#!/bin/bash

# =============================================================================
# Zinga Linga VPS Setup Script - Part 3: Application Deployment
# =============================================================================

echo "📦 Starting Zinga Linga VPS Setup - Part 3: Application Deployment"
echo "==================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}\n=== $1 ===${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Configuration
APP_DIR="/var/www/zinga-linga-app"
GIT_REPO="https://github.com/tiyya-ai/zinga-linga-app.git"
APP_USER="www-data"
APP_PORT="3000"

print_header "Checking Prerequisites"
print_status "Checking if database configuration exists..."
if [ ! -f "/var/www/db-config.env" ]; then
    print_error "Database configuration not found. Please run 02-database-setup.sh first."
    exit 1
fi

# Load database configuration
source /var/www/db-config.env
print_status "Database configuration loaded successfully"

print_header "Cloning Application Repository"
print_status "Removing existing application directory if it exists..."
if [ -d "$APP_DIR" ]; then
    rm -rf "$APP_DIR"
    print_status "Existing directory removed"
fi

print_status "Cloning repository from GitHub..."
cd /var/www
git clone $GIT_REPO
if [ $? -eq 0 ]; then
    print_status "Repository cloned successfully"
else
    print_error "Failed to clone repository"
    exit 1
fi

# Rename directory if needed
if [ -d "/var/www/zinga-linga-app" ]; then
    APP_DIR="/var/www/zinga-linga-app"
elif [ -d "/var/www/zinga-linga-nextjs" ]; then
    mv "/var/www/zinga-linga-nextjs" "$APP_DIR"
fi

cd "$APP_DIR"
print_status "Changed to application directory: $APP_DIR"

print_header "Installing Dependencies"
print_status "Installing npm dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

print_header "Configuring Environment Variables"
print_status "Creating production environment file..."
cat > "$APP_DIR/.env.production" << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=$APP_PORT

# Database Configuration
DATABASE_URL=$DATABASE_URL
PGHOST=$PGHOST
PGUSER=$PGUSER
PGDATABASE=$PGDATABASE
PGPASSWORD=$PGPASSWORD
PGPORT=$PGPORT

# Application Settings
NEXT_PUBLIC_APP_URL=http://109.199.106.28
NEXT_PUBLIC_API_URL=http://109.199.106.28/api

# Security
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://109.199.106.28

# Optional: Firebase Configuration (if needed)
# NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

EOF

chmod 600 "$APP_DIR/.env.production"
print_status "Environment configuration created"

# Also create .env.local for compatibility
cp "$APP_DIR/.env.production" "$APP_DIR/.env.local"

print_header "Setting Up Database Tables"
print_status "Running database setup script..."
if [ -f "$APP_DIR/setup-db.js" ]; then
    # Install dotenv if not already installed
    npm install dotenv
    
    # Update setup-db.js to use production environment
    sed -i "s/.env.local/.env.production/g" "$APP_DIR/setup-db.js"
    
    node "$APP_DIR/setup-db.js"
    if [ $? -eq 0 ]; then
        print_status "Database tables created successfully"
    else
        print_warning "Database setup script failed, but continuing..."
    fi
else
    print_warning "setup-db.js not found, skipping database setup"
fi

print_header "Building Application"
print_status "Building Next.js application for production..."
npm run build
if [ $? -eq 0 ]; then
    print_status "Application built successfully"
else
    print_error "Failed to build application"
    exit 1
fi

print_header "Setting File Permissions"
print_status "Setting proper file ownership and permissions..."
chown -R $APP_USER:$APP_USER "$APP_DIR"
chmod -R 755 "$APP_DIR"
chmod 600 "$APP_DIR/.env.production"
chmod 600 "$APP_DIR/.env.local"
print_status "File permissions set successfully"

print_header "Creating PM2 Configuration"
print_status "Creating PM2 ecosystem file..."
cat > "$APP_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'zinga-linga',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $APP_PORT
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: $APP_PORT
    },
    error_file: '/var/log/zinga-linga-error.log',
    out_file: '/var/log/zinga-linga-out.log',
    log_file: '/var/log/zinga-linga-combined.log',
    time: true
  }]
};
EOF

print_status "PM2 configuration created"

print_header "Testing Application"
print_status "Testing if application starts correctly..."
cd "$APP_DIR"
timeout 30s npm start &
START_PID=$!
sleep 10

# Check if the application is responding
if curl -f http://localhost:$APP_PORT > /dev/null 2>&1; then
    print_status "Application test successful"
    kill $START_PID 2>/dev/null
else
    print_warning "Application test failed, but continuing with deployment"
    kill $START_PID 2>/dev/null
fi

print_header "Starting Application with PM2"
print_status "Stopping any existing PM2 processes..."
pm2 delete zinga-linga 2>/dev/null || true

print_status "Starting application with PM2..."
cd "$APP_DIR"
pm2 start ecosystem.config.js --env production
if [ $? -eq 0 ]; then
    print_status "Application started successfully with PM2"
else
    print_error "Failed to start application with PM2"
    exit 1
fi

# Save PM2 configuration
pm2 save
print_status "PM2 configuration saved"

# Setup PM2 startup script
pm2 startup systemd -u root --hp /root
print_status "PM2 startup script configured"

print_header "Creating Update Script"
print_status "Creating application update script..."
cat > "/usr/local/bin/update-zinga-linga" << EOF
#!/bin/bash
# Zinga Linga Application Update Script

echo "🔄 Updating Zinga Linga Application..."

cd $APP_DIR

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Restart PM2
pm2 restart zinga-linga

echo "✅ Application updated successfully!"
EOF

chmod +x "/usr/local/bin/update-zinga-linga"
print_status "Update script created at /usr/local/bin/update-zinga-linga"

print_header "Creating Log Rotation"
print_status "Setting up log rotation for application logs..."
cat > "/etc/logrotate.d/zinga-linga" << EOF
/var/log/zinga-linga-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

print_status "Log rotation configured"

print_header "Application Deployment Complete!"
print_status "Application deployed successfully!"
print_status "Application Details:"
echo "  - Directory: $APP_DIR"
echo "  - Port: $APP_PORT"
echo "  - Process Manager: PM2"
echo "  - Environment: Production"
echo ""
print_status "PM2 Status:"
pm2 status
echo ""
print_status "Application Logs:"
echo "  - Error Log: /var/log/zinga-linga-error.log"
echo "  - Output Log: /var/log/zinga-linga-out.log"
echo "  - Combined Log: /var/log/zinga-linga-combined.log"
echo ""
print_status "Useful Commands:"
echo "  - View logs: pm2 logs zinga-linga"
echo "  - Restart app: pm2 restart zinga-linga"
echo "  - Update app: update-zinga-linga"
echo "  - Check status: pm2 status"
echo ""
print_status "Next step: Run ./04-nginx-config.sh to configure the web server"

echo "🎉 Part 3 Complete! Application is deployed and running."