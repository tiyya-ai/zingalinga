@echo off
echo Setting up Git repository...

cd "C:\Users\proth\OneDrive\Desktop\zinga linga final 2025"

git init
git add .
git commit -m "Initial commit - Fix React errors and admin dashboard"
git branch -M main
git remote add origin root@109.199.106.28:/var/www/zingalinga.git

echo.
echo Git repository initialized. Now generate SSH key:
echo ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
echo.
echo Then copy public key to VPS:
echo ssh-copy-id root@109.199.106.28

pause