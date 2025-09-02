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
        id: 'admin_001',
        email: 'admin@zingalinga.com',
        password: process.env.ADMIN_PASSWORD || process.env.DEFAULT_ADMIN_PASSWORD || 'change-me-admin',
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
      }
    ],
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
    
    // Skip backup creation to prevent data loss issues
    
    // Simple data save - use incoming data as-is
    const preservedData = {
      ...data,
      lastSaved: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    console.info('Saving data with modules:', preservedData.modules?.length || 0, 'users:', preservedData.users?.length || 0);
    
    // Skip permanent backup to prevent deployment issues
    await writeFile(dataFile, JSON.stringify(preservedData, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data saved successfully',
      moduleCount: preservedData.modules?.length || 0,
      userCount: preservedData.users?.length || 0
    });
  } catch (error) {
    console.error('API POST error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { success: false, error: 'Failed to save data', details: error instanceof Error ? sanitizeInput(error.message) : 'Unknown error' },
      { status: 500 }
    );
  }
}