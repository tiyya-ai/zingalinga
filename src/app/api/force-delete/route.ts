import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ FORCE DELETE: Starting database wipe...');
    
    // Delete all data in order (respecting foreign key constraints)
    const deletedPurchases = await prisma.purchase.deleteMany({});
    const deletedModules = await prisma.module.deleteMany({});
    const deletedPackages = await prisma.package.deleteMany({});
    const deletedUsers = await prisma.user.deleteMany({});
    
    console.log('✅ FORCE DELETE: Database wiped successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Database wiped successfully',
      deleted: {
        users: deletedUsers.count,
        modules: deletedModules.count,
        packages: deletedPackages.count,
        purchases: deletedPurchases.count
      }
    });
    
  } catch (error) {
    console.error('❌ FORCE DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to wipe database' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}