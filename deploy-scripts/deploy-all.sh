#!/bin/bash

# =============================================================================
# Zinga Linga Complete VPS Deployment Script - Master Installer
# =============================================================================

echo "🚀 ZINGA LINGA COMPLETE VPS DEPLOYMENT"
echo "======================================"
echo "This script will deploy Zinga Linga from 0% to 100% automatically"
echo "Estimated time: 15-20 minutes"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_progress() {
    echo -e "${PURPLE}[PROGRESS]${NC} $1"
}

print_success() {
    echo -e "${CYAN}[SUCCESS]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root (use sudo)"
    print_status "Usage: sudo bash deploy-all.sh"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

print_header "Pre-Deployment Checks"
print_status "Checking system requirements..."

# Check internet connection
if ! ping -c 1 google.com > /dev/null 2>&1; then
    print_error "No internet connection. Please check your network."
    exit 1
fi

# Check available disk space (minimum 5GB)
AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
MIN_SPACE=5242880  # 5GB in KB
if [ $AVAILABLE_SPACE -lt $MIN_SPACE ]; then
    print_error "Insufficient disk space. At least 5GB required."
    exit 1
fi

print_success "System requirements check passed"

# Create log file
LOG_FILE="/var/log/zinga-linga-deployment.log"
touch $LOG_FILE
echo "Deployment started at $(date)" >> $LOG_FILE

print_header "Deployment Overview"
echo "The following steps will be executed:"
echo "  1. Server Setup (Node.js, Nginx, PostgreSQL, PM2)"
echo "  2. Database Configuration (PostgreSQL setup)"
echo "  3. Application Deployment (Git clone, build, configure)"
echo "  4. Web Server Configuration (Nginx reverse proxy)"
echo "  5. Final Setup (Security, monitoring, backups)"
echo ""
print_warning "This process will take 15-20 minutes. Do not interrupt!"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Function to run script with error handling
run_script() {
    local script_name=$1
    local description=$2
    local step_num=$3
    
    print_progress "Step $step_num: $description"
    echo "Starting Step $step_num: $description at $(date)" >> $LOG_FILE
    
    if [ -f "$SCRIPT_DIR/$script_name" ]; then
        chmod +x "$SCRIPT_DIR/$script_name"
        if bash "$SCRIPT_DIR/$script_name" >> $LOG_FILE 2>&1; then
            print_success "Step $step_num completed successfully"
            echo "Step $step_num completed successfully at $(date)" >> $LOG_FILE
        else
            print_error "Step $step_num failed. Check log: $LOG_FILE"
            echo "Step $step_num FAILED at $(date)" >> $LOG_FILE
            exit 1
        fi
    else
        print_error "Script $script_name not found in $SCRIPT_DIR"
        exit 1
    fi
    
    echo "" # Add spacing
}

# Start deployment timer
START_TIME=$(date +%s)

print_header "🚀 Starting Automated Deployment"

# Step 1: Server Setup
run_script "01-server-setup.sh" "Server Preparation & Package Installation" "1/5"

# Step 2: Database Setup
run_script "02-database-setup.sh" "Database Configuration & Setup" "2/5"

# Step 3: Application Deployment
run_script "03-app-deployment.sh" "Application Deployment & Build" "3/5"

# Step 4: Nginx Configuration
run_script "04-nginx-config.sh" "Web Server Configuration" "4/5"

# Step 5: Final Setup
run_script "05-final-setup.sh" "Security & Final Configuration" "5/5"

# Calculate deployment time
END_TIME=$(date +%s)
DEPLOYMENT_TIME=$((END_TIME - START_TIME))
MINUTES=$((DEPLOYMENT_TIME / 60))
SECONDS=$((DEPLOYMENT_TIME % 60))

print_header "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉"
print_success "Total deployment time: ${MINUTES}m ${SECONDS}s"
echo ""
print_status "📋 Deployment Summary:"
echo "  ✅ Server configured and hardened"
echo "  ✅ PostgreSQL database setup"
echo "  ✅ Zinga Linga application deployed"
echo "  ✅ Nginx web server configured"
echo "  ✅ Security measures implemented"
echo "  ✅ Monitoring and backups configured"
echo ""
print_status "🌐 Your application is now live at:"
echo "     http://109.199.106.28"
echo ""
print_status "🔧 Management Commands:"
echo "     zinga-manage status    - Check system status"
echo "     zinga-manage ssl       - Setup HTTPS"
echo "     zinga-manage backup    - Create backup"
echo "     zinga-manage restart   - Restart services"
echo "     zinga-manage update    - Update application"
echo ""
print_status "📖 Full documentation available at:"
echo "     /root/DEPLOYMENT_SUMMARY.txt"
echo ""
print_status "📋 Deployment log saved to:"
echo "     $LOG_FILE"
echo ""
print_warning "🔒 Next Steps:"
echo "  1. Visit http://109.199.106.28 to test your application"
echo "  2. Run 'zinga-manage ssl' to setup HTTPS"
echo "  3. Configure your domain name (optional)"
echo "  4. Test all application features"
echo "  5. Set up monitoring alerts"
echo ""
print_success "🎊 Congratulations! Zinga Linga is ready for production use!"

# Final system status
print_header "Final System Status"
if command -v zinga-manage > /dev/null 2>&1; then
    zinga-manage status
else
    print_status "System services status:"
    echo "  Nginx: $(systemctl is-active nginx 2>/dev/null || echo 'unknown')"
    echo "  PostgreSQL: $(systemctl is-active postgresql 2>/dev/null || echo 'unknown')"
    echo "  Application: $(pm2 ping 2>/dev/null | grep -q 'pong' && echo 'active' || echo 'inactive')"
fi

echo ""
echo "🚀 Deployment completed at $(date) 🚀"
echo "Deployment completed successfully at $(date)" >> $LOG_FILE

# Create quick access script
cat > /usr/local/bin/deployment-info << 'EOF'
#!/bin/bash
echo "🌐 Zinga Linga Deployment Information"
echo "===================================="
echo "Application URL: http://109.199.106.28"
echo "Deployment Log: /var/log/zinga-linga-deployment.log"
echo "Documentation: /root/DEPLOYMENT_SUMMARY.txt"
echo "Management: zinga-manage [status|ssl|backup|restart|update]"
echo ""
echo "Quick Commands:"
echo "  zinga-manage status  - System status"
echo "  zinga-manage ssl     - Setup HTTPS"
echo "  tail -f /var/log/zinga-linga-deployment.log  - View deployment log"
EOF

chmod +x /usr/local/bin/deployment-info

print_status "💡 Tip: Run 'deployment-info' anytime to see this information again"
echo ""
print_success "🎉 Welcome to Zinga Linga! Your educational platform is ready! 🎉"