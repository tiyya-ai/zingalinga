import express from 'express';
import next from 'next';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Express server
const server = express();

// Use a canonical DATA_DIR so both Next API routes and this server read/write the
// same data file. Allow override via env (useful in deployments).
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'global-app-data.json');
const PERM_BACKUP = path.join(DATA_DIR, 'backup-permanent.json');

// Middleware
server.use(cors());
server.use(express.json({ limit: '50mb' }));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data file if it doesn't exist.
if (!fs.existsSync(DATA_FILE)) {
  if (fs.existsSync(PERM_BACKUP)) {
    try {
      const perm = fs.readFileSync(PERM_BACKUP, 'utf8');
      fs.writeFileSync(DATA_FILE, perm);
      console.log('✅ Restored data from permanent backup:', PERM_BACKUP);
    } catch (restoreErr) {
      console.error('❌ Failed to restore permanent backup:', restoreErr);
    }
  } else {
    // Minimal default data
    const defaultData = {
      users: [
        {
          id: 'admin_001',
          email: 'admin@zingalinga.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'admin',
          purchasedModules: [],
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          loginAttempts: 0,
          lastLoginAttempt: null,
          accountLocked: false
        }
      ],
      modules: [],
      purchases: [],
      contentFiles: [],
      uploadQueue: [],
      settings: {
        siteName: 'Zinga Linga',
        defaultLanguage: 'en',
        timezone: 'UTC',
        features: {
          userRegistration: true,
          videoComments: true,
          videoDownloads: true,
          socialSharing: false
        },
        dataSource: 'real',
        apiEndpoint: '/api/data',
        enableRealTimeSync: true
      },
      lastUpdated: new Date().toISOString(),
      lastLoaded: new Date().toISOString()
    };
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
      console.log('⚠️ Created minimal data file at', DATA_FILE);
    } catch (err) {
      console.error('❌ Failed to create data file:', err);
    }
  }
}

// API Routes for data management
server.get('/api/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    data.lastLoaded = new Date().toISOString();
    res.json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

server.post('/api/data', (req, res) => {
  try {
    const incoming = req.body || {};

    // Read existing data (if any)
    let existing = null;
    try {
      if (fs.existsSync(DATA_FILE)) {
        existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      }
    } catch (readErr) {
      console.error('Error reading existing data during save:', readErr);
    }

    // Create a timestamped backup of existing data
    if (existing) {
      try {
        const backupFile = path.join(DATA_DIR, `backup-${Date.now()}.json`);
        fs.writeFileSync(backupFile, JSON.stringify(existing, null, 2));
        console.log('🔐 Created backup:', backupFile);
      } catch (bErr) {
        console.error('Failed to create backup before save:', bErr);
      }
    }

    // Protect against destructive saves
    if (existing?.modules?.length > 0 && (!incoming.modules || incoming.modules.length === 0)) {
      console.error('🚨 Refusing to save: incoming payload would delete', existing.modules.length, 'modules');
      return res.status(400).json({ success: false, error: 'Refusing to delete existing modules' });
    }

    // Merge/preserve data
    const preserved = {
      users: incoming.users && incoming.users.length > 0 ? incoming.users : (existing?.users || []),
      modules: incoming.modules && incoming.modules.length > 0 ? incoming.modules : (existing?.modules || []),
      purchases: incoming.purchases && incoming.purchases.length > 0 ? incoming.purchases : (existing?.purchases || []),
      packages: incoming.packages && incoming.packages.length > 0 ? incoming.packages : (existing?.packages || []),
      contentFiles: incoming.contentFiles || existing?.contentFiles || [],
      uploadQueue: incoming.uploadQueue || existing?.uploadQueue || [],
      savedVideos: incoming.savedVideos || existing?.savedVideos || [],
      categories: incoming.categories || existing?.categories || ['Audio Lessons', 'PP1 Program', 'PP2 Program'],
      comments: incoming.comments || existing?.comments || [],
      subscriptions: incoming.subscriptions || existing?.subscriptions || [],
      transactions: incoming.transactions || existing?.transactions || [],
      notifications: incoming.notifications || existing?.notifications || [],
      scheduledContent: incoming.scheduledContent || existing?.scheduledContent || [],
      flaggedContent: incoming.flaggedContent || existing?.flaggedContent || [],
      accessLogs: incoming.accessLogs || existing?.accessLogs || [],
      bundles: incoming.bundles || existing?.bundles || [],
      ageGroups: incoming.ageGroups || existing?.ageGroups || [],
      settings: { ...(existing?.settings || {}), ...(incoming.settings || {}) },
      lastSaved: new Date().toISOString(),
      lastUpdated: incoming.lastUpdated || new Date().toISOString(),
      deploymentProtection: true
    };

    // Update permanent backup when we have modules
    if (preserved.modules && preserved.modules.length > 0) {
      try {
        fs.writeFileSync(PERM_BACKUP, JSON.stringify(preserved, null, 2));
        console.log('🔒 Permanent backup updated with', preserved.modules.length, 'modules');
      } catch (permErr) {
        console.error('Failed to write permanent backup:', permErr);
      }
    }

    // Write final file
    fs.writeFileSync(DATA_FILE, JSON.stringify(preserved, null, 2));
    return res.json({ success: true, moduleCount: preserved.modules?.length || 0 });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Payment confirmation endpoint
server.post('/api/payments/confirm', (req, res) => {
  try {
    const { purchaseIds } = req.body || {};
    if (!Array.isArray(purchaseIds) || purchaseIds.length === 0) {
      return res.status(400).json({ success: false, error: 'purchaseIds required' });
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw || '{}');
    data.purchases = data.purchases || [];
    data.users = data.users || [];

    let changed = false;

    for (const pid of purchaseIds) {
      const pIndex = data.purchases.findIndex(p => p.id === pid);
      if (pIndex === -1) continue;

      const purchase = data.purchases[pIndex];
      if (purchase.status === 'completed') continue;

      purchase.status = 'completed';
      purchase.confirmedAt = new Date().toISOString();

      const user = data.users.find(u => u.id === purchase.userId);
      if (user) {
        user.purchasedModules = user.purchasedModules || [];
        if (purchase.moduleId && !user.purchasedModules.includes(purchase.moduleId)) {
          user.purchasedModules.push(purchase.moduleId);
        }
        user.totalSpent = (user.totalSpent || 0) + (purchase.amount || 0);
      }

      changed = true;
    }

    if (changed) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      return res.json({ success: true, processed: purchaseIds.length });
    }

    return res.json({ success: true, processed: 0 });
  } catch (err) {
    console.error('Error confirming payments:', err);
    return res.status(500).json({ success: false, error: 'internal error' });
  }
});

// Let Next.js handle all other requests
server.all('*', (req, res) => {
  return handle(req, res);
});

app.prepare().then(() => {
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Server ready on http://${hostname}:${port}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
    console.log(`📄 Data file: ${DATA_FILE}`);
  });
});