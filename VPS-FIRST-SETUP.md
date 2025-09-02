# VPS First Time Setup

## 1. Clone Your Repository
```bash
cd /var/www
git clone https://github.com/tiyya-ai/zingalinga.git
cd zingalinga
```

## 2. Install Dependencies
```bash
npm install
```

## 3. Create Data Directory and Admin User
```bash
mkdir -p data
echo '{"users":[{"id":"admin_001","email":"admin@zingalinga.com","password":"admin123","name":"Admin User","role":"admin","status":"active","purchasedModules":[],"totalSpent":0,"createdAt":"2025-01-20T10:00:00.000Z","lastLogin":"2025-01-20T10:00:00.000Z","loginAttempts":0,"accountLocked":false}],"modules":[],"purchases":[],"packages":[]}' > data/global-app-data.json
```

## 4. Build and Start App
```bash
npm run build
npm install -g pm2
pm2 start npm --name "zingalinga" -- start
pm2 save
pm2 startup
```

## 5. Configure Apache Virtual Host
```bash
sudo nano /etc/apache2/sites-available/zingalinga.conf
```

Add this content:
```apache
<VirtualHost *:80>
    ServerName zingalinga.io
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>

<VirtualHost *:443>
    ServerName zingalinga.io
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/zingalinga.crt
    SSLCertificateKeyFile /etc/ssl/private/zingalinga.key
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

## 6. Enable Site and Modules
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod ssl
sudo a2ensite zingalinga
sudo systemctl reload apache2
```

## 7. Check Status
```bash
pm2 status
curl http://localhost:3000
```

Now you can login with admin@zingalinga.com / admin123