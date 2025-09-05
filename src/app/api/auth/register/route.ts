import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput, validateEmail, hashPassword } from '../../../../utils/securityUtils';
import { executeQuery } from '../../../../utils/database';

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

    // Check for existing user in database
    const existingUsers = await executeQuery('SELECT id FROM users WHERE email = ?', [sanitizedEmail]) as any[];
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password securely
    const hashedPassword = await hashPassword(password);

    // Generate secure user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save user to database
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await executeQuery(
      'INSERT INTO users (id, email, name, role, password, purchasedModules, totalSpent, status, createdAt, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        sanitizedEmail,
        sanitizedName,
        'user',
        hashedPassword,
        JSON.stringify([]),
        0,
        'active',
        now,
        now
      ]
    );

    const newUser = {
      id: userId,
      email: sanitizedEmail,
      name: sanitizedName,
      role: 'user',
      createdAt: now
    };

    // Log successful registration (without sensitive data)
    console.log(`User registered successfully: ${sanitizedEmail} (ID: ${userId})`);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: sanitizeInput(newUser.id),
        email: sanitizeInput(newUser.email),
        name: sanitizeInput(newUser.name),
        role: sanitizeInput(newUser.role),
        createdAt: sanitizeInput(newUser.createdAt)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}