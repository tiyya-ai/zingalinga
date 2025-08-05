# Zinga Linga VPS Deployment Guide

## 🚀 النشر الأوتوماتيكي الكامل (FULL AUTOMATIC)

يمكنك جعل النشر يتم تلقائيًا بالكامل عند كل Push على GitHub بدون أي تدخل يدوي، عبر GitHub Actions وSSH:

1. **اربط مشروعك بـ GitHub.**
2. **أضف مفتاح SSH خاص (private key) كسِر في إعدادات المستودع (secrets):**
   - `VPS_HOST`: عنوان السيرفر
   - `VPS_USER`: اسم المستخدم (عادة root)
   - `VPS_SSH_KEY`: مفتاح SSH الخاص

3. **أضف ملف GitHub Action في `.github/workflows/deploy.yml`:**
   ```yaml
   name: Full Auto Deploy to VPS

   on:
     push:
       branches:
         - main

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout code
           uses: actions/checkout@v3

         - name: Copy files to VPS via SSH
           uses: appleboy/scp-action@v0.1.7
           with:
             host: ${{ secrets.VPS_HOST }}
             username: ${{ secrets.VPS_USER }}
             key: ${{ secrets.VPS_SSH_KEY }}
             source: "."
             target: "/var/www/yourapp"
             rm: true

         - name: Install & Build & Restart (Remote)
           uses: appleboy/ssh-action@v1.0.3
           with:
             host: ${{ secrets.VPS_HOST }}
             username: ${{ secrets.VPS_USER }}
             key: ${{ secrets.VPS_SSH_KEY }}
             script: |
               cd /var/www/yourapp
               npm install
               npm run build
               pm2 restart yourapp || pm2 start npm --name "yourapp" -- start
   ```

4. **الآن كل Push على فرع main سيؤدي تلقائيًا إلى:**
   - رفع الكود إلى السيرفر
   - تثبيت الحزم
   - بناء المشروع
   - إعادة تشغيل التطبيق

---

## 🚦 أسهل طريقة للنشر اليدوي (rsync أو scp)

### المتطلبات
- مشروع Next.js جاهز على جهازك.
- لديك VPS ويمكنك الدخول إليه عبر SSH.
- Node.js وPM2 مثبتان على السيرفر.

### الخطوات

1. **بناء الموقع محليًا:**
   ```bash
   npm run build
   ```

2. **رفع الملفات إلى السيرفر (بدون node_modules):**
   ```bash
   rsync -avz --exclude='node_modules' . root@your_vps_ip:/var/www/yourapp
   ```
   أو:
   ```bash
   scp -r * root@your_vps_ip:/var/www/yourapp
   ```

3. **SSH إلى السيرفر وتشغيل الموقع:**
   ```bash
   ssh root@your_vps_ip
   cd /var/www/yourapp
   npm install
   npm run build
   pm2 start npm --name "yourapp" -- start
   ```

4. **لتحديث الموقع لاحقًا:**
   ```bash
   rsync -avz --exclude='node_modules' . root@your_vps_ip:/var/www/yourapp
   ssh root@your_vps_ip "cd /var/www/yourapp && npm run build && pm2 restart yourapp"
   ```

---

## ✅ الطريقة الأوتوماتيكية (تحديث تلقائي بعد Push على GitHub)

1. **ارفع مشروعك على GitHub.**
2. **على السيرفر:**
   ```bash
   git clone https://github.com/username/repo.git /var/www/yourapp
   cd /var/www/yourapp
   npm install
   npm run build
   pm2 start npm --name "yourapp" -- start
   ```
3. **في GitHub:**
   - أضف Webhook يشير إلى سكربت على السيرفر.

4. **أنشئ سكربت تلقائي على السيرفر:**  
   في `/var/www/deploy.sh`
   ```bash
   #!/bin/bash
   cd /var/www/yourapp
   git pull origin main
   npm install
   npm run build
   pm2 restart yourapp
   ```
   ثم:
   ```bash
   chmod +x /var/www/deploy.sh
   ```

5. **استخدم أداة webhook أو سيرفر صغير Node.js لاستقبال Webhook من GitHub.**

> يمكنك أيضًا استخدام خدمات مثل Cyclic.sh أو Render أو Railway للنشر التلقائي من GitHub بدون VPS.

---

