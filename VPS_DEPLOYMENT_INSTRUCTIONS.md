# 🚀 Zinga Linga VPS Deployment Instructions

## 📋 Your VPS Server Details

- **IP Address**: `109.199.106.28`
- **Server Type**: Cloud VPS 10 NVMe (no setup)
- **Location**: Hub Europe
- **Username**: `root`
- **Password**: `Secureweb25`

### VNC Access (Optional)
- **VNC IP**: `5.189.142.114`
- **VNC Port**: `63215`
- **VNC Password**: `SWzvh8WC`

## 🔧 Step-by-Step Deployment

### 1. Connect to Your VPS
```bash
# SSH into your VPS
ssh root@109.199.106.28
# When prompted, enter password: Secureweb25
```

### 2. Prepare the Server Environment
```bash
# Update system packages
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx (optional but recommended)
apt install nginx -y

# Create application directory
mkdir -p /var/www/zinga-linga-nextjs
mkdir -p /var/backups/zinga-linga
```

### 3. Upload Your Application

#### Option A: Upload from Local Machine
```bash
# From your local machine (Windows)
scp ../zinga-linga-update.tar.gz root@109.199.106.28:/tmp/
scp update-vps.sh root@109.199.106.28:/tmp/
```

#### Option B: Download Directly on VPS
```bash
# If you have the files hosted somewhere, download directly
# wget https://your-file-host.com/zinga-linga-update.tar.gz -O /tmp/zinga-linga-update.tar.gz
```

### 4. Deploy the Application
```bash
# SSH into VPS
ssh root@109.199.106.28

# Navigate to temp directory
cd /tmp

# Make update script executable
chmod +x update-vps.sh

# Run deployment
./update-vps.sh
```

### 5. Configure Nginx (Recommended)
```bash
# Copy nginx configuration
cp /var/www/zinga-linga-nextjs/nginx.conf /etc/nginx/sites-available/zinga-linga

# Edit the configuration to use your domain or IP
nano /etc/nginx/sites-available/zinga-linga
# Replace 'your-domain.com' with '109.199.106.28' or your actual domain

# Enable the site
ln -s /etc/nginx/sites-available/zinga-linga /etc/nginx/sites-enabled/

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx
```

### 6. Configure Firewall
```bash
# Allow SSH, HTTP, and HTTPS
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000
ufw --force enable
```

### 7. Setup SSL Certificate (Optional)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
# certbot --nginx -d your-domain.com
```

## 🌐 Access Your Application

After successful deployment, your application will be available at:

- **Direct Access**: `http://109.199.106.28:3000`
- **With Nginx**: `http://109.199.106.28`
- **With Domain**: `http://your-domain.com` (if configured)

## 📊 Management Commands

### Application Management
```bash
# Check application status
pm2 status

# View logs
pm2 logs zinga-linga

# Restart application
pm2 restart zinga-linga

# Stop application
pm2 stop zinga-linga

# Start application
pm2 start zinga-linga
```

### System Monitoring
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check nginx status
systemctl status nginx
```

## 🔄 Future Updates

To update your application in the future:

1. **Create new update package** (on local machine):
   ```bash
   npm run build
   tar -czf zinga-linga-update-$(date +%Y%m%d).tar.gz --exclude=node_modules --exclude=.git .
   ```

2. **Upload to VPS**:
   ```bash
   scp zinga-linga-update-YYYYMMDD.tar.gz root@109.199.106.28:/tmp/
   ```

3. **Apply update**:
   ```bash
   ssh root@109.199.106.28
   cd /tmp
   ./update-vps.sh
   ```

## 🆘 Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if application is running
   pm2 status
   
   # Check if port is open
   netstat -tlnp | grep :3000
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connectivity
   telnet 109.199.106.28 5432
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   chown -R root:root /var/www/zinga-linga-nextjs
   chmod -R 755 /var/www/zinga-linga-nextjs
   ```

4. **Nginx Issues**
   ```bash
   # Check nginx logs
   tail -f /var/log/nginx/error.log
   tail -f /var/log/nginx/access.log
   ```

## 📞 Quick Reference

### Server Access
- **SSH**: `ssh root@109.199.106.28`
- **Password**: `Secureweb25`
- **VNC**: `5.189.142.114:63215` (Password: `SWzvh8WC`)

### Application URLs
- **Direct**: `http://109.199.106.28:3000`
- **Nginx**: `http://109.199.106.28`

### Key Directories
- **App**: `/var/www/zinga-linga-nextjs`
- **Backups**: `/var/backups/zinga-linga`
- **Logs**: `/var/www/zinga-linga-nextjs/logs`

---

**Status**: Ready for deployment
**Update Package**: `../zinga-linga-update.tar.gz` (114 MB)
**Database**: Already configured (PostgreSQL at 109.199.106.28:5432)