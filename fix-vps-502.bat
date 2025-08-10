@echo off
echo ========================================
echo   VPS 502 Error Fix Script
echo ========================================
echo.
echo Checking VPS status and attempting to fix 502 Bad Gateway error...
echo.

echo Step 1: Connecting to VPS and checking PM2 status...
ssh root@109.199.106.28 "pm2 list"
echo.

echo Step 2: Checking if application is running...
ssh root@109.199.106.28 "pm2 logs zinga-linga --lines 20"
echo.

echo Step 3: Restarting the application...
ssh root@109.199.106.28 "cd /var/www/zinga-linga && pm2 restart zinga-linga"
echo.

echo Step 4: Checking nginx status...
ssh root@109.199.106.28 "systemctl status nginx"
echo.

echo Step 5: Restarting nginx if needed...
ssh root@109.199.106.28 "systemctl restart nginx"
echo.

echo Step 6: Final status check...
ssh root@109.199.106.28 "pm2 list && curl -I http://localhost:3000"
echo.

echo ========================================
echo   Fix attempt completed!
echo   Please check https://zingalinga.io/
echo ========================================
pause