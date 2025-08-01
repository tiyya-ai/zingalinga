# VPS Deployment Guide for Zinga Linga

## Prerequisites
- VPS server with Node.js 18+ installed
- PM2 process manager (recommended)
- Nginx (for reverse proxy)
- PostgreSQL database (already configured at 109.199.106.28)

## Deployment Steps

### 1. Prepare the Application
```bash
# Build the application (already done)
npm run build

# Create deployment package
tar -czf zinga-linga-deploy.tar.gz --exclude=node_modules --exclude=.git .
```

### 2. Upload to VPS
```bash
# Upload the package to your VPS
scp zinga-linga-deploy.tar.gz user@your-vps-ip:/var/www/

# SSH into your VPS
ssh user@your-vps-ip

# Extract the application
cd /var/www/
tar -xzf zinga-linga-deploy.tar.gz
cd zinga-linga-nextjs/
```

### 3. Install Dependencies and Configure
```bash
# Install production dependencies
npm ci --only=production

# Create production environment file
cp .env.local .env.production

# Update environment variables for production
echo "NODE_ENV=production" >> .env.production
echo "PORT=3000" >> .env.production
```

### 4. Start with PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'zinga-linga',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/zinga-linga-nextjs',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

### 5. Configure Nginx (Optional but Recommended)
```nginx
# /etc/nginx/sites-available/zinga-linga
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

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/zinga-linga /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Environment Variables
Ensure these are set in your production environment:

```env
DATABASE_URL=postgresql://zinga_user:Secureweb25@109.199.106.28:5432/zinga_linga
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Zinga Linga
NEXT_PUBLIC_APP_VERSION=1.0.0
PORT=3000
```

## Monitoring and Maintenance

```bash
# Check application status
pm2 status
pm2 logs zinga-linga

# Restart application
pm2 restart zinga-linga

# Update application
# 1. Upload new build
# 2. Extract to temporary directory
# 3. Stop application
pm2 stop zinga-linga
# 4. Replace files
# 5. Install dependencies
npm ci --only=production
# 6. Start application
pm2 start zinga-linga
```

## Database Connection
The application is already configured to connect to your VPS PostgreSQL database at:
- Host: 109.199.106.28
- Database: zinga_linga
- User: zinga_user
- Port: 5432

## Security Considerations
1. Use a firewall to restrict access to necessary ports only
2. Keep Node.js and dependencies updated
3. Use HTTPS in production
4. Regularly backup your database
5. Monitor application logs for security issues

## Troubleshooting
- Check PM2 logs: `pm2 logs zinga-linga`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify database connection: Test the DATABASE_URL connection
- Check port availability: `netstat -tlnp | grep :3000`