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
    
    // Delete user (Prisma will handle cascade delete of purchases)
    await prisma.user.delete({
      where: { id: userId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete user', details: errorMessage }, { status: 500 });
  }
}