import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { name, email, role = 'user' } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, 'userData'), {
      name,
      email,
      role,
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'User added successfully'
    });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json(
      { error: 'Failed to add user to database' },
      { status: 500 }
    );
  }
}