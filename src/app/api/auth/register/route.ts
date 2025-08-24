import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'global-app-data.json');

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name required' },
        { status: 400 }
      );
    }

    let data;
    if (existsSync(DATA_FILE)) {
      data = JSON.parse(await readFile(DATA_FILE, 'utf-8'));
    } else {
      data = { users: [] };
    }

    const existingUser = data.users?.find((u: any) => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password,
      name,
      role: 'user',
      status: 'active',
      purchasedModules: [],
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    data.users = data.users || [];
    data.users.push(newUser);

    await writeFile(DATA_FILE, JSON.stringify(data, null, 2));

    // Also save to VPS data endpoint
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to sync to VPS:', error);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}