# Creative Prompt Studio Android アプリ ビルド手順

## すぐに使える方法

### 1. PWA (Progressive Web App) として使用
- ブラウザで https://digitalian-pon.github.io/creative-prompt-studio/ にアクセス
- ChromeまたはEdgeで「ホーム画面に追加」をタップ
- ネイティブアプリのように使用可能

### 2. APKビルド方法

#### Android Studio使用 (推奨)
1. このプロジェクトをPCに転送
2. Android Studioで開く
3. Build → Generate Signed Bundle / APK
4. APKを選択してビルド

#### オンラインビルド
1. PhoneGap Build (https://build.phonegap.com/) にアカウント作成
2. このプロジェクトをアップロード
3. 自動でAPKが生成される

#### Termux環境でのビルド (上級者向け)
```bash
# Android SDKをインストール
pkg install android-tools
# 環境変数を設定
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

## プロジェクトファイル
- `/data/data/com.termux/files/home/CreativePromptStudioApp/`

## アプリ仕様
- パッケージ名: com.digitalian.creativeprompt
- アプリ名: Creative Prompt Studio
- WebView経由でWebアプリを表示