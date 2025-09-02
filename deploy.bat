@echo off
REM Windows VPS Deployment Script

echo 🚀 Building Next.js app...
call npm run build

echo 📦 Creating deployment package...
tar -czf zingalinga-deploy.tar.gz .next package.json package-lock.json public src next.config.js tsconfig.json tailwind.config.js postcss.config.js

echo 📤 VPS Deployment Commands:
echo # 1. Upload to VPS
echo scp zingalinga-deploy.tar.gz user@zingalinga.io:/var/www/
echo.
echo # 2. SSH and extract
echo ssh user@zingalinga.io
echo cd /var/www ^&^& tar -xzf zingalinga-deploy.tar.gz
echo.
echo # 3. Install and start
echo npm install --production
echo export NODE_ENV=production
echo export PORT=3000
echo npm start ^&
echo.
echo # 4. Check status
echo curl http://localhost:3000
echo ps aux ^| grep node
echo.
echo ✅ Deployment package ready: zingalinga-deploy.tar.gz