// Image utility functions for video admin
export const imageUtils = {
  // Validate if URL is a valid image
  isValidImageUrl: (url: string): boolean => {
    if (!url) return false;
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    
    // Check for direct image extensions
    const hasImageExtension = imageExtensions.some(ext => lowerUrl.includes(ext));
    
    // Check for common image hosting patterns
    const imageHosts = [
      'imgur.com',
      'cloudinary.com',
      'amazonaws.com',
      'googleusercontent.com',
      'unsplash.com',
      'pexels.com'
    ];
    
    const isImageHost = imageHosts.some(host => lowerUrl.includes(host));
    
    return hasImageExtension || isImageHost;
  },

  // Create a fallback image URL
  getFallbackImage: (): string => {
    return '/zinga-linga-logo.png';
  },

  // Validate uploaded file
  validateImageFile: (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please upload a valid image file (JPG, PNG, GIF, or WebP)'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image file size must be less than 10MB'
      };
    }

    return { valid: true };
  },

  // Create object URL with cleanup
  createPreviewUrl: (file: File): string => {
    return URL.createObjectURL(file);
  },

  // Cleanup object URL
  revokePreviewUrl: (url: string): void => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
};