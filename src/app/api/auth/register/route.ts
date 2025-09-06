import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { sanitizeInput, validateEmail, hashPassword } from '../../../../utils/securityUtils';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'global-app-data.json');

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
}

function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, name, confirmPassword } = body;

    // Input validation
    if (!email || !password || !name || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedName = sanitizeInput(name);
    
    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate name length
    if (sanitizedName.length < 2 || sanitizedName.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Name must be between 2 and 50 characters' },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }

    let data;
    if (existsSync(DATA_FILE)) {
      try {
        const fileContent = await readFile(DATA_FILE, 'utf-8');
        data = JSON.parse(fileContent);
      } catch (error) {
        console.error('Error reading data file:', error);
        data = { users: [] };
      }
    } else {
      data = { users: [] };
    }

    // Check for existing user with sanitized email
    const existingUser = data.users?.find((u: any) => u.email?.toLowerCase() === sanitizedEmail);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password securely
    const hashedPassword = await hashPassword(password);

    // Generate secure user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newUser = {
      id: userId,
      email: sanitizedEmail,
      password: hashedPassword,
      name: sanitizedName,
      role: 'user',
      status: 'active',
      purchasedModules: [],
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      registrationIp: ip,
      emailVerified: false,
      loginAttempts: 0,
      lastLoginAttempt: null,
      accountLocked: false
    };

    data.users = data.users || [];
    data.users.push(newUser);

    // Save to local file with error handling
    try {
      await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing to data file:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save user data' },
        { status: 500 }
      );
    }

    // Also save to VPS data endpoint with retry logic
    let syncSuccess = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/data`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'ZingaLinga-Registration-Service'
          },
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (response.ok) {
          syncSuccess = true;
          break;
        }
      } catch (error) {
        console.error(`VPS sync attempt ${attempt + 1} failed:`, error);
        if (attempt === 2) {
          console.error('All VPS sync attempts failed, but user was created locally');
        }
      }
    }

    // Log successful registration (without sensitive data)
    console.log(`User registered successfully: ${sanitizedEmail} (ID: ${userId})`);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      syncedToVPS: syncSuccess
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}