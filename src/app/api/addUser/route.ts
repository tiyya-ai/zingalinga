import { NextRequest, NextResponse } from 'next/server';
import { neonDataStore } from '../../../utils/neonDataStore';

export async function POST(request: NextRequest) {
  try {
    const { name, email, role = 'user' } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Load current data
    const data = await neonDataStore.loadData();
    const users = data.users || [];
    
    // Create new user with unique ID
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true
    };
    
    // Add user to the array
    const updatedUsers = [...users, newUser];
    
    // Save updated data
    await neonDataStore.saveData({ ...data, users: updatedUsers });

    return NextResponse.json({
      success: true,
      id: newUser.id,
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