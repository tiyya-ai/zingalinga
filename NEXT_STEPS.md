# 🚀 You're Now Connected to Your VPS!

## ✅ Current Status
- ✅ Files uploaded to VPS
- ✅ SSH connection established
- ✅ Ready to deploy

**Current Location**: `root@vmi2732955:~#`

## 🔧 Run These Commands Now

### Step 1: Navigate to Files
```bash
cd /tmp
ls -la
```
*You should see: `zinga-linga-update.tar.gz` and `update-vps.sh`*

### Step 2: Make Script Executable
```bash
chmod +x update-vps.sh
```

### Step 3: Run Deployment
```bash
./update-vps.sh
```

## 📋 What Will Happen
The deployment script will:
1. 🔄 Create backup of existing deployment
2. 🛑 Stop current application (if running)
3. 📦 Extract your new update (114MB)
4. 📚 Install/update dependencies
5. 🚀 Start updated application with PM2
6. ✅ Show status and confirmation

## 🌐 After Deployment
Your application will be available at:
- **Direct**: `http://109.199.106.28:3000`
- **With Nginx**: `http://109.199.106.28`

## 📊 Verification Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs zinga-linga --lines 20

# Test locally
curl http://localhost:3000

# Check if port is open
netstat -tlnp | grep :3000
```

## 🆘 If Issues Occur

### Check Logs
```bash
pm2 logs zinga-linga
```

### Restart Application
```bash
pm2 restart zinga-linga
```

### Check System Resources
```bash
htop
df -h
free -h
```

### Manual Start (if needed)
```bash
cd /var/www/zinga-linga-nextjs
npm start
```

## 🔥 Quick Commands Summary

**Right now, run these in your VPS terminal:**
```bash
cd /tmp
chmod +x update-vps.sh
./update-vps.sh
```

**Then verify:**
```bash
pm2 status
curl http://localhost:3000
```

---

**Status**: Connected to VPS ✅ | Ready to deploy 🚀
**Server**: Contabo VPS (vmi2732955)
**Next**: Run the deployment commands above