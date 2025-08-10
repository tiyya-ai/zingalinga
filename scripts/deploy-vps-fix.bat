@echo off
echo 🚀 Deploying VPS Profile Fix...

REM Upload the fix script to VPS
echo 📤 Uploading fix script to VPS...
scp scripts/fix-vps-permissions.sh root@YOUR_VPS_IP:/root/

REM Connect to VPS and run the fix
echo 🔧 Running fix on VPS...
ssh root@YOUR_VPS_IP "cd /var/www/zinga-linga && chmod +x /root/fix-vps-permissions.sh && /root/fix-vps-permissions.sh"

echo ✅ VPS fix deployed successfully!
echo 📝 Please update YOUR_VPS_IP in this script with your actual VPS IP address.
pause