import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    console.log('🔍 DEBUG: Fetching all users from database...');
    
    const users = await prisma.user.findMany({
      include: {
        purchases: true
      }
    });
    
    console.log('🔍 DEBUG: Found users:', users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      purchaseCount: u.purchases.length
    })));
    
    return NextResponse.json({
      count: users.length,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        purchaseCount: u.purchases.length,
        purchases: u.purchases.map(p => ({ id: p.id, moduleId: p.moduleId, amount: p.amount }))
      }))
    });
  } catch (error) {
    console.error('🔍 DEBUG: Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users', details: error }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    console.log('🗑️ DEBUG: FORCE DELETE ALL TEST USERS...');
    
    // Get all users first
    const users = await prisma.user.findMany();
    console.log('🗑️ DEBUG: Found users to delete:', users.map(u => ({ id: u.id, name: u.name, email: u.email })));
    
    // Delete all purchases first
    const deletedPurchases = await prisma.purchase.deleteMany({});
    console.log('🗑️ DEBUG: Deleted purchases:', deletedPurchases.count);
    
    // Delete all users
    const deletedUsers = await prisma.user.deleteMany({});
    console.log('🗑️ DEBUG: Deleted users:', deletedUsers.count);
    
    // Verify deletion
    const remainingUsers = await prisma.user.findMany();
    console.log('🗑️ DEBUG: Remaining users after deletion:', remainingUsers.length);
    
    return NextResponse.json({
      success: true,
      deletedPurchases: deletedPurchases.count,
      deletedUsers: deletedUsers.count,
      remainingUsers: remainingUsers.length
    });
  } catch (error) {
    console.error('🗑️ DEBUG: Error in force delete:', error);
    return NextResponse.json({ error: 'Failed to delete', details: error }, { status: 500 });
  }
}