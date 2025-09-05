import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../utils/database';

export async function POST(request: NextRequest) {
  try {
    const user = await request.json();
    
    await executeQuery(
      'INSERT INTO users (id, email, name, role, password, purchasedModules, totalSpent, status, createdAt, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        user.id,
        user.email,
        user.name,
        user.role || 'user',
        user.password,
        JSON.stringify(user.purchasedModules || []),
        user.totalSpent || 0,
        user.status || 'active',
        user.createdAt || new Date().toISOString(),
        user.lastLogin || new Date().toISOString()
      ]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}