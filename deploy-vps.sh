#!/bin/bash
# VPS Deployment Script

echo "🚀 Building Next.js app..."
npm run build

echo "📦 Creating deployment package..."
tar -czf app.tar.gz .next package.json package-lock.json public src

echo "📤 Upload to your VPS and run:"
echo "tar -xzf app.tar.gz"
echo "npm install --production"
echo "npm start"

echo "✅ Deployment package ready: app.tar.gz"