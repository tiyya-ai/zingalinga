const fs = require('fs');
const path = require('path');

// Create admin user script
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'global-app-data.json');

async function createAdmin() {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let data = {};
    
    // Load existing data or create new
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
      data = JSON.parse(fileContent);
    }

    // Initialize data structure
    data.users = data.users || [];
    data.modules = data.modules || [];
    data.purchases = data.purchases || [];
    data.packages = data.packages || [];
    data.settings = data.settings || {
      siteName: 'Zinga Linga',
      defaultLanguage: 'en',
      timezone: 'UTC',
      features: {
        userRegistration: true,
        videoComments: true,
        videoDownloads: true,
        socialSharing: false
      },
      dataSource: 'vps',
      enableRealTimeSync: true
    };

    // Check if admin already exists
    const existingAdmin = data.users.find(u => u.email === 'admin@zingalinga.com');
    
    if (!existingAdmin) {
      // Add admin user
      const adminUser = {
        id: 'admin_001',
        email: 'admin@zingalinga.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        status: 'active',
        purchasedModules: [],
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginAttempts: 0,
        accountLocked: false
      };
      
      data.users.push(adminUser);
      console.log('✅ Admin user created');
    } else {
      // Update existing admin password
      existingAdmin.password = 'admin123';
      existingAdmin.accountLocked = false;
      existingAdmin.loginAttempts = 0;
      console.log('✅ Admin user updated');
    }

    // Save data
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Data saved to:', DATA_FILE);
    console.log('🔑 Admin credentials: admin@zingalinga.com / admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

createAdmin();