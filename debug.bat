@echo off
echo Checking app logs and rebuilding...
ssh root@109.199.106.28 "cd /var/www/zinga-linga && pm2 logs zinga-linga --lines 10 && echo '--- REBUILDING ---' && npm run build && pm2 restart zinga-linga && pm2 status"
pause