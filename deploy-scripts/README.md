# 🚀 Zinga Linga VPS Deployment Scripts

Complete automated deployment solution for Zinga Linga educational platform on your VPS server.

## 📋 Server Information

- **IP Address**: 109.199.106.28
- **Server Type**: Cloud VPS 10 NVMe
- **Location**: Hub Europe
- **VNC Access**: 5.189.142.114:63215
- **Username**: root
- **Password**: Secureweb25

## 🎯 Quick Start (Automated Deployment)

### Option 1: One-Click Deployment (Recommended)

1. **Connect to your VPS**:
   ```bash
   ssh root@109.199.106.28
   # Enter password: Secureweb25
   ```

2. **Download and run the master deployment script**:
   ```bash
   # Download the deployment scripts
   wget https://raw.githubusercontent.com/tiyya-ai/zinga-linga-app/main/deploy-scripts/deploy-all.sh
   
   # Make it executable
   chmod +x deploy-all.sh
   
   # Run the complete deployment (15-20 minutes)
   sudo bash deploy-all.sh
   ```

3. **That's it!** Your application will be available at: http://109.199.106.28

### Option 2: Manual Step-by-Step Deployment

If you prefer to run each step manually:

```bash
# Step 1: Server Setup
sudo bash 01-server-setup.sh

# Step 2: Database Configuration
sudo bash 02-database-setup.sh

# Step 3: Application Deployment
sudo bash 03-app-deployment.sh

# Step 4: Web Server Configuration
sudo bash 04-nginx-config.sh

# Step 5: Final Setup & Security
sudo bash 05-final-setup.sh
```

## 📁 Deployment Scripts Overview

| Script | Description | Duration |
|--------|-------------|----------|
| `deploy-all.sh` | **Master script** - Runs all steps automatically | 15-20 min |
| `01-server-setup.sh` | System updates, Node.js, Nginx, PostgreSQL, PM2 | 3-5 min |
| `02-database-setup.sh` | Database creation, user setup, schema deployment | 2-3 min |
| `03-app-deployment.sh` | Git clone, dependencies, build, PM2 configuration | 5-7 min |
| `04-nginx-config.sh` | Reverse proxy, SSL preparation, optimization | 2-3 min |
| `05-final-setup.sh` | Security hardening, monitoring, backups | 3-5 min |

## 🔧 What Gets Installed

### System Components
- **Node.js 18.x** - JavaScript runtime
- **npm** - Package manager
- **Nginx** - Web server and reverse proxy
- **PostgreSQL** - Database server
- **PM2** - Process manager
- **UFW** - Firewall
- **Fail2ban** - Intrusion prevention

### Application Components
- **Zinga Linga Next.js App** - Main application
- **Database Schema** - PostgreSQL tables and indexes
- **Environment Configuration** - Production settings
- **SSL Certificate Support** - HTTPS ready

### Monitoring & Management
- **Automated Backups** - Daily database and file backups
- **Health Monitoring** - System health checks every 30 minutes
- **Log Rotation** - Automatic log management
- **Performance Optimization** - System tuning

## 🌐 Access Your Application

After deployment:

- **Application URL**: http://109.199.106.28
- **Admin Dashboard**: Available through the application interface
- **Server Management**: Use `zinga-manage` commands

## 🛠️ Management Commands

After deployment, use these commands to manage your application:

```bash
# Check system status
zinga-manage status

# Setup HTTPS/SSL
zinga-manage ssl

# Create backup
zinga-manage backup

# Restart services
zinga-manage restart

# Update application
zinga-manage update

# View logs
zinga-manage logs

# Health check
zinga-manage health
```

## 📊 System Information

After deployment, you can find:

- **Application Directory**: `/var/www/zinga-linga-app`
- **Database Config**: `/var/www/db-config.env`
- **Nginx Config**: `/etc/nginx/sites-available/zinga-linga`
- **Backups**: `/backup/`
- **Logs**: `/var/log/`
- **Deployment Summary**: `/root/DEPLOYMENT_SUMMARY.txt`

