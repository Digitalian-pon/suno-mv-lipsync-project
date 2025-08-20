module.exports = {
  apps: [{
    name: 'suno-ai-music-generator',
    script: 'api-server.js',
    
    // 自動再起動設定
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 3000,
    
    // メモリ制限（必要に応じて調整）
    max_memory_restart: '500M',
    
    // エラーハンドリング
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    merge_logs: true,
    time: true,
    
    // 環境変数
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    
    // クラスターモード（必要に応じて有効化）
    instances: 1,
    exec_mode: 'fork',
    
    // 再起動戦略
    exp_backoff_restart_delay: 100,
    
    // クラッシュ後の自動再起動
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: true
  }]
};