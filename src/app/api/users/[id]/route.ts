import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../utils/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}