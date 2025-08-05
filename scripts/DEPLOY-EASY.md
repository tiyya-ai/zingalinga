# 🚀 SUPER EASY DEPLOYMENT

## One Command Deployment

Just run ONE command and your website will be live!

### Option 1: Simple Command
```bash
npm run deploy
```

### Option 2: Windows Users
```bash
deploy-simple.bat
```

### Option 3: Linux/Mac Users
```bash
chmod +x deploy-simple.sh
./deploy-simple.sh
```

## That's It! 🎉

Your website will be automatically:
- ✅ Built
- ✅ Packaged
- ✅ Uploaded to server
- ✅ Deployed and running

## Your Website URLs

After deployment, visit:
- 🌐 **http://zingalinga.io/**
- 🌐 **http://109.199.106.28:3000**

## VPS Information

- **IP**: 109.199.106.28
- **User**: root
- **Password**: Secureweb25
- **Domain**: zingalinga.io

## If Something Goes Wrong

1. **Check your internet connection**
2. **Make sure you can access the VPS**:
   ```bash
   ssh root@109.199.106.28
   ```
3. **Run the deployment again**:
   ```bash
   npm run deploy
   ```

## Check if Website is Running

```bash
ssh root@109.199.106.28 "pm2 status"
```

---

**That's it! No complex scripts, no complicated setup. Just one command and you're live! 🚀**