import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../utils/database';

export async function GET() {
  try {
    const users = await executeQuery('SELECT * FROM users');
    return NextResponse.json((users as any[]).map(user => ({
      ...user,
      purchasedModules: JSON.parse(user.purchasedModules || '[]')
    })));
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await request.json();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
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
        now,
        now
      ]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}