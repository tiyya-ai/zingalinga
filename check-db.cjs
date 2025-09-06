const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database directly...');
    
    const users = await prisma.user.findMany();
    console.log('👥 Users in database:', users.length);
    
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user.id} - Created: ${user.createdAt}`);
    });
    
    // Now delete one user directly
    if (users.length > 0) {
      const userToDelete = users[0];
      console.log(`\n🗑️ Deleting user: ${userToDelete.name} (${userToDelete.email})`);
      
      await prisma.user.delete({
        where: { id: userToDelete.id }
      });
      
      console.log('✅ User deleted successfully');
      
      // Check again
      const remainingUsers = await prisma.user.findMany();
      console.log(`\n👥 Remaining users: ${remainingUsers.length}`);
      remainingUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();