## 🤖 النشر الأوتوماتيكي عبر GitHub Actions (Agentic Style)

1. **اربط مشروعك بـ GitHub.**

2. **أضف ملف GitHub Action في `.github/workflows/deploy.yml`:**
   ```yaml
   name: Deploy to VPS

   on:
     push:
       branches:
         - main

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout code
           uses: actions/checkout@v3

         - name: Copy files to VPS via SSH
           uses: appleboy/scp-action@v0.1.7
           with:
             host: ${{ secrets.VPS_HOST }}
             username: ${{ secrets.VPS_USER }}
             key: ${{ secrets.VPS_SSH_KEY }}
             source: "."
             target: "/var/www/yourapp"
             rm: true

         - name: Run remote SSH commands
           uses: appleboy/ssh-action@v1.0.3
           with:
             host: ${{ secrets.VPS_HOST }}
             username: ${{ secrets.VPS_USER }}
             key: ${{ secrets.VPS_SSH_KEY }}
             script: |
               cd /var/www/yourapp
               npm install
               npm run build
               pm2 restart yourapp || pm2 start npm --name "yourapp" -- start
   ```

3. **أضف أسرار الاتصال (secrets) في إعدادات مستودع GitHub:**
   - `VPS_HOST`: عنوان الـ VPS
   - `VPS_USER`: اسم المستخدم (عادة root)
   - `VPS_SSH_KEY`: مفتاح SSH الخاص (Private Key)

4. **كل Push على فرع main سيؤدي إلى:**
   - رفع الملفات إلى السيرفر.
   - تثبيت الحزم.
   - بناء المشروع.
   - إعادة تشغيل التطبيق تلقائيًا.

---

## 🚀 Deployment Steps

### 1. Prepare Application for Deployment

```bash
# Install dependencies
npm install

# Create production build
npm run build

# Create deployment package
tar -czf zinga-linga-vps.tar.gz .next node_modules package.json package-lock.json public
```

### 2. Upload to VPS

```bash
# Upload package to VPS
scp zinga-linga-vps.tar.gz root@109.199.106.28:/root/
```

### 3. SSH into VPS and Deploy

```bash
# Connect to VPS
ssh root@109.199.106.28

# Create application directory
mkdir -p /var/www/zinga-linga
cd /var/www/zinga-linga

# Extract deployment package
tar -xzf /root/zinga-linga-vps.tar.gz

# Install production dependencies
npm install --production

# Install PM2 if not already installed
npm install -g pm2

# Start application with PM2
pm2 start npm --name "zinga-linga" -- start

# Save PM2 configuration
pm2 save

# Clean up
rm /root/zinga-linga-vps.tar.gz
```

### 4. Setup NGINX (Optional)

```bash
# Install NGINX if not installed
apt-get update
apt-get install nginx

# Create NGINX configuration
cat > /etc/nginx/sites-available/zinga-linga << 'EOL'
server {
    listen 80;
    server_name 109.199.106.28;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Enable site and restart NGINX
ln -s /etc/nginx/sites-available/zinga-linga /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 🔑 Default Credentials

- Admin Account:
  - Email: admin@zingalinga.com
  - Password: admin123

- Test User Account:
  - Email: test@example.com
  - Password: test123

## 🌐 Access Application

Once deployed, your application will be available at:
- http://109.199.106.28:3000

## 📋 Post-Deployment Checklist

1. [ ] Verify application is running: `pm2 status`
2. [ ] Check application logs: `pm2 logs zinga-linga`
3. [ ] Test admin login
4. [ ] Test user login
5. [ ] Verify all features are working
6. [ ] Monitor server resources: `htop`

## 🔄 Update Application

To update the application:

```bash
# Stop current instance
pm2 stop zinga-linga

# Remove old files
cd /var/www/zinga-linga
rm -rf *

# Upload and extract new version
# (Follow steps 1-3 above)

# Restart application
pm2 restart zinga-linga
```

## 🛟 Troubleshooting

If you encounter issues:

1. Check application logs:
   ```bash
   pm2 logs zinga-linga
   ```

2. Verify Node.js version:
   ```bash
   node --version
   ```

3. Check port availability:
   ```bash
   lsof -i :3000
   ```

4. Restart application:
   ```bash
   pm2 restart zinga-linga
   ```

5. Monitor system resources:
   ```bash
   htop
   ```

For additional help, contact the development team.
