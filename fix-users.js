const fs = require('fs');
const path = require('path');

const dataFile = path.join(process.cwd(), 'data', 'global-app-data.json');

// Read current data
let data = {};
try {
  const content = fs.readFileSync(dataFile, 'utf-8');
  data = JSON.parse(content);
  console.log('Loaded existing data');
} catch (e) {
  console.log('No existing data file, creating new one');
  data = { users: [], modules: [], purchases: [], contentFiles: [] };
}

// Fix the test user password
if (data.users) {
  const testUser = data.users.find(u => u.email === 'test@example.com');
  if (testUser) {
    testUser.password = 'test123';
    console.log('Updated test user password');
  }
  
  const adminUser = data.users.find(u => u.email === 'admin@zingalinga.com');
  if (adminUser) {
    adminUser.password = 'admin123';
    console.log('Confirmed admin user password');
  }
}

// Save updated data
fs.mkdirSync(path.dirname(dataFile), { recursive: true });
fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
console.log('Data updated successfully');