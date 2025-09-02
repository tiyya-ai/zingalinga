#!/bin/bash

# Configuration
VPS_IP="109.199.106.28"
VPS_USER="root"
APP_NAME="zinga-linga"
DEPLOY_PACKAGE="zinga-linga-vps.tar.gz"
APP_PORT=3000

echo "🚀 Starting deployment process..."

# Create production build and package
echo "📦 Creating production build..."
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf $DEPLOY_PACKAGE .next node_modules package.json package-lock.json public src production-server.js .env.production data

# Upload to VPS
echo "📤 Uploading to VPS..."
scp $DEPLOY_PACKAGE $VPS_USER@$VPS_IP:/root/

# SSH into VPS and deploy
echo "🔧 Deploying on VPS..."
ssh $VPS_USER@$VPS_IP << 'EOF'
    # Stop existing PM2 process if running
    pm2 stop zinga-linga 2>/dev/null || true
    pm2 delete zinga-linga 2>/dev/null || true

    # Clean up existing deployment
    rm -rf /var/www/zinga-linga
    mkdir -p /var/www/zinga-linga

    # Extract new deployment
    cd /var/www/zinga-linga
    tar -xzf /root/zinga-linga-vps.tar.gz

    # Create data directory if it doesn't exist
    mkdir -p data
    
    # Set proper permissions
    chown -R root:root /var/www/zinga-linga
    chmod -R 755 /var/www/zinga-linga
    
    # Install production dependencies
    npm install --production

    # Start with PM2 using production server
    pm2 start production-server.js --name "zinga-linga"

    # Clean up
    rm /root/zinga-linga-vps.tar.gz

    # Save PM2 config
    pm2 save

    echo "✅ Deployment complete!"
EOF

# Final status check
echo "🔍 Checking deployment status..."
curl -s -o /dev/null -w "%{http_code}" http://$VPS_IP:$APP_PORT

echo "
✨ Deployment completed!
🌐 Your application is now available at:
   http://$VPS_IP:$APP_PORT

📝 Default credentials:
   Admin: admin@zingalinga.com / admin123
   User: test@example.com / test123
"
