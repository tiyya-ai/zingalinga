#!/bin/bash

# Zinga Linga VPS Deployment Script
# Run this script on your VPS server

set -e

echo "🚀 Starting Zinga Linga deployment..."

# Configuration
APP_NAME="zinga-linga"
APP_DIR="/var/www/zinga-linga-nextjs"
BACKUP_DIR="/var/backups/zinga-linga"
DATE=$(date +%Y%m%d_%H%M%S)

# Create directories if they don't exist
sudo mkdir -p $APP_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p $APP_DIR/logs

echo "📁 Directories created/verified"

# Backup existing deployment if it exists
if [ -d "$APP_DIR/.next" ]; then
    echo "💾 Creating backup of existing deployment..."
    sudo cp -r $APP_DIR $BACKUP_DIR/backup_$DATE
fi

# Extract new deployment
echo "📦 Extracting application files..."
sudo tar -xzf zinga-linga-deploy.tar.gz -C $APP_DIR --strip-components=0

# Set proper permissions
sudo chown -R $USER:$USER $APP_DIR
chmod +x $APP_DIR/deploy.sh

# Navigate to app directory
cd $APP_DIR

# Install dependencies
echo "📚 Installing production dependencies..."
npm ci --only=production

# Stop existing PM2 process if running
echo "🛑 Stopping existing application..."
pm2 stop $APP_NAME 2>/dev/null || echo "No existing process to stop"

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script (run once)
echo "⚙️ Setting up PM2 startup script..."
pm2 startup 2>/dev/null || echo "PM2 startup already configured"

echo "✅ Deployment completed successfully!"
echo "📊 Application status:"
pm2 status

echo ""
echo "🌐 Your application should be running at:"
echo "   Local: http://localhost:3000"
echo "   Network: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📝 Useful commands:"
echo "   Check status: pm2 status"
echo "   View logs: pm2 logs $APP_NAME"
echo "   Restart: pm2 restart $APP_NAME"
echo "   Stop: pm2 stop $APP_NAME"
echo ""
echo "🎉 Deployment complete!"