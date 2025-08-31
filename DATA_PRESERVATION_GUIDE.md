# 🛡️ Data Preservation Guide

## Problem Solved
Your live website data was being overwritten because:
1. Local data files were being committed to Git
2. GitHub Actions deployment was doing `git reset --hard` which replaced ALL files
3. No backup/restore mechanism was in place

## Solution Implemented

### 1. ✅ Data Directory Protection
- Added `/data/` and `*.json` to `.gitignore`
- Local data files will no longer be committed to Git

### 2. ✅ Deployment Data Preservation
Modified `.github/workflows/auto-deploy.yml` to:
- **Backup live data** before deployment
- **Preserve current data** in temporary location
- **Restore live data** after Git reset
- **Create timestamped backups** for safety

## How It Works Now

```bash
# During deployment, the workflow now:
1. 🔄 Backs up live data to timestamped folder
2. 💾 Copies current data to temp location
3. 🔄 Performs Git reset (gets new code)
4. 📁 Creates data directory
5. ✅ Restores your live data
6. 🚀 Starts the application
7. 🧹 Cleans up temp files
```

## Safe Deployment Steps

### Before Your Next Deployment:
1. **Commit these changes first:**
   ```bash
   git add .
   git commit -m "🛡️ Add data preservation to deployment"
   git push origin main
   ```

2. **Your live data will be preserved automatically!**

### Manual Backup (Optional)
If you want extra safety, you can manually backup your live data:

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Create manual backup
cd /var/www/zinga-linga
cp -r data manual-backup-$(date +%Y%m%d-%H%M%S)
```

## What Changed

### Files Modified:
- `.gitignore` - Excludes data directory from Git
- `.github/workflows/auto-deploy.yml` - Added data preservation

### New Behavior:
- ✅ Local data stays local
- ✅ Live data stays on server
- ✅ Automatic backups during deployment
- ✅ Zero data loss deployments

## Verification

After your next deployment, check:
1. Your live website data is still there
2. New code changes are deployed
3. Backup folders exist in `/var/www/zinga-linga/`

## Emergency Recovery

If something goes wrong, you can restore from backup:

```bash
# SSH into VPS
ssh root@your-vps-ip
cd /var/www/zinga-linga

# List available backups
ls -la data-backup-*

# Restore from specific backup
cp -r data-backup-YYYYMMDD-HHMMSS/global-app-data.json data/

# Restart application
pm2 restart zinga-linga
```

---

**🎉 Your data is now safe! Deploy with confidence!**