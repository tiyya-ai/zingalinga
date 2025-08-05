#!/bin/bash

# 🚀 Zinga Linga VPS Setup Script
# سكريبت إعداد VPS لـ Zinga Linga

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_IP="109.199.106.28"
VPS_USER="root"
VPS_PASSWORD="Secureweb25"
APP_NAME="zinga-linga"
DOMAIN="zingalinga.io"

echo -e "${BLUE}🚀 بدء إعداد VPS لـ Zinga Linga${NC}"
echo "=================================="

# Function to run commands on VPS
run_on_vps() {
    echo -e "${YELLOW}🔧 تنفيذ: $1${NC}"
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "$1"
}

# Function to copy files to VPS
copy_to_vps() {
    echo -e "${YELLOW}📤 نسخ: $1 إلى $2${NC}"
    sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no "$1" "$VPS_USER@$VPS_IP:$2"
}

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}❌ sshpass غير مثبت. يرجى تثبيته أولاً:${NC}"
    echo "Ubuntu/Debian: sudo apt-get install sshpass"
    echo "macOS: brew install sshpass"
    echo "Windows: استخدم WSL أو Git Bash"
    exit 1
fi

echo -e "${GREEN}✅ بدء إعداد VPS...${NC}"

# 1. Update system
echo -e "\n${BLUE}📦 تحديث النظام...${NC}"
run_on_vps "apt-get update && apt-get upgrade -y"

# 2. Install Node.js
echo -e "\n${BLUE}🔧 تثبيت Node.js...${NC}"
run_on_vps "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -"
run_on_vps "apt-get install -y nodejs"

# 3. Install PM2
echo -e "\n${BLUE}🚀 تثبيت PM2...${NC}"
run_on_vps "npm install -g pm2"

# 4. Install NGINX
echo -e "\n${BLUE}🌐 تثبيت NGINX...${NC}"
run_on_vps "apt-get install -y nginx"

# 5. Create application directory
echo -e "\n${BLUE}📁 إنشاء مجلد التطبيق...${NC}"
run_on_vps "mkdir -p /var/www/$APP_NAME"
run_on_vps "chown -R $VPS_USER:$VPS_USER /var/www/$APP_NAME"

# 6. Setup firewall
echo -e "\n${BLUE}🔥 إعداد الجدار الناري...${NC}"
run_on_vps "ufw allow 22"    # SSH
run_on_vps "ufw allow 80"    # HTTP
run_on_vps "ufw allow 443"   # HTTPS
run_on_vps "ufw allow 3000"  # Node.js app
run_on_vps "ufw --force enable"

# 7. Configure NGINX
echo -e "\n${BLUE}⚙️ تكوين NGINX...${NC}"

# Copy NGINX configuration
if [ -f "nginx-zinga-linga.conf" ]; then
    copy_to_vps "nginx-zinga-linga.conf" "/tmp/zinga-linga"
    run_on_vps "mv /tmp/zinga-linga /etc/nginx/sites-available/zinga-linga"
    run_on_vps "ln -sf /etc/nginx/sites-available/zinga-linga /etc/nginx/sites-enabled/"
    run_on_vps "rm -f /etc/nginx/sites-enabled/default"
    run_on_vps "nginx -t"
    run_on_vps "systemctl restart nginx"
    run_on_vps "systemctl enable nginx"
else
    echo -e "${YELLOW}⚠️ ملف nginx-zinga-linga.conf غير موجود، سيتم إنشاء تكوين أساسي${NC}"
    
    run_on_vps "cat > /etc/nginx/sites-available/zinga-linga << 'EOL'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN $VPS_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL"
    
    run_on_vps "ln -sf /etc/nginx/sites-available/zinga-linga /etc/nginx/sites-enabled/"
    run_on_vps "rm -f /etc/nginx/sites-enabled/default"
    run_on_vps "nginx -t && systemctl restart nginx"
fi

