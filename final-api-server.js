const http = require('http');
const https = require('https');

const PORT = 8080;

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎵 Final API - Suno Creator</title>
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
        .connection-status {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
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
        .status.warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
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
        <h1>🎵 Final API - Suno Creator</h1>
        
        <div class="connection-status">
            ✅ サーバー接続成功！プロキシ経由でAPI接続可能です
        </div>
        
        <div class="api-setup">
            <h3>🔧 Gemini AI設定</h3>
            <div class="status" id="status">API Keyを入力してテストしてください</div>
            <input type="password" id="apiKey" placeholder="Gemini API Keyを入力してください">
            <button onclick="testConnection()">接続テスト</button>
            <small style="display: block; margin-top: 10px; color: #666;">
                API Keyは<a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a>で取得
            </small>
        </div>
        
        <button onclick="generateSong()" id="generateBtn" disabled>🎵 楽曲生成</button>
        
        <div class="theme-box" id="themeBox">🎯 APIを設定して楽曲を生成してください</div>
        
        <div id="results"></div>
    </div>

    <script>
        let currentApiKey = '';
        let isApiConnected = false;
        
        const musicThemes = [
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
        
        async function testConnection() {
            const apiKey = document.getElementById('apiKey').value.trim();
            if (!apiKey) {
                updateStatus('API Keyを入力してください', 'error');
                return;
            }
            
            updateStatus('🔄 プロキシサーバー経由で接続テスト中...', '');
            
            try {
                const response = await fetch('/test', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ apiKey: apiKey })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    currentApiKey = apiKey;
                    isApiConnected = true;
                    updateStatus('✅ API接続成功！楽曲生成が可能です', 'success');
                    document.getElementById('generateBtn').disabled = false;
                    localStorage.setItem('gemini_api_key', apiKey);
                } else {
                    updateStatus('❌ 接続失敗: ' + result.error, 'error');
                }
            } catch (error) {
                updateStatus('❌ サーバーエラー: ' + error.message, 'error');
            }
        }
        
        async function generateSong() {
            if (!isApiConnected) {
                updateStatus('先にAPI接続テストを実行してください', 'error');
                return;
            }
            
            const btn = document.getElementById('generateBtn');
            const results = document.getElementById('results');
            const themeBox = document.getElementById('themeBox');
            
            btn.disabled = true;
            btn.textContent = '🤖 AI生成中...';
            
            const selectedTheme = musicThemes[Math.floor(Math.random() * musicThemes.length)];
            themeBox.textContent = '🎯 ' + selectedTheme;
            
            results.innerHTML = '<div class="loading"><div class="spinner"></div>Gemini AIが楽曲コンテンツを生成中...</div>';
            
            try {
                const response = await fetch('/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        apiKey: currentApiKey,
                        theme: selectedTheme
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    displayMusicContent(result.content);
                    updateStatus('✅ 楽曲生成完了！', 'success');
                } else {
                    results.innerHTML = '<div style="color: red; padding: 20px;">生成失敗: ' + result.error + '</div>';
                    updateStatus('❌ 生成失敗: ' + result.error, 'error');
                }
            } catch (error) {
                results.innerHTML = '<div style="color: red; padding: 20px;">エラー: ' + error.message + '</div>';
                updateStatus('❌ 生成エラー', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = '🎵 楽曲生成';
            }
        }
        
        function displayMusicContent(content) {
            const results = document.getElementById('results');
            results.innerHTML = \`
                <div class="result-box">
                    <div class="result-header">
                        🎵 楽曲タイトル
                        <button class="copy-btn" onclick="copyToClipboard('\${content.title}')">📋 コピー</button>
                    </div>
                    <div class="result-content">\${content.title}</div>
                </div>
                
                <div class="result-box">
                    <div class="result-header">
                        🎌 日本語歌詞
                        <button class="copy-btn" onclick="copyToClipboard(\\\`\${content.japaneseVerse}\\\`)">📋 コピー</button>
                    </div>
                    <div class="result-content">\${content.japaneseVerse}</div>
                </div>
                
                <div class="result-box">
                    <div class="result-header">
                        🇺🇸 英語歌詞
                        <button class="copy-btn" onclick="copyToClipboard(\\\`\${content.englishVerse}\\\`)">📋 コピー</button>
                    </div>
                    <div class="result-content">\${content.englishVerse}</div>
                </div>
                
                <div class="result-box">
                    <div class="result-header">
                        🎨 Sunoスタイル
                        <button class="copy-btn" onclick="copyToClipboard('\${content.musicStyle}')">📋 コピー</button>
                    </div>
                    <div class="result-content">\${content.musicStyle}</div>
                </div>
                
                <div class="result-box">
                    <div class="result-header">
                        🖼️ Midjourney画像プロンプト
                        <button class="copy-btn" onclick="copyToClipboard('\${content.imagePrompt}')">📋 コピー</button>
                    </div>
                    <div class="result-content">\${content.imagePrompt}</div>
                </div>
            \`;
        }
        
        function copyToClipboard(text) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    alert('✅ クリップボードにコピーしました！');
                });
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('✅ クリップボードにコピーしました！');
            }
        }
        
        function updateStatus(message, type) {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = 'status ' + (type || '');
        }
        
        // Page load
        window.addEventListener('load', () => {
            const savedKey = localStorage.getItem('gemini_api_key');
            if (savedKey) {
                document.getElementById('apiKey').value = savedKey;
            }
        });
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Root path - serve HTML
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(HTML_CONTENT);
        return;
    }

    // API test endpoint
    if (req.url === '/test' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { apiKey } = JSON.parse(body);
                
                const testRequest = JSON.stringify({
                    contents: [{
                        parts: [{ text: "Hello" }]
                    }]
                });
                
                const options = {
                    hostname: 'generativelanguage.googleapis.com',
                    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(testRequest)
                    }
                };
                
                const apiReq = https.request(options, (apiRes) => {
                    let data = '';
                    apiRes.on('data', chunk => data += chunk);
                    apiRes.on('end', () => {
                        console.log(`API Test Response: ${apiRes.statusCode}`);
                        
                        if (apiRes.statusCode === 200) {
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.candidates && parsed.candidates.length > 0) {
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ success: true }));
                                } else {
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ success: false, error: 'Invalid API response' }));
                                }
                            } catch (e) {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: false, error: 'Parse error: ' + e.message }));
                            }
                        } else {
                            let errorMsg = 'API connection failed';
                            try {
                                const errorData = JSON.parse(data);
                                if (errorData.error && errorData.error.message) {
                                    errorMsg = errorData.error.message;
                                }
                            } catch (e) {
                                errorMsg = `HTTP ${apiRes.statusCode}`;
                            }
                            
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: errorMsg }));
                        }
                    });
                });
                
                apiReq.on('error', (error) => {
                    console.error('API Request Error:', error);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Network error: ' + error.message }));
                });
                
                apiReq.write(testRequest);
                apiReq.end();
                
            } catch (error) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Request parsing error' }));
            }
        });
        return;
    }

    // Music generation endpoint
    if (req.url === '/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { apiKey, theme } = JSON.parse(body);
                
                const musicPrompt = `以下のテーマで、Suno AI用の楽曲コンテンツを生成してください。

テーマ: ${theme}

以下の形式で必ず出力してください:

TITLE: [印象的なタイトル]

JAPANESE_LYRICS:
[Verse 1]
[4行の日本語歌詞]

[Chorus]
[4行の日本語歌詞]

[Verse 2]  
[4行の日本語歌詞]

[Chorus]
[4行の日本語歌詞]

[Bridge]
[2行の日本語歌詞]

ENGLISH_LYRICS:
[Verse 1]
[4行の英語歌詞]

[Chorus]
[4行の英語歌詞]

[Verse 2]
[4行の英語歌詞]

[Chorus]
[4行の英語歌詞]

[Bridge]
[2行の英語歌詞]

STYLE: [ジャンル], [ムード], [BPM], [ボーカルタイプ]

IMAGE: [テーマに合った視覚的描写], digital art, album cover, 8k`;
                
                const requestData = JSON.stringify({
                    contents: [{
                        parts: [{ text: musicPrompt }]
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
                        'Content-Length': Buffer.byteLength(requestData)
                    }
                };
                
                const apiReq = https.request(options, (apiRes) => {
                    let data = '';
                    apiRes.on('data', chunk => data += chunk);
                    apiRes.on('end', () => {
                        if (apiRes.statusCode === 200) {
                            try {
                                const result = JSON.parse(data);
                                const generatedText = result.candidates[0].content.parts[0].text;
                                
                                // Parse the generated content
                                const content = parseGeneratedContent(generatedText);
                                
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: true, content: content }));
                                
                            } catch (parseError) {
                                console.error('Parse Error:', parseError);
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: false, error: 'Content parsing failed' }));
                            }
                        } else {
                            console.error(`Generation API Error: ${apiRes.statusCode}`);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: `API Error: ${apiRes.statusCode}` }));
                        }
                    });
                });
                
                apiReq.on('error', (error) => {
                    console.error('Generation Request Error:', error);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Generation network error' }));
                });
                
                apiReq.write(requestData);
                apiReq.end();
                
            } catch (error) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Generation request parsing error' }));
            }
        });
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

function parseGeneratedContent(text) {
    const sections = {
        title: '',
        japaneseVerse: '',
        englishVerse: '',
        musicStyle: '',
        imagePrompt: ''
    };
    
    const lines = text.split('\\n');
    let currentSection = '';
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        if (trimmed.startsWith('TITLE:')) {
            sections.title = trimmed.replace('TITLE:', '').trim();
        } else if (trimmed.includes('JAPANESE_LYRICS:')) {
            currentSection = 'japanese';
        } else if (trimmed.includes('ENGLISH_LYRICS:')) {
            currentSection = 'english';
        } else if (trimmed.startsWith('STYLE:')) {
            sections.musicStyle = trimmed.replace('STYLE:', '').trim();
        } else if (trimmed.startsWith('IMAGE:')) {
            sections.imagePrompt = trimmed.replace('IMAGE:', '').trim();
        } else if (currentSection === 'japanese') {
            if (!trimmed.includes('ENGLISH_LYRICS:') && !trimmed.startsWith('STYLE:')) {
                sections.japaneseVerse += trimmed + '\\n';
            }
        } else if (currentSection === 'english') {
            if (!trimmed.startsWith('STYLE:') && !trimmed.startsWith('IMAGE:')) {
                sections.englishVerse += trimmed + '\\n';
            }
        }
    }
    
    // Fallbacks
    if (!sections.title) sections.title = 'AI Generated Song';
    if (!sections.musicStyle) sections.musicStyle = 'Electronic Pop, Emotional, 120 BPM, Female Vocals';
    if (!sections.imagePrompt) sections.imagePrompt = 'Digital art, neon colors, romantic atmosphere, album cover, 8k';
    if (!sections.japaneseVerse) sections.japaneseVerse = '[Verse 1]\\n生成された歌詞\\n[Chorus]\\n心に響く歌';
    if (!sections.englishVerse) sections.englishVerse = '[Verse 1]\\nGenerated lyrics\\n[Chorus]\\nMusic from the heart';
    
    return sections;
}

server.listen(PORT, () => {
    console.log(`\\n🚀 Final API Server 起動成功！`);
    console.log(`\\n📱 アクセス: http://localhost:${PORT}/`);
    console.log(`\\n✅ 完全にAPI接続可能です！`);
    console.log(`\\n💡 使用方法:`);
    console.log(`1. ブラウザでアプリを開く`);
    console.log(`2. Gemini API Keyを入力`);
    console.log(`3. 接続テスト → 楽曲生成`);
});