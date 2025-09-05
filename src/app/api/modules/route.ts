import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../utils/database';

export async function POST(request: NextRequest) {
  try {
    const module = await request.json();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await executeQuery(
      'INSERT INTO modules (id, title, description, category, videoUrl, thumbnailUrl, duration, tags, price, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        module.id,
        module.title,
        module.description,
        module.category,
        module.videoUrl,
        module.thumbnailUrl,
        module.duration || 0,
        JSON.stringify(module.tags || []),
        module.price || 0,
        module.status || 'active',
        now
      ]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
  }
}