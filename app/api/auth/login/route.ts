import { NextRequest, NextResponse } from 'next/server';
import { neonDataStore } from '../../../../src/utils/neonDataStore';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Load data from VPS database using neonDataStore
    const data = await neonDataStore.loadData();
    const users = data.users || [];
    
    // Find user by email
    const userData = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!userData) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Simple password validation for demo
    const validPasswords: { [key: string]: string } = {
      'admin@zingalinga.com': 'Admin123!',
      'parent@demo.com': 'Parent123!'
    };

    if (password !== validPasswords[email.toLowerCase()]) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login (only if database is available)
    if (isDbAvailable && db) {
      try {
        await db
          .update(users)
          .set({ lastLogin: new Date().toISOString() })
          .where(eq(users.id, userData.id));
      } catch (error) {
        console.warn('Failed to update last login:', error);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        purchasedModules: userData.purchasedModules || [],
        totalSpent: userData.totalSpent || 0
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}