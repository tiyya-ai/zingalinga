import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'global-app-data.json');

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    if (!existsSync(DATA_FILE)) {
      return NextResponse.json(
        { success: false, error: 'No users found' },
        { status: 404 }
      );
    }

    const data = JSON.parse(await readFile(DATA_FILE, 'utf-8'));
    const user = data.users?.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check user status
    if (user.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended. Please contact support for assistance.' },
        { status: 403 }
      );
    }
    
    if (user.status === 'inactive') {
      return NextResponse.json(
        { success: false, error: 'Your account is inactive. Please contact support to reactivate your account.' },
        { status: 403 }
      );
    }

    user.lastLogin = new Date().toISOString();
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}