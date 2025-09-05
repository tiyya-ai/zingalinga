import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../utils/database';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;
    const userData = await request.json();
    
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await executeQuery(
      'UPDATE users SET email = ?, name = ?, role = ?, purchasedModules = ?, totalSpent = ?, status = ? WHERE id = ?',
      [
        userData.email,
        userData.name,
        userData.role || 'user',
        JSON.stringify(userData.purchasedModules || []),
        userData.totalSpent || 0.00,
        userData.status || 'active',
        userId
      ]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update user', details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;
    
    // Delete user and related purchases
    await executeQuery('DELETE FROM purchases WHERE userId = ?', [userId]);
    await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete user', details: errorMessage }, { status: 500 });
  }
}