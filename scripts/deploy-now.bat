@echo off
echo 🚀 Quick Deploy to GitHub...

git add .
git commit -m "Deploy with chat support - %date% %time%"
git push origin main

echo ✅ Pushed to GitHub!
echo 🌐 Visit: https://github.com/tiyya-ai/zingalinga/actions
pause