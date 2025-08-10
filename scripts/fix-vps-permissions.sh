#!/bin/bash

# Fix VPS Profile Editing Issue - Permissions Script
# Run this script on your VPS to fix file permissions

echo "🔧 Fixing VPS Profile Editing Issue..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current user
CURRENT_USER=$(whoami)
echo -e "${YELLOW}Current user: $CURRENT_USER${NC}"

# Create data directory with proper permissions
echo -e "${YELLOW}Creating data directory...${NC}"
sudo mkdir -p /var/www/zinga-linga-data
sudo chown -R $CURRENT_USER:$CURRENT_USER /var/www/zinga-linga-data
sudo chmod -R 755 /var/www/zinga-linga-data

# Also create fallback directory in project
echo -e "${YELLOW}Creating fallback data directory...${NC}"
mkdir -p ./data
chmod 755 ./data

# Check if directories exist and are writable
if [ -w "/var/www/zinga-linga-data" ]; then
    echo -e "${GREEN}✅ Primary data directory is writable${NC}"
else
    echo -e "${RED}❌ Primary data directory is not writable${NC}"
fi

if [ -w "./data" ]; then
    echo -e "${GREEN}✅ Fallback data directory is writable${NC}"
else
    echo -e "${RED}❌ Fallback data directory is not writable${NC}"
fi

# Create environment file if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Creating .env.production file...${NC}"
    cat > .env.production << EOF
# Production environment variables
NODE_ENV=production
PORT=3001
DATA_DIR=/var/www/zinga-linga-data

# Default passwords (change these!)
DEFAULT_ADMIN_PASSWORD=SecureAdmin123!
DEFAULT_USER_PASSWORD=SecureUser123!
EOF
    echo -e "${GREEN}✅ Created .env.production${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production already exists${NC}"
fi

# Set proper permissions for the app
echo -e "${YELLOW}Setting app permissions...${NC}"
sudo chown -R $CURRENT_USER:$CURRENT_USER .
find . -type f -name "*.js" -exec chmod 644 {} \;
find . -type f -name "*.json" -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;

# If using PM2, restart the application
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Restarting PM2 application...${NC}"
    pm2 restart all
    echo -e "${GREEN}✅ PM2 application restarted${NC}"
fi

# If using systemd service, restart it
if systemctl is-active --quiet zinga-linga; then
    echo -e "${YELLOW}Restarting systemd service...${NC}"
    sudo systemctl restart zinga-linga
    echo -e "${GREEN}✅ Systemd service restarted${NC}"
fi

echo -e "${GREEN}🎉 VPS permissions fixed! Profile editing should now work.${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "1. Update your .env.production with secure passwords"
echo -e "2. Test profile editing functionality"
echo -e "3. Check application logs if issues persist"