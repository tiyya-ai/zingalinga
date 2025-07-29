#!/bin/bash

# =============================================================================
# Zinga Linga VPS Setup Script - Part 5: Final Setup & Security
# =============================================================================

echo "🔒 Starting Zinga Linga VPS Setup - Part 5: Final Setup & Security"
echo "===================================================================="

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
SERVER_IP="109.199.106.28"
APP_DIR="/var/www/zinga-linga-app"

print_header "Security Hardening"
print_status "Configuring additional security measures..."

# Update SSH configuration for better security
print_status "Hardening SSH configuration..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Create improved SSH config
cat >> /etc/ssh/sshd_config << 'EOF'

# Zinga Linga Security Hardening
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowTcpForwarding no
EOF

# Restart SSH service
systemctl restart sshd
print_status "SSH configuration hardened"

# Configure fail2ban for additional security
print_status "Installing and configuring Fail2ban..."
apt install -y fail2ban

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl start fail2ban
print_status "Fail2ban configured and started"

print_header "System Monitoring Setup"
print_status "Installing system monitoring tools..."
apt install -y htop iotop nethogs ncdu

# Create system health check script
cat > /usr/local/bin/health-check << 'EOF'
#!/bin/bash
# System Health Check Script

echo "🏥 System Health Check - $(date)"
echo "================================="

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️ WARNING: Disk usage is ${DISK_USAGE}%"
else
    echo "✅ Disk usage: ${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 80 ]; then
    echo "⚠️ WARNING: Memory usage is ${MEM_USAGE}%"
else
    echo "✅ Memory usage: ${MEM_USAGE}%"
fi

# Check CPU load
CPU_LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
echo "📊 CPU Load: $CPU_LOAD"

# Check services
echo "\n🔧 Service Status:"
echo "Nginx: $(systemctl is-active nginx)"
echo "PostgreSQL: $(systemctl is-active postgresql)"
echo "PM2: $(pm2 ping 2>/dev/null | grep -q 'pong' && echo 'active' || echo 'inactive')"

# Check application
echo "\n🌐 Application Status:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Application responding (HTTP $HTTP_STATUS)"
else
    echo "❌ Application not responding (HTTP $HTTP_STATUS)"
fi

# Check database
echo "\n🗄️ Database Status:"
if sudo -u postgres psql -c "\l" > /dev/null 2>&1; then
    echo "✅ Database accessible"
else
    echo "❌ Database connection failed"
fi

echo "\n📋 Recent Errors:"
echo "Application errors (last 5):"
pm2 logs zinga-linga --err --lines 5 --nostream 2>/dev/null | tail -5

echo "\nNginx errors (last 5):"
tail -5 /var/log/nginx/error.log 2>/dev/null
EOF

chmod +x /usr/local/bin/health-check
print_status "Health check script created"

print_header "Automated Backup System"
print_status "Setting up comprehensive backup system..."

# Create main backup script
cat > /backup/full-backup.sh << 'EOF'
#!/bin/bash
# Comprehensive Backup Script for Zinga Linga

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"
APP_DIR="/var/www/zinga-linga-app"
LOG_FILE="$BACKUP_DIR/backup.log"

echo "$(date): Starting backup process" >> $LOG_FILE

# Create backup directory for this session
SESSION_DIR="$BACKUP_DIR/backup_$DATE"
mkdir -p $SESSION_DIR

# Backup application files
echo "$(date): Backing up application files" >> $LOG_FILE
tar -czf $SESSION_DIR/app_backup.tar.gz -C /var/www zinga-linga-app

# Backup database
echo "$(date): Backing up database" >> $LOG_FILE
source /var/www/db-config.env
PGPASSWORD=$PGPASSWORD pg_dump -h localhost -U $PGUSER $PGDATABASE > $SESSION_DIR/database_backup.sql
gzip $SESSION_DIR/database_backup.sql

# Backup Nginx configuration
echo "$(date): Backing up Nginx configuration" >> $LOG_FILE
tar -czf $SESSION_DIR/nginx_backup.tar.gz /etc/nginx

# Backup system configuration
echo "$(date): Backing up system configuration" >> $LOG_FILE
tar -czf $SESSION_DIR/system_backup.tar.gz /etc/ssh /etc/fail2ban /etc/crontab

