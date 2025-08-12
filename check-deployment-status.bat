@echo off
echo ========================================
echo   🔍 CHECKING DEPLOYMENT STATUS
echo ========================================
echo.

echo 📋 Checking GitHub repository status...
echo Repository: https://github.com/tiyya-ai/zingalinga
echo.

echo 🔗 Checking if local changes are pushed to GitHub...
git status
echo.

echo 📊 Latest commits:
git log --oneline -5
echo.

echo 🌐 Checking VPS status...
echo VPS URL: http://zingalinga.io
echo VPS IP: 109.199.106.28
echo.

echo 🔍 To manually check VPS deployment:
echo 1. Visit: http://zingalinga.io
echo 2. Check browser developer tools for any errors
echo 3. Look for your recent changes in the UI
echo.

echo 📝 To check VPS logs manually:
echo ssh root@109.199.106.28
echo cd /var/www/zinga-linga
echo git log --oneline -5
echo pm2 logs zinga-linga
echo.

echo ⚡ Quick deployment verification:
echo - Check GitHub Actions: https://github.com/tiyya-ai/zingalinga/actions
echo - Verify latest commit hash matches between GitHub and VPS
echo - Test your specific changes on the live site
echo.

echo 🚀 If changes are not visible:
echo 1. Check GitHub Actions for deployment errors
echo 2. Clear browser cache (Ctrl+F5)
echo 3. Wait 2-3 minutes for deployment to complete
echo 4. Check PM2 process status on VPS
echo.

pause