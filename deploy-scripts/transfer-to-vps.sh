#!/bin/bash

# =============================================================================
# Transfer Deployment Scripts to VPS
# =============================================================================

echo "📤 Zinga Linga VPS Transfer Script"
echo "=================================="
echo "This script will transfer all deployment files to your VPS"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# VPS Configuration
VPS_IP="109.199.106.28"
VPS_USER="root"
VPS_PASSWORD="Secureweb25"
REMOTE_DIR="/root/zinga-deployment"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

print_header "Pre-Transfer Checks"

# Check if scp is available
if ! command -v scp &> /dev/null; then
    print_error "scp command not found. Please install OpenSSH client."
    exit 1
fi

# Check if all required files exist
REQUIRED_FILES=(
    "01-server-setup.sh"
    "02-database-setup.sh"
    "03-app-deployment.sh"
    "04-nginx-config.sh"
    "05-final-setup.sh"
    "deploy-all.sh"
    "README.md"
)

print_status "Checking required files..."
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$SCRIPT_DIR/$file" ]; then
        print_error "Required file not found: $file"
        exit 1
    fi
done
print_status "All required files found ✅"

# Test VPS connection
print_status "Testing VPS connection..."
if ! ping -c 1 $VPS_IP > /dev/null 2>&1; then
    print_error "Cannot reach VPS at $VPS_IP"
    exit 1
fi
print_status "VPS is reachable ✅"

print_header "Transfer Options"
echo "Choose transfer method:"
echo "1. SCP with password (recommended)"
echo "2. Generate manual commands"
echo "3. Create archive for manual upload"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        print_header "Transferring Files via SCP"
        print_warning "You will be prompted for the VPS password: $VPS_PASSWORD"
        
        # Create remote directory
        print_status "Creating remote directory..."
        ssh $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR" 2>/dev/null || true
        
        # Transfer files
        print_status "Transferring deployment scripts..."
        scp "$SCRIPT_DIR"/*.sh "$SCRIPT_DIR"/README.md $VPS_USER@$VPS_IP:$REMOTE_DIR/
        
        if [ $? -eq 0 ]; then
            print_status "Files transferred successfully! ✅"
            
            # Make scripts executable
            print_status "Making scripts executable..."
            ssh $VPS_USER@$VPS_IP "chmod +x $REMOTE_DIR/*.sh"
            
            print_header "🎉 Transfer Complete!"
            print_status "Files are now available on your VPS at: $REMOTE_DIR"
            echo ""
            print_status "Next steps:"
            echo "1. SSH to your VPS: ssh $VPS_USER@$VPS_IP"
            echo "2. Navigate to: cd $REMOTE_DIR"
            echo "3. Run deployment: sudo bash deploy-all.sh"
            echo ""
            print_status "Or run this command to start deployment immediately:"
            echo "ssh $VPS_USER@$VPS_IP 'cd $REMOTE_DIR && sudo bash deploy-all.sh'"
        else
            print_error "Transfer failed. Please check your connection and credentials."
            exit 1
        fi
        ;;
        
    2)
        print_header "Manual Transfer Commands"
        print_status "Use these commands to transfer files manually:"
        echo ""
        echo "# Create directory on VPS"
        echo "ssh $VPS_USER@$VPS_IP 'mkdir -p $REMOTE_DIR'"
        echo ""
        echo "# Transfer files"
        echo "scp \"$SCRIPT_DIR\"/*.sh \"$SCRIPT_DIR\"/README.md $VPS_USER@$VPS_IP:$REMOTE_DIR/"
        echo ""
        echo "# Make executable"
        echo "ssh $VPS_USER@$VPS_IP 'chmod +x $REMOTE_DIR/*.sh'"
        echo ""
        echo "# Start deployment"
        echo "ssh $VPS_USER@$VPS_IP 'cd $REMOTE_DIR && sudo bash deploy-all.sh'"
        echo ""
        print_warning "Password for VPS: $VPS_PASSWORD"
        ;;
        
    3)
        print_header "Creating Archive for Manual Upload"
        ARCHIVE_NAME="zinga-deployment-$(date +%Y%m%d_%H%M%S).tar.gz"
        
        print_status "Creating archive: $ARCHIVE_NAME"
        tar -czf "$SCRIPT_DIR/$ARCHIVE_NAME" -C "$SCRIPT_DIR" *.sh README.md
        
        if [ $? -eq 0 ]; then
            print_status "Archive created successfully! ✅"
            print_status "Archive location: $SCRIPT_DIR/$ARCHIVE_NAME"
            echo ""
            print_status "Manual upload instructions:"
            echo "1. Upload $ARCHIVE_NAME to your VPS using your preferred method"
            echo "2. SSH to VPS: ssh $VPS_USER@$VPS_IP"
            echo "3. Extract: tar -xzf $ARCHIVE_NAME"
            echo "4. Make executable: chmod +x *.sh"
            echo "5. Run deployment: sudo bash deploy-all.sh"
            echo ""
            print_warning "VPS Details:"
            echo "  IP: $VPS_IP"
            echo "  User: $VPS_USER"
            echo "  Password: $VPS_PASSWORD"
        else
            print_error "Failed to create archive"
            exit 1
        fi
        ;;
        
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

print_header "📋 Quick Reference"
print_status "VPS Connection Details:"
echo "  IP Address: $VPS_IP"
echo "  Username: $VPS_USER"
echo "  Password: $VPS_PASSWORD"
echo "  SSH Command: ssh $VPS_USER@$VPS_IP"
echo "  VNC: 5.189.142.114:63215"
echo ""
print_status "After connecting to VPS:"
echo "  cd $REMOTE_DIR"
echo "  sudo bash deploy-all.sh"
echo ""
print_status "Deployment will take 15-20 minutes"
print_status "Your app will be available at: http://$VPS_IP"
echo ""
print_status "🚀 Ready to deploy Zinga Linga!"

echo ""
echo "📞 Need help? Check the README.md file for detailed instructions."