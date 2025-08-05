# 🚀 GitHub to VPS Deployment Setup - Zinga Linga

## 📋 Prerequisites

Your VPS details:
- **IP**: 109.199.106.28
- **User**: root
- **Domain**: zingalinga.io
- **GitHub Repo**: https://github.com/tiyya-ai/zingalinga

## 🔧 Step 1: Setup GitHub Repository Secrets

Go to your GitHub repository: `https://github.com/tiyya-ai/zingalinga/settings/secrets/actions`

Add these secrets:

### Required Secrets:
```
VPS_HOST = 109.199.106.28
VPS_USER = root
VPS_SSH_KEY = [Your private SSH key content]
```

## 🔑 Step 2: Generate SSH Key for GitHub Actions

Run this on your local machine:

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_deploy_key -N ""

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/github_deploy_key.pub root@109.199.106.28

# Get private key content for GitHub secret
cat ~/.ssh/github_deploy_key
```

Copy the entire private key content (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`) and paste it as the `VPS_SSH_KEY` secret in GitHub.

## 🏗️ Step 3: Prepare VPS Environment

SSH into your VPS and run:

```bash
# Connect to VPS
ssh root@109.199.106.28

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install NGINX (if not already installed)
apt update
apt install -y nginx

# Create application directory
mkdir -p /var/www/zinga-linga
chown -R root:root /var/www/zinga-linga

# Setup PM2 to start on boot
pm2 startup
pm2 save
```

## 🌐 Step 4: Configure NGINX

Create NGINX configuration:

```bash
# Create NGINX config
cat > /etc/nginx/sites-available/zingalinga << 'EOF'
server {
    listen 80;
    server_name zingalinga.io www.zingalinga.io 109.199.106.28;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Favicon and other static assets
    location ~* \.(ico|css|js|gif|jpeg|jpg|png|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000";
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/zingalinga /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart NGINX
nginx -t
systemctl restart nginx
systemctl enable nginx
```

## 🚀 Step 5: Deploy from GitHub

### Option A: Automatic Deployment (Recommended)

1. Push any changes to your `main` branch:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. GitHub Actions will automatically:
   - Build your Next.js application
   - Deploy to your VPS
   - Start with PM2
   - Configure NGINX

### Option B: Manual Deployment Script

Create a one-click deployment script:

```bash
# Create deployment script
cat > deploy-from-github.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying Zinga Linga from GitHub..."

# Variables
REPO_URL="https://github.com/tiyya-ai/zingalinga.git"
APP_DIR="/var/www/zinga-linga"
TEMP_DIR="/tmp/zinga-deploy-$(date +%s)"

# Create temporary directory
mkdir -p $TEMP_DIR
cd $TEMP_DIR

# Clone repository
echo "📥 Cloning repository..."
git clone $REPO_URL .

# Install dependencies and build
echo "📦 Installing dependencies..."
npm ci

echo "🏗️ Building application..."
npm run build

# Stop current application
echo "⏹️ Stopping current application..."
pm2 stop zinga-linga || echo "App not running"

# Backup current deployment
if [ -d "$APP_DIR" ]; then
    echo "📋 Creating backup..."
    cp -r $APP_DIR ${APP_DIR}-backup-$(date +%Y%m%d-%H%M%S)
fi

# Deploy new version
echo "🚀 Deploying new version..."
rm -rf $APP_DIR
mkdir -p $APP_DIR
cp -r .next package.json package-lock.json public src *.config.js tsconfig.json $APP_DIR/

# Set permissions
chown -R root:root $APP_DIR
cd $APP_DIR

# Install production dependencies
echo "📦 Installing production dependencies..."
npm ci --production

# Start application
echo "🚀 Starting application..."
pm2 start npm --name "zinga-linga" -- start || pm2 restart zinga-linga
pm2 save

# Cleanup
rm -rf $TEMP_DIR

echo "✅ Deployment completed successfully!"
echo "🌐 Visit: http://zingalinga.io"
EOF

chmod +x deploy-from-github.sh
```

## 🔄 Step 6: Environment Variables

Create environment file on VPS:

```bash
# Create .env.production on VPS
cat > /var/www/zinga-linga/.env.production << 'EOF'
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://zingalinga.io
# Add other environment variables as needed
EOF
```

## 📊 Step 7: Monitoring & Logs

Useful commands for monitoring:

```bash
# Check application status
pm2 status

# View application logs
pm2 logs zinga-linga

# Monitor in real-time
pm2 monit

# Restart application
pm2 restart zinga-linga

# Check NGINX status
systemctl status nginx

# View NGINX logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🎯 Step 8: Test Deployment

1. **Automatic Test**: Push to GitHub and watch the Actions tab
2. **Manual Test**: Run `./deploy-from-github.sh` on your VPS
3. **Verify**: Visit http://zingalinga.io

## 🔧 Troubleshooting

### Common Issues:

1. **SSH Key Issues**:
```bash
# Test SSH connection
ssh -i ~/.ssh/github_deploy_key root@109.199.106.28
```

2. **Port 3000 Already in Use**:
```bash
# Kill process on port 3000
sudo lsof -ti:3000 | xargs kill -9
```

3. **Permission Issues**:
```bash
# Fix permissions
chown -R root:root /var/www/zinga-linga
chmod -R 755 /var/www/zinga-linga
```

4. **Build Failures**:
```bash
# Check Node.js version
node --version  # Should be 18+
npm --version
```

## 🚀 Quick Start Commands

### Deploy Now:
```bash
# Option 1: Push to GitHub (automatic)
git push origin main

# Option 2: Manual deployment on VPS
ssh root@109.199.106.28
./deploy-from-github.sh
```

### Check Status:
```bash
# Application status
pm2 status

# Website test
curl -I http://zingalinga.io
```

## 🎉 Success!

Your website will be automatically deployed to:
- 🌐 **http://zingalinga.io**
- 🌐 **http://109.199.106.28:3000**

Every push to the `main` branch will trigger automatic deployment! 🚀