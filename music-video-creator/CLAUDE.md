# AI Music Video Creator with Lip Sync - プロジェクトメモリ

## プロジェクト概要
Suno AIで作成した楽曲とMidjourneyで作成した画像を使って、リップシンク機能付きのミュージックビデオを自動生成し、各SNSプラットフォーム用に最適化するアプリケーション。

## GitHubリポジトリ
**メインリポジトリ**: https://github.com/Digitalian-pon/suno-mv-lipsync-project.git

## 主要機能
- 🎵 **リップシンク**: Librosaによる音声解析で口の動きを自動生成
- 🎨 **AI素材対応**: Suno AI楽曲とMidjourney画像に最適化
- 📱 **SNS最適化**: Instagram、TikTok、YouTube Shortsなど各プラットフォーム用に自動最適化
- 🎬 **高品質出力**: FFmpegによる高品質な動画生成
- 🖥️ **デスクトップアプリ**: ブラウザー不要のtkinterベースアプリ
- 🌐 **Webインターフェース**: Streamlitによる直感的なUI
- 🔗 **外部API統合**: LipDub AI, Vozo AI, Higgsfield対応
- 🤖 **AI連携**: Claude Code & Gemini Studio連携ワークフロー

## 解決した重要問題
### ブラウザー接続問題の完全解決
- **問題**: 長期間続いていたlocalhost接続エラー「このサイトにアクセスできません」
- **解決**: デスクトップアプリケーション（desktop_app.py）の作成でブラウザー依存を完全排除
- **結果**: Unicode表示エラーも修正し、安定動作を実現

## 技術スタック
### Core Technologies
- **Python 3.8+**: メインプログラミング言語
- **tkinter**: デスクトップUIフレームワーク
- **Streamlit**: Webインターフェース
- **OpenCV**: 画像・動画処理
- **Librosa**: 音声解析
- **FFmpeg**: 高品質動画エンコーディング
- **NumPy/SciPy**: 数値計算

### AI Integration
- **Suno AI**: 楽曲生成素材
- **Midjourney**: 画像生成素材
- **LipDub AI**: 高品質リップシンクAPI（$0.10/秒）
- **Vozo AI**: コスト効率リップシンクAPI（$0.05/秒）
- **Higgsfield**: 無料Beta版リップシンクAPI

## ファイル構成
```
music-video-creator/
├── 【新】Suno API統合システム
│   ├── suno_api_client.py         # Suno API統合クライアント（楽曲・画像・リップシンク）
│   ├── integrated_suno_app.py     # Streamlit統合アプリ
│   ├── suno_desktop_app.py        # デスクトップ統合アプリ
│   ├── run_suno_integrated.py     # 統合起動スクリプト
│   └── SUNO_API_README.md        # Suno API統合ドキュメント
│
├── 【既存】従来のシステム
│   ├── desktop_app.py             # メインデスクトップアプリ（ブラウザー不要）
│   ├── enhanced_app.py            # 高機能Streamlitアプリ
│   ├── api_lipsync_creator.py     # 外部API統合システム
│   ├── claude_gemini_workflow.py  # Claude & Gemini連携システム
│   ├── video_processor_core.py    # 動画処理コアエンジン
│   ├── direct_server.py           # 直接サーバー管理システム
│   ├── lip_sync_analyzer.py       # リップシンク解析モジュール
│   ├── video_generator.py         # 動画生成モジュール
│   └── sns_optimizer.py           # SNS最適化モジュール
│
├── requirements.txt              # 依存関係
├── README.md                     # 詳細ドキュメント
└── CLAUDE.md                     # このファイル

Desktop/
├── デスクトップ版起動.bat        # メインデスクトップアプリ起動
├── 確実起動.bat                 # マルチオプション起動
├── FFmpeg確認とセットアップ.bat   # 環境確認・セットアップ
├── Claude-Gemini-連携.bat       # AI連携システム起動
└── AI-MV-Creator-API.bat        # 外部API版起動
```

## 使用方法
### 簡単起動（推奨）
1. デスクトップの「**デスクトップ版起動.bat**」をダブルクリック
2. ブラウザー不要で即座に起動

### Web版起動
1. デスクトップの「**確実起動.bat**」をダブルクリック
2. 起動方法を選択（直接サーバー/標準Streamlit/HTMLフォールバック）

### 基本ワークフロー
1. **音声ファイル**: Suno AIで作成したMP3/WAV/M4Aをアップロード
2. **画像ファイル**: Midjourneyで作成したPNG/JPG画像を複数選択
3. **設定調整**: フレームレート、解像度、SNSプラットフォーム選択
4. **生成実行**: ワンクリックでリップシンク動画作成
5. **ダウンロード**: 各SNS用に最適化された動画を取得

## SNSプラットフォーム対応
| プラットフォーム | 解像度 | アスペクト比 | 最大時間 | 特徴 |
|----------------|--------|------------|-----------|------|
| Instagram Post | 1080x1080 | 1:1 | 60秒 | スクエア形式 |
| Instagram Story | 1080x1920 | 9:16 | 15秒 | フルスクリーン縦型 |
| TikTok | 1080x1920 | 9:16 | 60秒 | トレンドエフェクト |
| YouTube Shorts | 1080x1920 | 9:16 | 60秒 | 高品質 |
| Twitter | 1280x720 | 16:9 | 140秒 | 横型動画 |

