import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users.map(user => ({
      ...user,
      purchasedModules: typeof user.purchasedModules === 'string' 
        ? JSON.parse(user.purchasedModules) 
        : user.purchasedModules
    })));
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    console.log('Creating user with Prisma:', userData);
    
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
    
    console.log('User created successfully:', user);
    return NextResponse.json(user);
    
  } catch (error) {
    console.error('Error creating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to create user', 
      details: errorMessage 
    }, { status: 500 });
  }
}