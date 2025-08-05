# 🚀 Zinga Linga - GitHub to VPS Deployment

## Quick Start (3 Steps)

### 1. Setup VPS (One-time)
SSH into your VPS and run:
```bash
ssh root@109.199.106.28
curl -sSL https://raw.githubusercontent.com/tiyya-ai/zingalinga/main/vps-setup-complete.sh | bash
```

### 2. Setup GitHub Secrets (One-time)
Go to: https://github.com/tiyya-ai/zingalinga/settings/secrets/actions

Add these secrets:
- `VPS_HOST`: `109.199.106.28`
- `VPS_USER`: `root`
- `VPS_SSH_KEY`: [Your SSH private key]

### 3. Deploy
**Windows:**
```bash
deploy-github-to-vps.bat
```

**Linux/Mac:**
```bash
./deploy-github-to-vps.sh
```

**Or simply:**
```bash
npm run deploy-github
```

## 🌐 Your Website
- **Live URL**: http://zingalinga.io
- **Direct IP**: http://109.199.106.28:3000

## 📊 Monitor Deployment
- **GitHub Actions**: https://github.com/tiyya-ai/zingalinga/actions
- **VPS Logs**: `ssh root@109.199.106.28 "pm2 logs zinga-linga"`

## 🔧 VPS Management Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs zinga-linga

# Restart app
pm2 restart zinga-linga

# Manual deploy
/root/deploy-zinga-linga.sh

# System monitor
/root/monitor-zinga-linga.sh
```

## ✅ Features
- ✅ Automatic deployment on git push
- ✅ Zero-downtime deployment
- ✅ PM2 process management
- ✅ NGINX reverse proxy
- ✅ Static file optimization
- ✅ Error handling & rollback
- ✅ Monitoring & logging

## 🆘 Troubleshooting
1. **Deployment fails**: Check GitHub Actions logs
2. **Website not loading**: Run `pm2 restart zinga-linga`
3. **502 Error**: Check if app is running with `pm2 status`
4. **SSH issues**: Verify SSH key in GitHub secrets

## 📞 Support
- **Repository**: https://github.com/tiyya-ai/zingalinga
- **VPS IP**: 109.199.106.28
- **Domain**: zingalinga.io

---
**🎉 Happy Deploying!**