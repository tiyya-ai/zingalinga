@echo off
REM =============================================================================
REM Zinga Linga VPS Deployment - Windows Batch Script
REM =============================================================================

echo.
echo ========================================
echo    ZINGA LINGA VPS DEPLOYMENT
echo ========================================
echo.
echo This script will help you deploy Zinga Linga to your VPS
echo.

REM Colors for Windows
color 0A

echo [INFO] VPS Server Details:
echo   IP Address: 109.199.106.28
echo   Username: root
echo   Password: Secureweb25
echo   VNC: 5.189.142.114:63215
echo.

echo [INFO] Deployment Options:
echo   1. Transfer files and deploy automatically
echo   2. Create deployment package for manual upload
echo   3. Show manual deployment commands
echo   4. Open VPS connection guide
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto auto_deploy
if "%choice%"=="2" goto create_package
if "%choice%"=="3" goto manual_commands
if "%choice%"=="4" goto connection_guide

echo [ERROR] Invalid choice. Please run the script again.
pause
exit /b 1

:auto_deploy
echo.
echo [INFO] Starting automatic deployment...
echo.
echo [WARNING] You will need:
echo   1. SSH client (like PuTTY or Windows OpenSSH)
echo   2. SCP client for file transfer
echo.
echo [INFO] Checking for Windows Subsystem for Linux (WSL)...

wsl --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] WSL detected. Using WSL for deployment.
    echo.
    echo [INFO] Running deployment via WSL...
    wsl bash ./transfer-to-vps.sh
) else (
    echo [WARNING] WSL not detected. Please use one of these options:
    echo.
    echo Option A: Install WSL (Recommended)
    echo   1. Open PowerShell as Administrator
    echo   2. Run: wsl --install
    echo   3. Restart computer
    echo   4. Run this script again
    echo.
    echo Option B: Use PuTTY/WinSCP
    echo   1. Download PuTTY and WinSCP
    echo   2. Use WinSCP to upload files to VPS
    echo   3. Use PuTTY to connect and run deployment
    echo.
    echo Option C: Use PowerShell SSH
    echo   1. Enable OpenSSH client in Windows Features
    echo   2. Use PowerShell to connect to VPS
    echo.
    goto connection_guide
)
goto end

:create_package
echo.
echo [INFO] Creating deployment package...
echo.

REM Create timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

set "package_name=zinga-deployment-%timestamp%.zip"

echo [INFO] Creating package: %package_name%
echo.

REM Create zip file using PowerShell
powershell -command "Compress-Archive -Path '*.sh', 'README.md' -DestinationPath '%package_name%'"

if exist "%package_name%" (
    echo [SUCCESS] Package created: %package_name%
    echo.
    echo [INFO] Upload this package to your VPS and extract it.
    echo.
    echo Manual upload instructions:
    echo   1. Use WinSCP, FileZilla, or similar to upload %package_name%
    echo   2. Connect to VPS: 109.199.106.28 (root/Secureweb25)
    echo   3. Extract: unzip %package_name%
    echo   4. Make executable: chmod +x *.sh
    echo   5. Run deployment: sudo bash deploy-all.sh
    echo.
    echo [INFO] Opening file location...
    explorer .
) else (
    echo [ERROR] Failed to create package
    echo [INFO] Please ensure PowerShell is available and try again
)
goto end

:manual_commands
echo.
echo [INFO] Manual Deployment Commands
echo =====================================
echo.
echo Step 1: Connect to VPS
echo   ssh root@109.199.106.28
echo   Password: Secureweb25
echo.
echo Step 2: Download deployment script
echo   wget https://raw.githubusercontent.com/tiyya-ai/zinga-linga-app/main/deploy-scripts/deploy-all.sh
echo   chmod +x deploy-all.sh
echo.
echo Step 3: Run deployment
echo   sudo bash deploy-all.sh
echo.
echo Alternative: Upload files manually
echo   1. Use WinSCP to upload all .sh files and README.md
echo   2. SSH to VPS and run: chmod +x *.sh
echo   3. Run: sudo bash deploy-all.sh
echo.
echo [INFO] Deployment takes 15-20 minutes
echo [INFO] App will be available at: http://109.199.106.28
echo.
goto end

:connection_guide
echo.
echo [INFO] VPS Connection Guide
echo ==========================
echo.
echo Connection Details:
echo   IP Address: 109.199.106.28
echo   Username: root
echo   Password: Secureweb25
echo   VNC: 5.189.142.114:63215
echo.
echo Connection Methods:
echo.
echo Method 1: Windows PowerShell (if OpenSSH is enabled)
echo   ssh root@109.199.106.28
echo.
echo Method 2: PuTTY
echo   1. Download PuTTY from https://putty.org/
echo   2. Host Name: 109.199.106.28
echo   3. Port: 22
echo   4. Connection Type: SSH
echo   5. Username: root, Password: Secureweb25
echo.
echo Method 3: VNC Client
echo   1. Download VNC Viewer
echo   2. Connect to: 5.189.142.114:63215
echo   3. Password: (VNC password if different)
echo.
echo Method 4: WSL (Windows Subsystem for Linux)
echo   1. Install WSL: wsl --install
echo   2. Restart computer
echo   3. Use: ssh root@109.199.106.28
echo.
echo File Transfer Methods:
echo.
echo Method 1: WinSCP
echo   1. Download from https://winscp.net/
echo   2. Protocol: SFTP
echo   3. Host: 109.199.106.28
echo   4. Username: root, Password: Secureweb25
echo.
echo Method 2: FileZilla
echo   1. Download from https://filezilla-project.org/
echo   2. Host: sftp://109.199.106.28
echo   3. Username: root, Password: Secureweb25
echo   4. Port: 22
echo.
echo Quick Deployment (once connected):
echo   wget https://raw.githubusercontent.com/tiyya-ai/zinga-linga-app/main/deploy-scripts/deploy-all.sh
echo   chmod +x deploy-all.sh
echo   sudo bash deploy-all.sh
echo.
echo [INFO] Need more help? Check README.md for detailed instructions.
echo.

:end
echo.
echo ========================================
echo    DEPLOYMENT INFORMATION
echo ========================================
echo.
echo After successful deployment:
echo   Application URL: http://109.199.106.28
echo   Deployment time: 15-20 minutes
echo   Management: zinga-manage commands
echo.
echo Next steps:
echo   1. Test your application
echo   2. Setup HTTPS: zinga-manage ssl
echo   3. Configure domain (optional)
echo.
echo Support:
echo   - Check deployment logs on VPS
echo   - Use zinga-manage status for system info
echo   - Review README.md for troubleshooting
echo.
echo [INFO] Press any key to exit...
pause >nul
exit /b 0