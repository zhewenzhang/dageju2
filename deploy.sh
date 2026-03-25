#!/bin/bash

# 《大棋局2》GitHub 部署腳本
# 使用方法：./deploy.sh

set -e

echo "🚀 開始部署《大棋局2》到 GitHub Pages..."

# 配置
REPO_URL="https://github.com/zhewenzhang/dageju2.git"

# 檢查 Token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ 請設置環境變量 GITHUB_TOKEN"
    echo "   export GITHUB_TOKEN=your_token_here"
    exit 1
fi

# 檢查是否在正確目錄
if [ ! -f "SUMMARY.md" ]; then
    echo "❌ 錯誤：請在 大棋局2 目錄下執行此腳本"
    exit 1
fi

# 設置遠程倉庫
echo "📡 設置 GitHub 遠程倉庫..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://${GITHUB_TOKEN}@github.com/zhewenzhang/dageju2.git"

# 推送代碼
echo "📤 推送源代碼到 GitHub..."
git push -u origin main --force

echo "✅ 代碼推送完成！"
echo ""
echo "🌐 請前往 GitHub 倉庫設置 Pages："
echo "   1. 訪問 https://github.com/zhewenzhang/dageju2"
echo "   2. 點擊 Settings → Pages"
echo "   3. Source 選擇 'Deploy from a branch'"
echo "   4. Branch 選擇 'gh-pages'"
echo "   5. 保存後等待部署完成"
echo ""
echo "📖 部署完成後訪問：https://zhewenzhang.github.io/dageju2/"
