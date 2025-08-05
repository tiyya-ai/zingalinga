@echo off
echo.
echo ========================================
echo   🚀 ZINGA LINGA - GITHUB TO VPS DEPLOY
echo ========================================
echo.

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed or not in PATH
    echo Please install Git first: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo 📋 Current status:
echo Repository: https://github.com/tiyya-ai/zingalinga
echo VPS: 109.199.106.28 (zingalinga.io)
echo.

REM Check if we're in a git repository
if not exist ".git" (
    echo ❌ This is not a Git repository
    echo Please run this script from your project root directory
    pause
    exit /b 1
)

echo 📦 Preparing deployment...

REM Add all changes
echo Adding all changes to git...
git add .

REM Check if there are changes to commit
git diff --staged --quiet
if errorlevel 1 (
    echo 📝 Committing changes...
    set /p commit_message="Enter commit message (or press Enter for default): "
    if "%commit_message%"=="" set commit_message=Deploy update - %date% %time%
    git commit -m "%commit_message%"
) else (
    echo ℹ️ No changes to commit
)

echo 🚀 Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ❌ Failed to push to GitHub
    echo Please check your internet connection and GitHub credentials
    pause
    exit /b 1
)

echo.
echo ✅ Successfully pushed to GitHub!
echo.
echo 🔄 GitHub Actions will now automatically:
echo   1. Build your Next.js application
echo   2. Deploy to your VPS (109.199.106.28)
echo   3. Start the application with PM2
echo   4. Configure NGINX proxy
echo.
echo 🌐 Your website will be available at:
echo   - http://zingalinga.io
echo   - http://109.199.106.28:3000
echo.
echo 📊 Monitor deployment progress:
echo   - GitHub Actions: https://github.com/tiyya-ai/zingalinga/actions
echo   - VPS Logs: ssh root@109.199.106.28 "pm2 logs zinga-linga"
echo.

REM Ask if user wants to open GitHub Actions
set /p open_github="Open GitHub Actions in browser? (y/n): "
if /i "%open_github%"=="y" (
    start https://github.com/tiyya-ai/zingalinga/actions
)

REM Ask if user wants to test the website
set /p test_site="Test website in browser? (y/n): "
if /i "%test_site%"=="y" (
    echo 🌐 Opening website...
    start http://zingalinga.io
)

echo.
echo 🎉 Deployment initiated successfully!
echo The deployment process will take 2-3 minutes to complete.
echo.
pause