# VPS Deployment Instructions

## 1. Install Dependencies
```bash
npm install
```

## 2. Build the Application
```bash
npm run build
```

## 3. Start the Server
```bash
npm start
```

## 4. For Production with PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 5. Nginx Configuration (Optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Files Structure
- `server.js` - Express server
- `data/global-app-data.json` - Persistent data storage
- `dist/` - Built React application
- `ecosystem.config.js` - PM2 configuration

## API Endpoints
- `GET /api/data` - Load application data
- `POST /api/data` - Save application data