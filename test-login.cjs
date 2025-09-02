const fs = require('fs');
const path = require('path');

// Replicate the sanitizeInput function from securityUtils.ts
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    input = String(input);
  }
  
  // Remove potential NoSQL injection characters
  return input
    .replace(/[\$\{\}]/g, '') // Remove MongoDB operators
    .replace(/[<>]/g, '') // Remove HTML/XML tags
    .replace(/[\r\n]/g, ' ') // Replace newlines for log safety
    .trim()
    .slice(0, 1000); // Limit length
};

// Test login functionality
const DATA_FILE = path.join(__dirname, 'data', 'global-app-data.json');

console.log('Testing login functionality...');
console.log('Data file path:', DATA_FILE);

try {
  const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(fileContent);
  
  console.log('\n📊 Available users:');
  data.users?.forEach(user => {
    console.log(`  - Email: ${user.email}, Role: ${user.role}, Password: ${user.password}`);
  });
  
  // Test admin login
  const testEmail = 'admin@zingalinga.com';
  const testPassword = 'admin123';
  
  console.log('\n🔍 Testing login for:', testEmail);
  
  // Apply the same sanitization as the login route
  const sanitizedEmail = sanitizeInput(testEmail).toLowerCase();
  console.log('🧹 Sanitized email:', sanitizedEmail);
  
  const user = data.users?.find(u => u.email === sanitizedEmail);
  console.log('🔍 Looking for user with email:', sanitizedEmail);
  console.log('📋 Available emails:', data.users?.map(u => u.email));
  if (user) {
    console.log('✅ User found:', { email: user.email, role: user.role });
    console.log('🔐 Password check:', user.password === testPassword ? '✅ Match' : '❌ No match');
    console.log('🔐 Stored password:', user.password);
    console.log('🔐 Test password:', testPassword);
  } else {
    console.log('❌ User not found');
  }
  
} catch (error) {
  console.error('Error:', error.message);
}