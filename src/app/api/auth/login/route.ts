import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { sanitizeInput, validateEmail, verifyPassword } from '../../../../utils/securityUtils';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'global-app-data.json');

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; resetTime: number; lockUntil?: number }>();

function checkLoginRateLimit(ip: string): { allowed: boolean; lockUntil?: number } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  const lockDuration = 30 * 60 * 1000; // 30 minutes lockout
  
  const record = loginAttempts.get(ip);
  
  if (!record || now > record.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (record.lockUntil && now < record.lockUntil) {
    return { allowed: false, lockUntil: record.lockUntil };
  }
  
  if (record.count >= maxAttempts) {
    record.lockUntil = now + lockDuration;
    return { allowed: false, lockUntil: record.lockUntil };
  }
  
  record.count++;
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitCheck = checkLoginRateLimit(ip);
    
    if (!rateLimitCheck.allowed) {
      const lockUntil = rateLimitCheck.lockUntil;
      const remainingTime = lockUntil ? Math.ceil((lockUntil - Date.now()) / 60000) : 0;
      return NextResponse.json(
        { 
          success: false, 
          error: `Too many login attempts. Account locked for ${remainingTime} minutes.` 
        },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sanitize and validate input
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!existsSync(DATA_FILE)) {
      return NextResponse.json(
        { success: false, error: 'Authentication service unavailable' },
        { status: 503 }
      );
    }

    let data;
    try {
      const fileContent = await readFile(DATA_FILE, 'utf-8');
      data = JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading user data:', error);
      return NextResponse.json(
        { success: false, error: 'Authentication service error' },
        { status: 500 }
      );
    }

    const user = data.users?.find((u: any) => u.email === sanitizedEmail);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.accountLocked) {
      return NextResponse.json(
        { success: false, error: 'Account is locked. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password (handle both hashed and legacy plain text)
    let passwordValid = false;
    if (user.password.length === 64) { // Hashed password (SHA-256 produces 64 char hex)
      passwordValid = await verifyPassword(password, user.password);
    } else {
      // Legacy plain text password (for backward compatibility)
      passwordValid = user.password === password;
    }

    if (!passwordValid) {
      // Track failed login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      user.lastLoginAttempt = new Date().toISOString();
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.accountLocked = true;
      }
      
      // Save updated user data
      try {
        await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error('Error updating user login attempts:', error);
      }
      
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
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

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lastLoginAttempt = null;
    user.accountLocked = false;
    user.lastLogin = new Date().toISOString();
    
    // Save updated user data
    try {
      await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error updating user login data:', error);
      return NextResponse.json(
        { success: false, error: 'Login processing error' },
        { status: 500 }
      );
    }

    // Log successful login (without sensitive data)
    console.log(`User logged in successfully: ${user.email} (ID: ${user.id})`);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication service error' },
      { status: 500 }
    );
  }
}