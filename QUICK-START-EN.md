# 🚀 Zinga Linga Quick Start Deployment Guide

## ⚡ Quick Start (5 minutes)

### 1. Run Deployment Tracker

```bash
# Windows
deployment-tracker.bat

# Linux/Mac or Windows with Node.js
node deployment-tracker-en.js
```

### 2. Follow the Steps

- Choose "2" to execute the next step
- Or choose "1" to view all steps first

### 3. Check Deployment

```bash
npm run deploy:check
```

## 🎯 Essential Commands

| Command | Description |
|---------|-------------|
| `node deployment-tracker-en.js` | Run interactive deployment tracker |
| `npm run deploy:prepare` | Prepare deployment package only |
| `npm run deploy:auto` | Full automatic deployment |
| `npm run deploy:check` | Check deployment status |
| `npm run deploy:fix` | Quick fix for issues |

## 📋 Quick Checklist

### Before Deployment
- [ ] Project built: `npm run build`
- [ ] No errors in code
- [ ] Application tested locally

### During Deployment
- [ ] Files uploaded to VPS
- [ ] Dependencies installed on VPS
- [ ] Application started with PM2

### After Deployment
- [ ] Application running: `npm run deploy:check:web`
- [ ] PM2 working correctly
- [ ] No errors in logs

## 🔧 VPS Settings

### Default Information
- **IP**: 109.199.106.28
- **User**: root
- **Password**: Secureweb25
- **Port**: 3000
- **App Path**: /var/www/zinga-linga
- **Domain**: http://zingalinga.io/

### Change Settings
Edit these files:
- `deployment-tracker-en.js` - for basic settings
- `check-deployment.js` - for deployment checks
- `nginx-zingalinga-io.conf` - for NGINX settings

## 🆘 Quick Troubleshooting

### Issue: Cannot access website
```bash
npm run deploy:fix
```

### Issue: PM2 not working
```bash
ssh root@109.199.106.28
pm2 restart zinga-linga
```

### Issue: Build error
```bash
npm install
npm run build
```

## 📞 Getting Help

1. **Check logs**:
   ```bash
   npm run deploy:check
   # Then choose "4" to view logs
   ```

2. **Full restart**:
   ```bash
   ssh root@109.199.106.28
   pm2 restart zinga-linga
   systemctl restart nginx
   ```

3. **Check status**:
   ```bash
   npm run deploy:check:all
   ```

## 🎉 Success Tips

- ✅ Use deployment tracker for first time
- ✅ Keep backup before deployment
- ✅ Test each step before continuing
- ✅ Monitor logs after deployment

---

## 🚀 Auto Deployment Setup

### GitHub Actions (Automatic)

1. **Connect to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "🚀 Initial commit with auto-deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/zinga-linga-nextjs.git
   git push -u origin main
   ```

2. **Setup GitHub Secrets**:
   Go to repository Settings → Secrets and variables → Actions:
   - `VPS_HOST`: `109.199.106.28`
   - `VPS_USER`: `root`
   - `VPS_SSH_KEY`: [Your SSH Private Key]

3. **Enable Auto Deployment**:
   ```bash
   git add .
   git commit -m "🎉 Enable auto-deployment"
   git push origin main
   ```

### VPS Setup

```bash
# Windows
setup-vps.bat

# Linux/Mac
chmod +x setup-vps.sh
./setup-vps.sh
```

## 📊 Monitoring

### Check Application Status
```bash
ssh root@109.199.106.28 "pm2 status"
```

### View Logs
```bash
ssh root@109.199.106.28 "pm2 logs zinga-linga"
```

### Test Website
```bash
curl -I http://zingalinga.io
```

---

**🚀 With deployment tracker, deployment is now easy and safe!**