@echo off
echo Manual deployment to VPS...

echo Building project...
call npm run build

echo Creating deployment package...
tar -czf deploy.tar.gz .next package.json package-lock.json public src next.config.js tailwind.config.js postcss.config.js tsconfig.json

echo Uploading to VPS...
scp deploy.tar.gz root@109.199.106.28:/tmp/

echo Deploying on VPS...
ssh root@109.199.106.28 "cd /var/www/zinga-linga && tar -xzf /tmp/deploy.tar.gz && npm install && pm2 restart zinga-linga || pm2 start npm --name zinga-linga -- start"

echo Deployment complete!
pause