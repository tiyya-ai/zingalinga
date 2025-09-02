#!/bin/bash
# Complete VPS Deployment Script

echo "🚀 Building Next.js app..."
npm run build

echo "📦 Creating deployment package..."
tar -czf zingalinga-deploy.tar.gz .next package.json package-lock.json public src next.config.js tsconfig.json tailwind.config.js postcss.config.js

echo "📤 VPS Deployment Commands:"
echo "# 1. Upload and extract"
echo "scp zingalinga-deploy.tar.gz user@zingalinga.io:/var/www/"
echo "ssh user@zingalinga.io"
echo "cd /var/www && tar -xzf zingalinga-deploy.tar.gz"
echo ""
echo "# 2. Install and start"
echo "npm install --production"
echo "export NODE_ENV=production"
echo "export PORT=3000"
echo "npm start &"
echo ""
echo "# 3. Check if running"
echo "curl http://localhost:3000"
echo "ps aux | grep node"
echo ""
echo "# 4. Use PM2 for production"
echo "npm install -g pm2"
echo "pm2 start npm --name zingalinga -- start"
echo "pm2 save && pm2 startup"

echo "✅ Deployment package ready: zingalinga-deploy.tar.gz"