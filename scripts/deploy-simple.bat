@echo off
title Simple Auto Deploy - Zinga Linga

echo.
echo 🚀 Simple Auto Deploy for Zinga Linga
echo =====================================
echo.

echo ✅ VPS: 109.199.106.28
echo ✅ Domain: http://zingalinga.io/
echo ✅ User: root
echo.

echo 🔄 Step 1: Building website...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build completed!

echo.
echo 🔄 Step 2: Creating package...
tar -czf deploy.tar.gz .next package.json package-lock.json public src
echo ✅ Package created!

echo.
echo 🔄 Step 3: Uploading to server...
scp deploy.tar.gz root@109.199.106.28:/tmp/
if errorlevel 1 (
    echo ❌ Upload failed! Check your connection.
    pause
    exit /b 1
)
echo ✅ Upload completed!

echo.
echo 🔄 Step 4: Deploying on server...
ssh root@109.199.106.28 "cd /var/www/zinga-linga && tar -xzf /tmp/deploy.tar.gz && npm install --production && pm2 restart zinga-linga || pm2 start npm --name zinga-linga -- start && pm2 save && rm /tmp/deploy.tar.gz"
if errorlevel 1 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo.
echo 🔄 Step 5: Cleaning up...
del deploy.tar.gz

echo.
echo 🎉 DEPLOYMENT SUCCESSFUL!
echo ========================
echo.
echo ✅ Your website is now live at:
echo 🌐 http://zingalinga.io/
echo 🌐 http://109.199.106.28:3000
echo.
echo 📋 To check status: ssh root@109.199.106.28 "pm2 status"
echo.
pause