import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;
    const userData = await request.json();
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        email: userData.email,
        name: userData.name,
        role: userData.role?.toUpperCase() || 'USER',
        totalSpent: parseFloat(userData.totalSpent) || 0.00,
        status: userData.status?.toUpperCase() || 'ACTIVE',
        purchasedModules: userData.purchasedModules || [],
        avatar: userData.avatar || null,
        phone: userData.phone || null,
        dateOfBirth: userData.dateOfBirth || null,
        subscription: userData.subscription?.toUpperCase() || 'FREE'
      }
    });
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update user', details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;
    console.log('🗑️ DELETE API: Attempting to delete user with ID:', userId);
    
    // Check if user exists first
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { purchases: true }
    });
    
    if (!existingUser) {
      console.log('❌ DELETE API: User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('✅ DELETE API: User found:', {
      name: existingUser.name,
      email: existingUser.email,
      purchaseCount: existingUser.purchases.length
    });
    
    // Use transaction to ensure complete deletion AND audit logging
    await prisma.$transaction(async (tx) => {
      // Create audit log BEFORE deletion
      await tx.auditLog.create({
        data: {
          action: 'DELETE_USER',
          entityId: userId,
          entityType: 'USER',
          details: {
            deletedUser: {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              role: existingUser.role,
              createdAt: existingUser.createdAt,
              purchaseCount: existingUser.purchases.length
            },
            deletedPurchases: existingUser.purchases.map(p => ({
              id: p.id,
              moduleId: p.moduleId,
              amount: p.amount,
              createdAt: p.createdAt
            }))
          },
          adminId: 'admin-system' // Could be passed from request
        }
      });
      console.log('✅ DELETE API: Audit log created');
      
      // First delete all purchases manually (even though cascade should handle this)
      if (existingUser.purchases.length > 0) {
        console.log(`🗑️ DELETE API: Deleting ${existingUser.purchases.length} purchases first`);
        await tx.purchase.deleteMany({
          where: { userId: userId }
        });
        console.log('✅ DELETE API: Purchases deleted');
      }
      
      // Then delete the user
      await tx.user.delete({
        where: { id: userId }
      });
      console.log('✅ DELETE API: User deleted');
    });
    
    console.log('✅ DELETE API: Transaction completed successfully');
    
    // Verify deletion
    const verifyDeleted = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (verifyDeleted) {
      console.log('❌ DELETE API: User still exists after deletion attempt!');
      return NextResponse.json({ error: 'User deletion failed - still exists' }, { status: 500 });
    }
    
    console.log('✅ DELETE API: Deletion verified - user no longer exists');
    return NextResponse.json({ success: true, message: 'User and related data deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete user', details: errorMessage }, { status: 500 });
  }
}