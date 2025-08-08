import { User, Module, Purchase } from '../types';
import { purchaseManager } from './purchaseManager';

export interface VideoAccessResult {
  hasAccess: boolean;
  reason?: string;
  requiresPurchase?: boolean;
  isDemo?: boolean;
}

/**
 * Determines if a user has access to a specific video/module
 * ENHANCED ACCESS CONTROL: Checks multiple sources for purchase verification
 */
export async function checkVideoAccess(
  user: User | null,
  module: Module,
  purchases: Purchase[] = []
): Promise<VideoAccessResult> {
  console.log('🔍 Checking video access for:', {
    user: user?.name,
    userRole: user?.role,
    module: module.title,
    modulePrice: module.price
  });

  // Admin users have access to everything
  if (user?.role === 'admin') {
    console.log('✅ Admin access granted');
    return { hasAccess: true, reason: 'Admin access' };
  }

  // If no user is logged in, no access
  if (!user) {
    console.log('❌ No user logged in');
    return { 
      hasAccess: false, 
      reason: 'User not logged in',
      requiresPurchase: true 
    };
  }

  // Check if it's a free module (price is 0 or undefined)
  if (!module.price || module.price === 0) {
    console.log('✅ Free content access granted');
    return { hasAccess: true, reason: 'Free content' };
  }

  // Check multiple sources for purchase verification
  try {
    // 1. Check purchase manager (most reliable)
    const hasPurchasedViaManager = await purchaseManager.hasPurchased(user.id, module.id);
    if (hasPurchasedViaManager) {
      console.log('✅ Purchase verified via purchase manager');
      return { hasAccess: true, reason: 'Purchased (verified)' };
    }

    // 2. Check provided purchases array
    const hasPurchasedInArray = purchases && purchases.length > 0 ? purchases.some(purchase => 
      purchase.userId === user.id && 
      (purchase.moduleId === module.id || purchase.moduleIds?.includes(module.id)) &&
      purchase.status === 'completed'
    ) : false;

    if (hasPurchasedInArray) {
      console.log('✅ Purchase found in purchases array');
      return { hasAccess: true, reason: 'Purchased' };
    }

    // 3. Check user's purchased modules list
    if (user.purchasedModules?.includes(module.id)) {
      console.log('✅ Module in user purchased list');
      return { hasAccess: true, reason: 'In purchased modules' };
    }

    // 4. Check localStorage as fallback
    const localPurchases = JSON.parse(localStorage.getItem(`user_purchases_${user.id}`) || '[]');
    const hasLocalPurchase = localPurchases.some((p: Purchase) => 
      p.moduleId === module.id && p.status === 'completed'
    );

    if (hasLocalPurchase) {
      console.log('✅ Purchase found in localStorage');
      return { hasAccess: true, reason: 'Purchased (local)' };
    }

  } catch (error) {
    console.error('Error checking purchase status:', error);
  }

  // For paid content, users must purchase to access
  console.log('❌ Access denied - purchase required');
  return { 
    hasAccess: false, 
    reason: 'Purchase required - $' + module.price,
    requiresPurchase: true 
  };
}

/**
 * Synchronous version for backward compatibility
 */
export function checkVideoAccessSync(
  user: User | null,
  module: Module,
  purchases: Purchase[] = []
): VideoAccessResult {
  // Admin users have access to everything
  if (user?.role === 'admin') {
    return { hasAccess: true, reason: 'Admin access' };
  }

  // If no user is logged in, no access
  if (!user) {
    return { 
      hasAccess: false, 
      reason: 'User not logged in',
      requiresPurchase: true 
    };
  }

  // Check if it's a free module
  if (!module.price || module.price === 0) {
    return { hasAccess: true, reason: 'Free content' };
  }

  // Check purchases array
  const hasPurchased = purchases.some(purchase => 
    purchase.userId === user.id && 
    (purchase.moduleId === module.id || purchase.moduleIds?.includes(module.id)) &&
    purchase.status === 'completed'
  );

  if (hasPurchased) {
    return { hasAccess: true, reason: 'Purchased' };
  }

  // Check user's purchased modules list
  if (user.purchasedModules?.includes(module.id)) {
    return { hasAccess: true, reason: 'In purchased modules' };
  }

  // Check localStorage
  try {
    const localPurchases = JSON.parse(localStorage.getItem(`user_purchases_${user.id}`) || '[]');
    const hasLocalPurchase = localPurchases.some((p: Purchase) => 
      p.moduleId === module.id && p.status === 'completed'
    );

    if (hasLocalPurchase) {
      return { hasAccess: true, reason: 'Purchased (local)' };
    }
  } catch (error) {
    console.error('Error checking localStorage purchases:', error);
  }

  return { 
    hasAccess: false, 
    reason: 'Purchase required - $' + module.price,
    requiresPurchase: true 
  };
}

