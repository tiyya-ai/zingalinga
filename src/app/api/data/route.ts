import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'global-app-data.json');

// Security: Input sanitization
const sanitizeInput = (input: string): string => {
  return input.replace(/[\r\n\x00-\x1f\x7f-\x9f]/g, '').trim();
};

// Security: Path validation
const validatePath = (filePath: string): boolean => {
  const resolvedPath = path.resolve(filePath);
  const resolvedDataDir = path.resolve(DATA_DIR);
  return resolvedPath.startsWith(resolvedDataDir);
};

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
      console.info('Loading existing data with modules:', existingData.modules?.length || 0);
      return NextResponse.json(existingData);
    }
    
    // Create default data if none exists
    console.info('No existing data found - creating default data');
    const defaultData = await createDefaultData();
    return NextResponse.json(defaultData);
  } catch (error) {
    console.error('API GET error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to load data', details: error instanceof Error ? sanitizeInput(error.message) : 'Unknown error' },
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
      const backupId = crypto.randomUUID();
      const backupFile = path.join(DATA_DIR, `backup-${backupId}.json`);
      
      if (!validatePath(backupFile)) {
        throw new Error('Invalid backup path');
      }
      
      await writeFile(backupFile, JSON.stringify(existingData, null, 2));
      console.info('Backup created:', sanitizeInput(backupFile));
    }
    
    // IMPROVED: Only refuse to save if modules array is undefined (not explicitly set)
    // Allow legitimate deletions when modules array is explicitly provided (even if empty)
    if (existingData?.modules?.length > 0 && data.modules === undefined) {
      console.warn('PROTECTION: modules array not provided, preserving existing modules');
      data.modules = existingData.modules;
    } else if (existingData?.modules?.length > 0 && Array.isArray(data.modules) && data.modules.length === 0) {
      console.info('DELETION: Explicit module deletion detected, allowing operation');
      // This is an intentional deletion - allow it to proceed
    }
    
    // SMART data preservation - protect critical content but allow legitimate operations
    const preservedData = {
      // Allow user changes (including deletions) when explicitly provided
      users: data.users !== undefined ? data.users : (existingData?.users || []),
      // Protect modules from accidental deletion but allow explicit updates
      modules: data.modules !== undefined ? data.modules : (existingData?.modules || []),
      // Allow purchase updates (including deletions for refunds/cleanup)
      purchases: data.purchases !== undefined ? data.purchases : (existingData?.purchases || []),
      // Allow package updates
      packages: data.packages !== undefined ? data.packages : (existingData?.packages || []),
      // Preserve other data with fallbacks
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
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      deploymentProtection: true
    };
    
    console.info('DATA PROTECTION ACTIVE');
    console.info('Existing modules:', existingData?.modules?.length || 0);
    console.info('Incoming modules:', data.modules?.length || 0);
    console.info('Final modules:', preservedData.modules?.length || 0);
    console.info('PROTECTED SAVE - Preserving modules:', preservedData.modules?.length || 0, 'users:', preservedData.users?.length || 0);
    
    // Create permanent backup if we have significant data
    if (preservedData.modules?.length > 0) {
      try {
        const permanentBackupPath = path.join(DATA_DIR, 'backup-permanent.json');
        
        if (!validatePath(permanentBackupPath)) {
          throw new Error('Invalid permanent backup path');
        }
        
        await writeFile(permanentBackupPath, JSON.stringify(preservedData, null, 2));
        console.info('Permanent backup updated with modules:', preservedData.modules.length);
      } catch (backupError) {
        console.error('Failed to create permanent backup:', backupError instanceof Error ? backupError.message : 'Unknown error');
      }
    }
    await writeFile(dataFile, JSON.stringify(preservedData, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data saved with full protection',
      moduleCount: preservedData.modules?.length || 0,
      userCount: preservedData.users?.length || 0,
      backupCreated: !!existingData
    });
  } catch (error) {
    console.error('API POST error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { success: false, error: 'Failed to save data', details: error instanceof Error ? sanitizeInput(error.message) : 'Unknown error' },
      { status: 500 }
    );
  }
}