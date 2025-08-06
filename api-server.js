const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// HTTPサーバーの作成
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORSヘッダーの設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // OPTIONSリクエストの処理
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Claude APIプロキシエンドポイント
    if (pathname === '/api/claude' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                const apiKey = requestData.apiKey;
                const prompt = requestData.prompt;
                const temperature = requestData.temperature || 0.9;
                
                // Claude APIへのリクエスト
                const claudeData = JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 1500,
                    temperature: temperature,
                    messages: [{ 
                        role: 'user', 
                        content: prompt 
                    }]
                });
                
                const options = {
                    hostname: 'api.anthropic.com',
                    path: '/v1/messages',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'Content-Length': Buffer.byteLength(claudeData)
                    }
                };
                
                const claudeReq = https.request(options, (claudeRes) => {
                    let responseData = '';
                    
                    claudeRes.on('data', (chunk) => {
                        responseData += chunk;
                    });
                    
                    claudeRes.on('end', () => {
                        console.log('Claude API Response Status:', claudeRes.statusCode);
                        console.log('Claude API Response Headers:', claudeRes.headers);
                        
                        if (claudeRes.statusCode === 429) {
                            console.error('Rate limit exceeded');
                            const retryAfter = claudeRes.headers['retry-after'] || '5';
                            res.writeHead(429, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ 
                                error: 'Rate limit exceeded. Please wait and try again.',
                                retryAfter: retryAfter 
                            }));
                        } else {
                            res.writeHead(claudeRes.statusCode, { 'Content-Type': 'application/json' });
                            res.end(responseData);
                        }
                    });
                });
                
                claudeReq.on('error', (error) => {
                    console.error('Claude API error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        error: 'Claude API request failed',
                        details: error.message 
                    }));
                });
                
                claudeReq.write(claudeData);
                claudeReq.end();
                
            } catch (error) {
                console.error('Request parsing error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request' }));
            }
        });
        
    // Gemini APIプロキシエンドポイント
    } else if (pathname === '/api/gemini' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                const apiKey = requestData.apiKey;
                const prompt = requestData.prompt;
                
                // Gemini APIへのリクエスト
                const geminiData = JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        maxOutputTokens: 2048
                    }
                });
                
                const options = {
                    hostname: 'generativelanguage.googleapis.com',
                    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(geminiData)
                    }
                };
                
                const geminiReq = https.request(options, (geminiRes) => {
                    let responseData = '';
                    
                    geminiRes.on('data', (chunk) => {
                        responseData += chunk;
                    });
                    
                    geminiRes.on('end', () => {
                        res.writeHead(geminiRes.statusCode, { 'Content-Type': 'application/json' });
                        res.end(responseData);
                    });
                });
                
                geminiReq.on('error', (error) => {
                    console.error('Gemini API error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'API request failed' }));
                });
                
                geminiReq.write(geminiData);
                geminiReq.end();
                
            } catch (error) {
                console.error('Request parsing error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request' }));
            }
        });
        
    } else if (pathname === '/') {
        // HTMLファイルの提供
        fs.readFile(path.join(__dirname, 'gemini-suno-creator.html'), (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
        
    } else {
        // 静的ファイルの提供
        let filePath = path.join(__dirname, pathname);
        const extname = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif'
        };
        
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        
        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('File not found');
                } else {
                    res.writeHead(500);
                    res.end('Server error');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`APIサーバーが起動しました: http://localhost:${PORT}`);
    console.log(`Gemini APIプロキシ: http://localhost:${PORT}/api/gemini`);
    console.log(`\nブラウザで開く: http://localhost:${PORT}/`);
});