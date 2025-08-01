@echo off
echo ========================================
echo    Zinga Linga VPS Deployment Script
echo ========================================
echo.

echo [1/5] Building the application...
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/5] Creating deployment package...
tar -czf zinga-linga-working-login.tar.gz --exclude=node_modules --exclude=.git --exclude=*.zip --exclude=*.tar.gz .
if %errorlevel% neq 0 (
    echo ERROR: Failed to create deployment package!
    pause
    exit /b 1
)

echo.
echo [3/5] Package created successfully!
dir zinga-linga-working-login.tar.gz

echo.
echo [4/5] Upload commands for VPS:
echo.
echo Run these commands to upload to your VPS:
echo scp zinga-linga-working-login.tar.gz root@109.199.106.28:/tmp/
echo scp update-vps.sh root@109.199.106.28:/tmp/
echo.
echo [5/5] VPS deployment commands:
echo.
echo SSH into your VPS and run:
echo ssh root@109.199.106.28
echo cd /tmp
echo chmod +x update-vps.sh
echo ./update-vps.sh
echo.
echo ========================================
echo    Deployment package ready!
echo ========================================
echo.
echo Your application will be available at:
echo http://109.199.106.28:3000
echo.
pause