import { NextRequest, NextResponse } from 'next/server';
import { vpsDataStore } from '../../../utils/vpsDataStore';

export async function GET() {
  try {
    const uploadQueue = await vpsDataStore.getUploadQueue();
    return NextResponse.json(uploadQueue);
  } catch (error) {
    console.error('Error fetching upload queue:', error);
    return NextResponse.json({ error: 'Failed to fetch upload queue' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const uploadItem = await request.json();
    const success = await vpsDataStore.addToUploadQueue(uploadItem);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to add to upload queue' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error adding to upload queue:', error);
    return NextResponse.json({ error: 'Failed to add to upload queue' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { uploadId, updates } = await request.json();
    const success = await vpsDataStore.updateUploadQueueItem(uploadId, updates);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to update upload queue item' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating upload queue item:', error);
    return NextResponse.json({ error: 'Failed to update upload queue item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('uploadId');
    
    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID is required' }, { status: 400 });
    }
    
    const success = await vpsDataStore.removeFromUploadQueue(uploadId);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to remove from upload queue' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error removing from upload queue:', error);
    return NextResponse.json({ error: 'Failed to remove from upload queue' }, { status: 500 });
  }
}