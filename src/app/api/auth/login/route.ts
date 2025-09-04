import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../utils/database';
import { sanitizeInput, verifyPassword } from '../../../../utils/securityUtils';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Get user from database only
    const users = await executeQuery('SELECT * FROM users WHERE email = ?', [sanitizedEmail]);
    
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0] as any;

    // Verify password
    const passwordValid = user.password === password;

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await executeQuery('UPDATE users SET lastLogin = NOW() WHERE id = ?', [user.id]);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        lastLogin: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Database connection required' },
      { status: 500 }
    );
  }
}