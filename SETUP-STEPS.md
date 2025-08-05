# 🚀 EASIEST GitHub Auto-Deploy Setup

## Step 1: Create GitHub Repository
1. Go to https://github.com
2. Click "New repository"
3. Name it: `zinga-linga-nextjs`
4. Make it Public
5. Click "Create repository"

## Step 2: Connect Your Code to GitHub
Copy and paste these commands one by one:

```bash
git init
git add .
git commit -m "🚀 Initial commit with auto-deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zinga-linga-nextjs.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 3: Add Secrets to GitHub
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**
5. Add these 3 secrets:

### Secret 1:
- **Name**: `VPS_HOST`
- **Value**: `109.199.106.28`

### Secret 2:
- **Name**: `VPS_USER`
- **Value**: `root`

### Secret 3:
- **Name**: `VPS_PASSWORD`
- **Value**: `Secureweb25`

## Step 4: Test Auto-Deploy
Make any small change to your code, then run:

```bash
git add .
git commit -m "Test auto-deploy"
git push
```

Go to your GitHub repository → **Actions** tab to watch the deployment!

## Step 5: Your Website is Live! 🎉
Visit: **http://zingalinga.io/**

## Future Deployments
Just run these 3 commands whenever you want to deploy:

```bash
git add .
git commit -m "Update website"
git push
```

**That's it! Your website will automatically deploy every time you push!**