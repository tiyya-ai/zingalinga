# =============================================================================
# Zinga Linga VPS Deployment - PowerShell Script
# =============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    ZINGA LINGA VPS DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# VPS Configuration
$VPS_IP = "109.199.106.28"
$VPS_USER = "root"
$VPS_PASSWORD = "Secureweb25"
$DEPLOYMENT_URL = "https://raw.githubusercontent.com/tiyya-ai/zinga-linga-app/main/deploy-scripts/deploy-all.sh"

Write-Host "[INFO] VPS Server Details:" -ForegroundColor Green
Write-Host "  IP Address: $VPS_IP"
Write-Host "  Username: $VPS_USER"
Write-Host "  Password: $VPS_PASSWORD"
Write-Host ""

# Check if SSH is available
try {
    $sshVersion = ssh -V 2>&1
    Write-Host "[SUCCESS] SSH client detected: $sshVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] SSH client not found. Please install OpenSSH client." -ForegroundColor Red
    Write-Host "To install: Go to Settings > Apps > Optional Features > Add Feature > OpenSSH Client" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[INFO] Deployment Options:" -ForegroundColor Yellow
Write-Host "  1. Automatic deployment (recommended)"
Write-Host "  2. Manual SSH connection"
Write-Host "  3. Show deployment commands"
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "[INFO] Starting automatic deployment..." -ForegroundColor Green
        Write-Host ""
        
        # Create deployment command
        $deploymentCommand = @"
wget $DEPLOYMENT_URL && chmod +x deploy-all.sh && sudo bash deploy-all.sh
"@
        
        Write-Host "[INFO] Connecting to VPS and running deployment..." -ForegroundColor Yellow
        Write-Host "[WARNING] You may be prompted to:" -ForegroundColor Yellow
        Write-Host "  1. Accept host key (type 'yes')" -ForegroundColor Yellow
        Write-Host "  2. Enter password: $VPS_PASSWORD" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "[INFO] Deployment will take 15-20 minutes..." -ForegroundColor Cyan
        Write-Host ""
        
        # Connect and run deployment
        try {
            ssh -o "StrictHostKeyChecking=no" $VPS_USER@$VPS_IP $deploymentCommand
        } catch {
            Write-Host "[ERROR] SSH connection failed. Trying interactive mode..." -ForegroundColor Red
            ssh $VPS_USER@$VPS_IP
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "[INFO] Opening manual SSH connection..." -ForegroundColor Green
        Write-Host "[INFO] After connecting, run this command:" -ForegroundColor Yellow
        Write-Host "wget $DEPLOYMENT_URL && chmod +x deploy-all.sh && sudo bash deploy-all.sh" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "[INFO] Password: $VPS_PASSWORD" -ForegroundColor Yellow
        Write-Host ""
        
        ssh $VPS_USER@$VPS_IP
    }
    
    "3" {
        Write-Host ""
        Write-Host "[INFO] Manual Deployment Commands" -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Step 1: Connect to VPS" -ForegroundColor Yellow
        Write-Host "ssh $VPS_USER@$VPS_IP" -ForegroundColor Cyan
        Write-Host "Password: $VPS_PASSWORD" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Step 2: Run deployment" -ForegroundColor Yellow
        Write-Host "wget $DEPLOYMENT_URL" -ForegroundColor Cyan
        Write-Host "chmod +x deploy-all.sh" -ForegroundColor Cyan
        Write-Host "sudo bash deploy-all.sh" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "[INFO] Deployment takes 15-20 minutes" -ForegroundColor Green
        Write-Host "[INFO] App will be available at: http://$VPS_IP" -ForegroundColor Green
    }
    
    default {
        Write-Host "[ERROR] Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    DEPLOYMENT INFORMATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "After successful deployment:" -ForegroundColor Green
Write-Host "  Application URL: http://$VPS_IP" -ForegroundColor Cyan
Write-Host "  Deployment time: 15-20 minutes" -ForegroundColor Gray
Write-Host "  Management: zinga-manage commands (on VPS)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test your application" -ForegroundColor Gray
Write-Host "  2. Setup HTTPS: zinga-manage ssl" -ForegroundColor Gray
Write-Host "  3. Configure domain (optional)" -ForegroundColor Gray
Write-Host ""
Write-Host "Support:" -ForegroundColor Yellow
Write-Host "  - Check deployment logs on VPS" -ForegroundColor Gray
Write-Host "  - Use zinga-manage status for system info" -ForegroundColor Gray
Write-Host "  - Review README.md for troubleshooting" -ForegroundColor Gray
Write-Host ""
Write-Host "[INFO] Press any key to exit..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "🚀 Ready to deploy Zinga Linga! 🚀" -ForegroundColor Cyan