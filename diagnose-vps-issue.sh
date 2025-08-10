#!/bin/bash

echo "🔍 VPS Diagnosis and Fix Script for 502 Bad Gateway"
echo "================================================="
echo

# Function to check service status
check_service() {
    local service=$1
    echo "📋 Checking $service status..."
    systemctl is-active $service
    if [ $? -ne 0 ]; then
        echo "❌ $service is not running"
        return 1
    else
        echo "✅ $service is running"
        return 0
    fi
}

# Function to restart service
restart_service() {
    local service=$1
    echo "🔄 Restarting $service..."
    systemctl restart $service
    sleep 3
    check_service $service
}

echo "🔍 Step 1: Checking system resources..."
echo "Memory usage:"
free -h
echo
echo "Disk usage:"
df -h
echo
echo "CPU load:"
uptime
echo

echo "🔍 Step 2: Checking nginx configuration..."
nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration has errors!"
else
    echo "✅ Nginx configuration is valid"
fi
echo

echo "🔍 Step 3: Checking nginx status..."
if ! check_service nginx; then
    restart_service nginx
fi
echo

echo "🔍 Step 4: Checking application directory..."
cd /var/www/zinga-linga || {
    echo "❌ Application directory not found!"
    echo "Creating directory and cloning repository..."
    mkdir -p /var/www/zinga-linga
    cd /var/www/zinga-linga
    git clone https://github.com/tiyya-ai/zingalinga .
}
echo "📁 Current directory: $(pwd)"
echo "📋 Directory contents:"
ls -la
echo

echo "🔍 Step 5: Checking PM2 processes..."
pm2 list
echo

echo "🔍 Step 6: Checking application logs..."
echo "Recent PM2 logs:"
pm2 logs zinga-linga --lines 20 --nostream
echo

echo "🔍 Step 7: Checking if Node.js app is responding..."
echo "Testing local connection:"
curl -I http://localhost:3000 || echo "❌ Application not responding on port 3000"
echo

echo "🔍 Step 8: Checking git status..."
git status
echo "Latest commits:"
git log --oneline -3
echo

echo "🔧 Step 9: Attempting to fix the issue..."
echo "Pulling latest changes..."
git pull origin main
echo

echo "Installing/updating dependencies..."
npm install --production
echo

echo "Building application..."
npm run build
echo

echo "Restarting PM2 application..."
pm2 restart zinga-linga || {
    echo "PM2 restart failed, trying to start fresh..."
    pm2 delete zinga-linga 2>/dev/null
    pm2 start npm --name "zinga-linga" -- start
}
echo

echo "Waiting for application to start..."
sleep 10

echo "🔍 Step 10: Final verification..."
echo "PM2 status:"
pm2 list
echo
echo "Testing application response:"
curl -I http://localhost:3000
echo
echo "Testing external access:"
curl -I http://109.199.106.28
echo

echo "🔍 Step 11: Nginx configuration check..."
echo "Nginx sites-enabled:"
ls -la /etc/nginx/sites-enabled/
echo
echo "Checking nginx error logs:"
tail -20 /var/log/nginx/error.log
echo

echo "✅ Diagnosis and fix attempt completed!"
echo "🌐 Please test: https://zingalinga.io/"
echo "📋 If still not working, check the logs above for specific errors."