/**
 * Gets the video URL based on access level with enhanced validation
 */
export function getVideoUrl(module: Module, hasAccess: boolean): string {
  console.log('🎥 getVideoUrl called with:', {
    moduleId: module.id,
    moduleTitle: module.title,
    hasAccess,
    videoUrl: module.videoUrl,
    demoVideo: module.demoVideo
  });

  if (hasAccess) {
    // Return full video URL if user has access
    // Try multiple possible video URL fields with validation
    const possibleUrls = [
      module.videoUrl,
      module.demoVideo
    ].filter(Boolean); // Remove empty/null values

    // Find the first valid URL
    for (const url of possibleUrls) {
      if (url && isValidVideoUrl(url)) {
        console.log('🎬 Returning validated full access URL:', url);
        return url;
      }
    }

    // If no valid URL found, return the first available one
    const fallbackUrl = possibleUrls[0] || '';
    console.log('🎬 Returning fallback URL:', fallbackUrl);
    return fallbackUrl;
  } else {
    // Return demo/preview URL if available and valid
    const demoUrl = module.demoVideo || '';
    if (demoUrl && isValidVideoUrl(demoUrl)) {
      console.log('🎭 Returning validated demo URL:', demoUrl);
      return demoUrl;
    }
    
    console.log('🎭 No valid demo URL available');
    return demoUrl; // Return even if invalid, let player handle the error
  }
}

/**
 * Validates if a URL is likely to be a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    // Check if it's a valid URL
    new URL(url);
    
    // Check for common video formats
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv'];
    const hasVideoExtension = videoExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );
    
    // Check for common video hosting platforms
    const videoHosts = [
      'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 
      'twitch.tv', 'wistia.com', 'brightcove.com', 'jwplayer.com',
      'commondatastorage.googleapis.com' // Google Cloud Storage
    ];
    const isVideoHost = videoHosts.some(host => 
      url.toLowerCase().includes(host)
    );
    
    // Check for streaming indicators
    const streamingIndicators = ['video', 'stream', 'media', 'content'];
    const hasStreamingIndicator = streamingIndicators.some(indicator => 
      url.toLowerCase().includes(indicator)
    );
    
    return hasVideoExtension || isVideoHost || hasStreamingIndicator;
  } catch (error) {
    console.warn('Invalid URL format:', url);
    return false;
  }
}

/**
 * Checks if user can access admin video features
 */
export function checkAdminVideoAccess(user: User | null): boolean {
  return user?.role === 'admin';
}

/**
 * Gets user's purchased modules
 */
export function getUserPurchasedModules(
  user: User | null,
  modules: Module[],
  purchases: Purchase[]
): Module[] {
  if (!user) return [];

  const purchasedModuleIds = new Set<string>();

  // Add from user's purchased modules list
  user.purchasedModules?.forEach(id => purchasedModuleIds.add(id));

  // Add from purchase records
  if (purchases && purchases.length > 0) {
    purchases
      .filter(purchase => purchase.userId === user.id && purchase.status === 'completed')
      .forEach(purchase => {
        if (purchase.moduleId) {
          purchasedModuleIds.add(purchase.moduleId);
        }
        if (purchase.moduleIds) {
          purchase.moduleIds.forEach(id => purchasedModuleIds.add(id));
        }
      });
  }

  const purchased = modules.filter(module => purchasedModuleIds.has(module.id));
  console.log('📚 User purchased modules:', purchased.map(m => m.title));
  return purchased;
}

/**
 * Gets user's available (not purchased) modules
 */
export function getUserAvailableModules(
  user: User | null,
  modules: Module[],
  purchases: Purchase[]
): Module[] {
  if (!user) return modules;

  const purchasedModules = getUserPurchasedModules(user, modules, purchases);
  const purchasedIds = new Set(purchasedModules.map(m => m.id));

  const available = modules.filter(module => !purchasedIds.has(module.id));
  console.log('🛒 User available modules:', available.map(m => m.title));
  return available;
}