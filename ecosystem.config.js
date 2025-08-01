module.exports = {
  apps: [{
    name: 'zinga-linga',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/zinga-linga-nextjs',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://zinga_user:Secureweb25@109.199.106.28:5432/zinga_linga',
      NEXT_PUBLIC_APP_NAME: 'Zinga Linga',
      NEXT_PUBLIC_APP_VERSION: '1.0.0'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};