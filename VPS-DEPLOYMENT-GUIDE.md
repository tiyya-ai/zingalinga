# 🚀 Complete VPS Deployment Guide for Zinga Linga

## 📋 VPS Server Information
- **IP Address**: 109.199.106.28
- **Server Type**: Cloud VPS 10 NVMe
- **Location**: Hub Europe
- **VNC Access**: 5.189.142.114:63215
- **Username**: root
- **Password**: Secureweb25

## 🎯 Complete Setup Process (1-100%)

### Step 1: Connect to Your VPS

**Option A: SSH Connection**
```bash
ssh root@109.199.106.28
# Enter password: Secureweb25
```

**Option B: VNC Connection**
- Use VNC client to connect to: `5.189.142.114:63215`
- Password: `SWzvh8WC`

### Step 2: Initial Server Setup

```bash
# Update system packages
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git unzip software-properties-common

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 3: Install and Configure Nginx

```bash
# Install Nginx
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Check status
systemctl status nginx
```

### Step 4: Install PostgreSQL (for Neon alternative)

```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

**In PostgreSQL shell:**
```sql
CREATE DATABASE zinga_linga;
CREATE USER zinga_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE zinga_linga TO zinga_user;
\q
```

### Step 5: Install PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Setup PM2 startup
pm2 startup
# Follow the instructions provided by the command
```

### Step 6: Clone and Setup Your Project

```bash
# Navigate to web directory
cd /var/www

# Clone your project
git clone https://github.com/tiyya-ai/zinga-linga-app.git
cd zinga-linga-app

# Install dependencies
npm install

# Install production dependencies
npm install --production
```

### Step 7: Environment Configuration

```bash
# Create production environment file
cp .env.local .env.production

# Edit environment variables
nano .env.production
```

**Update .env.production with:**
```env
# Database Configuration
DATABASE_URL=postgresql://zinga_user:your_secure_password@localhost:5432/zinga_linga

# Production Settings
NODE_ENV=production
PORT=3000

# Your existing Neon config (if you prefer)
# DATABASE_URL=postgres://neondb_owner:npg_JxlPy2BE1ven@ep-mute-base-adzqh4c7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 8: Build the Application

```bash
# Build for production
npm run build

# Test the build
npm start
```

### Step 9: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/zinga-linga
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name 109.199.106.28;

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
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/zinga-linga /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 10: Setup Database Tables

```bash
# Run database setup
node setup-db.js
```

### Step 11: Start Application with PM2

```bash
# Start with PM2
pm2 start npm --name "zinga-linga" -- start

# Save PM2 configuration
pm2 save

# Check status
pm2 status
```

### Step 12: Configure Firewall

```bash
# Install UFW
apt install -y ufw

# Configure firewall rules
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'

# Enable firewall
ufw enable

# Check status
ufw status
```

### Step 13: SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com

# Auto-renewal test
certbot renew --dry-run
```

### Step 14: Monitoring and Logs

```bash
# View application logs
pm2 logs zinga-linga

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Monitor system resources
htop
```

### Step 15: Backup Script

```bash
# Create backup directory
mkdir -p /backup

# Create backup script
nano /backup/backup.sh
```

**Backup Script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"
APP_DIR="/var/www/zinga-linga-app"

# Backup application
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz $APP_DIR

# Backup database
pg_dump -U zinga_user -h localhost zinga_linga > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*backup*" -mtime +7 -delete
```

```bash
# Make script executable
chmod +x /backup/backup.sh

# Add to crontab for daily backup
crontab -e
# Add: 0 2 * * * /backup/backup.sh
```

## 🎉 Deployment Complete!

### Access Your Application
- **HTTP**: http://109.199.106.28
- **HTTPS**: https://109.199.106.28 (if SSL configured)

### Useful Commands

```bash
# Restart application
pm2 restart zinga-linga

# Update application
cd /var/www/zinga-linga-app
git pull origin main
npm install
npm run build
pm2 restart zinga-linga

# Check application status
pm2 status
pm2 logs zinga-linga

# Restart Nginx
systemctl restart nginx

# Check system resources
htop
df -h
free -h
```

### Troubleshooting

1. **Application not starting**: Check PM2 logs
2. **502 Bad Gateway**: Check if app is running on port 3000
3. **Database connection issues**: Verify DATABASE_URL in .env.production
4. **Permission issues**: Check file ownership with `chown -R www-data:www-data /var/www/zinga-linga-app`

## 📊 Performance Optimization

### Enable Gzip Compression
```bash
# Edit Nginx config
nano /etc/nginx/nginx.conf

# Add in http block:
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### Setup Log Rotation
```bash
# Create logrotate config
nano /etc/logrotate.d/zinga-linga
```

```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        systemctl reload nginx
    endscript
}
```

Your Zinga Linga application is now fully deployed and production-ready! 🚀