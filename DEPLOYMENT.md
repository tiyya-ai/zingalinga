# 🚀 Zinga Linga VPS Deployment Guide

## Prerequisites
- Ubuntu 20.04+ VPS
- Domain name pointed to your VPS IP
- SSH access to your VPS

## Quick Deployment

### 1. Upload Files to VPS
```bash
# From your local machine
rsync -avz --exclude node_modules --exclude .git . user@your-vps-ip:/var/www/zingalinga/
```

### 2. Run Deployment Script
```bash
# On your VPS
chmod +x deploy.sh
./deploy.sh
```

### 3. Configure Environment
Edit `/var/www/zingalinga/.env.production`:
```env
DB_HOST=localhost
DB_USER=zingalinga_user
DB_PASSWORD=your-secure-password
DB_NAME=zingalinga
NEXTAUTH_URL=https://yourdomain.com
```

### 4. Update Domain
Edit `/etc/nginx/sites-available/zingalinga`:
- Replace `your-domain.com` with your actual domain

### 5. Restart Services
```bash
sudo systemctl restart nginx
pm2 restart zingalinga
```

## Manual Steps

### Database Setup
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database and user
CREATE DATABASE zingalinga;
CREATE USER 'zingalinga_user'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON zingalinga.* TO 'zingalinga_user'@'localhost';
FLUSH PRIVILEGES;
```

### SSL Certificate (Recommended)
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Admin Access
- **URL:** `https://yourdomain.com/admin`
- **Email:** `admin@zingalinga.com`
- **Password:** `admin123`

## Monitoring
```bash
# Check application status
pm2 status

# View logs
pm2 logs zingalinga

# Restart application
pm2 restart zingalinga
```

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL status
sudo systemctl status mysql

# Test connection
mysql -u zingalinga_user -p zingalinga
```

### Application Issues
```bash
# Check build
npm run build

# Check environment
cat .env.production
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check status
sudo systemctl status nginx
```

## Security Notes
- Change default admin password after first login
- Use strong database passwords
- Enable firewall: `sudo ufw enable`
- Keep system updated: `sudo apt update && sudo apt upgrade`