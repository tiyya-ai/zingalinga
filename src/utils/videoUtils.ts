// Extract YouTube video ID from URL
export const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Get YouTube thumbnail URL
export const getYouTubeThumbnail = (videoUrl: string): string | null => {
  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) return null;
  
  // Return high quality thumbnail
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Get video thumbnail - custom or YouTube
export const getVideoThumbnail = (videoUrl: string, customThumbnail?: string): string => {
  // If custom thumbnail is provided, use it
  if (customThumbnail && customThumbnail.trim() !== '') {
    return customThumbnail;
  }
  
  // Try to get YouTube thumbnail
  const youtubeThumbnail = getYouTubeThumbnail(videoUrl);
  if (youtubeThumbnail) {
    return youtubeThumbnail;
  }
  
  // Default fallback
  return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop';
};