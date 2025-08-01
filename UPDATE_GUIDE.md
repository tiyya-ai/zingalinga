# 🔄 VPS Update Guide for Zinga Linga

## Quick Update Instructions

Since your application is already deployed on VPS, follow these steps to apply the latest changes:

### 1. Upload Update Package
```bash
# Upload the update package to your VPS
scp ../zinga-linga-update.tar.gz user@your-vps-ip:/tmp/

# Upload the update script
scp update-vps.sh user@your-vps-ip:/tmp/
```

### 2. Apply Updates on VPS
```bash
# SSH into your VPS
ssh user@your-vps-ip

# Navigate to temp directory
cd /tmp

# Make update script executable
chmod +x update-vps.sh

# Run the update
./update-vps.sh
```

### 3. Verify Update
```bash
# Check application status
pm2 status

# View logs to ensure no errors
pm2 logs zinga-linga --lines 20

# Test the application
curl http://localhost:3000
```

## What's Updated

### ✅ Latest Features
- **Enhanced Admin Dashboard**: All 22 admin pages fully implemented
- **Video Upload System**: Complete video management with file upload, YouTube integration, and direct URLs
- **Cover Image Upload**: Multiple upload options (file, YouTube thumbnail, direct URL)
- **User Management**: Comprehensive user and children profile management
- **Content Moderation**: Advanced moderation tools and flagged content management
- **Analytics & Reports**: Detailed performance and engagement analytics
- **Settings Management**: Complete configuration options

### 🔧 Technical Improvements
- **Production Build**: Optimized for performance
- **Database Integration**: Connected to VPS PostgreSQL
- **Security Enhancements**: Improved authentication and data validation
- **UI/UX Improvements**: Modern, responsive design

## Update Process Details

The update script will:
1. ✅ Create a backup of your current deployment
2. ✅ Stop the running application safely
3. ✅ Extract and apply new changes
4. ✅ Update dependencies if needed
5. ✅ Restart the application with PM2
6. ✅ Verify the update was successful

## Rollback (If Needed)

If something goes wrong, you can rollback:
```bash
# Stop current application
pm2 stop zinga-linga

# Restore from backup (replace DATE with actual backup date)
sudo rm -rf /var/www/zinga-linga-nextjs
sudo cp -r /var/backups/zinga-linga/backup_YYYYMMDD_HHMMSS /var/www/zinga-linga-nextjs
sudo chown -R $USER:$USER /var/www/zinga-linga-nextjs

# Restart application
cd /var/www/zinga-linga-nextjs
pm2 start ecosystem.config.js
```

## Post-Update Checklist

- [ ] Application starts without errors
- [ ] Admin dashboard loads correctly
- [ ] Video upload functionality works
- [ ] User authentication works
- [ ] Database connections are stable
- [ ] All new features are accessible

## Support

If you encounter any issues:
1. Check PM2 logs: `pm2 logs zinga-linga`
2. Verify database connectivity
3. Check system resources: `htop`
4. Review Nginx logs (if using): `sudo tail -f /var/log/nginx/error.log`

---

**Update Package**: `zinga-linga-update.tar.gz`
**Location**: `../zinga-linga-update.tar.gz`
**Status**: Ready for VPS deployment
**Backup**: Automatic backup will be created during update