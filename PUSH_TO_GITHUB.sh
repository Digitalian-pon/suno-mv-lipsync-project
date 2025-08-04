#!/bin/bash

# 🚀 Suno AI Music Generator - GitHub Push Script
# このスクリプトでワンクリックでGitHubにプッシュできます

echo "🎵 Suno AI Music Generator - GitHub Push開始"
echo "================================================"

# 現在の状態を確認
echo "📊 現在のGit状態:"
git status

echo ""
echo "📋 コミット履歴:"
git log --oneline -3

echo ""
echo "🌐 リモートリポジトリ:"
git remote -v

# ユーザーに確認
echo ""
echo "⚠️  重要: GitHubで以下の設定でリポジトリを作成してください:"
echo "   Repository name: suno-ai-music-generator"
echo "   Description: 🎵 AI-Powered Suno Music Generation App with Gemini Integration"
echo "   Public を選択"
echo ""

read -p "GitHubでリポジトリを作成しましたか？ (y/N): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo ""
    echo "🚀 GitHubにプッシュを開始します..."
    
    # プッシュ実行
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 プッシュ成功！"
        echo "🌐 リポジトリURL: https://github.com/YOUR-USERNAME/suno-ai-music-generator"
        echo "📱 メインアプリ: gemini-suno-creator.html"
        echo ""
        echo "✅ 完了！GitHubでリポジトリを確認してください。"
    else
        echo ""
        echo "❌ プッシュに失敗しました。"
        echo "💡 解決方法:"
        echo "1. GitHubでリポジトリが正しく作成されているか確認"
        echo "2. GitHub usernameが正しいか確認"
        echo "3. Personal Access Tokenが必要な場合があります"
    fi
else
    echo ""
    echo "⏸️  プッシュをキャンセルしました。"
    echo "📖 GITHUB_SETUP.md を参照してリポジトリを作成してください。"
fi

echo ""
echo "🎵 スクリプト終了"