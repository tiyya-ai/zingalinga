import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }
    
    // Extract Vimeo video ID
    const vimeoIdMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (!vimeoIdMatch) {
      return NextResponse.json({ error: 'Invalid Vimeo URL' }, { status: 400 });
    }
    
    const videoId = vimeoIdMatch[1];
    
    // Use Vimeo oEmbed API to get video info including thumbnail
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}&width=640&height=360`;
    
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch video info' }, { status: 500 });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      id: videoId,
      title: data.title || 'Vimeo Video',
      thumbnail: data.thumbnail_url || '',
      duration: data.duration || 0,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      width: data.width || 640,
      height: data.height || 360
    });
    
  } catch (error) {
    console.error('Vimeo API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}