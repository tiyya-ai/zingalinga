import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'global-app-data.json');

export async function GET() {
  try {
    if (!existsSync(DATA_FILE)) {
      return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
    }

    const fileContent = await readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    
    const users = data.users?.map((u: any) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      passwordLength: u.password?.length || 0,
      accountLocked: u.accountLocked,
      loginAttempts: u.loginAttempts
    })) || [];

    return NextResponse.json({
      totalUsers: users.length,
      users,
      adminUsers: users.filter((u: any) => u.role === 'admin')
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read users' }, { status: 500 });
  }
}