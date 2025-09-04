# 🚀 GitHub Actions VPS Deployment

## Setup Instructions

### 1. Repository Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

```
VPS_HOST=your-vps-ip-address
VPS_USER=root
VPS_SSH_KEY=your-private-ssh-key
DB_ROOT_PASSWORD=your-mysql-root-password
DB_PASSWORD=secure-database-password
DOMAIN=yourdomain.com
NEXTAUTH_SECRET=your-super-secret-key-here
```

### 2. SSH Key Setup
Generate SSH key pair:
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions"
```

Copy public key to VPS:
```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub user@your-vps-ip
```

Copy private key content to `VPS_SSH_KEY` secret.

### 3. Initial VPS Setup
Run the "Setup VPS" workflow manually:
- Go to Actions tab
- Select "Setup VPS" workflow  
- Click "Run workflow"

### 4. Automatic Deployment
Every push to `main` branch will automatically deploy to VPS.

## Workflows

### `setup-vps.yml`
- Installs Node.js, PM2, MySQL, Nginx
- Creates database and tables
- Sets up SSL certificate
- **Run once manually**

### `deploy.yml` 
- Builds and deploys on every push
- Restarts PM2 and Nginx
- **Runs automatically**

## After Deployment

Your website will be live at:
- **Website:** `https://yourdomain.com`
- **Admin:** `https://yourdomain.com/admin`
- **Login:** `admin@zingalinga.com` / `admin123`

## Monitoring

Check deployment status in GitHub Actions tab.

SSH to VPS to monitor:
```bash
pm2 status
pm2 logs zingalinga
sudo systemctl status nginx
```