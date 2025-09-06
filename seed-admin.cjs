const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin user...');
  
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zingalinga.com' },
    update: {
      password: 'admin123',
      role: 'ADMIN',
      status: 'ACTIVE'
    },
    create: {
      email: 'admin@zingalinga.com',
      name: 'Admin User',
      password: 'admin123',
      role: 'ADMIN',
      status: 'ACTIVE',
      totalSpent: 0.00,
      subscription: 'FREE'
    }
  });
  
  console.log('✅ Admin user created/updated:', admin);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });