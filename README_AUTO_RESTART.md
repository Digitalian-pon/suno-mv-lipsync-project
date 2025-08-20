# 自動再起動機能

Suno AI Music Generatorに自動再起動機能を実装しました。

## 利用可能な起動方法

### 1. PM2を使用（推奨）
PM2は高度なプロセス管理ツールで、自動再起動、ログ管理、モニタリング機能を提供します。

```bash
# PM2でサーバーを起動
npm run pm2:start

# サーバーの状態を確認
npm run pm2:status

# ログを表示
npm run pm2:logs

# サーバーを再起動
npm run pm2:restart

# サーバーを停止
npm run pm2:stop

# PM2からアプリを削除
npm run pm2:delete
```

### 2. Bashスクリプトを使用
シンプルな自動再起動スクリプトです。

```bash
# 自動再起動モードで起動
npm run start:auto
# または
./auto-restart.sh
```

### 3. 通常起動（再起動なし）
```bash
npm start
```

## 機能詳細

### PM2設定（ecosystem.config.js）
- **自動再起動**: クラッシュ時に自動的に再起動
- **最大再起動回数**: 10回まで
- **再起動遅延**: 3秒
- **メモリ制限**: 500MBを超えると再起動
- **ログ管理**: logs/フォルダに保存

### Bashスクリプト（auto-restart.sh）
- **最大再起動回数**: 10回
- **再起動遅延**: 3秒
- **終了コード監視**: 異常終了時のみ再起動

## トラブルシューティング

### PM2が起動しない場合
```bash
# PM2デーモンを再起動
npx pm2 kill
npm run pm2:start
```

### ログを確認
```bash
# PM2のログ
npm run pm2:logs

# ログファイル直接確認
cat logs/error.log
cat logs/out.log
```

### システム起動時の自動起動設定
```bash
# PM2の起動スクリプトを生成
npx pm2 startup
# 表示されたコマンドを実行

# 現在の設定を保存
npx pm2 save
```

## 注意事項
- Termuxでは一部のPM2機能が制限される場合があります
- メモリ不足の場合は、ecosystem.config.jsのmax_memory_restartを調整してください