# Fix VPS Profile Editing Issue

## Problem
Profile editing works locally but fails on VPS due to file permissions and data persistence issues.

## Root Causes
1. **File Permissions**: VPS doesn't have write access to data directory
2. **Missing Data Directory**: `/var/www/zinga-linga-data` doesn't exist
3. **Environment Variables**: Not properly loaded on VPS

## Solutions

### 1. Fix File Permissions on VPS
```bash
# SSH into your VPS and run:
sudo mkdir -p /var/www/zinga-linga-data
sudo chown -R www-data:www-data /var/www/zinga-linga-data
sudo chmod -R 755 /var/www/zinga-linga-data

# If using PM2 or different user:
sudo chown -R $USER:$USER /var/www/zinga-linga-data
```

### 2. Update Environment Variables
Create/update `.env.production` on VPS:
```env
DATA_DIR=/var/www/zinga-linga-data
NODE_ENV=production
DEFAULT_ADMIN_PASSWORD=YourSecurePassword123!
DEFAULT_USER_PASSWORD=YourSecurePassword123!
```

### 3. Add Error Handling to API Route
The current API route needs better error handling for VPS deployment.

### 4. Alternative: Use Relative Data Directory
If permissions are still an issue, use a relative path instead.