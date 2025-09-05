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

    // Insert without manual id if AUTO_INCREMENT
    const result = await executeQuery(
      'INSERT INTO users (email, name, role, password, purchasedModules, totalSpent, status, createdAt, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
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

    // Return the new user object with inserted id
    return NextResponse.json({
      id: (result as any).insertId,
      ...user,
      purchasedModules: user.purchasedModules || [],
      createdAt: now,
      lastLogin: now
    });
  } catch (error) {
    console.error('Error creating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create user', details: errorMessage }, { status: 500 });
  }
}