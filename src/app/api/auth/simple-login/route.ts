import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const { email, password } = JSON.parse(body);

    // Simple hardcoded authentication
    const validUsers = {
      'admin@zingalinga.com': {
        password: 'admin123',
        user: {
          id: 'admin_001',
          email: 'admin@zingalinga.com',
          name: 'Admin User',
          role: 'admin'
        }
      },
      'test@example.com': {
        password: 'test123',
        user: {
          id: 'user_001',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        }
      }
    };

    const userRecord = validUsers[email?.toLowerCase()];
    
    if (!userRecord || userRecord.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userRecord.user,
      token: 'demo-token-' + Date.now(),
      expiresAt: Date.now() + (8 * 60 * 60 * 1000)
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 400 }
    );
  }
}