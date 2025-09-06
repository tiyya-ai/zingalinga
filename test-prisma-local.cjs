// Test Prisma setup locally
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Testing Prisma setup locally...');

try {
  // Install Prisma
  console.log('📦 Installing Prisma...');
  execSync('npm install prisma @prisma/client', { stdio: 'inherit' });
  
  // Generate Prisma client
  console.log('⚙️ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Create test API directory
  const testApiDir = 'src/app/api/test-prisma';
  if (!fs.existsSync(testApiDir)) {
    fs.mkdirSync(testApiDir, { recursive: true });
  }
  
  // Create a simple test API with Prisma
  const testApiContent = `import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ 
      success: true, 
      message: 'Prisma working!',
      userCount 
    });
  } catch (error) {
    console.error('Prisma error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Prisma connection failed' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password,
        role: 'USER'
      }
    });
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create user' 
    }, { status: 500 });
  }
}`;

  fs.writeFileSync(path.join(testApiDir, 'route.ts'), testApiContent);
  
  console.log('✅ Prisma setup complete!');
  console.log('📝 Created test API at /api/test-prisma');
  console.log('🚀 Next steps:');
  console.log('1. Add DATABASE_URL to .env.local');
  console.log('2. Run: npm run dev');
  console.log('3. Test: http://localhost:3000/api/test-prisma');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
}