## 🔒 Security Features

✅ **Firewall Configuration** - UFW with proper rules
✅ **Intrusion Prevention** - Fail2ban protection
✅ **SSH Hardening** - Secure SSH configuration
✅ **Nginx Security Headers** - XSS, CSRF protection
✅ **Rate Limiting** - API and login protection
✅ **SSL/HTTPS Ready** - Easy certificate setup

## 📋 Automated Tasks

- **Daily Backups** (2:00 AM) - Full system backup
- **Health Checks** (Every 30 minutes) - System monitoring
- **Weekly Restarts** (Sunday 3:00 AM) - Application restart
- **Monthly Cleanup** - Log rotation and system updates

## 🚨 Troubleshooting

### Common Issues

1. **Script Permission Denied**:
   ```bash
   chmod +x *.sh
   ```

2. **Internet Connection Issues**:
   ```bash
   ping google.com
   ```

3. **Port Already in Use**:
   ```bash
   sudo netstat -tulpn | grep :3000
   sudo kill -9 <PID>
   ```

4. **Database Connection Failed**:
   ```bash
   sudo systemctl status postgresql
   sudo systemctl restart postgresql
   ```

5. **Application Not Starting**:
   ```bash
   pm2 logs zinga-linga
   pm2 restart zinga-linga
   ```

### Log Files

- **Deployment Log**: `/var/log/zinga-linga-deployment.log`
- **Application Logs**: `/var/log/zinga-linga-*.log`
- **Nginx Logs**: `/var/log/nginx/zinga-linga-*.log`
- **System Logs**: `/var/log/syslog`

### Getting Help

```bash
# View deployment information
deployment-info

# Check system health
health-check

# Monitor system resources
htop

# View recent errors
journalctl -xe
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Automatic update
zinga-manage update

# Manual update
cd /var/www/zinga-linga-app
git pull origin main
npm install
npm run build
pm2 restart zinga-linga
```

### Creating Backups

```bash
# Create immediate backup
zinga-manage backup

# Manual backup
/backup/full-backup.sh
```

### Monitoring

```bash
# Real-time monitoring
zinga-manage status

# Detailed health check
zinga-manage health

# View live logs
pm2 logs zinga-linga --lines 50
```

## 🌟 Features Included

### Educational Platform Features
- ✅ User Authentication & Registration
- ✅ Course Management System
- ✅ Progress Tracking
- ✅ Interactive Learning Modules
- ✅ Admin Dashboard
- ✅ Payment Integration Ready
- ✅ Responsive Design
- ✅ Multi-device Support

### Technical Features
- ✅ Next.js 14 with App Router
- ✅ PostgreSQL Database
- ✅ RESTful API
- ✅ Server-Side Rendering
- ✅ Optimized Performance
- ✅ SEO Friendly
- ✅ Production Ready

## 📞 Support

If you encounter any issues:

1. **Check the logs**: `zinga-manage logs`
2. **Run health check**: `zinga-manage health`
3. **View system status**: `zinga-manage status`
4. **Create backup before changes**: `zinga-manage backup`
5. **Check deployment log**: `tail -f /var/log/zinga-linga-deployment.log`

## 🎉 Next Steps

After successful deployment:

1. **Visit your application**: http://109.199.106.28
2. **Setup HTTPS**: `zinga-manage ssl`
3. **Configure domain** (if you have one)
4. **Test all features**
5. **Set up monitoring alerts**
6. **Customize content and branding**

---

## 📝 License

This deployment solution is part of the Zinga Linga educational platform.

## 🤝 Contributing

For improvements or issues with the deployment scripts, please create an issue in the repository.

---

**🚀 Ready to deploy? Run `sudo bash deploy-all.sh` and watch the magic happen!**