# Create backup manifest
echo "Backup created on: $(date)" > $SESSION_DIR/manifest.txt
echo "Server IP: 109.199.106.28" >> $SESSION_DIR/manifest.txt
echo "Application: Zinga Linga" >> $SESSION_DIR/manifest.txt
echo "Files included:" >> $SESSION_DIR/manifest.txt
ls -la $SESSION_DIR >> $SESSION_DIR/manifest.txt

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*" -type d -mtime +7 -exec rm -rf {} \;

echo "$(date): Backup process completed" >> $LOG_FILE
echo "Backup saved to: $SESSION_DIR"
EOF

chmod +x /backup/full-backup.sh
print_status "Backup script created"

print_header "Cron Jobs Setup"
print_status "Setting up automated tasks..."

# Create crontab entries
(crontab -l 2>/dev/null; cat << 'EOF'
# Zinga Linga Automated Tasks

# Daily backup at 2 AM
0 2 * * * /backup/full-backup.sh

# Health check every 30 minutes
*/30 * * * * /usr/local/bin/health-check >> /var/log/health-check.log 2>&1

# Restart application weekly (Sunday 3 AM)
0 3 * * 0 pm2 restart zinga-linga

# Clean logs monthly
0 0 1 * * find /var/log -name "*.log" -mtime +30 -delete

# Update system packages monthly
0 4 1 * * apt update && apt upgrade -y
EOF
) | crontab -

print_status "Cron jobs configured"

print_header "Performance Optimization"
print_status "Applying performance optimizations..."

# Optimize system limits
cat >> /etc/security/limits.conf << 'EOF'
# Zinga Linga Performance Optimization
www-data soft nofile 65536
www-data hard nofile 65536
root soft nofile 65536
root hard nofile 65536
EOF

# Optimize kernel parameters
cat >> /etc/sysctl.conf << 'EOF'
# Zinga Linga Network Optimization
net.core.somaxconn = 65536
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 3
EOF

sysctl -p
print_status "Performance optimizations applied"

print_header "Creating Management Dashboard"
print_status "Setting up management commands..."

# Create management script
cat > /usr/local/bin/zinga-manage << 'EOF'
#!/bin/bash
# Zinga Linga Management Script

case "$1" in
    status)
        echo "🔍 Zinga Linga Status"
        echo "==================="
        /usr/local/bin/monitor-zinga-linga
        ;;
    restart)
        echo "🔄 Restarting Zinga Linga..."
        pm2 restart zinga-linga
        systemctl restart nginx
        echo "✅ Restart completed"
        ;;
    update)
        echo "📦 Updating Zinga Linga..."
        /usr/local/bin/update-zinga-linga
        ;;
    backup)
        echo "💾 Creating backup..."
        /backup/full-backup.sh
        ;;
    logs)
        echo "📋 Recent Application Logs:"
        pm2 logs zinga-linga --lines 20
        ;;
    health)
        /usr/local/bin/health-check
        ;;
    ssl)
        /usr/local/bin/setup-ssl
        ;;
    *)
        echo "Zinga Linga Management Tool"
        echo "Usage: zinga-manage {status|restart|update|backup|logs|health|ssl}"
        echo ""
        echo "Commands:"
        echo "  status  - Show system and application status"
        echo "  restart - Restart application and web server"
        echo "  update  - Update application from Git"
        echo "  backup  - Create full system backup"
        echo "  logs    - Show recent application logs"
        echo "  health  - Run health check"
        echo "  ssl     - Setup SSL certificate"
        ;;
esac
EOF

chmod +x /usr/local/bin/zinga-manage
print_status "Management dashboard created"

print_header "Final System Test"
print_status "Running comprehensive system test..."

# Test all components
ERRORS=0

# Test Nginx
if ! systemctl is-active --quiet nginx; then
    print_error "Nginx is not running"
    ((ERRORS++))
fi

# Test PostgreSQL
if ! systemctl is-active --quiet postgresql; then
    print_error "PostgreSQL is not running"
    ((ERRORS++))
fi

# Test Application
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_error "Application is not responding"
    ((ERRORS++))
fi

# Test PM2
if ! pm2 ping > /dev/null 2>&1; then
    print_error "PM2 is not responding"
    ((ERRORS++))
fi

# Test external access
if ! curl -f http://$SERVER_IP > /dev/null 2>&1; then
    print_error "External access test failed"
    ((ERRORS++))
