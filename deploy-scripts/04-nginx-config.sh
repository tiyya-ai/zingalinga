#!/bin/bash

# =============================================================================
# Zinga Linga VPS Setup Script - Part 4: Nginx Configuration
# =============================================================================

echo "🌐 Starting Zinga Linga VPS Setup - Part 4: Nginx Configuration"
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}\n=== $1 ===${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Configuration
SERVER_IP="109.199.106.28"
APP_PORT="3000"
SITE_NAME="zinga-linga"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

print_header "Checking Prerequisites"
print_status "Checking if Nginx is installed and running..."
if ! systemctl is-active --quiet nginx; then
    print_error "Nginx is not running. Please run 01-server-setup.sh first."
    exit 1
fi

print_status "Checking if application is running..."
if ! curl -f http://localhost:$APP_PORT > /dev/null 2>&1; then
    print_error "Application is not responding on port $APP_PORT. Please run 03-app-deployment.sh first."
    exit 1
fi

print_status "Prerequisites check passed"

print_header "Backing Up Existing Configuration"
print_status "Creating backup of existing Nginx configuration..."
mkdir -p /backup/nginx
cp -r /etc/nginx /backup/nginx/nginx-backup-$(date +%Y%m%d_%H%M%S)
print_status "Nginx configuration backed up"

print_header "Creating Nginx Site Configuration"
print_status "Creating Nginx configuration for Zinga Linga..."
cat > "$NGINX_SITES_AVAILABLE/$SITE_NAME" << EOF
# Zinga Linga Next.js Application
server {
    listen 80;
    listen [::]:80;
    server_name $SERVER_IP;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # Main application
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # Next.js static files
    location /_next/static {
        proxy_pass http://localhost:$APP_PORT;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API routes
    location /api {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)\$ {
        proxy_pass http://localhost:$APP_PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # Favicon
    location = /favicon.ico {
        proxy_pass http://localhost:$APP_PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
        log_not_found off;
        access_log off;
    }
    
    # Robots.txt
    location = /robots.txt {
        proxy_pass http://localhost:$APP_PORT;
        log_not_found off;
        access_log off;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    # Logging
    access_log /var/log/nginx/zinga-linga-access.log;
    error_log /var/log/nginx/zinga-linga-error.log;
}
EOF

print_status "Nginx site configuration created"

print_header "Enabling Site Configuration"
print_status "Removing default Nginx site..."
rm -f "$NGINX_SITES_ENABLED/default"

print_status "Enabling Zinga Linga site..."
ln -sf "$NGINX_SITES_AVAILABLE/$SITE_NAME" "$NGINX_SITES_ENABLED/$SITE_NAME"
print_status "Site enabled successfully"

print_header "Optimizing Nginx Configuration"
print_status "Updating main Nginx configuration..."

# Backup original nginx.conf
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Update nginx.conf with optimizations
cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # File size limits
    client_max_body_size 100M;
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    
    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # Logging Settings
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # Virtual Host Configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

print_status "Nginx configuration optimized"

print_header "Testing Nginx Configuration"
print_status "Testing Nginx configuration syntax..."
nginx -t
if [ $? -eq 0 ]; then
    print_status "Nginx configuration test passed"
else
    print_error "Nginx configuration test failed"
    print_status "Restoring backup configuration..."
    cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf
    exit 1
fi

print_header "Restarting Nginx"
print_status "Restarting Nginx service..."
systemctl restart nginx
if [ $? -eq 0 ]; then
    print_status "Nginx restarted successfully"
else
    print_error "Failed to restart Nginx"
    exit 1
fi

# Wait a moment for Nginx to fully start
sleep 3

print_header "Testing Web Server"
print_status "Testing HTTP connection..."
if curl -f http://$SERVER_IP > /dev/null 2>&1; then
    print_status "HTTP connection test successful"
else
    print_error "HTTP connection test failed"
    print_status "Checking Nginx status..."
    systemctl status nginx
    print_status "Checking application status..."
    pm2 status
fi

print_header "Creating SSL Certificate Setup Script"
print_status "Creating SSL certificate installation script..."
cat > "/usr/local/bin/setup-ssl" << 'EOF'
#!/bin/bash
# SSL Certificate Setup Script for Zinga Linga

echo "🔒 Setting up SSL Certificate..."

# Install Certbot
apt update
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
echo "Please enter your domain name (or press Enter to skip SSL setup):"
read DOMAIN_NAME

if [ -n "$DOMAIN_NAME" ]; then
    certbot --nginx -d $DOMAIN_NAME
    
    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    echo "✅ SSL certificate installed successfully!"
    echo "Your site is now available at: https://$DOMAIN_NAME"
else
    echo "⚠️ SSL setup skipped. Your site is available at: http://109.199.106.28"
fi
EOF

chmod +x "/usr/local/bin/setup-ssl"
print_status "SSL setup script created at /usr/local/bin/setup-ssl"

print_header "Creating Monitoring Script"
print_status "Creating system monitoring script..."
cat > "/usr/local/bin/monitor-zinga-linga" << 'EOF'
#!/bin/bash
# Zinga Linga Monitoring Script

echo "📊 Zinga Linga System Status"
echo "============================"
echo ""

echo "🌐 Nginx Status:"
systemctl is-active nginx && echo "✅ Running" || echo "❌ Not Running"
echo ""

echo "📦 Application Status:"
pm2 status
echo ""

echo "🗄️ Database Status:"
systemctl is-active postgresql && echo "✅ Running" || echo "❌ Not Running"
echo ""

echo "💾 Disk Usage:"
df -h /
echo ""

echo "🧠 Memory Usage:"
free -h
echo ""

echo "🔗 Network Test:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" http://localhost:3000
echo ""

echo "📋 Recent Application Logs:"
pm2 logs zinga-linga --lines 5 --nostream
EOF

chmod +x "/usr/local/bin/monitor-zinga-linga"
print_status "Monitoring script created at /usr/local/bin/monitor-zinga-linga"

print_header "Nginx Configuration Complete!"
print_status "Web server configured successfully!"
print_status "Server Details:"
echo "  - Server IP: $SERVER_IP"
echo "  - Application Port: $APP_PORT"
echo "  - Nginx Configuration: $NGINX_SITES_AVAILABLE/$SITE_NAME"
echo "  - Access Logs: /var/log/nginx/zinga-linga-access.log"
echo "  - Error Logs: /var/log/nginx/zinga-linga-error.log"
echo ""
print_status "Your application is now accessible at:"
echo "  🌐 HTTP: http://$SERVER_IP"
echo ""
print_status "Useful Commands:"
echo "  - Monitor system: monitor-zinga-linga"
echo "  - Setup SSL: setup-ssl"
echo "  - Restart Nginx: systemctl restart nginx"
echo "  - View Nginx logs: tail -f /var/log/nginx/zinga-linga-access.log"
echo "  - Test Nginx config: nginx -t"
echo ""
print_status "Next step: Run ./05-final-setup.sh to complete the deployment"

echo "🎉 Part 4 Complete! Web server is configured and running."