## リップシンク技術詳細
### 音声解析手法
- **RMS**: 音量レベルの解析
- **スペクトラル重心**: 音の明るさ・クリアさ
- **ゼロクロッシングレート**: 音の変化の激しさ
- **MFCC**: メル周波数ケプストラム係数

### 口の動き生成
```python
mouth_openness = (0.6 * rms_norm + 0.3 * sc_norm + 0.1 * zcr_norm) * strength
```
- ガウシアンフィルタによるスムージング
- フレームレートに合わせた補間
- リアルタイム調整可能な強度パラメータ

## 必要な環境
### 必須ソフトウェア
- Python 3.8以上
- FFmpeg（Windows Package Manager経由でインストール済み）

### 主要依存関係
```
streamlit>=1.28.0
opencv-python>=4.8.0
librosa>=0.10.0
numpy>=1.24.0
pillow>=9.5.0
ffmpeg-python>=0.2.0
scipy>=1.10.0
```

## トラブルシューティング
### 解決済み問題
1. **ブラウザー接続エラー** → デスクトップアプリで完全解決
2. **Unicode表示エラー** → 文字エンコーディング修正済み
3. **FFmpeg不具合** → 自動インストール・セットアップ対応

### よくある問題と解決法
- **メモリ不足**: 大きな画像をリサイズしてから使用
- **音声が聞こえない**: MP3/WAV/M4A形式を確認
- **リップシンクずれ**: サンプリングレート確認、パラメータ調整

## 開発履歴
### Version 1.0 (2025年1月)
- 基本的なリップシンク機能実装
- Streamlit Webインターフェース作成
- SNS最適化機能追加

### Version 2.0 (継続開発)
- **重大改善**: ブラウザー接続問題の完全解決
- デスクトップアプリケーション追加
- 外部API統合システム構築
- Claude & Gemini連携ワークフロー実装
- Unicode表示問題修正
- 包括的なセットアップシステム構築

### Version 3.0 (2025年1月) - Suno API統合版 🆕
- **🎵 Suno API V5対応**: 楽曲生成から動画作成まで完全統合
- **🔗 ワンストップワークフロー**: プロンプト入力だけでMV完成
- **🎨 複数画像生成API対応**: Flux/DALL-E/Midjourney統合
- **⚡ 全自動生成モード**: 楽曲→画像→リップシンク動画を自動実行
- **📱 2つのUI**: Streamlit Web版とtkinterデスクトップ版
- **💾 設定保存機能**: APIキーと設定の保存・読込対応

### Version 4.0 (2025年1月) - グローバル版 🌍 🆕
- **🌍 世界18ジャンル対応**: J-POP, K-POP, Bollywood, Latin, Afrobeat等
- **💫 10の普遍的テーマ**: Hope, Courage, Unity, Peace, Love等
- **🎵 15のプリセット**: 感動と勇気を与える楽曲テンプレート
- **🗣️ 多言語対応**: 英語、日本語、韓国語、中国語、スペイン語等13言語
- **📚 ストーリーテンプレート**: 5つの感動的な物語構造
- **🎨 3つの作成モード**: プリセット選択/カスタム作成/自由入力
- **🌏 グローバルメッセージ**: 世界中の人々に感動と勇気を届ける

## 今後の拡張予定
- 🎥 リアルタイムプレビュー機能
- 😊 より高度な顔認識・表情制御
- 🎚️ 音声品質自動最適化
- 📦 バッチ処理機能
- ☁️ クラウドデプロイメント対応
- 🌐 グローバルコミュニティプラットフォーム
- 🎓 教育機関との連携プログラム
- 💝 チャリティー音楽プロジェクト

## 関連リンク
- **Suno AI**: https://suno.ai （AI音楽生成）
- **Midjourney**: https://midjourney.com （AI画像生成）
- **FFmpeg**: https://ffmpeg.org （動画処理）
- **Streamlit**: https://streamlit.io （Webアプリフレームワーク）
- **LipDub AI**: https://lipdub.ai （リップシンクAPI）

## ライセンス
MIT License

## 作成者・貢献者
- メイン開発: Claude Code AI Assistant
- プロジェクト管理: Digitalian-pon
- 協力: Gemini Studio連携システム

## 🚀 クイックスタート

### グローバル版（推奨）
```bash
# 世界に感動と勇気を届ける
streamlit run global_mv_creator.py
```

### Suno API統合版
```bash
# 楽曲生成から動画まで一括処理
streamlit run integrated_suno_app.py
# または
python run_suno_integrated.py
```

### 従来版
```bash
# 従来のシステム
streamlit run enhanced_app.py
python desktop_app.py
```

## 📊 プロジェクト統計
- **対応ジャンル**: 18種類（J-POP, K-POP, Bollywood, Latin, Afrobeat等）
- **テーマ**: 10種類（Hope, Courage, Unity, Peace, Love等）
- **プリセット**: 15種類
- **言語**: 13言語対応
- **作成モード**: 3種類
- **合計ファイル数**: 25+ファイル

---
**最終更新**: 2025年1月
**リポジトリ**: https://github.com/Digitalian-pon/suno-mv-lipsync-project.git
**ビジョン**: 🌍 音楽で世界をつなぎ、感動と勇気を届ける