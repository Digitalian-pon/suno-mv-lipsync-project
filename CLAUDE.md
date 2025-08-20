# Suno AI Music Generator メモリ

## プロジェクト概要
- **リポジトリ**: https://github.com/Digitalian-pon/suno-ai-music-generator
- **用途**: AI駆動の音楽生成アプリ (Gemini API統合)
- **状態**: アクティブ開発中

## 主要ファイル
- `gemini-suno-creator.html` - メインアプリ（推奨版）
- `android-working-creator.html` - 改良版アプリ（新機能搭載）
- `api-server.js` - Gemini APIプロキシサーバー
- `package.json` - Node.js設定

## コマンド
- **サーバー起動**: `cd suno-ai-music-generator && npm start`
- **メインアプリ起動**: `termux-open gemini-suno-creator.html`
- **新機能版起動**: `termux-open android-working-creator.html`
- **Git更新**: `git add -A && git commit -m "message" && git push`

## 最新機能 (2025-08-20)
### テーマ生成システムの大幅強化
- **日本語テーマ**: 87+種類の豊富なテーマ追加
- **英語テーマ**: 30+種類の多様なテーマ追加
- **カテゴリー分類**: 8つのテーマカテゴリーでフィルタリング機能
- **テーマ編集**: クリックでテーマを直接編集可能
- **二言語対応**: 日本語/英語タイトル生成
- **言語切替**: ユーザーインターフェース言語切替機能
- **多様性向上**: 感情や状況のランダム化による多彩な生成

### テーマカテゴリー
1. 自然・風景 (Nature & Landscapes)
2. 感情・心境 (Emotions & Feelings)  
3. 人間関係 (Relationships)
4. 日常・生活 (Daily Life)
5. 冒険・旅 (Adventure & Travel)
6. 文化・歴史 (Culture & History)
7. 季節・時間 (Seasons & Time)
8. 抽象・哲学 (Abstract & Philosophy)

## 最終更新履歴
- 2025-08-20: android-working-creator.html 大幅機能拡張
  - 多言語テーマシステム実装
  - インタラクティブUI改善
  - テーマ管理機能追加
- 2025-08-06: 新しいAPIサーバーバリエーション追加
- Gemini統合の改善
- 複数のサーバー実装追加

## 次のステップ
- テスト継続
- ドキュメント更新
- 機能拡張検討
