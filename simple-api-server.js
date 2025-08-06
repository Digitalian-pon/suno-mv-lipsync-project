const http = require('http');
const https = require('https');

const PORT = 8000;

const server = http.createServer((req, res) => {
    // CORSヘッダー
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // ルートパス
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎵 Gemini Suno Creator - API版</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            text-align: center;
            color: #667eea;
            margin-bottom: 30px;
        }
        .api-setup {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
        }
        input[type="password"] {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 15px 30px;
            margin: 10px 5px;
            border-radius: 10px;
            font-size: 18px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover:not(:disabled) {
            transform: scale(1.05);
        }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            text-align: center;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .result-box {
            background: #f9f9f9;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #e0e0e0;
        }
        .result-header {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .result-content {
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
            background: white;
            padding: 15px;
            border-radius: 5px;
            max-height: 300px;
            overflow-y: auto;
        }
        .copy-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        .copy-btn:hover {
            background: #45a049;
        }
        .theme-box {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            font-size: 18px;
            margin: 20px 0;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 Gemini Suno Creator - API版</h1>
        
        <div class="api-setup">
            <h3>🔧 Gemini AI設定</h3>
            <div class="status" id="status">APIサーバー経由で接続中...</div>
            <input type="password" id="apiKey" placeholder="Gemini API Keyを入力してください">
            <button onclick="testAPI()">接続テスト</button>
            <small style="display: block; margin-top: 10px; color: #666;">
                API Keyは<a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a>で取得
            </small>
        </div>
        
        <button onclick="generate()" id="generateBtn" disabled>🎵 楽曲生成</button>
        
        <div class="theme-box" id="themeBox">🎯 APIを設定して楽曲を生成してください</div>
        
        <div id="results"></div>
    </div>

    <script>
        let apiKey = '';
        let isConnected = false;
        
        const themes = [
            "時をかける恋 (タイムリープ, 運命, 切ない恋)",
            "AI少女との恋 (人工知能, デジタル愛, 感情)",
            "異世界での失恋 (ファンタジー, 魔法, 別れ)",
            "ワープした先の君 (時空, 瞬間移動, 再会)",
            "デジタル世界の片想い (メタバース, アバター, オンライン)",
            "ループする告白 (無限ループ, 繰り返し, 諦め)",
            "AIが歌う失恋歌 (機械の心, 学習, データ)",
            "異次元恋愛事情 (パラレルワールド, 別の自分)",
            "サイバー空間の初恋 (ネット, コード, プログラム)",
            "時間停止中の恋 (静止, 永遠, 瞬間)"
        ];
        
        async function testAPI() {
            const key = document.getElementById('apiKey').value.trim();
            if (!key) {
                updateStatus('API Keyを入力してください', 'error');
                return;
            }
            
            updateStatus('接続テスト中...', '');
            
            try {
                const response = await fetch('/api/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey: key })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    apiKey = key;
                    isConnected = true;
                    updateStatus('✅ API接続成功！', 'success');
                    document.getElementById('generateBtn').disabled = false;
                    localStorage.setItem('gemini_api_key', key);
                } else {
                    updateStatus('❌ 接続失敗: ' + data.error, 'error');
                }
            } catch (error) {
                updateStatus('❌ エラー: ' + error.message, 'error');
            }
        }
        
        async function generate() {
            if (!isConnected) {
                updateStatus('先にAPI接続してください', 'error');
                return;
            }
            
            const btn = document.getElementById('generateBtn');
            const results = document.getElementById('results');
            const themeBox = document.getElementById('themeBox');
            
            btn.disabled = true;
            btn.textContent = '🤖 生成中...';
            
            const theme = themes[Math.floor(Math.random() * themes.length)];
            themeBox.textContent = '🎯 ' + theme;
            
            results.innerHTML = '<div class="loading"><div class="spinner"></div>Gemini AIが楽曲を生成中...</div>';
            
            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey, theme })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    displayResults(data.content);
                } else {
                    results.innerHTML = '<div style="color: red; padding: 20px;">生成エラー: ' + data.error + '</div>';
                }
            } catch (error) {
                results.innerHTML = '<div style="color: red; padding: 20px;">エラー: ' + error.message + '</div>';
            } finally {
                btn.disabled = false;
                btn.textContent = '🎵 楽曲生成';
            }
        }
        
        function displayResults(content) {
            const results = document.getElementById('results');
            results.innerHTML = \`
                <div class="result-box">
                    <div class="result-header">
                        🎵 楽曲タイトル
                        <button class="copy-btn" onclick="copyText('\${content.title}')">📋 コピー</button>
                    </div>
                    <div class="result-content">\${content.title}</div>
                </div>
                
                <div class="result-box">
                    <div class="result-header">
                        🎌 日本語歌詞
                        <button class="copy-btn" onclick="copyText(\\\`\${content.lyricsJP}\\\`)">📋 コピー</button>
                    </div>
                    <div class="result-content">\${content.lyricsJP}</div>
                </div>
                
                <div class="result-box">
                    <div class="result-header">
                        🇺🇸 英語歌詞
                        <button class="copy-btn" onclick="copyText(\\\`\${content.lyricsEN}\\\`)">📋 コピー</button>
                    </div>
                    <div class="result-content">\${content.lyricsEN}</div>
                </div>
                
                <div class="result-box">
                    <div class="result-header">
                        🎨 Sunoスタイル
                        <button class="copy-btn" onclick="copyText('\${content.style}')">📋 コピー</button>
                    </div>
                    <div class="result-content">\${content.style}</div>
                </div>
                
                <div class="result-box">
                    <div class="result-header">
                        🖼️ Midjourney画像
                        <button class="copy-btn" onclick="copyText('\${content.midjourney}')">📋 コピー</button>
                    </div>
                    <div class="result-content">\${content.midjourney}</div>
                </div>
            \`;
        }
        
        function copyText(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert('✅ コピーしました！');
            }).catch(() => {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('✅ コピーしました！');
            });
        }
        
        function updateStatus(text, type) {
            const status = document.getElementById('status');
            status.textContent = text;
            status.className = 'status ' + type;
        }
        
        // 起動時に保存されたAPI Keyを復元
        window.addEventListener('load', () => {
            const savedKey = localStorage.getItem('gemini_api_key');
            if (savedKey) {
                document.getElementById('apiKey').value = savedKey;
            }
        });
    </script>
</body>
</html>
        `);
        return;
    }

    // API テストエンドポイント
    if (req.url === '/api/test' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { apiKey } = JSON.parse(body);
                
                const testData = JSON.stringify({
                    contents: [{ parts: [{ text: "Hello" }] }]
                });
                
                const options = {
                    hostname: 'generativelanguage.googleapis.com',
                    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(testData)
                    }
                };
                
                const apiReq = https.request(options, (apiRes) => {
                    let data = '';
                    apiRes.on('data', chunk => data += chunk);
                    apiRes.on('end', () => {
                        if (apiRes.statusCode === 200) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true }));
                        } else {
                            const error = JSON.parse(data);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ 
                                success: false, 
                                error: error.error?.message || 'API接続失敗'
                            }));
                        }
                    });
                });
                
                apiReq.on('error', (e) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: e.message }));
                });
                
                apiReq.write(testData);
                apiReq.end();
                
            } catch (e) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
        return;
    }

    // API 生成エンドポイント
    if (req.url === '/api/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { apiKey, theme } = JSON.parse(body);
                
                const prompt = `以下のテーマで、Suno AI用の楽曲コンテンツを生成してください。
テーマ: ${theme}

以下の形式で出力してください:
タイトル: [創造的で印象的な楽曲タイトル]
日本語歌詞:
[Verse 1]
[4行]
[Chorus]
[4行]
[Verse 2]
[4行]
[Chorus]
[4行]
[Bridge]
[4行]

英語歌詞:
[同じ構成で英語版]

Sunoスタイル: [ジャンル], [ムード], [BPM], [ボーカルタイプ]
Midjourney: [テーマ], [アートスタイル], [色彩], [雰囲気], album cover, 8k`;
                
                const requestData = JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
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
                        'Content-Length': Buffer.byteLength(requestData)
                    }
                };
                
                const apiReq = https.request(options, (apiRes) => {
                    let data = '';
                    apiRes.on('data', chunk => data += chunk);
                    apiRes.on('end', () => {
                        if (apiRes.statusCode === 200) {
                            const result = JSON.parse(data);
                            const text = result.candidates[0].content.parts[0].text;
                            
                            // パース処理
                            const lines = text.split('\n');
                            let title = '', lyricsJP = '', lyricsEN = '', style = '', midjourney = '';
                            let section = '';
                            
                            for (const line of lines) {
                                if (line.includes('タイトル:')) {
                                    title = line.split(':')[1].trim();
                                } else if (line.includes('日本語歌詞:')) {
                                    section = 'jp';
                                } else if (line.includes('英語歌詞:')) {
                                    section = 'en';
                                } else if (line.includes('Sunoスタイル:')) {
                                    style = line.split(':')[1].trim();
                                } else if (line.includes('Midjourney:')) {
                                    midjourney = line.split(':')[1].trim();
                                } else if (line.trim()) {
                                    switch(section) {
                                        case 'jp': lyricsJP += line + '\n'; break;
                                        case 'en': lyricsEN += line + '\n'; break;
                                    }
                                }
                            }
                            
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                success: true,
                                content: {
                                    title: title || `AI Generated: ${theme}`,
                                    lyricsJP: lyricsJP.trim(),
                                    lyricsEN: lyricsEN.trim(),
                                    style: style || 'Electronic Pop, Emotional, 120 BPM, Female Vocals',
                                    midjourney: midjourney || `${theme}, digital art, neon colors, album cover, 8k`
                                }
                            }));
                        } else {
                            const error = JSON.parse(data);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ 
                                success: false, 
                                error: error.error?.message || 'API生成失敗'
                            }));
                        }
                    });
                });
                
                apiReq.on('error', (e) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: e.message }));
                });
                
                apiReq.write(requestData);
                apiReq.end();
                
            } catch (e) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
        return;
    }

    // 404
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`\n🚀 APIサーバーが起動しました！`);
    console.log(`\n📱 ブラウザで開く: http://localhost:${PORT}/`);
    console.log(`\n💡 使い方:`);
    console.log(`1. ブラウザでアプリを開く`);
    console.log(`2. Gemini API Keyを入力`);
    console.log(`3. 接続テスト → 楽曲生成`);
});