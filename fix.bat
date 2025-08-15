@echo off
echo Connecting to VPS to restart app...
ssh root@109.199.106.28 "cd /var/www/zinga-linga && pm2 restart zinga-linga && pm2 status"
echo App restarted!
pause