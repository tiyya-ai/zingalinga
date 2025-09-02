const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'global-app-data.json');

try {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  
  const admin = data.users?.find(u => u.email === 'admin@zingalinga.com');
  if (admin) {
    admin.accountLocked = false;
    admin.loginAttempts = 0;
    admin.lastLoginAttempt = null;
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Admin account unlocked');
  } else {
    console.log('❌ Admin not found');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}