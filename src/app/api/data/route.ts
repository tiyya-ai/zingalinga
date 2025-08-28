import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'global-app-data.json');

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  return DATA_FILE;
}

// Default data structure
function getDefaultData() {
  const staticDate = '2025-01-20T10:00:00.000Z';
  return {
    users: [
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
    packages: [],
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

async function loadData() {
  if (existsSync(DATA_FILE)) {
    const data = await readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  }
  return null;
}

async function createDefaultData() {
  const defaultData = getDefaultData();
  const dataFile = await ensureDataDir();
  await writeFile(dataFile, JSON.stringify(defaultData, null, 2));
  return defaultData;
}

export async function GET() {
  try {
    await ensureDataDir();
    const existingData = await loadData();
    
    if (existingData) {
      console.log('📊 Loading existing data with', existingData.modules?.length || 0, 'modules');
      return NextResponse.json(existingData);
    }
    
    // NEVER create default data automatically - this prevents data loss
    console.log('⚠️ No existing data found - returning empty structure to prevent data loss');
    return NextResponse.json({
      users: [],
      modules: [],
      purchases: [],
      contentFiles: [],
      uploadQueue: [],
      packages: [],
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
    });
  } catch (error) {
    console.error('❌ API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const dataFile = await ensureDataDir();
    const data = await request.json();
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    // Create backup before saving
    const existingData = await loadData();
    if (existingData) {
      const backupFile = path.join(DATA_DIR, `backup-${Date.now()}.json`);
      await writeFile(backupFile, JSON.stringify(existingData, null, 2));
      console.log('🔒 Backup created:', backupFile);
    }
    
    // STRICT data preservation - never lose existing content
    const preservedData = {
      users: data.users && data.users.length > 0 ? data.users : (existingData?.users || []),
      modules: data.modules && data.modules.length > 0 ? data.modules : (existingData?.modules || []),
      purchases: data.purchases && data.purchases.length > 0 ? data.purchases : (existingData?.purchases || []),
      packages: data.packages && data.packages.length > 0 ? data.packages : (existingData?.packages || []),
      contentFiles: data.contentFiles || existingData?.contentFiles || [],
      uploadQueue: data.uploadQueue || existingData?.uploadQueue || [],
      savedVideos: data.savedVideos || existingData?.savedVideos || [],
      categories: data.categories || existingData?.categories || ['Audio Lessons', 'PP1 Program', 'PP2 Program'],
      comments: data.comments || existingData?.comments || [],
      subscriptions: data.subscriptions || existingData?.subscriptions || [],
      transactions: data.transactions || existingData?.transactions || [],
      notifications: data.notifications || existingData?.notifications || [],
      scheduledContent: data.scheduledContent || existingData?.scheduledContent || [],
      flaggedContent: data.flaggedContent || existingData?.flaggedContent || [],
      accessLogs: data.accessLogs || existingData?.accessLogs || [],
      bundles: data.bundles || existingData?.bundles || [],
      ageGroups: data.ageGroups || existingData?.ageGroups || [],
      settings: { ...existingData?.settings, ...data.settings },
      lastSaved: new Date().toISOString(),
      lastUpdated: data.lastUpdated || new Date().toISOString()
    };
    
    console.log('💾 PROTECTED SAVE - Preserving', preservedData.modules?.length || 0, 'modules,', preservedData.users?.length || 0, 'users');
    await writeFile(dataFile, JSON.stringify(preservedData, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data saved with full protection',
      moduleCount: preservedData.modules?.length || 0,
      userCount: preservedData.users?.length || 0,
      backupCreated: !!existingData
    });
  } catch (error) {
    console.error('❌ API POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}