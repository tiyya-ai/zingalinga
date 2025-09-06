import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    console.log('👥 USERS API: GET request received at', new Date().toISOString());
    const users = await prisma.user.findMany();
    console.log('👥 USERS API: Found', users.length, 'users in database');
    console.log('👥 USERS API: User list:', users.map(u => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt })));
    
    return NextResponse.json(users.map(user => ({
      ...user,
      purchasedModules: typeof user.purchasedModules === 'string' 
        ? JSON.parse(user.purchasedModules) 
        : user.purchasedModules
    })));
  } catch (error) {
    console.error('👥 USERS API: Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    console.log('🆕 USERS API: POST - Creating new user:', {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      timestamp: new Date().toISOString()
    });
    
    // Create user with Prisma
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: userData.role?.toUpperCase() || 'USER',
        status: userData.status?.toUpperCase() || 'ACTIVE',
        totalSpent: parseFloat(userData.totalSpent) || 0.00,
        purchasedModules: userData.purchasedModules || [],
        avatar: userData.avatar || null,
        phone: userData.phone || null,
        dateOfBirth: userData.dateOfBirth || null,
        subscription: userData.subscription?.toUpperCase() || 'FREE'
      }
    });
    
    console.log('✅ USERS API: User created successfully:', user.id, user.name, user.email);
    return NextResponse.json(user);
    
  } catch (error) {
    console.error('❌ USERS API: Error creating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to create user', 
      details: errorMessage 
    }, { status: 500 });
  }
}