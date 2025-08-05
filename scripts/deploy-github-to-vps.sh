#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "========================================"
echo "  🚀 ZINGA LINGA - GITHUB TO VPS DEPLOY"
echo "========================================"
echo -e "${NC}"

# Check if git is available
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    echo "Please install Git first"
    exit 1
fi

echo -e "${BLUE}📋 Current status:${NC}"
echo "Repository: https://github.com/tiyya-ai/zingalinga"
echo "VPS: 109.199.106.28 (zingalinga.io)"
echo

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ This is not a Git repository${NC}"
    echo "Please run this script from your project root directory"
    exit 1
fi

echo -e "${YELLOW}📦 Preparing deployment...${NC}"

# Add all changes
echo "Adding all changes to git..."
git add .

# Check if there are changes to commit
if ! git diff --staged --quiet; then
    echo -e "${YELLOW}📝 Committing changes...${NC}"
    read -p "Enter commit message (or press Enter for default): " commit_message
    if [ -z "$commit_message" ]; then
        commit_message="Deploy update - $(date)"
    fi
    git commit -m "$commit_message"
else
    echo -e "${BLUE}ℹ️ No changes to commit${NC}"
fi

echo -e "${YELLOW}🚀 Pushing to GitHub...${NC}"
if git push origin main; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    echo "Please check your internet connection and GitHub credentials"
    exit 1
fi

echo
echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
echo
echo -e "${BLUE}🔄 GitHub Actions will now automatically:${NC}"
echo "  1. Build your Next.js application"
echo "  2. Deploy to your VPS (109.199.106.28)"
echo "  3. Start the application with PM2"
echo "  4. Configure NGINX proxy"
echo
echo -e "${GREEN}🌐 Your website will be available at:${NC}"
echo "  - http://zingalinga.io"
echo "  - http://109.199.106.28:3000"
echo
echo -e "${BLUE}📊 Monitor deployment progress:${NC}"
echo "  - GitHub Actions: https://github.com/tiyya-ai/zingalinga/actions"
echo "  - VPS Logs: ssh root@109.199.106.28 \"pm2 logs zinga-linga\""
echo

# Ask if user wants to open GitHub Actions
read -p "Open GitHub Actions in browser? (y/n): " open_github
if [[ $open_github =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open https://github.com/tiyya-ai/zingalinga/actions
    elif command -v open &> /dev/null; then
        open https://github.com/tiyya-ai/zingalinga/actions
    else
        echo "Please open: https://github.com/tiyya-ai/zingalinga/actions"
    fi
fi

# Ask if user wants to test the website
read -p "Test website in browser? (y/n): " test_site
if [[ $test_site =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🌐 Opening website...${NC}"
    if command -v xdg-open &> /dev/null; then
        xdg-open http://zingalinga.io
    elif command -v open &> /dev/null; then
        open http://zingalinga.io
    else
        echo "Please open: http://zingalinga.io"
    fi
fi

echo
echo -e "${GREEN}🎉 Deployment initiated successfully!${NC}"
echo "The deployment process will take 2-3 minutes to complete."
echo