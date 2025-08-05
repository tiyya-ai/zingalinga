@echo off
echo Cleaning up unnecessary files...

REM Remove deployment scripts (keep only the essential ones)
del /f deploy-simple.bat 2>nul
del /f deploy-simple.sh 2>nul
del /f deploy-to-vps.bat 2>nul
del /f deploy-vps.bat 2>nul
del /f deploy-vps.sh 2>nul
del /f setup-vps.bat 2>nul
del /f setup-vps.sh 2>nul
del /f one-click-deploy.js 2>nul
del /f deployment-tracker.js 2>nul
del /f deployment-tracker.bat 2>nul
del /f check-deployment.js 2>nul
del /f test-deployment.js 2>nul
del /f temp_fix.js 2>nul
del /f vps-config.js 2>nul

REM Remove extra markdown files
del /f AUTO-DEPLOY-GUIDE.md 2>nul
del /f DEPLOY_TO_VPS.md 2>nul
del /f GITHUB-ACTIONS-SETUP.md 2>nul
del /f QUICK-START-DEPLOYMENT.md 2>nul
del /f QUICK-START-EN.md 2>nul
del /f VPS-DEPLOYMENT-READY.md 2>nul
del /f DEPLOYMENT-TRACKER-README.md 2>nul

REM Remove nginx configs (keep only one)
del /f nginx.conf 2>nul
del /f nginx-zinga-linga.conf 2>nul

REM Commit changes
git add .
git commit -m "Clean up unnecessary files"
git push origin main

echo ✅ Repository cleaned up!
pause