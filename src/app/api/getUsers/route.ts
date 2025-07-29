import { NextResponse } from 'next/server';
import { db } from '../../../config/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export async function GET() {
  try {
    const usersQuery = query(
      collection(db, 'userData'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(usersQuery);
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      lastLogin: doc.data().lastLogin?.toDate?.()?.toISOString() || doc.data().lastLogin
    }));

    return NextResponse.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users from database' },
      { status: 500 }
    );
  }
}