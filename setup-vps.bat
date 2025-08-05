@echo off
chcp 65001 >nul
title Zinga Linga VPS Setup

echo.
echo 🚀 إعداد VPS لـ Zinga Linga
echo ============================
echo.

REM VPS Configuration
set VPS_IP=109.199.106.28
set VPS_USER=root
set VPS_PASSWORD=Secureweb25
set APP_NAME=zinga-linga
set DOMAIN=zingalinga.io

echo 📋 معلومات VPS:
echo • IP: %VPS_IP%
echo • المستخدم: %VPS_USER%
echo • النطاق: %DOMAIN%
echo.

REM Check if PuTTY/plink is available
where plink >nul 2>&1
if errorlevel 1 (
    echo ❌ PuTTY غير مثبت. يرجى تثبيت PuTTY أولاً
    echo 🔗 https://www.putty.org/
    echo.
    echo أو استخدم WSL/Git Bash وقم بتشغيل setup-vps.sh
    pause
    exit /b 1
)

echo ✅ PuTTY متوفر
echo.

echo 🔧 بدء إعداد VPS...
echo.

REM Function to run commands on VPS
echo 📦 تحديث النظام...
plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "apt-get update && apt-get upgrade -y"

echo.
echo 🔧 تثبيت Node.js...
plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs"

echo.
echo 🚀 تثبيت PM2...
plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "npm install -g pm2"

echo.
echo 🌐 تثبيت NGINX...
plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "apt-get install -y nginx"

echo.
echo 📁 إنشاء مجلد التطبيق...
plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "mkdir -p /var/www/%APP_NAME% && chown -R %VPS_USER%:%VPS_USER% /var/www/%APP_NAME%"

echo.
echo 🔥 إعداد الجدار الناري...
plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw allow 3000 && ufw --force enable"

echo.
echo ⚙️ تكوين NGINX...
plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "cat > /etc/nginx/sites-available/zinga-linga << 'EOL'^
server {^
    listen 80;^
    server_name %DOMAIN% www.%DOMAIN% %VPS_IP%;^
^
    location / {^
        proxy_pass http://localhost:3000;^
        proxy_http_version 1.1;^
        proxy_set_header Upgrade $http_upgrade;^
        proxy_set_header Connection 'upgrade';^
        proxy_set_header Host $host;^
        proxy_set_header X-Real-IP $remote_addr;^
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;^
        proxy_set_header X-Forwarded-Proto $scheme;^
        proxy_cache_bypass $http_upgrade;^
    }^
}^
EOL"

plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "ln -sf /etc/nginx/sites-available/zinga-linga /etc/nginx/sites-enabled/ && rm -f /etc/nginx/sites-enabled/default && nginx -t && systemctl restart nginx"

echo.
echo 🔄 إعداد PM2 للتشغيل التلقائي...
plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "pm2 startup systemd -u %VPS_USER% --hp /root && pm2 save"

echo.
echo 🛠️ تثبيت أدوات إضافية...
plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "apt-get install -y htop curl wget unzip git"

echo.
echo 📝 إنشاء سكريبت النشر على VPS...
plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "cat > /root/deploy-zinga-linga.sh << 'EOL'^
#!/bin/bash^
set -e^
^
echo \"🚀 بدء نشر Zinga Linga...\"^
^
cd /var/www/%APP_NAME%^
^
# Stop application^
pm2 stop %APP_NAME% ^|^| echo \"Application not running\"^
^
# Backup current version^
if [ -d \".next\" ]; then^
    cp -r .next .next-backup-$(date +%%Y%%m%%d-%%H%%M%%S) ^|^| true^
fi^
^
# Install dependencies^
npm install --production^
^
# Start application^
pm2 start npm --name \"%APP_NAME%\" -- start ^|^| pm2 restart %APP_NAME%^
pm2 save^
^
echo \"✅ تم النشر بنجاح!\"^
echo \"🌐 الموقع متاح على: http://%DOMAIN%\"^
EOL"

plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "chmod +x /root/deploy-zinga-linga.sh"

echo.
echo 🧪 اختبار الإعداد...
echo.

echo 📋 فحص الخدمات...
plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "systemctl status nginx --no-pager -l"
plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "node --version && npm --version && pm2 --version"

echo.
echo 🎉 تم إعداد VPS بنجاح!
echo ==========================
echo.
echo 📋 ملخص الإعداد:
echo • VPS IP: %VPS_IP%
echo • Domain: %DOMAIN%
echo • App Directory: /var/www/%APP_NAME%
echo • NGINX: مُفعل ويعمل
echo • PM2: مُثبت ومُعد للتشغيل التلقائي
echo • Firewall: مُفعل (ports 22, 80, 443, 3000)
echo.
echo 📋 الخطوات التالية:
echo 1. ارفع مشروعك إلى GitHub
echo 2. أعد GitHub Secrets (راجع GITHUB-ACTIONS-SETUP.md)
echo 3. اعمل push لتفعيل النشر التلقائي
echo 4. تحقق من الموقع على: http://%DOMAIN%
echo.
echo 🔧 أوامر مفيدة:
echo • فحص حالة التطبيق: plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "pm2 status"
echo • عرض السجلات: plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "pm2 logs %APP_NAME%"
echo • إعادة تشغيل: plink -ssh -l %VPS_USER% -pw %VPS_PASSWORD% %VPS_IP% "pm2 restart %APP_NAME%"
echo.
echo ✅ VPS جاهز للنشر التلقائي!
echo.
pause