#!/bin/bash

# =============================================================================
# Zinga Linga VPS Setup Script - Part 2: Database Configuration
# =============================================================================

echo "🗄️ Starting Zinga Linga VPS Setup - Part 2: Database Configuration"
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

# Generate secure password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
DB_NAME="zinga_linga"
DB_USER="zinga_user"

print_header "Database Configuration"
print_status "Creating database and user..."
print_status "Database: $DB_NAME"
print_status "User: $DB_USER"
print_status "Password: $DB_PASSWORD"

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

if [ $? -eq 0 ]; then
    print_status "Database and user created successfully"
else
    print_error "Failed to create database and user"
    exit 1
fi

print_header "Testing Database Connection"
print_status "Testing connection to database..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Database connection test successful"
else
    print_error "Database connection test failed"
    exit 1
fi

print_header "Creating Environment Configuration"
print_status "Creating database configuration file..."
cat > /var/www/db-config.env << EOF
# Database Configuration for Zinga Linga
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
PGHOST=localhost
PGUSER=$DB_USER
PGDATABASE=$DB_NAME
PGPASSWORD=$DB_PASSWORD
PGPORT=5432
EOF

chmod 600 /var/www/db-config.env
print_status "Database configuration saved to /var/www/db-config.env"

print_header "Creating Database Tables Script"
print_status "Creating database tables setup script..."
cat > /var/www/create-tables.sql << 'EOF'
-- Zinga Linga Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    subscription_status VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0.00,
    category VARCHAR(100),
    difficulty_level VARCHAR(50),
    duration_minutes INTEGER,
    is_free BOOLEAN DEFAULT false,
    content_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'completed',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255)
);

-- Content files table
CREATE TABLE IF NOT EXISTS content_files (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    file_url VARCHAR(500),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, module_id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_module_id ON purchases(module_id);
CREATE INDEX IF NOT EXISTS idx_content_files_module_id ON content_files(module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Insert sample data
INSERT INTO modules (title, description, price, category, difficulty_level, duration_minutes, is_free) VALUES
('Introduction to Zinga Linga', 'Learn the basics of our educational platform', 0.00, 'Getting Started', 'Beginner', 30, true),
('Advanced Learning Techniques', 'Master advanced learning strategies', 19.99, 'Advanced', 'Intermediate', 60, false),
('Creative Problem Solving', 'Develop creative thinking skills', 14.99, 'Creativity', 'Beginner', 45, false),
('Digital Literacy Basics', 'Essential digital skills for modern learning', 9.99, 'Technology', 'Beginner', 40, false),
('Critical Thinking Workshop', 'Enhance your analytical abilities', 24.99, 'Thinking Skills', 'Advanced', 90, false)
ON CONFLICT DO NOTHING;

EOF

print_status "Database schema script created"

print_header "Creating Database Tables"
print_status "Executing database schema..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f /var/www/create-tables.sql
if [ $? -eq 0 ]; then
    print_status "Database tables created successfully"
else
    print_error "Failed to create database tables"
    exit 1
fi

print_header "Verifying Database Setup"
print_status "Checking created tables..."
TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
print_status "Created $TABLE_COUNT tables in the database"

print_header "Creating Database Backup Script"
print_status "Creating automated backup script..."
cat > /backup/backup-database.sh << EOF
#!/bin/bash
# Automated database backup script
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"
DB_PASSWORD="$DB_PASSWORD"

# Create backup
PGPASSWORD=\$DB_PASSWORD pg_dump -h localhost -U \$DB_USER \$DB_NAME > \$BACKUP_DIR/db_backup_\$DATE.sql

# Compress backup
gzip \$BACKUP_DIR/db_backup_\$DATE.sql

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: db_backup_\$DATE.sql.gz"
EOF

chmod +x /backup/backup-database.sh
print_status "Database backup script created at /backup/backup-database.sh"

print_header "Database Setup Complete!"
print_status "Database configuration completed successfully!"
print_status "Database Details:"
echo "  - Database Name: $DB_NAME"
echo "  - Database User: $DB_USER"
echo "  - Database Password: $DB_PASSWORD"
echo "  - Connection String: postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
print_warning "IMPORTANT: Save these database credentials securely!"
print_warning "Configuration saved to: /var/www/db-config.env"
echo ""
print_status "Next step: Run ./03-app-deployment.sh to deploy the application"

echo "🎉 Part 2 Complete! Database is ready for the application."