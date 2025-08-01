import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'global-app-data.json');

// Default data structure
const getDefaultData = () => ({
  users: [
    {
      id: 'admin_001',
      email: 'admin@zingalinga.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      purchasedModules: [],
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      id: 'user_001',
      email: 'test@example.com',
      password: 'test123',
      name: 'Test User',
      role: 'user',
      purchasedModules: [],
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  ],
  modules: [],
  purchases: [],
  contentFiles: []
});

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'user' } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    let data = getDefaultData();

    // Try to load existing data
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      data = JSON.parse(fileContent);
    } catch (fileError) {
      console.log('Creating new data file');
      // Ensure directory exists
      await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    }

    // Check if user already exists
    const existingUser = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      password, // In production, hash this password
      name,
      role,
      purchasedModules: [],
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Add user to data
    data.users.push(newUser);
    
    // Save data
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));

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