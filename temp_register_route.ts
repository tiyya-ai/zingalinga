import { NextRequest, NextResponse } from 'next/server';
import { vpsDataStore } from '../../../../src/utils/vpsDataStore';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = vpsDataStore.users.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser = {
      id: userId,
      email,
      password, // In production, this should be hashed
      name,
      role: 'user' as const,
      purchasedModules: [],
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    vpsDataStore.users.push(newUser);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        purchasedModules: newUser.purchasedModules,
        totalSpent: newUser.totalSpent
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}