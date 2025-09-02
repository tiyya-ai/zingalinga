# VPS Data Persistence Setup

## 1. Create Persistent Data Directory
```bash
# On your VPS, run these commands:
sudo mkdir -p /var/lib/zingalinga/data
sudo mkdir -p /var/backups/zingalinga
sudo chown -R www-data:www-data /var/lib/zingalinga
sudo chown -R www-data:www-data /var/backups/zingalinga
```

## 2. Set Environment Variables
Add to your VPS environment or `.env.production`:
```bash
DATA_DIR=/var/lib/zingalinga/data
NODE_ENV=production
```

## 3. Before Each Deployment
```bash
# Backup existing data
./backup-data.sh

# Or manually:
cp /var/lib/zingalinga/data/global-app-data.json /var/backups/zingalinga/backup-$(date +%Y%m%d-%H%M%S).json
```

## 4. After Deployment
```bash
# Restore data if needed
cp /var/backups/zingalinga/backup-YYYYMMDD-HHMMSS.json /var/lib/zingalinga/data/global-app-data.json
```

## 5. Automatic Backup (Optional)
Add to crontab:
```bash
# Backup every 6 hours
0 */6 * * * /path/to/your/app/backup-data.sh
```

## 6. Check Data Persistence
```bash
# Verify data directory exists and has correct permissions
ls -la /var/lib/zingalinga/data/
```