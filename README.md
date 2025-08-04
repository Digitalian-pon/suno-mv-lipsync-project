# 🎵 Creative Prompt Studio - Suno AI Music Generation App

**完全なAI音楽生成アプリケーション** - Gemini AI統合とオフライン機能を備えた包括的な楽曲制作ツール

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![AI](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-orange.svg)

## ✨ 主な機能

### 🤖 AI生成機能
- **Gemini AI統合**: 最新のgemini-1.5-flashモデルを使用
- **多言語歌詞**: 日本語・英語の歌詞を自動生成
- **スタイルプロンプト**: Suno AI用の最適化されたプロンプト
- **画像プロンプト**: Midjourney用のアルバムアート指示

### 🏠 オフライン機能
- **完全ローカル動作**: インターネット不要での楽曲生成
- **自動フォールバック**: API接続失敗時の自動切替
- **データ永続化**: localStorage による設定・履歴保存
- **無限バリエーション**: 数千通りの組み合わせ生成

### 📱 ユーザー体験
- **ワンクリック生成**: シンプルな操作で完全な楽曲コンテンツ
- **個別コピー**: 各セクションの専用コピーボタン
- **モバイル対応**: レスポンシブデザインとタッチ操作
- **テーマ豊富**: 20+のユニークなテーマ

## 🚀 アプリバージョン

### 推奨版
- **`gemini-suno-creator.html`** - メインのAI統合版（最新・推奨）

### その他のバージョン
- `simple-suno-creator.html` - 高度なオフライン版
- `offline-suno-creator.html` - 機能豊富なオフライン版  
- `suno-creator.html` - 基本テンプレート版

## 🎯 対応テーマ

- 🕐 時をかける恋 (タイムリープ・運命・切ない恋)
- 🤖 AI少女との恋 (人工知能・デジタル愛・感情)
- 🌟 異世界での失恋 (ファンタジー・魔法・別れ)
- ⚡ ワープした先の君 (時空・瞬間移動・再会)
- 🌐 デジタル世界の片想い (メタバース・アバター)
- ♾️ ループする告白 (無限ループ・繰り返し)
- 🎵 AIが歌う失恋歌 (機械の心・学習・データ)
- 🌌 異次元恋愛事情 (パラレルワールド・可能性)
- 💻 サイバー空間の初恋 (ネット・コード・プログラム)
- ⏸️ 時間停止中の恋 (静止・永遠・瞬間)

*...その他10以上のテーマをサポート*

## 🔧 使用方法

### 1. 基本的な使用
```bash
# ファイルをブラウザで開く
open gemini-suno-creator.html
```

### 2. Gemini AI設定
1. [Google AI Studio](https://aistudio.google.com/app/apikey)でAPI Keyを取得
2. アプリにAPI Keyを入力
3. 「接続テスト」ボタンでテスト
4. 🤖 AI生成モードで楽曲生成

### 3. オフライン使用
1. 🏠 ローカル生成モードを選択
2. API Key不要で即座に生成開始
3. データはブラウザに自動保存

## 🛠️ 技術仕様

### フロントエンド
- **HTML5/CSS3/JavaScript** - ピュアWeb技術
- **レスポンシブデザイン** - モバイルファースト
- **LocalStorage** - クライアント側データ永続化

### AI統合
- **Gemini 1.5 Flash** - 高速AI推論
- **REST API** - 直接API接続
- **エラーハンドリング** - 堅牢な例外処理

### 特徴
- **サーバーレス** - 静的HTML単体動作
- **プライベート** - データ外部送信なし
- **ポータブル** - 単一ファイルで完結

## 📋 必要要件

### 最小要件
- モダンWebブラウザ (Chrome, Firefox, Safari, Edge)
- JavaScript有効

### 推奨要件
- インターネット接続 (AI機能用)
- Gemini API Key (AI機能用)

## 🚀 使用方法・インストール

### オンライン使用 (推奨)
1. 直接ブラウザでアクセス：`gemini-suno-creator.html`
2. Gemini API Keyを設定してAI生成を体験

### ローカルインストール
```bash
# リポジトリをクローン
git clone https://github.com/your-username/creative-prompt-studio.git

# ディレクトリに移動
cd creative-prompt-studio

# ブラウザで開く
open gemini-suno-creator.html
```

### Termuxでの使用
```bash
# Termuxで直接作成
git clone <repository-url>
cd creative-prompt-studio

# Termuxブラウザで表示
termux-open gemini-suno-creator.html
```

## 📖 ドキュメント

### API接続
- Gemini API Keyは[Google AI Studio](https://aistudio.google.com/app/apikey)で取得
- localStorageに安全に保存される
- CORS制限時は自動でローカルモードに切替

### データ保存
- 生成履歴はlocalStorageに保存
- ブラウザデータ削除時にリセット
- プライバシー完全保護

## 🌐 GitHubリポジトリ作成

このプロジェクトをGitHubにアップロードする手順：

### 1. GitHub上でリポジトリ作成
- [GitHub](https://github.com)にアクセス
- 「New repository」をクリック  
- リポジトリ名: `creative-prompt-studio`
- Description: `🎵 AI-Powered Suno Music Generation App`
- Public を選択
- 「Create repository」をクリック

### 2. ローカルからプッシュ
```bash
# リモートリポジトリを追加
git remote add origin https://github.com/your-username/creative-prompt-studio.git

# メインブランチに変更
git branch -M main

# すべてをプッシュ
git push -u origin main
```

## 🤝 貢献

プルリクエストを歓迎します！

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

## 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照

## 🙏 謝辞

- **Suno AI** - 音楽生成プラットフォーム
- **Google Gemini** - AI推論エンジン
- **Midjourney** - 画像生成AI
- **Claude Code** - 開発支援

---

## 🔗 リンク

- [Suno AI](https://www.suno.ai/) - 音楽生成プラットフォーム
- [Google AI Studio](https://aistudio.google.com/) - Gemini API
- [Midjourney](https://www.midjourney.com/) - AI画像生成

**🎵 あなたの音楽創作を次のレベルへ！**