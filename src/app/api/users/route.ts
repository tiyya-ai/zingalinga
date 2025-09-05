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
    console.log('Creating user:', user);
    
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Ensure all required fields have values
    const email = user.email?.toString() || '';
    const name = user.name?.toString() || '';
    const role = user.role?.toString() || 'user';
    const password = user.password?.toString() || '';
    const purchasedModules = JSON.stringify(user.purchasedModules || []);
    const totalSpent = parseFloat(user.totalSpent?.toString() || '0') || 0.00;
    const status = user.status?.toString() || 'active';
    
    // Generate a unique string ID like existing users
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Prepared values:', { userId, email, name, role, password, purchasedModules, totalSpent, status, now });

    // Insert with generated string ID
    const result = await executeQuery(
      'INSERT INTO users (id, email, name, role, password, purchasedModules, totalSpent, status, createdAt, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, email, name, role, password, purchasedModules, totalSpent, status, now, now]
    );
    
    console.log('Insert result:', result);

    // Return the new user object with generated id
    return NextResponse.json({
      id: userId,
      email,
      name,
      role,
      purchasedModules: user.purchasedModules || [],
      totalSpent,
      status,
      createdAt: now,
      lastLogin: now
    });
  } catch (error) {
    console.error('Error creating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create user', details: errorMessage }, { status: 500 });
  }
}