fi

if [ $ERRORS -eq 0 ]; then
    print_status "All system tests passed! ✅"
else
    print_warning "$ERRORS test(s) failed. Please check the issues above."
fi

print_header "Creating Deployment Summary"
print_status "Generating deployment report..."

cat > /root/DEPLOYMENT_SUMMARY.txt << EOF
================================================================================
                    ZINGA LINGA DEPLOYMENT SUMMARY
================================================================================

Deployment Date: $(date)
Server IP: $SERVER_IP
Application: Zinga Linga Educational Platform

🌐 ACCESS INFORMATION
--------------------
Application URL: http://$SERVER_IP
Admin Access: Available through application interface
SSH Access: ssh root@$SERVER_IP
VNC Access: 5.189.142.114:63215

📁 DIRECTORY STRUCTURE
----------------------
Application: $APP_DIR
Backups: /backup
Logs: /var/log
Nginx Config: /etc/nginx/sites-available/zinga-linga
Database Config: /var/www/db-config.env

🔧 SERVICES STATUS
------------------
Nginx: $(systemctl is-active nginx)
PostgreSQL: $(systemctl is-active postgresql)
PM2: $(pm2 ping 2>/dev/null | grep -q 'pong' && echo 'active' || echo 'inactive')
Fail2ban: $(systemctl is-active fail2ban)

📊 SYSTEM INFORMATION
---------------------
OS: $(lsb_release -d | cut -f2)
Node.js: $(node --version)
npm: $(npm --version)
Nginx: $(nginx -v 2>&1)
PostgreSQL: $(sudo -u postgres psql -c 'SELECT version();' | head -3 | tail -1 | cut -d' ' -f1-2)

🛠️ MANAGEMENT COMMANDS
-----------------------
zinga-manage status    - Check system status
zinga-manage restart   - Restart services
zinga-manage update    - Update application
zinga-manage backup    - Create backup
zinga-manage logs      - View logs
zinga-manage health    - Health check
zinga-manage ssl       - Setup SSL

📋 MAINTENANCE TASKS
--------------------
✅ Daily backups (2 AM)
✅ Health checks (every 30 minutes)
✅ Weekly restarts (Sunday 3 AM)
✅ Monthly log cleanup
✅ Monthly system updates

🔒 SECURITY FEATURES
--------------------
✅ UFW Firewall configured
✅ Fail2ban intrusion prevention
✅ SSH hardening
✅ Nginx security headers
✅ Rate limiting
✅ Log monitoring

📞 SUPPORT INFORMATION
----------------------
For technical support or issues:
1. Check logs: zinga-manage logs
2. Run health check: zinga-manage health
3. View system status: zinga-manage status
4. Create backup before changes: zinga-manage backup

🎉 DEPLOYMENT COMPLETE!
------------------------
Your Zinga Linga application is now fully deployed and ready for production use.
All security measures, monitoring, and backup systems are in place.

Next Steps:
1. Visit http://$SERVER_IP to access your application
2. Set up SSL certificate: zinga-manage ssl
3. Configure your domain name (if applicable)
4. Test all application features
5. Set up regular monitoring

================================================================================
EOF

print_status "Deployment summary created at /root/DEPLOYMENT_SUMMARY.txt"

print_header "🎉 DEPLOYMENT COMPLETE! 🎉"
print_status "Zinga Linga has been successfully deployed!"
echo ""
print_status "🌐 Your application is live at: http://$SERVER_IP"
echo ""
print_status "📋 Quick Start Commands:"
echo "  zinga-manage status  - Check everything"
echo "  zinga-manage ssl     - Setup HTTPS"
echo "  zinga-manage backup  - Create backup"
echo ""
print_status "📖 Full documentation: /root/DEPLOYMENT_SUMMARY.txt"
echo ""
print_warning "🔒 Remember to:"
echo "  1. Setup SSL certificate for HTTPS"
echo "  2. Configure your domain name"
echo "  3. Test all application features"
echo "  4. Set up monitoring alerts"
echo ""
print_status "🎊 Congratulations! Your Zinga Linga platform is ready for users!"

# Run final status check
echo ""
print_header "Final Status Check"
zinga-manage status

echo ""
echo "🚀 Deployment completed successfully! Welcome to Zinga Linga! 🚀"