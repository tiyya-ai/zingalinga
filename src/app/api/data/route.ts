import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Use relative path for better VPS compatibility
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'global-app-data.json');

// Fallback data directory for VPS
const FALLBACK_DATA_DIR = path.join(process.cwd(), 'data');
const FALLBACK_DATA_FILE = path.join(FALLBACK_DATA_DIR, 'global-app-data.json');

// Ensure data directory exists with fallback
async function ensureDataDir() {
  try {
    // Try primary data directory first
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }
    return { dataDir: DATA_DIR, dataFile: DATA_FILE };
  } catch (error) {
    console.warn('Primary data directory failed, trying fallback:', error);
    try {
      // Try fallback directory
      if (!existsSync(FALLBACK_DATA_DIR)) {
        await mkdir(FALLBACK_DATA_DIR, { recursive: true });
      }
      return { dataDir: FALLBACK_DATA_DIR, dataFile: FALLBACK_DATA_FILE };
    } catch (fallbackError) {
      console.error('Both data directories failed:', fallbackError);
      throw new Error('Unable to initialize data storage');
    }
  }
}

// Default data structure
function getDefaultData() {
  const staticDate = '2025-01-20T10:00:00.000Z';
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
        createdAt: staticDate,
        lastLogin: staticDate
      },
      {
        id: 'user_001',
        email: 'test@example.com',
        password: process.env.DEFAULT_USER_PASSWORD || 'change-me-user',
        name: 'Test User',
        role: 'user',
        purchasedModules: [],
        totalSpent: 0,
        createdAt: staticDate,
        lastLogin: staticDate
      },
      {
        id: 'user-1',
        email: 'user@example.com',
        password: 'user123',
        name: 'User',
        role: 'user',
        purchasedModules: [],
        totalSpent: 0,
        createdAt: staticDate,
        lastLogin: staticDate
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
        createdAt: staticDate,
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

// Helper function to load data with fallback
async function loadData() {
  // Try primary data file first
  if (existsSync(DATA_FILE)) {
    try {
      const data = await readFile(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to read primary data file:', error);
    }
  }
  
  // Try fallback data file
  if (existsSync(FALLBACK_DATA_FILE)) {
    try {
      const data = await readFile(FALLBACK_DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to read fallback data file:', error);
    }
  }
  
  return null;
}

// Helper function to create default data with fallback
async function createDefaultData() {
  const defaultData = getDefaultData();
  const { dataFile } = await ensureDataDir();
  
  try {
    await writeFile(dataFile, JSON.stringify(defaultData, null, 2));
    console.log(`✅ Default data created at: ${dataFile}`);
  } catch (error) {
    console.error('Failed to create default data:', error);
    throw error;
  }
  
  return defaultData;
}

// GET - Load data from storage
export async function GET() {
  try {
    const { dataDir, dataFile } = await ensureDataDir();
    console.log(`📁 Using data directory: ${dataDir}`);
    
    const existingData = await loadData();
    if (existingData) {
      console.log('✅ Loaded existing data');
      return NextResponse.json(existingData);
    }
    
    console.log('📝 Creating default data...');
    const defaultData = await createDefaultData();
    return NextResponse.json(defaultData);
  } catch (error) {
    console.error('❌ Error loading data:', error);
    return NextResponse.json(
      { error: 'Failed to load data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Save data to storage
export async function POST(request: NextRequest) {
  try {
    const { dataDir, dataFile } = await ensureDataDir();
    console.log(`💾 Saving data to: ${dataFile}`);
    
    const data = await request.json();
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    // Add timestamp for debugging
    data.lastSaved = new Date().toISOString();
    data.savedFrom = process.env.NODE_ENV || 'unknown';
    
    await writeFile(dataFile, JSON.stringify(data, null, 2));
    console.log('✅ Data saved successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data saved successfully',
      savedTo: dataFile,
      timestamp: data.lastSaved
    });
  } catch (error) {
    console.error('❌ Error saving data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to save data', details: errorMessage },
      { status: 500 }
    );
  }
}