#!/bin/bash

# =============================================================================
# Zinga Linga VPS Setup Script - Part 1: Server Preparation
# =============================================================================

echo "🚀 Starting Zinga Linga VPS Setup - Part 1: Server Preparation"
echo "================================================================="

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

print_header "System Update"
print_status "Updating system packages..."
apt update && apt upgrade -y
if [ $? -eq 0 ]; then
    print_status "System updated successfully"
else
    print_error "Failed to update system"
    exit 1
fi

print_header "Installing Essential Packages"
print_status "Installing curl, wget, git, unzip..."
apt install -y curl wget git unzip software-properties-common htop ufw
if [ $? -eq 0 ]; then
    print_status "Essential packages installed successfully"
else
    print_error "Failed to install essential packages"
    exit 1
fi

print_header "Installing Node.js 18.x"
print_status "Adding NodeSource repository..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
if [ $? -eq 0 ]; then
    print_status "NodeSource repository added successfully"
else
    print_error "Failed to add NodeSource repository"
    exit 1
fi

print_status "Installing Node.js..."
apt install -y nodejs
if [ $? -eq 0 ]; then
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_status "Node.js installed successfully - Version: $NODE_VERSION"
    print_status "npm installed successfully - Version: $NPM_VERSION"
else
    print_error "Failed to install Node.js"
    exit 1
fi

print_header "Installing Nginx"
print_status "Installing Nginx web server..."
apt install -y nginx
if [ $? -eq 0 ]; then
    systemctl start nginx
    systemctl enable nginx
    print_status "Nginx installed and started successfully"
else
    print_error "Failed to install Nginx"
    exit 1
fi

print_header "Installing PostgreSQL"
print_status "Installing PostgreSQL database..."
apt install -y postgresql postgresql-contrib
if [ $? -eq 0 ]; then
    systemctl start postgresql
    systemctl enable postgresql
    print_status "PostgreSQL installed and started successfully"
else
    print_error "Failed to install PostgreSQL"
    exit 1
fi

print_header "Installing PM2 Process Manager"
print_status "Installing PM2 globally..."
npm install -g pm2
if [ $? -eq 0 ]; then
    print_status "PM2 installed successfully"
else
    print_error "Failed to install PM2"
    exit 1
fi

print_header "Configuring Firewall"
print_status "Setting up UFW firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
print_status "Firewall configured successfully"

print_header "Creating Application Directory"
print_status "Creating /var/www directory..."
mkdir -p /var/www
chown -R www-data:www-data /var/www
print_status "Application directory created successfully"

print_header "Creating Backup Directory"
print_status "Creating /backup directory..."
mkdir -p /backup
print_status "Backup directory created successfully"

print_header "Setup Complete!"
print_status "Server preparation completed successfully!"
print_status "Next steps:"
echo "  1. Run 02-database-setup.sh to configure the database"
echo "  2. Run 03-app-deployment.sh to deploy the application"
echo "  3. Run 04-nginx-config.sh to configure the web server"
echo ""
print_status "System Information:"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - Nginx: $(nginx -v 2>&1)"
echo "  - PostgreSQL: $(sudo -u postgres psql -c 'SELECT version();' | head -3 | tail -1)"
echo ""
print_warning "Please run the next script: ./02-database-setup.sh"

echo "🎉 Part 1 Complete! Server is ready for application deployment."