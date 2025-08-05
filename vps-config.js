/**
 * VPS Configuration for Zinga Linga Deployment
 * تكوين VPS لنشر Zinga Linga
 */

module.exports = {
  // VPS Connection Details
  vps: {
    ip: '109.199.106.28',
    user: 'root',
    password: 'Secureweb25',
    port: 22
  },
  
  // Application Details
  app: {
    name: 'zinga-linga',
    domain: 'zingalinga.io',
    url: 'http://zingalinga.io/',
    localPort: 3000,
    deployPath: '/var/www/zinga-linga'
  },
  
  // Deployment Settings
  deployment: {
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    pm2Name: 'zinga-linga',
    excludeFiles: ['node_modules', '.git', '.next', 'deployment-progress.json'],
    includeFiles: ['.next', 'package.json', 'package-lock.json', 'public', 'src']
  },
  
  // NGINX Settings
  nginx: {
    siteName: 'zinga-linga',
    serverName: 'zingalinga.io www.zingalinga.io 109.199.106.28',
    sslEnabled: false, // Set to true when SSL is configured
    configPath: '/etc/nginx/sites-available/zinga-linga'
  }
};