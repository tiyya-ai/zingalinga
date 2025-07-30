import { NextResponse } from 'next/server';
import { neonDataStore } from '../../../utils/neonDataStore';

export async function GET() {
  try {
    const data = await neonDataStore.loadData();
    const users = data.users || [];
    
    // Sort users by createdAt in descending order
    const sortedUsers = users.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      users: sortedUsers,
      count: sortedUsers.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users from database' },
      { status: 500 }
    );
  }
}