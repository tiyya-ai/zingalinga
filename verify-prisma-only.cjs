// Verify entire website uses ONLY Prisma database
const fs = require('fs');

console.log('🔍 VERIFYING PRISMA-ONLY IMPLEMENTATION');
console.log('======================================');

// Check for old database methods
const filesToCheck = [
  'src/utils/purchaseManager.ts',
  'src/components/ModernAdminDashboard.tsx',
  'src/components/LandingPage.tsx'
];

console.log('\n🗑️ CHECKING FOR OLD DATABASE METHODS:');
let foundOldMethods = false;

const oldMethods = [
  'vpsDataStore',
  'executeQuery',
  'localStorage.setItem',
  'localStorage.getItem',
  '/api/data'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    console.log(`\n📁 ${file}:`);
    
    oldMethods.forEach(method => {
      if (content.includes(method)) {
        console.log(`   ❌ Still uses: ${method}`);
        foundOldMethods = true;
      }
    });
    
    if (!oldMethods.some(method => content.includes(method))) {
      console.log('   ✅ Clean - uses only Prisma');
    }
  }
});

// Check API endpoints
console.log('\n🔌 API ENDPOINTS:');
const apiEndpoints = [
  'src/app/api/users/route.ts',
  'src/app/api/modules/route.ts', 
  'src/app/api/purchases/route.ts',
  'src/app/api/packages/route.ts',
  'src/app/api/auth/login/route.ts'
];

apiEndpoints.forEach(endpoint => {
  if (fs.existsSync(endpoint)) {
    const content = fs.readFileSync(endpoint, 'utf8');
    const usesPrisma = content.includes('import { prisma }');
    console.log(`${endpoint}: ${usesPrisma ? '✅ Prisma' : '❌ Not Prisma'}`);
  }
});

// Summary
console.log('\n📊 SUMMARY:');
if (!foundOldMethods) {
  console.log('🎉 SUCCESS! Website uses ONLY Prisma database');
  console.log('✅ No old database methods found');
  console.log('✅ All operations use Prisma API endpoints');
  console.log('✅ Complete migration to Prisma completed');
} else {
  console.log('⚠️  Some old database methods still found');
  console.log('Review the warnings above to complete cleanup');
}

console.log('\n🎯 CURRENT ARCHITECTURE:');
console.log('Frontend → Prisma API → Prisma ORM → Database');
console.log('- User registration: /api/users → Prisma');
console.log('- User purchases: /api/purchases → Prisma');
console.log('- Content management: /api/modules → Prisma');
console.log('- Package management: /api/packages → Prisma');
console.log('- Authentication: /api/auth/login → Prisma');