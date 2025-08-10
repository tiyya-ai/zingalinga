import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'global-app-data.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create data directory:', error);
    throw new Error('Unable to initialize data storage');
  }
}

// Default data structure
function getDefaultData() {
  return {
    users: [
      {
        id: 'admin_001',
        email: 'admin@zingalinga.com',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'change-me-admin',
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
        password: process.env.DEFAULT_USER_PASSWORD || 'change-me-user',
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
        description: 'A sample video for testing the admin',
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

// Helper function to load data
async function loadData() {
  if (existsSync(DATA_FILE)) {
    const data = await readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  }
  return null;
}

// Helper function to create default data
async function createDefaultData() {
  const defaultData = getDefaultData();
  await writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
  return defaultData;
}

// GET - Load data from storage
export async function GET() {
  try {
    await ensureDataDir();
    
    const existingData = await loadData();
    if (existingData) {
      return NextResponse.json(existingData);
    }
    
    const defaultData = await createDefaultData();
    return NextResponse.json(defaultData);
  } catch (error) {
    console.error('Error loading data:', error);
    return NextResponse.json(
      { error: 'Failed to load data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Save data to storage
export async function POST(request: NextRequest) {
  try {
    await ensureDataDir();
    
    const data = await request.json();
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to save data', details: errorMessage },
      { status: 500 }
    );
  }
}