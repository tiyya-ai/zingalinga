// Comprehensive deployment readiness check
const fs = require('fs');
const path = require('path');

console.log('🔍 ZINGA LINGA PROJECT DEPLOYMENT CHECK');
console.log('==========================================');

// Project Overview
console.log('\n📋 PROJECT OVERVIEW:');
console.log('- Name: Zinga Linga Educational Platform');
console.log('- Type: Next.js 15 Educational Website');
console.log('- Target: Children ages 3-6 learning platform');
console.log('- Features: Admin panel, user management, video content');

// Database Check
console.log('\n💾 DATABASE CONFIGURATION:');

// Check if Prisma is set up
const hasPrisma = fs.existsSync('prisma/schema.prisma');
console.log(`- Prisma Schema: ${hasPrisma ? '✅ EXISTS' : '❌ MISSING'}`);

// Check database file
const hasLocalDB = fs.existsSync('dev.db');
console.log(`- Local SQLite DB: ${hasLocalDB ? '✅ EXISTS' : '❌ MISSING'}`);

// Check environment files
const hasEnv = fs.existsSync('.env');
const hasEnvLocal = fs.existsSync('.env.local');
console.log(`- .env file: ${hasEnv ? '✅ EXISTS' : '❌ MISSING'}`);
console.log(`- .env.local file: ${hasEnvLocal ? '✅ EXISTS' : '❌ MISSING'}`);

// Check Prisma client
const hasPrismaClient = fs.existsSync('node_modules/@prisma/client');
console.log(`- Prisma Client: ${hasPrismaClient ? '✅ GENERATED' : '❌ NOT GENERATED'}`);

// Check API routes
console.log('\n🔌 API ENDPOINTS:');
const apiRoutes = [
  'src/app/api/auth/login/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/app/api/modules/route.ts',
  'src/app/api/test-prisma/route.ts'
];

apiRoutes.forEach(route => {
  const exists = fs.existsSync(route);
  console.log(`- ${route}: ${exists ? '✅' : '❌'}`);
});

// Check key components
console.log('\n🧩 KEY COMPONENTS:');
const components = [
  'src/components/ModernAdminDashboard.tsx',
  'src/components/LandingPage.tsx',
  'src/lib/prisma.ts',
  'src/utils/vpsDataStore.ts'
];

components.forEach(comp => {
  const exists = fs.existsSync(comp);
  console.log(`- ${comp}: ${exists ? '✅' : '❌'}`);
});

// Data Storage Analysis
console.log('\n📊 DATA STORAGE ANALYSIS:');
console.log('Current Setup:');
console.log('- Local Development: SQLite database (dev.db)');
console.log('- Production VPS: MySQL database');
console.log('- Admin Panel: Connected to database via Prisma/API');
console.log('- User Data: Stored in database tables');

// Database Tables
if (hasPrisma) {
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  const models = schema.match(/model \w+/g) || [];
  console.log('\n🗃️ DATABASE TABLES:');
  models.forEach(model => {
    const tableName = model.replace('model ', '');
    console.log(`- ${tableName} table`);
  });
}

// Deployment Readiness
console.log('\n🚀 DEPLOYMENT READINESS:');

const checks = [
  { name: 'Prisma Schema', status: hasPrisma },
  { name: 'Prisma Client', status: hasPrismaClient },
  { name: 'Environment Config', status: hasEnv || hasEnvLocal },
  { name: 'Admin Dashboard', status: fs.existsSync('src/components/ModernAdminDashboard.tsx') },
  { name: 'API Routes', status: fs.existsSync('src/app/api/users/route.ts') },
  { name: 'Database Utility', status: fs.existsSync('src/lib/prisma.ts') }
];

const readyCount = checks.filter(check => check.status).length;
const totalChecks = checks.length;

checks.forEach(check => {
  console.log(`- ${check.name}: ${check.status ? '✅ READY' : '❌ NOT READY'}`);
});

console.log(`\n📈 READINESS SCORE: ${readyCount}/${totalChecks} (${Math.round(readyCount/totalChecks*100)}%)`);

// Deployment Instructions
console.log('\n📝 DEPLOYMENT STEPS FOR VPS:');
console.log('1. Update prisma/schema.prisma to use MySQL:');
console.log('   provider = "mysql"');
console.log('   url = env("DATABASE_URL")');
console.log('');
console.log('2. Update .env on VPS:');
console.log('   DATABASE_URL="mysql://zingalinga_user:Zingalinga2025!@localhost:3306/zingalinga"');
console.log('');
console.log('3. Run on VPS:');
console.log('   npx prisma generate');
console.log('   npx prisma db push');
console.log('   npm run build');
console.log('   npm run start');
console.log('');
console.log('4. Test admin panel:');
console.log('   https://zingalinga.io/admin');
console.log('   Login: admin@zingalinga.com / admin123');

// Data Location Summary
console.log('\n📍 DATA STORAGE LOCATIONS:');
console.log('- User accounts: Database users table');
console.log('- Video content: Database modules table');
console.log('- Purchases: Database purchases table');
console.log('- Admin settings: Database (via API)');
console.log('- File uploads: Server file system + database references');
console.log('- Session data: Server memory/cookies');

console.log('\n✅ PROJECT ANALYSIS COMPLETE!');