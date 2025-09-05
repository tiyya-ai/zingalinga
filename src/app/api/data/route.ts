import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../utils/database';

export async function GET() {
  try {
    const [users, modules, purchases] = await Promise.all([
      executeQuery('SELECT * FROM users'),
      executeQuery('SELECT * FROM modules'),
      executeQuery('SELECT * FROM purchases')
    ]);

    const data = {
      users: (users as any[]).map(user => ({
        ...user,
        purchasedModules: JSON.parse(user.purchasedModules || '[]')
      })),
      modules: (modules as any[]).map(module => ({
        ...module,
        tags: JSON.parse(module.tags || '[]')
      })),
      purchases: purchases as any[],
      contentFiles: [],
      uploadQueue: [],
      savedVideos: [],
      categories: ['Audio Lessons', 'PP1 Program', 'PP2 Program'],
      comments: [],
      subscriptions: [],
      transactions: [],
      notifications: [],
      scheduledContent: [],
      flaggedContent: [],
      accessLogs: [],
      packages: [],
      bundles: [],
      ageGroups: [],
      settings: {
        siteName: 'Zinga Linga',
        defaultLanguage: 'en',
        timezone: 'UTC',
        features: {
          userRegistration: true,
          videoComments: true,
          videoDownloads: true,
          socialSharing: false
        },
        dataSource: 'real',
        enableRealTimeSync: true
      },
      lastUpdated: new Date().toISOString(),
      lastLoaded: new Date().toISOString()
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Save users to database if provided
    if (data.users && Array.isArray(data.users)) {
      for (const user of data.users) {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        // Check if user exists
        const existingUsers = await executeQuery('SELECT id FROM users WHERE id = ?', [user.id]);
        
        if ((existingUsers as any[]).length === 0) {
          // Insert new user
          await executeQuery(
            'INSERT INTO users (id, email, name, role, password, purchasedModules, totalSpent, status, createdAt, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              user.id,
              user.email,
              user.name,
              user.role || 'user',
              user.password || 'defaultpass',
              JSON.stringify(user.purchasedModules || []),
              user.totalSpent || 0.00,
              user.status || 'active',
              now,
              now
            ]
          );
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Data saved successfully'
    });
  } catch (error) {
    console.error('API POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save data' },
      { status: 500 }
    );
  }
}