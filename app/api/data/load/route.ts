import { NextRequest, NextResponse } from 'next/server';
import { db, isDbAvailable, users, modules, purchases, contentFiles } from '../../../../lib/neon';
import { desc } from 'drizzle-orm';
import { modules as defaultModules } from '../../../../src/data/modules';

export async function GET(request: NextRequest) {
  try {
    console.log('📖 Loading data from Neon database...');
    
    // Check if database is available
    if (!isDbAvailable || !db) {
      console.log('⚠️ Database not available, returning default data');
      return NextResponse.json(getDefaultData());
    }
    
    // Load all data from database
    const [dbUsers, dbModules, dbPurchases, dbContentFiles] = await Promise.all([
      db.select().from(users).orderBy(desc(users.createdAt)),
      db.select().from(modules).orderBy(desc(modules.createdAt)),
      db.select().from(purchases).orderBy(desc(purchases.purchaseDate)),
      db.select().from(contentFiles).orderBy(desc(contentFiles.uploadedAt))
    ]);

    // If database is empty, initialize with default data
    if (dbModules.length === 0) {
      console.log('🔧 Database empty, initializing with default data...');
      await initializeDefaultData();
      
      // Reload after initialization
      const [newUsers, newModules, newPurchases, newContentFiles] = await Promise.all([
        db.select().from(users).orderBy(desc(users.createdAt)),
        db.select().from(modules).orderBy(desc(modules.createdAt)),
        db.select().from(purchases).orderBy(desc(purchases.purchaseDate)),
        db.select().from(contentFiles).orderBy(desc(contentFiles.uploadedAt))
      ]);
      
      return NextResponse.json({
        users: newUsers.map(user => ({
          ...user,
          purchasedModules: user.purchasedModules || []
        })),
        modules: newModules.map(module => ({
          ...module,
          fullContent: module.fullContent ? JSON.parse(module.fullContent) : {}
        })),
        purchases: newPurchases,
        contentFiles: newContentFiles,
        analytics: {
          totalUsers: newUsers.length,
          totalRevenue: newPurchases.reduce((sum, p) => sum + p.amount, 0),
          totalPurchases: newPurchases.length,
          activeModules: newModules.length
        }
      });
    }

    // Calculate analytics
    const analytics = {
      totalUsers: dbUsers.length,
      totalRevenue: dbPurchases.reduce((sum, p) => sum + p.amount, 0),
      totalPurchases: dbPurchases.length,
      activeModules: dbModules.length
    };

    console.log('✅ Data loaded from Neon:', {
      users: dbUsers.length,
      modules: dbModules.length,
      purchases: dbPurchases.length
    });

    return NextResponse.json({
      users: dbUsers.map(user => ({
        ...user,
        purchasedModules: user.purchasedModules || []
      })),
      modules: dbModules.map(module => ({
        ...module,
        fullContent: module.fullContent ? JSON.parse(module.fullContent) : {}
      })),
      purchases: dbPurchases,
      contentFiles: dbContentFiles,
      analytics
    });
  } catch (error) {
    console.error('❌ Error loading from Neon:', error);
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}

// Initialize database with default data
async function initializeDefaultData() {
  try {
    console.log('🔧 Initializing database with default data...');
    
    // Insert default modules
    for (const module of defaultModules) {
      await db.insert(modules).values({
        id: module.id,
        title: module.title,
        description: module.description,
        price: module.price,
        category: module.category,
        difficulty: module.difficulty,
        duration: module.duration,
        videoUrl: module.videoUrl,
        thumbnailUrl: module.thumbnailUrl,
        fullContent: JSON.stringify(module.fullContent),
        createdAt: new Date().toISOString()
      }).onConflictDoNothing();
    }

    // Insert default admin user
    await db.insert(users).values({
      id: 'admin-001',
      email: 'admin@zingalinga.com',
      name: 'System Administrator',
      role: 'admin',
      purchasedModules: [],
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }).onConflictDoNothing();

    // Insert demo parent user
    await db.insert(users).values({
      id: 'parent-001',
      email: 'parent@demo.com',
      name: 'Demo Parent',
      role: 'user',
      purchasedModules: [],
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }).onConflictDoNothing();

    console.log('✅ Default data initialized');
  } catch (error) {
    console.error('❌ Error initializing default data:', error);
    throw error;
  }
}

// Get default data for when database is not available
function getDefaultData() {
  return {
    users: [
      {
        id: 'admin-001',
        email: 'admin@zingalinga.com',
        name: 'System Administrator',
        role: 'admin',
        purchasedModules: [],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        totalSpent: 0
      },
      {
        id: 'parent-001',
        email: 'parent@demo.com',
        name: 'Demo Parent',
        role: 'user',
        purchasedModules: [],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        totalSpent: 0
      }
    ],
    modules: defaultModules,
    purchases: [],
    contentFiles: [],
    analytics: {
      totalUsers: 2,
      totalRevenue: 0,
      totalPurchases: 0,
      activeModules: defaultModules.length
    }
  };
}