@echo off
echo Cleaning up repository - removing unnecessary files...

REM Remove build artifacts and cache
if exist ".next" rmdir /s /q ".next"
if exist "node_modules" rmdir /s /q "node_modules"
if exist "out" rmdir /s /q "out"
if exist "build" rmdir /s /q "build"

REM Remove data directory (contains backups and user data)
if exist "data" rmdir /s /q "data"

REM Remove SSH keys directory
if exist "%USERPROFILE%" rmdir /s /q "%USERPROFILE%"

REM Remove backup and temporary files
del /f /q *.tsbuildinfo 2>nul
del /f /q *.log 2>nul
del /f /q commit_message.txt 2>nul
del /f /q deploy.tar.gz 2>nul
del /f /q trigger-deploy.txt 2>nul

REM Remove documentation files that are not needed
del /f /q AUDIO_LESSONS_PP1_IMPROVEMENTS.md 2>nul
del /f /q DASHBOARD_ANALYSIS_REPORT.md 2>nul
del /f /q DASHBOARD_CLEANUP_SUMMARY.md 2>nul
del /f /q DATA_PRESERVATION_GUIDE.md 2>nul
del /f /q PRICING_REMOVAL_COMMIT.md 2>nul
del /f /q QUICK_FIXES_SUMMARY.md 2>nul
del /f /q VIDEO_EDIT_FIX.md 2>nul
del /f /q VIDEO_FIXES_SUMMARY.md 2>nul
del /f /q VIDEO_UPLOAD_FIX.md 2>nul
del /f /q fix-vps-profile-issue.md 2>nul

REM Remove deployment and diagnostic scripts
del /f /q check-deployment-status.bat 2>nul
del /f /q check-vps-deployment.ps1 2>nul
del /f /q check-vps-direct.bat 2>nul
del /f /q diagnose-vps-issue.sh 2>nul
del /f /q fix-vps-502.bat 2>nul
del /f /q manual-deploy.bat 2>nul
del /f /q ssh-check-vps.bat 2>nul
del /f /q test-notifications.js 2>nul
del /f /q fix-types.cjs 2>nul
del /f /q fix-types.js 2>nul

REM Remove backup components
del /f /q "src\components\CartModal_backup.tsx" 2>nul
del /f /q "src\components\LandingPage_backup.tsx" 2>nul
del /f /q "src\components\ModernAdminDashboard.module.css.backup" 2>nul
del /f /q "src\components\ProfessionalUserDashboard_backup.tsx" 2>nul
del /f /q "src\components\VideoCardFix.md" 2>nul

REM Remove backup pages directory
if exist "src\pages-backup" rmdir /s /q "src\pages-backup"

REM Remove test components
del /f /q "src\components\ImageTestComponent.tsx" 2>nul
del /f /q "src\components\VideoTestComponent.tsx" 2>nul
del /f /q "src\app\test-video-card\page.tsx" 2>nul
if exist "src\app\test-video-card" rmdir /s /q "src\app\test-video-card"

REM Remove unused utility files
del /f /q "src\utils\authFixed.ts" 2>nul
del /f /q "src\utils\comprehensiveSecurityFix.ts" 2>nul
del /f /q "src\utils\mockApi.ts" 2>nul
del /f /q "src\utils\neonDataStore.ts" 2>nul
del /f /q "src\utils\optimizedDataStore.ts" 2>nul
del /f /q "src\utils\cloudDataStore.ts" 2>nul

REM Remove environment files (keep .env.example)
del /f /q .env 2>nul

echo Cleanup completed!
echo.
echo Files removed:
echo - Build artifacts (.next, node_modules, out, build)
echo - Data directory (backups and user data)
echo - SSH keys directory
echo - Temporary and log files
echo - Unnecessary documentation files
echo - Deployment and diagnostic scripts
echo - Backup components and test files
echo - Unused utility files
echo - Environment files (except .env.example)
echo.
echo Repository is now clean for GitHub!
pause