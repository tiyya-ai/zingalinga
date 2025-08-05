#!/bin/bash

# Setup GitHub Auto-Deploy for Zinga Linga

echo ""
echo "🚀 Setup GitHub Auto-Deploy for Zinga Linga"
echo "============================================"
echo ""

echo "This will setup automatic deployment from GitHub to your VPS."
echo "Every time you push code, it will automatically deploy!"
echo ""

read -p "Enter your GitHub repository URL (e.g., https://github.com/username/zinga-linga-nextjs.git): " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ Repository URL is required!"
    exit 1
fi

echo ""
echo "🔄 Setting up Git repository..."

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git initialized"
fi

# Add all files
git add .
echo "✅ Files added"

# Commit
git commit -m "🚀 Initial commit with auto-deploy setup"
echo "✅ Files committed"

# Set main branch
git branch -M main
echo "✅ Main branch set"

# Add remote
git remote remove origin 2>/dev/null
git remote add origin "$repo_url"
echo "✅ Remote repository added"

# Push to GitHub
echo ""
echo "🔄 Pushing to GitHub..."
git push -u origin main

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Push failed! Please check:"
    echo "1. Your GitHub repository exists"
    echo "2. You have access to the repository"
    echo "3. Your Git credentials are set up"
    echo ""
    echo "Run this command manually:"
    echo "git push -u origin main"
    exit 1
fi

echo ""
echo "✅ Code pushed to GitHub successfully!"
echo ""
echo "📋 NEXT STEPS:"
echo "============"
echo ""
echo "1. Go to your GitHub repository"
echo "2. Click: Settings → Secrets and variables → Actions"
echo "3. Add these 3 secrets:"
echo ""
echo "   Name: VPS_HOST"
echo "   Value: 109.199.106.28"
echo ""
echo "   Name: VPS_USER"
echo "   Value: root"
echo ""
echo "   Name: VPS_PASSWORD"
echo "   Value: Secureweb25"
echo ""
echo "4. That's it! Now every time you push code:"
echo "   git add ."
echo "   git commit -m \"Update website\""
echo "   git push"
echo ""
echo "   Your website will automatically deploy to:"
echo "   🌐 http://zingalinga.io/"
echo ""