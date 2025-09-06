const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('⚠️ Admin seeding DISABLED to prevent user recreation');
  console.log('ℹ️ Users will only exist if manually created via admin dashboard');
  
  // SEEDING DISABLED - No automatic user creation
  // This prevents users from being recreated after deletion
  
  console.log('✅ Seeding skipped - database will only contain manually created users');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });