import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { sanitizeInput, sanitizeForLog, validateEmail, verifyPassword } from '../../../../utils/securityUtils';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'global-app-data.json');

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; resetTime: number; lockUntil?: number }>();

function checkLoginRateLimit(ip: string): { allowed: boolean; lockUntil?: number } {
  // Skip rate limiting for admin access during development
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true };
  }
  
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10; // Increased from 5 to 10
  const lockDuration = 5 * 60 * 1000; // Reduced from 30 to 5 minutes
  
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
  console.log('🚀 Login API endpoint called');
  console.log('🌍 Environment:', process.env.NODE_ENV);
  console.log('📁 Data file path:', DATA_FILE);
  console.log('📂 Data file exists:', existsSync(DATA_FILE));
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
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

    let email, password;
    try {
      const requestData = await request.json();
      email = requestData.email;
      password = requestData.password;
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError instanceof Error ? parseError.message : 'Unknown error');
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

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

    console.log('🔍 Login attempt for:', sanitizeInput(sanitizedEmail));
    console.log('📊 Total users in database:', data.users?.length || 0);
    console.log('📊 Available users:', data.users?.map((u: any) => ({ email: u.email, role: u.role, locked: u.accountLocked, attempts: u.loginAttempts })) || []);
    
    let user = data.users?.find((u: any) => u.email === sanitizedEmail);
    
    // Auto-create admin if missing and trying to login as admin
    if (!user && sanitizedEmail === 'admin@zingalinga.com') {
      const adminUser = {
        id: 'admin-001',
        email: 'admin@zingalinga.com',
        password: 'admin123',
        name: 'System Administrator',
        role: 'admin',
        status: 'active',
        purchasedModules: [],
        createdAt: new Date().toISOString(),
        lastLogin: null,
        totalSpent: 0,
        isActive: true
      };
      data.users = data.users || [];
      data.users.push(adminUser);
      await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
      console.log('✅ Auto-created admin user');
      user = adminUser;
    }
    
    if (!user) {
      console.log('❌ User not found for email:', sanitizeInput(sanitizedEmail));
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    console.log('✅ User found:', { 
      email: sanitizeForLog(user.email), 
      role: sanitizeForLog(user.role), 
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
      accountLocked: user.accountLocked,
      loginAttempts: user.loginAttempts,
      status: user.status
    });

    // Auto-unlock admin accounts
    if (user.role === 'admin' && user.accountLocked) {
      user.accountLocked = false;
      user.loginAttempts = 0;
      console.log('🔓 Auto-unlocked admin account');
    }
    
    // Check if account is locked (non-admin)
    if (user.accountLocked && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Account is locked. Please contact support.' },
        { status: 403 }
      );
    }

    // Handle empty passwords
    if (!user.password || user.password.length === 0) {
      console.log('❌ User has no password set');
      return NextResponse.json(
        { success: false, error: 'Authentication service error' },
        { status: 500 }
      );
    }
    
    // Verify password (handle both hashed and legacy plain text)
    let passwordValid = false;
    console.log('🔐 Password verification:', { 
      storedPassword: '[REDACTED]', 
      providedPassword: '[REDACTED]', 
      storedLength: user.password.length 
    });
    
    if (user.password.length === 64) { // Hashed password (SHA-256 produces 64 char hex)
      console.log('🔒 Using hashed password verification');
      passwordValid = await verifyPassword(password, user.password);
    } else {
      // Legacy plain text password (for backward compatibility)
      console.log('🔓 Using plain text password verification');
      // Use timing-safe comparison for passwords
      const userPasswordBuffer = Buffer.from(user.password, 'utf8');
      const providedPasswordBuffer = Buffer.from(password, 'utf8');
      
      if (userPasswordBuffer.length === providedPasswordBuffer.length) {
        passwordValid = require('crypto').timingSafeEqual(userPasswordBuffer, providedPasswordBuffer);
      } else {
        passwordValid = false;
      }
    }
    
    console.log('🎯 Password validation result:', passwordValid);

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
    console.log(`User logged in successfully: ${sanitizeForLog(user.email)} (ID: ${sanitizeForLog(user.id)})`);

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