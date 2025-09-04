#!/bin/bash

# Zinga Linga VPS Deployment Script

echo "🚀 Starting Zinga Linga deployment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MySQL
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql

# Create application directory
sudo mkdir -p /var/www/zingalinga
sudo chown -R $USER:$USER /var/www/zingalinga

# Copy files (run this from your local machine)
# rsync -avz --exclude node_modules --exclude .git . user@your-vps-ip:/var/www/zingalinga/

# Navigate to app directory
cd /var/www/zingalinga

# Install dependencies
npm install

# Build application
npm run build

# Setup MySQL database
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS zingalinga;
CREATE USER IF NOT EXISTS 'zingalinga_user'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON zingalinga.* TO 'zingalinga_user'@'localhost';
FLUSH PRIVILEGES;

USE zingalinga;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  purchasedModules JSON,
  totalSpent DECIMAL(10,2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastLogin TIMESTAMP NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  type VARCHAR(50),
  rating DECIMAL(2,1) DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  thumbnail TEXT,
  videoUrl TEXT,
  audioUrl TEXT,
  duration VARCHAR(20),
  tags JSON,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255),
  moduleId VARCHAR(255),
  amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'completed',
  paymentMethod VARCHAR(100),
  transactionId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  type VARCHAR(50),
  isActive BOOLEAN DEFAULT TRUE,
  contentIds JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT IGNORE INTO users (id, email, password, name, role, status) 
VALUES ('admin-001', 'admin@zingalinga.com', 'admin123', 'Admin User', 'admin', 'active');

-- Insert default packages
INSERT IGNORE INTO packages (id, name, description, price, type, isActive, contentIds) 
VALUES ('explorer-pack', 'Explorer Pack', 'Where Letters Come to Life!', 30.00, 'subscription', TRUE, '[]');

EOF

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Install and configure Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/zingalinga << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/zingalinga /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL certificate (optional)
# sudo apt install certbot python3-certbot-nginx -y
# sudo certbot --nginx -d your-domain.com -d www.your-domain.com

echo "✅ Deployment complete!"
echo "🌐 Your website should be available at: http://your-domain.com"
echo "🔐 Admin login: admin@zingalinga.com / admin123"