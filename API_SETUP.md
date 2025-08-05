# 🚀 Gemini API接続ガイド

## 📋 必要な準備

### 1. Gemini API Keyの取得
1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. API Keyをコピーして保存

### 2. Node.jsの確認
```bash
node --version
```
Node.js 14以上が必要です。インストールされていない場合：
```bash
pkg install nodejs
```

## 🔧 API接続の方法

### 方法1: プロキシサーバー経由（推奨）

1. **サーバー起動**
```bash
cd ~/suno-ai-music-generator
node api-server.js
```

2. **ブラウザでアクセス**
新しいTermuxセッションで：
```bash
termux-open http://localhost:3000/
```

3. **API Key設定**
- アプリにAPI Keyを入力
- 「接続テスト」をクリック
- 「🤖 AI生成」モードを選択

### 方法2: 直接接続（フォールバック）

プロキシサーバーが利用できない場合、アプリは自動的に直接接続を試行します。
CORS制限により成功率は低いですが、一部の環境では動作します。

## 📱 使用方法

### 1. サーバー起動コマンド
```bash
# 基本起動
node api-server.js

# または npm経由
npm start

# カスタムポート
PORT=8080 node api-server.js
```

### 2. アクセス方法
- **メインアプリ**: http://localhost:3000/
- **API エンドポイント**: http://localhost:3000/api/gemini

### 3. 機能確認
1. API Key入力
2. 接続テスト実行
3. 成功メッセージ確認
4. AI生成モード選択
5. 楽曲生成実行

## 🔍 トラブルシューティング

### エラー: "API接続失敗"
- API Keyが正しいか確認
- インターネット接続を確認
- サーバーが起動しているか確認

### エラー: "プロキシサーバーエラー"
- `node api-server.js` でサーバーを再起動
- ポート3000が使用可能か確認

### エラー: "CORS制限"
- プロキシサーバー経由でアクセス
- 直接HTMLファイルを開かない

### API クォータ制限
- 1分間15回、1日1500回の制限
- 制限に達した場合はローカルモードを使用

## 📊 API使用状況

### 無料枠
- **1分間**: 15リクエスト
- **1日**: 1500リクエスト
- **1ヶ月**: 無制限（日次制限内で）

### 有料プラン
詳細は [Google AI Studio](https://aistudio.google.com/) で確認

## 🚨 セキュリティ注意事項

- API Keyは第三者と共有しない
- GitHubなどに API Key をコミットしない
- 本アプリはAPI KeyをlocalStorageに保存（ブラウザ内のみ）
- プロキシサーバーはローカル実行のみ

## 🔄 自動フォールバック

アプリは以下の順序で接続を試行します：
1. プロキシサーバー経由
2. 直接接続
3. ローカルモードに自動切替

## 💡 使用のコツ

- **安定接続**: プロキシサーバー経由を推奨
- **高速生成**: ローカルモードも高品質
- **API節約**: テスト後はローカルモードに切替
- **バックアップ**: 生成結果は都度コピー保存

---

**🎵 Happy Music Creating! 🎵**