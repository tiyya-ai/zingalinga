@echo off
echo ========================================
echo   🔍 SSH VPS DEPLOYMENT VERIFICATION
echo ========================================
echo.

echo 📋 VPS Details:
echo IP: 109.199.106.28
echo Port: 22
echo User: root
echo.

echo 🌐 Your website is live at: https://zingalinga.io
echo.

echo 🔧 To manually check VPS deployment via SSH:
echo.
echo 1. Connect to VPS:
echo    ssh root@109.199.106.28
echo    (Password: Secureweb25)
echo.
echo 2. Navigate to project directory:
echo    cd /var/www/zinga-linga
echo.
echo 3. Check latest commits on VPS:
echo    git log --oneline -5
echo    git status
echo.
echo 4. Verify your latest commit is there:
echo    git show --name-only HEAD
echo.
echo 5. Check PM2 process status:
echo    pm2 status
echo    pm2 logs zinga-linga --lines 20
echo.
echo 6. Check if build is up to date:
echo    ls -la .next/
echo    npm run build
echo.
echo 7. Restart services if needed:
echo    pm2 restart zinga-linga
echo    pm2 reload zinga-linga
echo    systemctl restart nginx
echo.
echo 🚨 If changes still not visible:
echo.
echo A. Force rebuild and restart:
echo    rm -rf .next/
echo    npm run build
echo    pm2 restart zinga-linga
echo.
echo B. Check disk space:
echo    df -h
echo.
echo C. Check system resources:
echo    free -h
echo    top
echo.
echo D. Check nginx status:
echo    systemctl status nginx
echo    nginx -t
echo.
echo 💡 Browser troubleshooting:
echo - Clear all browser data (Ctrl+Shift+Delete)
echo - Try incognito/private mode
echo - Try different browser
echo - Hard refresh (Ctrl+F5)
echo - Check developer console for errors
echo.
echo 🔗 Quick SSH command to run all checks:
echo ssh root@109.199.106.28 "cd /var/www/zinga-linga && git log --oneline -3 && pm2 status && pm2 logs zinga-linga --lines 5"
echo.
pause