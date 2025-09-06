import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ 
      success: true, 
      message: 'Prisma working!',
      userCount 
    });
  } catch (error) {
    console.error('Prisma error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Prisma connection failed' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password,
        role: 'USER'
      }
    });
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create user' 
    }, { status: 500 });
  }
}