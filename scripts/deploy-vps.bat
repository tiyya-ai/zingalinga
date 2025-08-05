@echo off
echo ========================================
echo    ZINGA LINGA VPS DEPLOYMENT
echo ========================================
echo.

echo [1/5] Building production version...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/5] Creating deployment package...
tar -czf zinga-linga-production.tar.gz src public data package.json next.config.js tailwind.config.js tsconfig.json postcss.config.js .env.production

echo.
echo [3/5] Package created: zinga-linga-production.tar.gz
echo File size:
dir zinga-linga-production.tar.gz

echo.
echo [4/5] VPS Upload Instructions:
echo ========================================
echo 1. Upload zinga-linga-production.tar.gz to your VPS
echo 2. Extract: tar -xzf zinga-linga-production.tar.gz
echo 3. Install: npm install --production
echo 4. Build: npm run build
echo 5. Start: npm start
echo.
echo Default port: 3000
echo Admin login: admin@zingalinga.com / admin123
echo User login: test@example.com / test123
echo ========================================

echo.
echo [5/5] Deployment package ready!
echo Upload zinga-linga-production.tar.gz to your VPS
echo.
pause