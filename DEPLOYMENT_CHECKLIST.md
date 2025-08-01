# 🚀 VPS Deployment Checklist for Zinga Linga

## ✅ Pre-Deployment Verification

### Local Environment
- [x] Application builds successfully (`npm run build`)
- [x] Production server starts without errors (`npm start`)
- [x] Database connection configured (PostgreSQL at 109.199.106.28)
- [x] Environment variables properly set
- [x] Deployment package created (`zinga-linga-deploy.tar.gz` - 113.5 MB)

### Files Created for Deployment
- [x] `deploy.md` - Complete deployment guide
- [x] `ecosystem.config.js` - PM2 configuration
- [x] `deploy.sh` - Automated deployment script
- [x] `nginx.conf` - Nginx reverse proxy configuration
- [x] `.env.production` - Production environment template
- [x] `zinga-linga-deploy.tar.gz` - Deployment package

## 🖥️ VPS Requirements

### System Requirements
- [ ] Ubuntu/Debian/CentOS server
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] PM2 process manager (`npm install -g pm2`)
- [ ] Nginx web server (optional but recommended)
- [ ] SSL certificate (Let's Encrypt recommended)

### Network Requirements
- [ ] Port 3000 available for the application
- [ ] Port 80/443 available for Nginx (if using)
- [ ] Firewall configured to allow HTTP/HTTPS traffic
- [ ] Database connectivity to 109.199.106.28:5432

## 📦 Deployment Steps

### 1. Upload Files to VPS
```bash
# Upload deployment package
scp zinga-linga-deploy.tar.gz user@your-vps-ip:/tmp/

# Upload deployment script
scp deploy.sh user@your-vps-ip:/tmp/
```

### 2. Execute Deployment
```bash
# SSH into VPS
ssh user@your-vps-ip

# Make deployment script executable
chmod +x /tmp/deploy.sh

# Run deployment
cd /tmp && ./deploy.sh
```

### 3. Configure Nginx (Optional)
```bash
# Copy nginx configuration
sudo cp /var/www/zinga-linga-nextjs/nginx.conf /etc/nginx/sites-available/zinga-linga

# Enable site
sudo ln -s /etc/nginx/sites-available/zinga-linga /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 4. Setup SSL (Recommended)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## 🔧 Post-Deployment Verification

### Application Health Checks
- [ ] Application starts successfully (`pm2 status`)
- [ ] No errors in logs (`pm2 logs zinga-linga`)
- [ ] Database connection working
- [ ] All admin dashboard pages load correctly
- [ ] Video upload functionality works
- [ ] User authentication works

### Performance Checks
- [ ] Application responds within acceptable time
- [ ] Memory usage is reasonable
- [ ] CPU usage is normal
- [ ] No memory leaks detected

### Security Checks
- [ ] HTTPS enabled (if using SSL)
- [ ] Security headers configured
- [ ] Database credentials secured
- [ ] Firewall properly configured
- [ ] Regular backups scheduled

## 🌐 Access Points

After successful deployment, your application will be available at:
- **Direct Access**: `http://your-vps-ip:3000`
- **With Nginx**: `http://your-domain.com`
- **With SSL**: `https://your-domain.com`

## 📊 Monitoring Commands

```bash
# Check application status
pm2 status

# View real-time logs
pm2 logs zinga-linga --lines 50

# Monitor system resources
htop

# Check nginx status
sudo systemctl status nginx

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🆘 Troubleshooting

### Common Issues
1. **Port 3000 already in use**
   - Check: `netstat -tlnp | grep :3000`
   - Solution: Kill existing process or change port

2. **Database connection failed**
   - Check: Network connectivity to 109.199.106.28
   - Verify: Database credentials in environment variables

3. **PM2 process crashes**
   - Check: `pm2 logs zinga-linga`
   - Solution: Fix errors shown in logs

4. **Nginx 502 Bad Gateway**
   - Check: Application is running (`pm2 status`)
   - Verify: Nginx configuration is correct

## 📞 Support

If you encounter issues during deployment:
1. Check the logs first (`pm2 logs zinga-linga`)
2. Verify all prerequisites are met
3. Ensure database connectivity
4. Check firewall and port configurations

---

**Deployment Package**: `zinga-linga-deploy.tar.gz` (113.5 MB)
**Created**: $(date)
**Status**: Ready for VPS deployment