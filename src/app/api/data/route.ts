import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = '/var/www/zinga-linga-data';
const DATA_FILE = path.join(DATA_DIR, 'app-data.json');

// Ensure data directory exists
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

// Default data structure
function getDefaultData() {
  return {
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
        id: 'sample_video_001',
        title: 'Sample Educational Video',
        description: 'A sample video for testing the admin dashboard',
        price: 9.99,
        category: 'education',
        thumbnail: '/placeholder-video.jpg',
        videoUrl: '/sample-video.mp4',
        duration: '15:30',
        estimatedDuration: '15:30',
        createdAt: new Date().toISOString(),
        isActive: true,
        rating: 4.5,
        ageRange: '3-8 years'
      }
    ],
    purchases: [],
    contentFiles: [],
    uploadQueue: [],
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
      dataSource: 'vps',
      enableRealTimeSync: true
    }
  };
}

// GET - Load data from VPS
export async function GET() {
  try {
    await ensureDataDir();
    
    if (existsSync(DATA_FILE)) {
      const data = await readFile(DATA_FILE, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    } else {
      // Create default data file
      const defaultData = getDefaultData();
      await writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
      return NextResponse.json(defaultData);
    }
  } catch (error) {
    console.error('Error loading data:', error);
    return NextResponse.json(getDefaultData());
  }
}

// POST - Save data to VPS
export async function POST(request: NextRequest) {
  try {
    await ensureDataDir();
    
    const data = await request.json();
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save data' },
      { status: 500 }
    );
  }
}