import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email;
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check admin credentials
    if (email.toLowerCase() === 'admin@zingalinga.com' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin_001',
          email: 'admin@zingalinga.com',
          name: 'Admin User',
          role: 'admin',
          purchasedModules: [],
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        token: 'admin-token-' + Date.now(),
        expiresAt: Date.now() + (8 * 60 * 60 * 1000)
      });
    }

    // Check test user credentials
    if (email.toLowerCase() === 'test@example.com' && password === 'test123') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'user_001',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          purchasedModules: [],
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        token: 'user-token-' + Date.now(),
        expiresAt: Date.now() + (8 * 60 * 60 * 1000)
      });
    }

    // Invalid credentials
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 400 }
    );
  }
}