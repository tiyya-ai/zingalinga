@echo off
echo Connecting to VPS to check last commit...
echo.

ssh root@109.199.106.28 "cd /var/www/zingalinga && git log --oneline -5 && echo && echo 'Current branch:' && git branch && echo && echo 'Git status:' && git status --short"

pause