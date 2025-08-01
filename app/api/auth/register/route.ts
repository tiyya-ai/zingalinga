import { NextRequest, NextResponse } from 'next/server';
import { vpsDataStore } from '../../../../src/utils/vpsDataStore';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'user' } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Load existing users
    const data = await vpsDataStore.loadData();
    const users = data.users || [];

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password, // In production, hash this password
      name,
      role,
      createdAt: new Date().toISOString(),
      purchases: [],
      progress: {}
    };

    // Add user to data
    users.push(newUser);
    data.users = users;
    
    // Save data
    await vpsDataStore.saveData(data);

    // Generate session token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = Date.now() + (8 * 60 * 60 * 1000); // 8 hours

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      expiresAt,
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}