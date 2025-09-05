import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getConnection } from '../../../utils/database';

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

    const connection = await getConnection();
    await connection.beginTransaction();

    try {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Save users if provided
      if (data.users && Array.isArray(data.users)) {
        for (const user of data.users) {
          // Check if user exists
          const [existingUsers] = await connection.execute('SELECT id FROM users WHERE id = ?', [user.id]);
          
          if ((existingUsers as any[]).length === 0) {
            // Insert new user
            await connection.execute(
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
          } else {
            // Update existing user
            await connection.execute(
              'UPDATE users SET email = ?, name = ?, role = ?, purchasedModules = ?, totalSpent = ?, status = ? WHERE id = ?',
              [
                user.email,
                user.name,
                user.role || 'user',
                JSON.stringify(user.purchasedModules || []),
                user.totalSpent || 0.00,
                user.status || 'active',
                user.id
              ]
            );
          }
        }
      }

      // Save modules if provided
      if (data.modules && Array.isArray(data.modules)) {
        for (const module of data.modules) {
          const [existingModules] = await connection.execute('SELECT id FROM modules WHERE id = ?', [module.id]);
          
          if ((existingModules as any[]).length === 0) {
            await connection.execute(
              'INSERT INTO modules (id, title, description, price, category, tags, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [
                module.id,
                module.title,
                module.description,
                module.price,
                module.category,
                JSON.stringify(module.tags || []),
                module.isActive ? 1 : 0,
                now
              ]
            );
          }
        }
      }

      // Save purchases if provided
      if (data.purchases && Array.isArray(data.purchases)) {
        for (const purchase of data.purchases) {
          const [existingPurchases] = await connection.execute('SELECT id FROM purchases WHERE id = ?', [purchase.id]);
          
          if ((existingPurchases as any[]).length === 0) {
            await connection.execute(
              'INSERT INTO purchases (id, userId, moduleId, amount, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
              [
                purchase.id,
                purchase.userId,
                purchase.moduleId,
                purchase.amount,
                purchase.status || 'completed',
                now
              ]
            );
          }
        }
      }

      await connection.commit();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Data saved successfully to database'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('API POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save data to database' },
      { status: 500 }
    );
  }
}