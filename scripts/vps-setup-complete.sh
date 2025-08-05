#!/bin/bash

# Complete VPS Setup Script for Zinga Linga
# Run this on your VPS: 109.199.106.28

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "============================================"
echo "  🚀 ZINGA LINGA VPS SETUP - COMPLETE"
echo "============================================"
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root: sudo $0${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 VPS Information:${NC}"
echo "IP: $(curl -s ifconfig.me)"
echo "User: $(whoami)"
echo "OS: $(lsb_release -d | cut -f2)"
echo

# Update system
echo -e "${YELLOW}🔄 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install essential packages
echo -e "${YELLOW}📦 Installing essential packages...${NC}"
apt install -y curl wget git unzip software-properties-common

# Install Node.js 18
echo -e "${YELLOW}📦 Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
echo -e "${GREEN}✅ Node.js installed: $node_version${NC}"
echo -e "${GREEN}✅ NPM installed: $npm_version${NC}"

# Install PM2 globally
echo -e "${YELLOW}📦 Installing PM2...${NC}"
npm install -g pm2

# Install NGINX
echo -e "${YELLOW}📦 Installing NGINX...${NC}"
apt install -y nginx

# Create application directory
echo -e "${YELLOW}📁 Setting up application directory...${NC}"
mkdir -p /var/www/zinga-linga
chown -R root:root /var/www/zinga-linga

# Configure NGINX
echo -e "${YELLOW}🌐 Configuring NGINX...${NC}"
cat > /etc/nginx/sites-available/zingalinga << 'EOF'
server {
    listen 80;
    server_name zingalinga.io www.zingalinga.io 109.199.106.28;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        
        # Handle timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Static files optimization
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Media files
    location ~* \.(ico|css|js|gif|jpeg|jpg|png|svg|woff|woff2|ttf|eot|webp)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000";
        expires 1y;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/zingalinga /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test NGINX configuration
echo -e "${YELLOW}🔧 Testing NGINX configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ NGINX configuration is valid${NC}"
else
    echo -e "${RED}❌ NGINX configuration error${NC}"
    exit 1
fi

# Start and enable services
echo -e "${YELLOW}🚀 Starting services...${NC}"
systemctl restart nginx
systemctl enable nginx

# Setup PM2 startup
echo -e "${YELLOW}🔧 Configuring PM2 startup...${NC}"
pm2 startup systemd -u root --hp /root
pm2 save

# Create deployment script
echo -e "${YELLOW}📝 Creating deployment script...${NC}"
cat > /root/deploy-zinga-linga.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying Zinga Linga from GitHub..."

# Variables
REPO_URL="https://github.com/tiyya-ai/zingalinga.git"
APP_DIR="/var/www/zinga-linga"
TEMP_DIR="/tmp/zinga-deploy-$(date +%s)"

# Create temporary directory
mkdir -p $TEMP_DIR
cd $TEMP_DIR

# Clone repository
echo "📥 Cloning repository..."
git clone $REPO_URL .

# Install dependencies and build
echo "📦 Installing dependencies..."
npm ci

echo "🏗️ Building application..."
npm run build

# Stop current application
echo "⏹️ Stopping current application..."
pm2 stop zinga-linga || echo "App not running"

# Backup current deployment
if [ -d "$APP_DIR" ]; then
    echo "📋 Creating backup..."
    cp -r $APP_DIR ${APP_DIR}-backup-$(date +%Y%m%d-%H%M%S)
fi

# Deploy new version
echo "🚀 Deploying new version..."
rm -rf $APP_DIR
mkdir -p $APP_DIR
cp -r .next package.json package-lock.json public src *.config.js tsconfig.json $APP_DIR/ 2>/dev/null || true

# Set permissions
chown -R root:root $APP_DIR
cd $APP_DIR

# Install production dependencies
echo "📦 Installing production dependencies..."
npm ci --production

# Start application
echo "🚀 Starting application..."
pm2 start npm --name "zinga-linga" -- start || pm2 restart zinga-linga
pm2 save

# Cleanup
rm -rf $TEMP_DIR

echo "✅ Deployment completed successfully!"
echo "🌐 Visit: http://zingalinga.io"
EOF

chmod +x /root/deploy-zinga-linga.sh

# Create monitoring script
echo -e "${YELLOW}📊 Creating monitoring script...${NC}"
cat > /root/monitor-zinga-linga.sh << 'EOF'
#!/bin/bash

echo "🔍 Zinga Linga System Status"
echo "============================"
echo

echo "📊 Application Status:"
pm2 status

echo
echo "🌐 NGINX Status:"
systemctl status nginx --no-pager -l

echo
echo "💾 System Resources:"
echo "Memory Usage:"
free -h
echo
echo "Disk Usage:"
df -h /

echo
echo "🌍 Network Test:"
echo "Testing application response..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Application is responding"
else
    echo "❌ Application is not responding"
fi

echo
echo "Testing external access..."
if curl -f http://zingalinga.io > /dev/null 2>&1; then
    echo "✅ External access working"
else
    echo "❌ External access not working"
fi

echo
echo "📋 Recent Logs:"
echo "Application logs (last 10 lines):"
pm2 logs zinga-linga --lines 10 --nostream

echo
echo "NGINX error logs (last 5 lines):"
tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "No NGINX errors"
EOF

chmod +x /root/monitor-zinga-linga.sh

# Setup firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp

# Create initial deployment
echo -e "${YELLOW}🚀 Running initial deployment...${NC}"
/root/deploy-zinga-linga.sh

# Final status check
echo -e "${YELLOW}🔍 Final status check...${NC}"
sleep 5

if pm2 list | grep -q "zinga-linga.*online"; then
    echo -e "${GREEN}✅ Application is running!${NC}"
else
    echo -e "${RED}❌ Application failed to start${NC}"
    pm2 logs zinga-linga --lines 20
fi

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ NGINX is running!${NC}"
else
    echo -e "${RED}❌ NGINX is not running${NC}"
fi

# Display summary
echo
echo -e "${GREEN}🎉 VPS Setup Complete!${NC}"
echo
echo -e "${BLUE}📋 Summary:${NC}"
echo "✅ Node.js $(node --version) installed"
echo "✅ PM2 installed and configured"
echo "✅ NGINX installed and configured"
echo "✅ Application deployed and running"
echo "✅ Firewall configured"
echo
echo -e "${GREEN}🌐 Your website is available at:${NC}"
echo "  - http://zingalinga.io"
echo "  - http://$(curl -s ifconfig.me):3000"
echo
echo -e "${BLUE}🛠️ Useful commands:${NC}"
echo "  - Deploy: /root/deploy-zinga-linga.sh"
echo "  - Monitor: /root/monitor-zinga-linga.sh"
echo "  - PM2 status: pm2 status"
echo "  - PM2 logs: pm2 logs zinga-linga"
echo "  - NGINX status: systemctl status nginx"
echo
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Setup GitHub secrets for automatic deployment"
echo "2. Configure SSL certificate (optional)"
echo "3. Setup monitoring and backups"
echo