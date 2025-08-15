/**
 * Google Drive URL utilities for converting preview links to direct video URLs
 */

export interface GoogleDriveUrlResult {
  directUrl: string;
  fileId: string;
  startTime?: number;
  isGoogleDrive: boolean;
}

/**
 * Converts Google Drive preview URLs to direct video URLs without UI
 * Supports various Google Drive URL formats and preserves timestamps
 */
export function convertGoogleDriveUrl(url: string): GoogleDriveUrlResult {
  if (!url || !url.includes('drive.google.com')) {
    return {
      directUrl: url,
      fileId: '',
      isGoogleDrive: false
    };
  }

  // Extract file ID from various Google Drive URL formats
  const fileIdPatterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
    /docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  ];

  let fileId = '';
  for (const pattern of fileIdPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      fileId = match[1];
      break;
    }
  }

  if (!fileId) {
    return {
      directUrl: url,
      fileId: '',
      isGoogleDrive: true
    };
  }

  // Extract timestamp if present (t=2 means start at 2 seconds)
  let startTime: number | undefined;
  const timeMatch = url.match(/[?&]t=(\d+)/);
  if (timeMatch && timeMatch[1]) {
    startTime = parseInt(timeMatch[1]);
  }

  // Create direct download URL
  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  return {
    directUrl,
    fileId,
    startTime,
    isGoogleDrive: true
  };
}

/**
 * Creates a clean Google Drive embed URL for iframe usage
 */
export function getGoogleDriveEmbedUrl(url: string): string {
  const result = convertGoogleDriveUrl(url);
  
  if (!result.isGoogleDrive || !result.fileId) {
    return url;
  }

  return `https://drive.google.com/file/d/${result.fileId}/preview`;
}

/**
 * Checks if a URL is a Google Drive link
 */
export function isGoogleDriveUrl(url: string): boolean {
  return Boolean(url) && (
    url.includes('drive.google.com') || 
    url.includes('docs.google.com')
  );
}