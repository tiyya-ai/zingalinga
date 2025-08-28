// Vimeo utilities for handling private videos and thumbnails

export interface VimeoVideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  embedUrl: string;
  isPrivate: boolean;
}

// Extract Vimeo video ID from various URL formats
export function extractVimeoId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/video\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Get Vimeo thumbnail for private videos using oEmbed API
export async function getVimeoThumbnail(videoUrl: string): Promise<string | null> {
  try {
    const videoId = extractVimeoId(videoUrl);
    if (!videoId) return null;
    
    // Use Vimeo oEmbed API which works for private videos
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}&width=640&height=360`;
    
    const response = await fetch(oembedUrl);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.thumbnail_url || null;
  } catch (error) {
    console.error('Failed to get Vimeo thumbnail:', error);
    return null;
  }
}

// Get Vimeo video info including thumbnail for private videos
export async function getVimeoVideoInfo(videoUrl: string): Promise<VimeoVideoInfo | null> {
  try {
    const videoId = extractVimeoId(videoUrl);
    if (!videoId) return null;
    
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`;
    
    const response = await fetch(oembedUrl);
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      id: videoId,
      title: data.title || 'Vimeo Video',
      thumbnail: data.thumbnail_url || '',
      duration: data.duration || 0,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      isPrivate: data.is_plus || false
    };
  } catch (error) {
    console.error('Failed to get Vimeo video info:', error);
    return null;
  }
}

// Convert Vimeo URL to embed format
export function getVimeoEmbedUrl(videoUrl: string): string {
  const videoId = extractVimeoId(videoUrl);
  if (!videoId) return videoUrl;
  
  return `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;
}

// Check if URL is a Vimeo video
export function isVimeoUrl(url: string): boolean {
  return /vimeo\.com/.test(url);
}