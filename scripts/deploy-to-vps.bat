@echo off
echo ========================================
echo    ZINGA LINGA VPS DEPLOYMENT
echo ========================================
echo Target VPS: 109.199.106.28:22
echo.

echo [1/6] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/6] Building production version...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [3/6] Creating deployment package...
tar -czf zinga-linga-deploy.tar.gz src public data package.json next.config.js tailwind.config.js tsconfig.json postcss.config.js .env.production

echo.
echo [4/6] Package created successfully!
dir zinga-linga-deploy.tar.gz

echo.
echo [5/6] Uploading to VPS...
echo ========================================
echo VPS Details:
echo IP: 109.199.106.28
echo Port: 22
echo Password: Secureweb25
echo ========================================
echo.
echo Manual upload required:
echo 1. Use WinSCP, FileZilla, or SCP to upload zinga-linga-deploy.tar.gz
echo 2. SSH to server: ssh root@109.199.106.28
echo 3. Extract: tar -xzf zinga-linga-deploy.tar.gz
echo 4. Install: npm install --production
echo 5. Start: npm start
echo.

echo [6/6] VPS Commands to run:
echo ========================================
echo ssh root@109.199.106.28
echo tar -xzf zinga-linga-deploy.tar.gz
echo cd zinga-linga-nextjs
echo npm install --production
echo npm run build
echo npm start
echo ========================================
echo.
echo Deployment package ready: zinga-linga-deploy.tar.gz
echo Upload this file to your VPS and run the commands above.
echo.
pause