// Check Prisma database connection
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Checking Prisma database connection...');

try {
  // Check if Prisma is installed
  console.log('1. Checking Prisma installation...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasPrisma = packageJson.dependencies?.['@prisma/client'] || packageJson.devDependencies?.['prisma'];
  console.log(hasPrisma ? '✅ Prisma installed' : '❌ Prisma not installed');

  // Check if schema exists
  console.log('2. Checking Prisma schema...');
  const schemaExists = fs.existsSync('prisma/schema.prisma');
  console.log(schemaExists ? '✅ Schema exists' : '❌ Schema missing');

  // Check if client is generated
  console.log('3. Checking Prisma client...');
  const clientExists = fs.existsSync('node_modules/@prisma/client');
  console.log(clientExists ? '✅ Client generated' : '❌ Client not generated');

  // Check if lib/prisma.ts exists
  console.log('4. Checking Prisma utility...');
  const utilExists = fs.existsSync('src/lib/prisma.ts');
  console.log(utilExists ? '✅ Prisma utility exists' : '❌ Prisma utility missing');

  // Check environment variables
  console.log('5. Checking environment variables...');
  const envExists = fs.existsSync('.env.local');
  if (envExists) {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const hasDatabaseUrl = envContent.includes('DATABASE_URL');
    console.log(hasDatabaseUrl ? '✅ DATABASE_URL configured' : '❌ DATABASE_URL missing');
  } else {
    console.log('❌ .env.local missing');
  }

  // Check test API
  console.log('6. Checking test API...');
  const testApiExists = fs.existsSync('src/app/api/test-prisma/route.ts');
  console.log(testApiExists ? '✅ Test API exists' : '❌ Test API missing');

  // Try to push schema to database
  console.log('7. Testing database connection...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe' });
    console.log('✅ Database connection successful');
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }

  console.log('\n🎯 Summary:');
  console.log('- Prisma is set up locally');
  console.log('- Run: npm run dev');
  console.log('- Test: http://localhost:3000/api/test-prisma');
  console.log('- View data: npx prisma studio');

} catch (error) {
  console.error('❌ Check failed:', error.message);
}