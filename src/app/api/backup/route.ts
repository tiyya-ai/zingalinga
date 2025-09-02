import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'global-app-data.json');

// List all backups
export async function GET() {
  try {
    if (!existsSync(DATA_DIR)) {
      return NextResponse.json({ backups: [] });
    }

    const files = await readdir(DATA_DIR);
    const backups = files
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .map(file => {
        const timestamp = file.replace('backup-', '').replace('.json', '');
        return {
          filename: file,
          timestamp: parseInt(timestamp),
          date: new Date(parseInt(timestamp)).toISOString(),
          path: path.basename(file) // Only return filename for security
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ backups });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list backups' },
      { status: 500 }
    );
  }
}

// Restore from backup
export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();
    
    if (!filename || !filename.startsWith('backup-')) {
      return NextResponse.json(
        { success: false, error: 'Invalid backup filename' },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent path traversal
    const sanitizedFilename = path.basename(filename);
    if (!sanitizedFilename.startsWith('backup-') || !sanitizedFilename.endsWith('.json')) {
      return NextResponse.json(
        { success: false, error: 'Invalid backup filename format' },
        { status: 400 }
      );
    }
    
    const backupFile = path.join(DATA_DIR, sanitizedFilename);
    
    if (!existsSync(backupFile)) {
      return NextResponse.json(
        { success: false, error: 'Backup file not found' },
        { status: 404 }
      );
    }

    const backupData = await readFile(backupFile, 'utf-8');
    const data = JSON.parse(backupData);

    if (existsSync(DATA_FILE)) {
      const currentBackup = path.join(DATA_DIR, `pre-restore-backup-${Date.now()}.json`);
      const currentData = await readFile(DATA_FILE, 'utf-8');
      await writeFile(currentBackup, currentData);
    }

    await writeFile(DATA_FILE, JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Data restored successfully',
      moduleCount: data.modules?.length || 0,
      userCount: data.users?.length || 0
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}