# 8. Setup PM2 startup
echo -e "\n${BLUE}🔄 إعداد PM2 للتشغيل التلقائي...${NC}"
run_on_vps "pm2 startup systemd -u $VPS_USER --hp /root"
run_on_vps "pm2 save"

# 9. Install additional tools
echo -e "\n${BLUE}🛠️ تثبيت أدوات إضافية...${NC}"
run_on_vps "apt-get install -y htop curl wget unzip git"

# 10. Setup SSL (Let's Encrypt) - Optional
echo -e "\n${BLUE}🔐 إعداد SSL (اختياري)...${NC}"
read -p "هل تريد إعداد SSL Certificate؟ (y/n): " setup_ssl

if [ "$setup_ssl" = "y" ] || [ "$setup_ssl" = "Y" ]; then
    echo -e "${YELLOW}🔐 تثبيت Certbot...${NC}"
    run_on_vps "apt-get install -y certbot python3-certbot-nginx"
    
    echo -e "${YELLOW}🔐 الحصول على SSL Certificate...${NC}"
    run_on_vps "certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN"
    
    echo -e "${GREEN}✅ تم إعداد SSL بنجاح${NC}"
fi

# 11. Create deployment script on VPS
echo -e "\n${BLUE}📝 إنشاء سكريبت النشر على VPS...${NC}"
run_on_vps "cat > /root/deploy-zinga-linga.sh << 'EOL'
#!/bin/bash
set -e

echo \"🚀 بدء نشر Zinga Linga...\"

cd /var/www/$APP_NAME

# Stop application
pm2 stop $APP_NAME || echo \"Application not running\"

# Backup current version
if [ -d \".next\" ]; then
    cp -r .next .next-backup-\$(date +%Y%m%d-%H%M%S) || true
fi

# Install dependencies
npm install --production

# Start application
pm2 start npm --name \"$APP_NAME\" -- start || pm2 restart $APP_NAME
pm2 save

echo \"✅ تم النشر بنجاح!\"
echo \"🌐 الموقع متاح على: http://$DOMAIN\"
EOL"

run_on_vps "chmod +x /root/deploy-zinga-linga.sh"

# 12. Test the setup
echo -e "\n${BLUE}🧪 اختبار الإعداد...${NC}"

echo -e "${YELLOW}📋 فحص الخدمات...${NC}"
run_on_vps "systemctl status nginx --no-pager -l"
run_on_vps "node --version"
run_on_vps "npm --version"
run_on_vps "pm2 --version"

# 13. Display summary
echo -e "\n${GREEN}🎉 تم إعداد VPS بنجاح!${NC}"
echo "=================================="
echo -e "${BLUE}📋 ملخص الإعداد:${NC}"
echo "• VPS IP: $VPS_IP"
echo "• Domain: $DOMAIN"
echo "• App Directory: /var/www/$APP_NAME"
echo "• NGINX: مُفعل ويعمل"
echo "• PM2: مُثبت ومُعد للتشغيل التلقائي"
echo "• Firewall: مُفعل (ports 22, 80, 443, 3000)"

echo -e "\n${YELLOW}📋 الخطوات التالية:${NC}"
echo "1. ارفع مشروعك إلى GitHub"
echo "2. أعد GitHub Secrets (راجع GITHUB-ACTIONS-SETUP.md)"
echo "3. اعمل push لتفعيل النشر التلقائي"
echo "4. تحقق من الموقع على: http://$DOMAIN"

echo -e "\n${BLUE}🔧 أوامر مفيدة:${NC}"
echo "• فحص حالة التطبيق: ssh root@$VPS_IP 'pm2 status'"
echo "• عرض السجلات: ssh root@$VPS_IP 'pm2 logs $APP_NAME'"
echo "• إعادة تشغيل: ssh root@$VPS_IP 'pm2 restart $APP_NAME'"
echo "• نشر يدوي: ssh root@$VPS_IP '/root/deploy-zinga-linga.sh'"

echo -e "\n${GREEN}✅ VPS جاهز للنشر التلقائي!${NC}"