const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeDebugLogs() {
  console.log('🧹 Removing debug console.log statements...');
  // This would typically be done with a build tool or linter
  // For now, just log the action
  console.log('✅ Debug logs removed (simulated)');
}

async function wipeDatabase() {
  try {
    console.log('🗑️ Wiping database...');
    
    // Delete all data in order (respecting foreign key constraints)
    await prisma.purchase.deleteMany({});
    console.log('✅ Deleted all purchases');
    
    await prisma.module.deleteMany({});
    console.log('✅ Deleted all modules');
    
    await prisma.package.deleteMany({});
    console.log('✅ Deleted all packages');
    
    await prisma.user.deleteMany({});
    console.log('✅ Deleted all users');
    
    console.log('🎉 Database wiped successfully!');
    
  } catch (error) {
    console.error('❌ Error wiping database:', error);
  }
}

async function clearAuditLogs() {
  try {
    console.log('📋 Clearing audit logs...');
    
    await prisma.auditLog.deleteMany({});
    console.log('✅ All audit logs cleared');
    
  } catch (error) {
    console.error('❌ Error clearing audit logs:', error);
  }
}

async function runQuickActions() {
  const action = process.argv[2];
  
  switch (action) {
    case 'remove-debug':
      await removeDebugLogs();
      break;
    case 'wipe-db':
      await wipeDatabase();
      break;
    case 'clear-audit':
      await clearAuditLogs();
      break;
    case 'all':
      await removeDebugLogs();
      await wipeDatabase();
      await clearAuditLogs();
      break;
    default:
      console.log('Usage: node quick-actions.cjs [remove-debug|wipe-db|clear-audit|all]');
      break;
  }
  
  await prisma.$disconnect();
}

runQuickActions();