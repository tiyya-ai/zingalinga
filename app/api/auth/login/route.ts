import { NextRequest, NextResponse } from 'next/server';
import { db, isDbAvailable, users } from '../../../../lib/neon';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let userData = null;

    // Check if database is available
    if (isDbAvailable && db) {
      // Find user by email in database
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user.length > 0) {
        userData = user[0];
      }
    } else {
      // Fallback to demo users when database is not available
      const demoUsers = [
        {
          id: 'admin-001',
          email: 'admin@zingalinga.com',
          name: 'System Administrator',
          role: 'admin',
          purchasedModules: [],
          totalSpent: 0
        },
        {
          id: 'parent-001',
          email: 'parent@demo.com',
          name: 'Demo Parent',
          role: 'user',
          purchasedModules: [],
          totalSpent: 0
        }
      ];
      
      userData = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

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