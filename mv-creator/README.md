# MV Creator

Sunoで生成してダウンロードしたWAVファイルと歌詞から、ミュージックビデオ（歌詞テロップ＋アニメーション背景の動画）を自動生成するWebアプリです。**Windows・Android・iOSのどれでも、ブラウザ（PC・スマートフォン）から同じアプリを使えます**。ホーム画面に追加すればアプリのように起動できます（PWA対応）。

## 特徴・技術的なポイント

- **完全ブラウザ内処理**: 歌詞の音声認識も、動画のレンダリング・書き出しもすべて端末のブラウザ内で実行します。サーバーへ音声や動画を送信することはありません。
- **動画生成のコストがかからない**: AI動画生成APIは使わず、Canvas 2Dで「歌詞テロップ＋グラデーション/パーティクル/波形ビジュアライザー/静止画（Ken Burns風パン&ズーム）」を合成して動画化します。追加のAPI課金は発生しません。
- **歌詞抽出は2通り**:
  - 🤖 AI自動抽出: [transformers.js](https://github.com/xenova/transformers.js) + Whisper（多言語対応の音声認識モデル）をブラウザ内で実行。初回のみモデル（約145MB）をダウンロードしますが、APIキー・課金は不要です。歌唱音声の認識は完璧ではないため、抽出後にテキストと時間を修正できます。
  - ✍️ 手動貼り付け＋タップ同期: 歌詞を貼り付けて再生しながらスペースキーでタイミングを記録する方法。より正確に同期したい場合におすすめです。
- **Google Driveでアップロード/ダウンロード**: WAVファイルをGoogle Driveから選択して読み込み、完成した動画をGoogle Driveに保存できます（Googleアカウントの認可が必要）。

## 使い方（クイックスタート）

1. 既存のAPIサーバーを起動します（リポジトリのルートで実行）。
   ```bash
   npm run pm2:start
   ```
2. ブラウザで `http://localhost:3000/mv-creator/` を開きます（同一Wi-Fi内のPC/スマホからは `http://<サーバーのIP>:3000/mv-creator/`）。
3. ①音楽を読み込む → ②歌詞を用意する → ③シーンを設定する → ④プレビュー・書き出す、の順に進みます。
4. 「動画として書き出す」を押すと、曲の長さと同じ時間だけ録画が行われます（リアルタイム録画のため）。完了後、端末に保存するか、Google Driveに保存できます。

### ホーム画面に追加する（アプリのように使う）

- **Android (Chrome)**: メニュー →「ホーム画面に追加」
- **iOS (Safari)**: 共有ボタン →「ホーム画面に追加」
- **Windows/デスクトップ (Chrome/Edge)**: アドレスバーのインストールアイコンをクリック

## Google Drive連携のセットアップ（任意）

Google Driveの読み込み・保存を使うには、あなた自身のGoogle CloudプロジェクトでOAuthクライアントIDとAPIキーを取得し、アプリ右下の「⚙️ Google Drive 連携設定」に入力してください（値は端末のlocalStorageにのみ保存され、サーバーには送信されません）。

1. [Google Cloud Console](https://console.cloud.google.com/) で新しいプロジェクトを作成（無料）。
2. 「APIとサービス」→「ライブラリ」から **Google Drive API** と **Google Picker API** を有効化。
3. 「APIとサービス」→「認証情報」で以下を作成:
   - **OAuthクライアントID**（アプリケーションの種類: ウェブアプリケーション）。「承認済みのJavaScript生成元」に、実際にアプリを開くURL（例: `http://localhost:3000` や `http://192.168.x.x:3000`）を追加。
   - **APIキー**（Picker APIの呼び出しに使用）。
4. OAuth同意画面で自分のGoogleアカウントを「テストユーザー」に追加（個人利用のみなら公開審査は不要）。
5. アプリの設定画面にクライアントIDとAPIキーを貼り付けて保存。

権限スコープは `drive.file`（ユーザーが選んだファイル、またはこのアプリが作成したファイルのみにアクセス）に限定しているため、Drive内の他のファイルにはアクセスしません。

## 既知の制限

- 動画の書き出しはリアルタイム録画のため、曲の長さぶん時間がかかります（3分の曲なら約3分）。
- `MediaRecorder` の対応形式はブラウザにより異なります。Chrome/Edge/Android Chromeは基本的に動作します。iOS Safariは16.4以降を推奨（非対応の場合はエラーメッセージが表示されます）。
- 歌唱音声のAI自動抽出は、歌詞が正確に取れないことがあります。手動貼り付け＋タップ同期、または抽出後の手動修正を推奨します。
- Whisperモデルのダウンロードには初回のみ数十秒〜数分かかります（2回目以降はブラウザキャッシュから読み込むため高速です）。

## ファイル構成

```
mv-creator/
  index.html            画面本体（4ステップのウィザードUI）
  css/style.css
  manifest.json          PWAマニフェスト
  service-worker.js       オフライン用アプリシェルキャッシュ
  js/
    app.js               画面制御・状態管理
    audio.js             WAV読み込み・波形・再生（AnalyserNode/MediaStreamDestination）
    transcribe.js         音声認識の呼び出し（Web Worker経由）
    worker/whisper-worker.js  transformers.js (Whisper) を実行するWorker
    lyrics-sync.js        タップ同期 / シーン自動分割ロジック
    scene-renderer.js      Canvas背景・歌詞テロップの描画
    recorder.js           Canvas+音声のMediaRecorder録画
    drive.js              Google Drive連携（OAuth・Picker・アップロード）
  icons/                 PWA/ホーム画面アイコン
```
