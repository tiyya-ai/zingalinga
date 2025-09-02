#!/bin/bash
# Backup script for Zinga Linga data

# Create backup directory
mkdir -p /var/backups/zingalinga

# Backup current data
if [ -f "/var/lib/zingalinga/data/global-app-data.json" ]; then
    cp /var/lib/zingalinga/data/global-app-data.json /var/backups/zingalinga/backup-$(date +%Y%m%d-%H%M%S).json
    echo "Backup created: backup-$(date +%Y%m%d-%H%M%S).json"
else
    echo "No data file found to backup"
fi

# Keep only last 10 backups
cd /var/backups/zingalinga
ls -t backup-*.json | tail -n +11 | xargs -r rm
echo "Old backups cleaned up"