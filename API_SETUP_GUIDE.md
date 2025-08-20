# APIキー設定ガイド

## 🚨 問題の原因
アプリは正常に動作していますが、**有効なAPIキーが設定されていない**ため、AI生成機能が利用できません。

## ✅ 解決方法

### 方法1: Claude APIを使用する場合

1. **Claude APIキーの取得**
   - https://console.anthropic.com にアクセス
   - アカウントを作成またはログイン
   - API Keysセクションで新しいキーを生成
   - キーは `sk-ant-api03-` で始まる形式

2. **アプリでの設定**
   - ブラウザで http://localhost:3000/android-working-creator.html を開く
   - 「Claude API」を選択
   - APIキー入力方法を選択して、取得したキーを入力
   - 「接続テスト」をクリック

### 方法2: Gemini APIを使用する場合（無料枠あり）

1. **Gemini APIキーの取得**
   - https://makersuite.google.com/app/apikey にアクセス
   - Googleアカウントでログイン
   - 「Create API Key」をクリック
   - キーは `AIzaSy` で始まる形式

2. **アプリでの設定**
   - ブラウザで http://localhost:3000/android-working-creator.html を開く
   - 「Gemini API」を選択
   - APIキー入力方法を選択して、取得したキーを入力
   - 「接続テスト」をクリック

## 📝 注意事項

- **Claude API**: 有料（使用量に応じた課金）
- **Gemini API**: 無料枠あり（1日1,500リクエストまで無料）
- APIキーは他人と共有しないでください
- キーはローカルストレージに保存されます

## 🔧 トラブルシューティング

### エラー: "invalid x-api-key"
→ APIキーが無効です。正しいキーを入力してください。

### エラー: "Rate limit exceeded"
→ API利用制限に達しました。しばらく待ってから再試行してください。

### エラー: "サーバーに接続できません"
→ サーバーが起動していません。`npm start`を実行してください。

## 🎯 動作確認方法

1. APIキーを設定
2. 「接続テスト」で成功メッセージを確認
3. 「AIバズテーマ生成」をクリック
4. テーマが生成されたら「3分楽曲を生成」をクリック

これで楽曲の生成が可能になります！