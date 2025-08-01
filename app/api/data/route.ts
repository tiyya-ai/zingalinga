import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'global-app-data.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Default data structure
const getDefaultData = () => ({
  users: [
    {
      id: 'admin_001',
      email: 'admin@zingalinga.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      purchasedModules: [],
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    },
    {
      id: 'user_001',
      email: 'test@example.com',
      password: 'test123',
      name: 'Test User',
      role: 'user',
      purchasedModules: [],
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  ],
  modules: [
    {
      id: 'alphabet-basics',
      title: 'Alphabet Basics',
      description: 'Learn the fundamentals of the African alphabet with Kiki & Tano',
      price: 9.99,
      category: 'alphabet',
      difficulty: 'beginner',
      estimatedTime: '2-3 hours',
      thumbnail: '/images/alphabet-basics.jpg',
      isPopular: true,
      tags: ['alphabet', 'basics', 'beginner']
    },
    {
      id: 'advanced-reading',
      title: 'Advanced Reading',
      description: 'Master advanced reading skills and comprehension',
      price: 14.99,
      category: 'reading',
      difficulty: 'advanced',
      estimatedTime: '4-5 hours',
      thumbnail: '/images/advanced-reading.jpg',
      isPopular: false,
      tags: ['reading', 'advanced', 'comprehension']
    }
  ],
  purchases: [],
  contentFiles: [],
  lastUpdated: new Date().toISOString()
});

// GET - Load global data
export async function GET() {
  try {
    await ensureDataDirectory();
    
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      const data = JSON.parse(fileContent);
      
      return NextResponse.json({
        ...data,
        lastLoaded: new Date().toISOString()
      });
    } catch (fileError) {
      // File doesn't exist, return default data
      const defaultData = getDefaultData();
      
      // Save default data to file
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(defaultData, null, 2));
      
      return NextResponse.json({
        ...defaultData,
        lastLoaded: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error loading global data:', error);
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}

// POST - Save global data
export async function POST(request: NextRequest) {
  try {
    await ensureDataDirectory();
    
    const data = await request.json();
    
    // Add timestamp
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(dataWithTimestamp, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Data saved successfully',
      lastUpdated: dataWithTimestamp.lastUpdated
    });
  } catch (error) {
    console.error('Error saving global data:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}

// DELETE - Reset to default data
export async function DELETE() {
  try {
    await ensureDataDirectory();
    
    const defaultData = getDefaultData();
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(defaultData, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Data reset to defaults',
      data: defaultData
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    return NextResponse.json(
      { error: 'Failed to reset data' },
      { status: 500 }
    );
  }
}