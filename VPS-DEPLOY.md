# VPS Deployment Fix

## Problem
Your VPS is showing Firebase Hosting page instead of your Next.js app.

## Solution

### 1. On Your Local Machine
```bash
# Build the app
npm run build

# Create deployment package
tar -czf zingalinga.tar.gz .next package.json package-lock.json public src next.config.js

# Upload to VPS
scp zingalinga.tar.gz user@your-vps:/var/www/
```

### 2. On Your VPS
```bash
# Navigate to web directory
cd /var/www/

# Extract files
tar -xzf zingalinga.tar.gz

# Install dependencies
npm install --production

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Start the app
npm start
```

### 3. Nginx Configuration
Create `/etc/nginx/sites-available/zingalinga`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

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
    }
}
```

### 4. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/zingalinga /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start app with PM2
pm2 start npm --name "zingalinga" -- start

# Save PM2 config
pm2 save
pm2 startup
```

This will serve your Next.js app instead of the Firebase page.