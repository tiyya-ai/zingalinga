#!/bin/bash

# Simple Auto Deploy for Zinga Linga
# Just run this script and your website will be deployed!

echo ""
echo "🚀 Simple Auto Deploy for Zinga Linga"
echo "====================================="
echo ""

echo "✅ VPS: 109.199.106.28"
echo "✅ Domain: http://zingalinga.io/"
echo "✅ User: root"
echo ""

# Step 1: Build
echo "🔄 Step 1: Building website..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build completed!"

# Step 2: Package
echo ""
echo "🔄 Step 2: Creating package..."
tar -czf deploy.tar.gz .next package.json package-lock.json public src
echo "✅ Package created!"

# Step 3: Upload
echo ""
echo "🔄 Step 3: Uploading to server..."
scp deploy.tar.gz root@109.199.106.28:/tmp/
if [ $? -ne 0 ]; then
    echo "❌ Upload failed! Check your connection."
    exit 1
fi
echo "✅ Upload completed!"

# Step 4: Deploy
echo ""
echo "🔄 Step 4: Deploying on server..."
ssh root@109.199.106.28 "
    cd /var/www/zinga-linga
    tar -xzf /tmp/deploy.tar.gz
    npm install --production
    pm2 restart zinga-linga || pm2 start npm --name zinga-linga -- start
    pm2 save
    rm /tmp/deploy.tar.gz
"

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

# Step 5: Cleanup
echo ""
echo "🔄 Step 5: Cleaning up..."
rm deploy.tar.gz

echo ""
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "========================"
echo ""
echo "✅ Your website is now live at:"
echo "🌐 http://zingalinga.io/"
echo "🌐 http://109.199.106.28:3000"
echo ""
echo "📋 To check status: ssh root@109.199.106.28 'pm2 status'"
echo ""