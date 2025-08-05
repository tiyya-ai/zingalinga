# 🚀 SUPER EASY GitHub Auto-Deploy

## How It Works
1. You push code to GitHub
2. GitHub automatically deploys to your server
3. Your website is live!

## Setup (One Time Only)

### Step 1: Connect to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zinga-linga-nextjs.git
git push -u origin main
```

### Step 2: Add GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these 3 secrets:
- **VPS_HOST**: `109.199.106.28`
- **VPS_USER**: `root`  
- **VPS_PASSWORD**: `Secureweb25`

### Step 3: Done! 🎉

## How to Deploy

Just push your code:
```bash
git add .
git commit -m "Update website"
git push
```

**That's it!** Your website will automatically deploy to http://zingalinga.io/

## No More Manual Work!
- ✅ No scripts to run
- ✅ No files to upload
- ✅ No server commands
- ✅ Just push and it's live!