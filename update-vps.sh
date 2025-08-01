#!/bin/bash

# Zinga Linga VPS Update Script
# Run this script on your VPS server to apply latest changes

set -e

echo "🔄 Starting Zinga Linga update process..."

# Configuration
APP_NAME="zinga-linga"
APP_DIR="/var/www/zinga-linga-nextjs"
BACKUP_DIR="/var/backups/zinga-linga"
DATE=$(date +%Y%m%d_%H%M%S)
UPDATE_PACKAGE="zinga-linga-update.tar.gz"

# Check if update package exists
if [ ! -f "$UPDATE_PACKAGE" ]; then
    echo "❌ Error: Update package '$UPDATE_PACKAGE' not found!"
    echo "Please upload the update package first:"
    echo "scp zinga-linga-update.tar.gz user@your-vps-ip:/tmp/"
    exit 1
fi

echo "📦 Update package found: $UPDATE_PACKAGE"

# Create backup of current deployment
echo "💾 Creating backup of current deployment..."
sudo mkdir -p $BACKUP_DIR
if [ -d "$APP_DIR" ]; then
    sudo cp -r $APP_DIR $BACKUP_DIR/backup_$DATE
    echo "✅ Backup created: $BACKUP_DIR/backup_$DATE"
else
    echo "⚠️  No existing deployment found at $APP_DIR"
fi

# Stop the application
echo "🛑 Stopping application..."
pm2 stop $APP_NAME 2>/dev/null || echo "No running process found"

# Extract update package
echo "📂 Extracting update package..."
sudo mkdir -p $APP_DIR
sudo tar -xzf $UPDATE_PACKAGE -C $APP_DIR --strip-components=0

# Set proper permissions
sudo chown -R $USER:$USER $APP_DIR
chmod +x $APP_DIR/update-vps.sh 2>/dev/null || true
chmod +x $APP_DIR/deploy.sh 2>/dev/null || true

# Navigate to app directory
cd $APP_DIR

# Install/update dependencies
echo "📚 Installing/updating dependencies..."
npm ci --only=production

# Start the application
echo "🚀 Starting updated application..."
pm2 start ecosystem.config.js 2>/dev/null || pm2 restart $APP_NAME

# Save PM2 configuration
pm2 save

echo "✅ Update completed successfully!"
echo "📊 Application status:"
pm2 status

echo ""
echo "🌐 Your updated application is running at:"
echo "   Local: http://localhost:3000"
echo "   Network: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📝 Useful commands:"
echo "   Check status: pm2 status"
echo "   View logs: pm2 logs $APP_NAME"
echo "   Restart: pm2 restart $APP_NAME"
echo ""
echo "🎉 Update deployment complete!"
echo "📅 Updated on: $(date)"
echo "💾 Backup available at: $BACKUP_DIR/backup_$DATE"

# Clean up
echo "🧹 Cleaning up..."
rm -f $UPDATE_PACKAGE
echo "✅ Cleanup complete!"