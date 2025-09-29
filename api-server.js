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
                console.log('Received request data:', requestData);
                
                const apiKey = requestData.apiKey;
                const prompt = requestData.prompt;
                const temperature = requestData.temperature || 0.9;
                
                console.log('API Key format check:');
                console.log('  Length:', apiKey ? apiKey.length : 'undefined');
                console.log('  Starts with sk-ant-api:', apiKey ? apiKey.startsWith('sk-ant-api') : false);
                console.log('  First 20 chars:', apiKey ? apiKey.substring(0, 20) + '...' : 'undefined');
                
                if (!apiKey) {
                    throw new Error('apiKey is required');
                }
                if (!prompt) {
                    throw new Error('prompt is required');
                }
                
                // APIキーの基本チェック（デバッグログ拒否機能を緩和）
                if (apiKey.includes('デバッグログ:') || apiKey.includes('API connection failed')) {
                    throw new Error('Invalid API key format. Debug messages detected in API key');
                }
                
                if (!apiKey.startsWith('sk-ant-api')) {
                    throw new Error('Invalid API key format. Must start with sk-ant-api');
                }
                
                // Claude APIへのリクエスト
                const claudeData = JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 4000,
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
                console.error('Request body was:', body);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 'Invalid request', 
                    details: error.message,
                    body: body 
                }));
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
                console.log('Received Gemini request data:', requestData);
                
                const apiKey = requestData.apiKey;
                const prompt = requestData.prompt;
                
                console.log('Gemini API Key format check:');
                console.log('  Length:', apiKey ? apiKey.length : 'undefined');
                console.log('  Starts with AIzaSy:', apiKey ? apiKey.startsWith('AIzaSy') : false);
                console.log('  First 20 chars:', apiKey ? apiKey.substring(0, 20) + '...' : 'undefined');
                
                if (!apiKey) {
                    throw new Error('apiKey is required');
                }
                if (!prompt) {
                    throw new Error('prompt is required');
                }
                
                // APIキーの基本チェック（デバッグログ拒否機能を緩和）
                if (apiKey.includes('デバッグログ:') || apiKey.includes('API connection failed')) {
                    throw new Error('Invalid API key format. Debug messages detected in API key');
                }
                
                if (!apiKey.startsWith('AIzaSy')) {
                    throw new Error('Invalid Gemini API key format. Must start with AIzaSy');
                }
                
                // モデル選択（デフォルトは2.0-flash-exp）
                const model = requestData.model || 'gemini-2.0-flash-exp';
                const temperature = requestData.temperature || 0.9;
                
                // Gemini APIへのリクエスト
                const geminiData = JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: temperature,
                        maxOutputTokens: 4096
                    }
                });
                
                const options = {
                    hostname: 'generativelanguage.googleapis.com',
                    path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
                        console.log('Gemini API Response Status:', geminiRes.statusCode);
                        console.log('Gemini API Response Headers:', geminiRes.headers);
                        
                        if (geminiRes.statusCode === 429) {
                            console.error('Rate limit exceeded');
                            const retryAfter = geminiRes.headers['retry-after'] || '5';
                            res.writeHead(429, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ 
                                error: 'Rate limit exceeded. Please wait and try again.',
                                retryAfter: retryAfter 
                            }));
                        } else {
                            res.writeHead(geminiRes.statusCode, { 'Content-Type': 'application/json' });
                            res.end(responseData);
                        }
                    });
                });
                
                geminiReq.on('error', (error) => {
                    console.error('Gemini API error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        error: 'Gemini API request failed',
                        details: error.message 
                    }));
                });
                
                geminiReq.write(geminiData);
                geminiReq.end();
                
            } catch (error) {
                console.error('Gemini request parsing error:', error);
                console.error('Request body was:', body);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 'Invalid request', 
                    details: error.message,
                    body: body 
                }));
            }
        });
        
    } else if (pathname === '/') {
        // HTMLファイルの提供 - 最新版のai-complete-creator.htmlを表示
        fs.readFile(path.join(__dirname, 'ai-complete-creator.html'), (err, data) => {
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