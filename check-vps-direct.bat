@echo off
echo ========================================
echo   🔍 DIRECT VPS DEPLOYMENT CHECK
echo ========================================
echo.

echo 📋 Checking VPS deployment status...
echo VPS: 109.199.106.28 (zingalinga.io)
echo.

echo 🌐 Testing VPS connection...
ping -n 4 109.199.106.28
echo.

echo 🔗 Checking website response...
curl -I http://zingalinga.io 2>nul || echo Website might be down or unreachable
echo.

echo 📊 To manually verify VPS deployment:
echo.
echo 1. SSH into VPS:
echo    ssh root@109.199.106.28
echo.
echo 2. Check if code was pulled:
echo    cd /var/www/zinga-linga
echo    git log --oneline -3
echo    git status
echo.
echo 3. Check PM2 process:
echo    pm2 status
echo    pm2 logs zinga-linga --lines 10
echo.
echo 4. Check if build was successful:
echo    ls -la .next/
echo    npm run build
echo.
echo 5. Restart services if needed:
echo    pm2 restart zinga-linga
echo    pm2 reload zinga-linga
echo.
echo 🚨 Common issues:
echo - VPS might be out of disk space
echo - Node.js process might have crashed
echo - Build might have failed
echo - Git pull might have failed
echo - PM2 process might not be running
echo.
echo 💡 Quick fixes to try:
echo - Clear browser cache completely (Ctrl+Shift+Delete)
echo - Try incognito/private browsing mode
echo - Check different browsers
echo - Wait 5-10 minutes and try again
echo.
echo 🔧 If still not working, run these VPS commands:
echo sudo systemctl restart nginx
echo pm2 restart all
echo npm run build
echo.
pause