#!/bin/bash

# Suno AI Music Generator 自動再起動スクリプト
# このスクリプトはサーバーがクラッシュした場合に自動的に再起動します

echo "🎵 Suno AI Music Generator 自動再起動モード"
echo "サーバーを起動しています..."

# 再起動カウンター
RESTART_COUNT=0
MAX_RESTARTS=10
RESTART_DELAY=3

# 無限ループで監視
while true; do
    echo ""
    echo "起動回数: $((RESTART_COUNT + 1))"
    echo "サーバー起動時刻: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "----------------------------------------"
    
    # サーバーを起動
    node api-server.js
    
    # 終了コードを取得
    EXIT_CODE=$?
    
    # 再起動カウンターを増やす
    RESTART_COUNT=$((RESTART_COUNT + 1))
    
    # 終了コードが0の場合（正常終了）
    if [ $EXIT_CODE -eq 0 ]; then
        echo "✅ サーバーが正常に終了しました"
        break
    fi
    
    # 最大再起動回数をチェック
    if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
        echo "❌ 最大再起動回数（$MAX_RESTARTS回）に達しました"
        echo "問題が解決しない場合は、エラーログを確認してください"
        exit 1
    fi
    
    # エラー通知
    echo "⚠️ サーバーがクラッシュしました（終了コード: $EXIT_CODE）"
    echo "$RESTART_DELAY秒後に再起動します..."
    
    # 待機
    sleep $RESTART_DELAY
done

echo "自動再起動スクリプトを終了します"