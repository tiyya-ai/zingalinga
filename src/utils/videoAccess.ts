import { User, Module, Purchase } from '../types';

export interface VideoAccessResult {
  hasAccess: boolean;
  reason?: string;
  requiresPurchase?: boolean;
  isDemo?: boolean;
}

/**
 * Determines if a user has access to a specific video/module
 * STRICT ACCESS CONTROL: Users can only watch videos they have purchased or free content
 */
export function checkVideoAccess(
  user: User | null,
  module: Module,
  purchases: Purchase[]
): VideoAccessResult {
  console.log('🔍 Checking video access for:', {
    user: user?.name,
    userRole: user?.role,
    module: module.title,
    modulePrice: module.price,
    moduleIsDemo: module.isDemo
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

  // Check if user has purchased this module
  const hasPurchased = purchases.some(purchase => 
    purchase.userId === user.id && 
    (purchase.moduleId === module.id || purchase.moduleIds?.includes(module.id)) &&
    purchase.status === 'completed'
  );

  console.log('💰 Purchase check:', { hasPurchased, purchases: purchases.length });

  if (hasPurchased) {
    console.log('✅ User has purchased this module');
    return { hasAccess: true, reason: 'Purchased' };
  }

  // Check if user has the module in their purchased modules list
  if (user.purchasedModules?.includes(module.id)) {
    console.log('✅ Module in user purchased list');
    return { hasAccess: true, reason: 'In purchased modules' };
  }

  // Check if it's a free module (price is 0)
  if (module.price === 0) {
    console.log('✅ Free content access granted');
    return { hasAccess: true, reason: 'Free content' };
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
 * Gets the video URL based on access level
 */
export function getVideoUrl(module: Module, hasAccess: boolean): string {
  console.log('🎥 getVideoUrl called with:', {
    moduleId: module.id,
    moduleTitle: module.title,
    hasAccess,
    videoUrl: module.videoUrl,
    videoSource: module.videoSource,
    demoVideo: module.demoVideo
  });

  if (hasAccess) {
    // Return full video URL if user has access
    // Try multiple possible video URL fields
    const url = module.videoUrl || 
                module.videoSource || 
                module.demoVideo || 
                '';
    console.log('🎬 Returning full access URL:', url);
    return url;
  } else {
    // Return demo/preview URL if available, otherwise empty
    const url = module.demoVideo || '';
    console.log('🎭 Returning demo URL:', url);
    return url;
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