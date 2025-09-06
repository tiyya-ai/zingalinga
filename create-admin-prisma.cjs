const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔄 Creating admin user in Prisma database...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@zingalinga.com' }
    });
    
    if (existingAdmin) {
      // Update existing admin
      const updatedAdmin = await prisma.user.update({
        where: { email: 'admin@zingalinga.com' },
        data: {
          password: 'admin123',
          role: 'ADMIN',
          status: 'ACTIVE',
          name: 'Admin User'
        }
      });
      console.log('✅ Admin user updated:', updatedAdmin.email);
    } else {
      // Create new admin
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@zingalinga.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'ADMIN',
          status: 'ACTIVE',
          subscription: 'PREMIUM',
          totalSpent: 0
        }
      });
      console.log('✅ Admin user created:', newAdmin.email);
    }
    
    console.log('🔑 Admin credentials:');
    console.log('   Email: admin@zingalinga.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();