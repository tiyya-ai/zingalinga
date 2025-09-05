import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../utils/database';

export async function POST(request: NextRequest) {
  try {
    const purchase = await request.json();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await executeQuery(
      'INSERT INTO purchases (id, userId, moduleId, amount, status, paymentMethod, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        purchase.id,
        purchase.userId,
        purchase.moduleId,
        purchase.amount,
        purchase.status || 'completed',
        purchase.paymentMethod || 'card',
        now
      ]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
  }
}