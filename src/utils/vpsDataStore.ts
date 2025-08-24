// File-based Data Store
import { User, Module, Purchase, ContentFile } from '../types';
// Removed defaultModules import to prevent fallback to hardcoded videos

interface UploadQueueItem {
  id: string;
  fileName: string;
  title: string;
  size: string;
  status: 'uploading' | 'processing' | 'encoding' | 'completed' | 'failed';
  progress: number;
  uploadedAt: string;
  duration?: string;
  errorMessage?: string;
  formData?: FormData | Record<string, unknown>;
}

interface AppSettings {
  siteName: string;
  defaultLanguage: string;
  timezone: string;
  features: {
    userRegistration: boolean;
    videoComments: boolean;
    videoDownloads: boolean;
    socialSharing: boolean;
  };
  dataSource: 'real' | 'sample';
  apiEndpoint?: string;
  enableRealTimeSync: boolean;
  platformLogo?: string | null;
  logoUpdatedAt?: string;
}

interface AppData {
  users: User[];
  modules: Module[];
  purchases: Purchase[];
  contentFiles: ContentFile[];
  uploadQueue: UploadQueueItem[];
  settings?: AppSettings;
  savedVideos?: any[];
  categories?: string[];
  comments?: any[];
  subscriptions?: any[];
  transactions?: any[];
  notifications?: any[];
  scheduledContent?: any[];
  flaggedContent?: any[];
  accessLogs?: any[];
  packages?: any[];
  bundles?: any[];
  ageGroups?: any[];
  lastUpdated?: string;
  lastLoaded?: string;
}

class VPSDataStore {
  private currentUser: User | null = null;
  private storageKey = 'zinga-linga-app-data';
  private memoryData: AppData | null = null;
  private videoMemoryCache: Map<string, string> | null = null;

  constructor() {
    // File-based data store initialized
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  clearMemoryCache() {
    this.memoryData = null;
    console.log('🧹 Memory cache cleared');
  }

  // Get default data structure
  private getDefaultData(): AppData {
    return {
      users: [
        {
          id: 'user_001',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user' as 'user' | 'admin',
          purchasedModules: [],
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      ],
      modules: [],
      purchases: [],
      contentFiles: [],
      uploadQueue: [],
      savedVideos: [],
      categories: ['Audio Lessons', 'PP1 Program', 'PP2 Program'],
      comments: [],
      subscriptions: [],
      transactions: [],
      notifications: [],
      scheduledContent: [],
      flaggedContent: [],
      accessLogs: [],
      packages: this.getDefaultPackages(), // Initialize with default packages
      bundles: [], // Initialize empty bundles array
      ageGroups: [], // Initialize empty age groups array
      settings: this.getDefaultSettings(),
      lastUpdated: new Date().toISOString(),
      lastLoaded: new Date().toISOString()
    };
  }

  // Get default packages
  getDefaultPackages(): any[] {
    return [
      {
        id: 'explorer-pack',
        name: 'Explorer Pack',
        description: 'Where Letters Come to Life!',
        price: 30,
        type: 'subscription',
        isActive: true,
        isPopular: false,
        icon: '🎒',
        features: [
          'Letter Safari with playful letter recognition games',
          'Magic Word Builder to create fun words like a word wizard!',
          'Phonics party - sing along to catchy letter sounds',
          'Storytime with exciting tales role plays for children',
          '15 Learning Quests - colorful lessons that feel like playtime'
        ],
        contentIds: [],
        ageGroups: ['3-6'],
        billingCycle: 'yearly',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'adventurer-pack',
        name: 'Adventurer Pack',
        description: 'Reading Superpowers Unlocked!',
        price: 45,
        type: 'subscription',
        isActive: true,
        isPopular: true,
        icon: '🚀',
        features: [
          'Everything in Explorer Pack PLUS:',
          'Word Architect: Build bigger, cooler words!',
          '25 Learning Quests with more stories, more adventures',
          '25 Gold Star Challenges to earn rewards after each lesson'
        ],
        contentIds: [],
        ageGroups: ['3-6'],
        billingCycle: 'yearly',
        upgradeFrom: 'explorer-pack',
        upgradePrice: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'roadtripper-pack',
        name: 'Roadtripper Pack',
        description: 'Learning On-The-Go!',
        price: 80,
        type: 'one-time',
        isActive: false,
        isPopular: false,
        icon: '🚗',
        features: [
          '125 Audio adventures, perfect for car rides & travel',
          '125 Sing-along phonics - turn travel time into learning time',
          'Story podcasts with African tales that spark imagination'
        ],
        contentIds: [],
        ageGroups: ['3-6'],
        billingCycle: 'one-time',
        upgradeFrom: 'adventurer-pack',
        upgradePrice: 35,
        comingSoon: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'bookie-pack',
        name: 'Zingalinga Bookie Pack',
        description: 'Interactive Learning Device',
        price: 60,
        type: 'physical',
        isActive: true,
        isPopular: false,
        icon: '📚',
        features: [
          'Fully aligned PP1 and PP2 equivalent literacy product',
          'Learn through stories anywhere anytime',
          'Battery that lasts 8 hours when fully utilized',
          'Interactive screen with 20+ interactive lessons'
        ],
        contentIds: [],
        ageGroups: ['3-6'],
        billingCycle: 'one-time',
        isPhysical: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Get default settings
  getDefaultSettings(): AppSettings {
    return {
      siteName: 'Zinga Linga',
      defaultLanguage: 'en',
      timezone: 'UTC',
      features: {
        userRegistration: true,
        videoComments: true,
        videoDownloads: true,
        socialSharing: false
      },
      dataSource: 'real',
      apiEndpoint: '/api/data',
      enableRealTimeSync: true
    };
  }

  // Load data from API
  async loadData(forceRefresh = false): Promise<AppData> {
    try {
      // Return memory data if available and not forcing refresh
      if (this.memoryData && !forceRefresh) {
        return this.memoryData;
      }
      
      // Load from API
      const response = await fetch('/api/data');
      if (response.ok) {
        const data = await response.json();
        // Ensure all required arrays exist
        if (!data.packages || data.packages.length === 0) {
          data.packages = this.getDefaultPackages();
        }
        if (!data.categories) {
          data.categories = ['Audio Lessons', 'PP1 Program', 'PP2 Program'];
        }
        if (!data.savedVideos) {
          data.savedVideos = [];
        }
        if (!data.ageGroups) {
          data.ageGroups = [];
        }
        this.memoryData = data;
        console.log('✅ Data loaded from API with', data.packages?.length || 0, 'packages');
        return data;
      }
    } catch (error) {
      console.error('❌ API load failed:', error);
    }
    
    // Skip localStorage fallback to avoid quota issues
    console.log('⚠️ API failed, using default data (localStorage skipped)');
    
    const defaultData = this.getDefaultData();
    this.memoryData = defaultData;
    return defaultData;
  }

  // Save data to API
  async saveData(data: AppData): Promise<boolean> {
    try {
      // Always save to memory first
      this.memoryData = {
        ...data,
        lastUpdated: new Date().toISOString()
      };

      // Calculate data size for logging
      const dataSize = JSON.stringify(this.memoryData).length;
      console.log(`📊 Data size: ${(dataSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`📊 Total modules: ${data.modules?.length || 0}`);

      // Save to API first
      try {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.memoryData)
        });
        
        if (response.ok) {
          console.log('✅ Data saved to API successfully');
          return true;
        } else {
          const errorText = await response.text();
          console.error('❌ API save failed:', errorText);
          
          // If API save fails due to size, try with reduced data
          if (errorText.includes('too large') || errorText.includes('limit') || response.status === 413) {
            console.log('🔄 Attempting to save with reduced media data...');
            const reducedData = {
              ...this.memoryData,
              modules: this.memoryData.modules?.map(module => ({
                ...module,
                videoUrl: module.videoUrl?.startsWith('data:') ? '[Large video data removed]' : module.videoUrl,
                thumbnail: module.thumbnail?.length > 50000 ? '[Large thumbnail removed]' : module.thumbnail,
                audioUrl: module.audioUrl?.startsWith('data:') ? '[Large audio data removed]' : module.audioUrl
              }))
            };
            
            const reducedResponse = await fetch('/api/data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(reducedData)
            });
            
            if (reducedResponse.ok) {
              console.log('✅ Reduced data saved to API successfully');
              return true;
            }
          }
          
          return false;
        }
      } catch (apiError) {
        console.error('❌ API save error:', apiError);
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to save data:', error);
      return false;
    }
  }

  // Settings management methods
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await this.loadData();
      return data.settings || this.getDefaultSettings();
    } catch (error) {

      return this.getDefaultSettings();
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.settings = { ...this.getDefaultSettings(), ...data.settings, ...settings };
      return await this.saveData(data);
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }

  // Product management methods
  async getProducts(): Promise<any[]> {
    try {
      const data = await this.loadData();
      return data.modules || [];
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async addProduct(product: any): Promise<boolean> {
    try {
      console.log('🎬 Adding product:', { title: product.title, videoUrl: product.videoUrl?.substring(0, 50), thumbnail: product.thumbnail?.substring(0, 50) });
      const data = await this.loadData();
      
      const newProduct = {
        ...product,
        id: product.id || `video_${Date.now()}`,
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: product.isActive !== undefined ? product.isActive : true,
        isVisible: product.isVisible !== undefined ? product.isVisible : true,
        rating: product.rating || 0,
        totalRatings: product.totalRatings || 0,
        features: product.features || [],
        fullContent: product.fullContent || [],
        difficulty: product.difficulty || 'beginner',
        tags: product.tags || [],
        // Ensure media URLs are preserved
        videoUrl: product.videoUrl || '',
        thumbnail: product.thumbnail || '',
        audioUrl: product.audioUrl || ''
      };
      
      data.modules = data.modules || [];
      
      // Check if adding this product would exceed reasonable limits
      const currentVideoCount = data.modules.length;
      console.log(`📊 Current video count: ${currentVideoCount}`);
      
      // Remove any artificial limits - allow unlimited videos
      data.modules.push(newProduct);
      
      console.log('💾 Saving product to data store...');
      const success = await this.saveData(data);
      console.log(success ? '✅ Product saved successfully' : '❌ Product save failed');
      
      if (!success) {
        console.log('🔄 Attempting to save with reduced data size...');
        // If save fails, try with smaller data
        const lightProduct = {
          ...newProduct,
          videoUrl: newProduct.videoUrl?.startsWith('data:') ? '' : newProduct.videoUrl,
          thumbnail: newProduct.thumbnail?.length > 50000 ? '' : newProduct.thumbnail,
          audioUrl: newProduct.audioUrl?.startsWith('data:') ? '' : newProduct.audioUrl,
          originalSize: newProduct.videoUrl?.length || 0
        };
        
        // Replace the last added product with the light version
        data.modules[data.modules.length - 1] = lightProduct;
        const lightSuccess = await this.saveData(data);
        console.log(lightSuccess ? '✅ Light product saved successfully' : '❌ Light product save failed');
        return lightSuccess;
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error adding product:', error);
      return false;
    }
  }

  async updateProduct(updatedProduct: any): Promise<boolean> {
    try {
      console.log('🔄 Updating product:', { id: updatedProduct.id, title: updatedProduct.title, videoUrl: updatedProduct.videoUrl?.substring(0, 50) });
      const data = await this.loadData();
      data.modules = data.modules || [];
      const index = data.modules.findIndex(p => p.id === updatedProduct.id);
      if (index !== -1) {
        const originalProduct = data.modules[index];
        data.modules[index] = {
          ...originalProduct,
          ...updatedProduct,
          updatedAt: new Date().toISOString(),
          // Preserve media URLs if they exist
          videoUrl: updatedProduct.videoUrl || originalProduct.videoUrl || '',
          thumbnail: updatedProduct.thumbnail || originalProduct.thumbnail || '',
          audioUrl: updatedProduct.audioUrl || originalProduct.audioUrl || ''
        };
        console.log('💾 Saving updated product...');
        const success = await this.saveData(data);
        console.log(success ? '✅ Product updated successfully' : '❌ Product update failed');
        return success;
      }
      console.log('🔄 Product not found, adding as new product');
      return await this.addProduct(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {

      
      const data = await this.loadData();
      data.modules = data.modules || [];
      const originalLength = data.modules.length;
      data.modules = data.modules.filter(p => p.id !== productId);
      
      if (data.modules.length < originalLength) {
        const success = await this.saveData(data);

        return success;
      } else {

        return false;
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  async getUsers(): Promise<any[]> {
    try {
      const data = await this.loadData();
      return data.users || [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Order management methods
  async getOrders(): Promise<any[]> {
    try {
      const data = await this.loadData();
      return data.purchases || [];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.purchases = data.purchases || [];
      const index = data.purchases.findIndex(o => o.id === orderId);
      if (index !== -1) {
        data.purchases[index].status = status as 'pending' | 'completed' | 'failed' | 'refunded';
        if (status === 'completed') {
          data.purchases[index].completedAt = new Date().toISOString();
        }
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.purchases = data.purchases || [];
      const originalLength = data.purchases.length;
      data.purchases = data.purchases.filter(o => o.id !== orderId);
      
      if (data.purchases.length < originalLength) {
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  // User management methods
  async addUser(user: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      
      // Check if user already exists
      const existingUser = data.users?.find(u => u.email === user.email);
      if (existingUser) {

        return false;
      }
      
      const newUser = {
        ...user,
        id: user.id || `user_${Date.now()}`,
        createdAt: user.createdAt || new Date().toISOString(),
        purchasedModules: user.purchasedModules || [],
        totalSpent: user.totalSpent || 0,
        isActive: true
      };
      
      data.users = data.users || [];
      data.users.push(newUser);
      
      const success = await this.saveData(data);

      return success;
    } catch (error) {
      console.error('Error adding user:', error);
      return false;
    }
  }

  async updateUser(userId: string, updatedUser: any): Promise<boolean> {
    try {
      console.log('updateUser called with:', { userId, updatedUser });
      const data = await this.loadData();
      data.users = data.users || [];
      console.log('Current users:', data.users.map(u => ({ id: u.id, name: u.name })));
      
      const index = data.users.findIndex(u => u.id === userId);
      console.log('User index found:', index);
      
      if (index !== -1) {
        const oldUser = data.users[index];
        data.users[index] = { ...oldUser, ...updatedUser };
        console.log('Updated user:', data.users[index]);
        
        const saveResult = await this.saveData(data);
        console.log('Save result:', saveResult);
        return saveResult;
      } else {
        // Create user if not found
        console.log('User not found, creating new user with ID:', userId);
        const staticDate = '2025-01-20T10:00:00.000Z';
        const newUser = {
          id: userId,
          email: updatedUser.email || 'user@example.com',
          name: updatedUser.name || 'User',
          role: 'user',
          purchasedModules: [],
          totalSpent: 0,
          createdAt: staticDate,
          lastLogin: staticDate,
          ...updatedUser
        };
        data.users.push(newUser);
        console.log('Created new user:', newUser);
        
        const saveResult = await this.saveData(data);
        console.log('Save result:', saveResult);
        return saveResult;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.users = data.users || [];
      data.users = data.users.filter(u => u.id !== userId);
      return await this.saveData(data);
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.users = data.users || [];
      const index = data.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        // Password field not available in User interface
        // data.users[index].password = newPassword;
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Error changing user password:', error);
      return false;
    }
  }

  async getUserData(userId: string): Promise<any> {
    try {
      const data = await this.loadData();
      const user = data.users?.find(u => u.id === userId);
      if (user) {
        // Watch history not available in User interface
        // if (!user.watchHistory) {
        //   const availableVideos = data.modules || [];
        //   if (availableVideos.length > 0) {
        //     user.watchHistory = availableVideos.slice(0, 3).map((video, index) => ({
        //       id: video.id,
        //       title: video.title,
        //       thumbnail: video.thumbnail || '/placeholder-video.jpg',
        //       progress: [65, 30, 85][index] || 50,
        //       duration: video.estimatedDuration || video.duration || '15:00',
        //       lastWatched: new Date(Date.now() - (86400000 * (index + 1))).toISOString()
        //     }));
        //   } else {
        //     user.watchHistory = [];
        //   }
        // }
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.users = data.users || [];
      const index = data.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        data.users[index] = { ...data.users[index], ...preferences };
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }

  async clearUserWatchHistory(userId: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.users = data.users || [];
      const index = data.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        // Watch history not available in User interface
        // delete data.users[index].watchHistory;
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Error clearing user watch history:', error);
      return false;
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    try {
      const data = await this.loadData();
      const user = data.users?.find(u => u.id === userId);
      if (user) {
        return {
          profileImage: user.profileImage || null,
          referralCode: this.generateReferralCode(userId),
          points: 0,
          referredUsers: [],
          totalReferrals: 0,
          theme: null,
          avatar: user.avatar || null
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, profileData: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.users = data.users || [];
      const index = data.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        data.users[index] = { 
          ...data.users[index], 
          ...profileData
        };
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  private generateReferralCode(userId: string): string {
    return `REF${userId.slice(0, 4).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  // Upload Queue management methods
  async getUploadQueue(): Promise<UploadQueueItem[]> {
    try {
      const data = await this.loadData();
      const queue = data.uploadQueue || [];
      
      // Restore video data from memory cache for items that have it
      const restoredQueue = queue.map(item => {
        if ((item as any).hasLargeVideo && (item as any).videoStorageType === 'memory') {
          const videoData = this.videoMemoryCache?.get(item.id);
          if (videoData) {
            return {
              ...item,
              localUrl: videoData
            };
          }
        }
        return item;
      });
      
      return restoredQueue;
    } catch (error) {
      console.error('Error getting upload queue:', error);
      return [];
    }
  }

  async addToUploadQueue(uploadItem: UploadQueueItem): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.uploadQueue = data.uploadQueue || [];
      
      // Handle large video data separately to avoid localStorage quota issues
      const processedItem = { ...uploadItem };
      
      // If the item contains large base64 video data, store it separately
      if ((uploadItem.formData as any)?.videoFile || (uploadItem as any).localUrl?.startsWith('data:video/')) {
        const videoData = (uploadItem as any).localUrl || '';
        
        // Only store video metadata in the main queue, not the actual video data
        if (videoData.length > 100000) { // If larger than 100KB
          console.log('🔄 Large video detected, using memory-only storage to avoid localStorage quota');
          
          // Store only metadata in localStorage
          delete (processedItem as any).localUrl;
          if (processedItem.formData && typeof processedItem.formData === 'object') {
            delete (processedItem.formData as any).videoFile;
          }
          
          // Add a flag to indicate video is stored in memory
          (processedItem as any).hasLargeVideo = true;
          (processedItem as any).videoStorageType = 'memory';
          
          // Store the actual video data in a separate memory cache
          if (!this.videoMemoryCache) {
            this.videoMemoryCache = new Map();
          }
          this.videoMemoryCache.set(uploadItem.id, videoData);
          
          console.log('✅ Video stored in memory cache, metadata saved to localStorage');
        }
      }
      
      data.uploadQueue.unshift(processedItem);
      return await this.saveData(data);
    } catch (error) {
      console.error('Error adding to upload queue:', error);
      return false;
    }
  }

  async updateUploadQueueItem(uploadId: string, updates: Partial<UploadQueueItem>): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.uploadQueue = data.uploadQueue || [];
      const index = data.uploadQueue.findIndex(item => item.id === uploadId);
      if (index !== -1) {
        data.uploadQueue[index] = { ...data.uploadQueue[index], ...updates };
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Error updating upload queue item:', error);
      return false;
    }
  }

  async removeFromUploadQueue(uploadId: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.uploadQueue = data.uploadQueue || [];
      
      // Clean up video memory cache if item exists
      if (this.videoMemoryCache?.has(uploadId)) {
        this.videoMemoryCache.delete(uploadId);
        console.log('🗑️ Removed video from memory cache:', uploadId);
      }
      
      data.uploadQueue = data.uploadQueue.filter(item => item.id !== uploadId);
      return await this.saveData(data);
    } catch (error) {
      console.error('Error removing from upload queue:', error);
      return false;
    }
  }

  async clearCompletedUploads(): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.uploadQueue = data.uploadQueue || [];
      
      // Clean up video memory cache for completed items
      const completedItems = data.uploadQueue.filter(item => item.status === 'completed');
      completedItems.forEach(item => {
        if (this.videoMemoryCache?.has(item.id)) {
          this.videoMemoryCache.delete(item.id);
          console.log('🗑️ Removed completed video from memory cache:', item.id);
        }
      });
      
      data.uploadQueue = data.uploadQueue.filter(item => item.status !== 'completed');
      return await this.saveData(data);
    } catch (error) {
      console.error('Error clearing completed uploads:', error);
      return false;
    }
  }

  // Package management methods
  async getPackages(): Promise<any[]> {
    try {
      const data = await this.loadData();
      return data.packages || this.getDefaultPackages();
    } catch (error) {
      console.error('Error getting packages:', error);
      return this.getDefaultPackages();
    }
  }



  // Categories management
  async getCategories(): Promise<string[]> {
    const data = await this.loadData();
    return data.categories || ['Audio Lessons', 'PP1 Program', 'PP2 Program'];
  }

  async addCategory(category: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.categories = data.categories || [];
      if (!data.categories.includes(category)) {
        data.categories.push(category);
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Error adding category:', error);
      return false;
    }
  }

  async updateCategory(oldCategory: string, newCategory: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.categories = data.categories || [];
      
      // Check if new category already exists
      if (data.categories.includes(newCategory)) {
        return false;
      }
      
      // Update category name
      const index = data.categories.indexOf(oldCategory);
      if (index !== -1) {
        data.categories[index] = newCategory;
        
        // Update all videos that use this category
        data.modules = data.modules?.map(module => 
          module.category === oldCategory 
            ? { ...module, category: newCategory }
            : module
        ) || [];
        
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Error updating category:', error);
      return false;
    }
  }

  async deleteCategory(category: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.categories = data.categories || [];
      data.categories = data.categories.filter(c => c !== category);
      return await this.saveData(data);
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  // Comments management
  async getComments(): Promise<any[]> {
    const data = await this.loadData();
    return data.comments || [];
  }

  async addComment(comment: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.comments = data.comments || [];
      data.comments.push({ ...comment, id: `comment_${Date.now()}`, createdAt: new Date().toISOString() });
      return await this.saveData(data);
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  }

  async updateCommentStatus(commentId: string, status: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.comments = data.comments || [];
      const index = data.comments.findIndex(c => c.id === commentId);
      if (index !== -1) {
        data.comments[index].status = status;
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Error updating comment status:', error);
      return false;
    }
  }

  // Subscriptions management
  async getSubscriptions(): Promise<any[]> {
    const data = await this.loadData();
    return data.subscriptions || [];
  }

  async addSubscription(subscription: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.subscriptions = data.subscriptions || [];
      data.subscriptions.push({ ...subscription, id: `sub_${Date.now()}`, createdAt: new Date().toISOString() });
      return await this.saveData(data);
    } catch (error) {
      console.error('Error adding subscription:', error);
      return false;
    }
  }

  // Notifications management
  async getNotifications(): Promise<any[]> {
    const data = await this.loadData();
    return data.notifications || [];
  }

  async addNotification(notification: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.notifications = data.notifications || [];
      data.notifications.unshift({ ...notification, id: `notif_${Date.now()}`, createdAt: new Date().toISOString() });
      return await this.saveData(data);
    } catch (error) {
      console.error('Error adding notification:', error);
      return false;
    }
  }

  // Scheduled content management
  async getScheduledContent(): Promise<any[]> {
    const data = await this.loadData();
    return data.scheduledContent || [];
  }

  async addScheduledContent(content: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.scheduledContent = data.scheduledContent || [];
      data.scheduledContent.push({ ...content, id: `schedule_${Date.now()}`, createdAt: new Date().toISOString() });
      return await this.saveData(data);
    } catch (error) {
      console.error('Error adding scheduled content:', error);
      return false;
    }
  }

  async updateScheduledContent(scheduleId: string, updates: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.scheduledContent = data.scheduledContent || [];
      const index = data.scheduledContent.findIndex(s => s.id === scheduleId);
      if (index !== -1) {
        data.scheduledContent[index] = { ...data.scheduledContent[index], ...updates };
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Error updating scheduled content:', error);
      return false;
    }
  }

  // User-specific methods
  async getSavedVideos(userId: string): Promise<any[]> {
    const data = await this.loadData();
    return data.savedVideos?.filter(v => v.userId === userId) || [];
  }

  async addSavedVideo(userId: string, video: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.savedVideos = data.savedVideos || [];
      const savedVideo = { ...video, userId, savedAt: new Date().toISOString() };
      data.savedVideos.push(savedVideo);
      return await this.saveData(data);
    } catch (error) {
      console.error('Error adding saved video:', error);
      return false;
    }
  }

  async removeSavedVideo(userId: string, videoId: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.savedVideos = data.savedVideos || [];
      data.savedVideos = data.savedVideos.filter(v => !(v.userId === userId && v.id === videoId));
      return await this.saveData(data);
    } catch (error) {
      console.error('Error removing saved video:', error);
      return false;
    }
  }

  async addPurchase(purchase: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.purchases = data.purchases || [];
      data.purchases.push({ ...purchase, id: purchase.id || `purchase_${Date.now()}`, createdAt: new Date().toISOString() });
      return await this.saveData(data);
    } catch (error) {
      console.error('Error adding purchase:', error);
      return false;
    }
  }

  // Method to get video data from memory cache
  getVideoFromMemoryCache(uploadId: string): string | null {
    return this.videoMemoryCache?.get(uploadId) || null;
  }

  // Method to clear all video memory cache (useful for cleanup)
  clearVideoMemoryCache(): void {
    if (this.videoMemoryCache) {
      this.videoMemoryCache.clear();
      console.log('🧹 Video memory cache cleared');
    }
  }

  // Method to get memory cache size for debugging
  getMemoryCacheInfo(): { count: number; totalSize: number } {
    if (!this.videoMemoryCache) {
      return { count: 0, totalSize: 0 };
    }
    
    let totalSize = 0;
    this.videoMemoryCache.forEach(videoData => {
      totalSize += videoData.length;
    });
    
    return {
      count: this.videoMemoryCache.size,
      totalSize: Math.round(totalSize / (1024 * 1024)) // Size in MB
    };
  }



  async addPackage(packageData: any): Promise<boolean> {
    try {
      console.log('📦 Adding package:', packageData.name);
      const data = await this.loadData();
      
      // Check if package with same name already exists
      const existingPackage = data.packages?.find(p => p.name === packageData.name);
      if (existingPackage) {
        console.log('❌ Package with same name already exists');
        return false;
      }
      
      const newPackage = {
        ...packageData,
        id: packageData.id || `package_${Date.now()}`,
        createdAt: packageData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: packageData.isActive !== undefined ? packageData.isActive : true
      };
      
      data.packages = data.packages || [];
      data.packages.push(newPackage);
      
      console.log('💾 Saving package to data store...');
      const success = await this.saveData(data);
      console.log(success ? '✅ Package saved successfully' : '❌ Package save failed');
      return success;
    } catch (error) {
      console.error('❌ Error adding package:', error);
      return false;
    }
  }

  async updatePackage(updatedPackage: any): Promise<boolean> {
    try {
      console.log('🔄 Updating package:', updatedPackage.id);
      const data = await this.loadData();
      data.packages = data.packages || [];
      const index = data.packages.findIndex(p => p.id === updatedPackage.id);
      if (index !== -1) {
        data.packages[index] = {
          ...data.packages[index],
          ...updatedPackage,
          updatedAt: new Date().toISOString()
        };
        const success = await this.saveData(data);
        console.log(success ? '✅ Package updated successfully' : '❌ Package update failed');
        return success;
      }
      return false;
    } catch (error) {
      console.error('Error updating package:', error);
      return false;
    }
  }

  async deletePackage(packageId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting package:', packageId);
      const data = await this.loadData();
      data.packages = data.packages || [];
      const originalLength = data.packages.length;
      data.packages = data.packages.filter(p => p.id !== packageId);
      
      if (data.packages.length < originalLength) {
        const success = await this.saveData(data);
        console.log(success ? '✅ Package deleted successfully' : '❌ Package delete failed');
        return success;
      }
      console.log('❌ Package not found');
      return false;
    } catch (error) {
      console.error('Error deleting package:', error);
      return false;
    }
  }

  // Bundle management methods
  async getBundles(): Promise<any[]> {
    try {
      const data = await this.loadData();
      const bundles = data.bundles || [];
      console.log('📦 Retrieved bundles:', bundles.length);
      return bundles;
    } catch (error) {
      console.error('Error getting bundles:', error);
      return [];
    }
  }

  async addBundle(bundleData: any): Promise<boolean> {
    try {
      console.log('📦 Adding bundle:', bundleData.name);
      const data = await this.loadData();
      
      // Check if bundle with same name already exists
      const existingBundle = data.bundles?.find(b => b.name === bundleData.name);
      if (existingBundle) {
        console.log('❌ Bundle with same name already exists');
        return false;
      }
      
      const newBundle = {
        ...bundleData,
        id: bundleData.id || `bundle_${Date.now()}`,
        createdAt: bundleData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: bundleData.isActive !== undefined ? bundleData.isActive : true
      };
      
      data.bundles = data.bundles || [];
      data.bundles.push(newBundle);
      
      console.log('💾 Saving bundle to data store...');
      const success = await this.saveData(data);
      console.log(success ? '✅ Bundle saved successfully' : '❌ Bundle save failed');
      return success;
    } catch (error) {
      console.error('❌ Error adding bundle:', error);
      return false;
    }
  }

  async updateBundle(updatedBundle: any): Promise<boolean> {
    try {
      console.log('🔄 Updating bundle:', updatedBundle.id);
      const data = await this.loadData();
      data.bundles = data.bundles || [];
      const index = data.bundles.findIndex(b => b.id === updatedBundle.id);
      if (index !== -1) {
        data.bundles[index] = {
          ...data.bundles[index],
          ...updatedBundle,
          updatedAt: new Date().toISOString()
        };
        const success = await this.saveData(data);
        console.log(success ? '✅ Bundle updated successfully' : '❌ Bundle update failed');
        return success;
      }
      return false;
    } catch (error) {
      console.error('Error updating bundle:', error);
      return false;
    }
  }

  async deleteBundle(bundleId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting bundle:', bundleId);
      const data = await this.loadData();
      data.bundles = data.bundles || [];
      const originalLength = data.bundles.length;
      data.bundles = data.bundles.filter(b => b.id !== bundleId);
      
      if (data.bundles.length < originalLength) {
        const success = await this.saveData(data);
        console.log(success ? '✅ Bundle deleted successfully' : '❌ Bundle delete failed');
        return success;
      }
      console.log('❌ Bundle not found');
      return false;
    } catch (error) {
      console.error('Error deleting bundle:', error);
      return false;
    }
  }

  // Package upgrade method
  async upgradePackage(userId: string, fromPackageId: string, toPackageId: string): Promise<boolean> {
    try {
      console.log('🔄 Processing package upgrade:', { userId, fromPackageId, toPackageId });
      const data = await this.loadData();
      
      // Get the target package
      const toPackage = data.packages?.find(p => p.id === toPackageId);
      if (!toPackage) {
        console.log('❌ Target package not found');
        return false;
      }
      
      // Check if user has the from package
      const userPurchases = data.purchases?.filter(p => p.userId === userId && p.moduleId === fromPackageId) || [];
      if (userPurchases.length === 0) {
        console.log('❌ User does not have the required package for upgrade');
        return false;
      }
      
      // Calculate upgrade price
      const upgradePrice = toPackage.upgradePrice || (toPackage.price - (data.packages?.find(p => p.id === fromPackageId)?.price || 0));
      
      // Create upgrade purchase record
      const upgradePurchase = {
        id: `upgrade_${Date.now()}`,
        userId,
        moduleId: toPackageId,
        packageId: toPackageId,
        purchaseDate: new Date().toISOString(),
        amount: upgradePrice,
        status: 'completed' as const,
        type: 'upgrade' as const,
        upgradeFrom: fromPackageId
      };
      
      data.purchases = data.purchases || [];
      data.purchases.push(upgradePurchase);
      
      // Update user's purchased modules
      const user = data.users?.find(u => u.id === userId);
      if (user) {
        user.purchasedModules = user.purchasedModules || [];
        if (!user.purchasedModules.includes(toPackageId)) {
          user.purchasedModules.push(toPackageId);
        }
        user.totalSpent = (user.totalSpent || 0) + upgradePrice;
      }
      
      const success = await this.saveData(data);
      console.log(success ? '✅ Package upgrade completed' : '❌ Package upgrade failed');
      return success;
    } catch (error) {
      console.error('❌ Error upgrading package:', error);
      return false;
    }
  }

  // Check available upgrades for user
  async getAvailableUpgrades(userId: string): Promise<any[]> {
    try {
      const data = await this.loadData();
      const userPurchases = data.purchases?.filter(p => p.userId === userId) || [];
      const userPackages = userPurchases.map(p => p.moduleId);
      
      const availableUpgrades = [];
      
      for (const userPackageId of userPackages) {
        const upgradeOptions = data.packages?.filter(p => p.upgradeFrom === userPackageId && p.isActive) || [];
        for (const upgrade of upgradeOptions) {
          if (!userPackages.includes(upgrade.id)) {
            availableUpgrades.push({
              ...upgrade,
              fromPackage: data.packages?.find(p => p.id === userPackageId),
              upgradePrice: upgrade.upgradePrice || (upgrade.price - (data.packages?.find(p => p.id === userPackageId)?.price || 0))
            });
          }
        }
      }
      
      return availableUpgrades;
    } catch (error) {
      console.error('Error getting available upgrades:', error);
      return [];
    }
  }

  // Bundle purchase method
  async purchaseBundle(userId: string, bundleId: string): Promise<boolean> {
    try {
      console.log('🛒 Processing bundle purchase:', { userId, bundleId });
      const data = await this.loadData();
      
      // Get the bundle
      const bundle = data.bundles?.find(b => b.id === bundleId);
      if (!bundle) {
        console.log('❌ Bundle not found');
        return false;
      }
      
      // Create purchase record for the bundle
      const bundlePurchase = {
        id: `purchase_${Date.now()}_bundle`,
        userId,
        moduleId: bundleId,
        bundleId,
        purchaseDate: new Date().toISOString(),
        amount: bundle.price || 0,
        status: 'completed' as const,
        type: 'bundle' as const
      };
      
      // Create individual purchase records for each content item in the bundle
      const contentPurchases = (bundle.contentIds || []).map((contentId: string, index: number) => ({
        id: `purchase_${Date.now()}_${index}`,
        userId,
        moduleId: contentId,
        bundleId,
        purchaseDate: new Date().toISOString(),
        amount: 0, // Individual items are free when purchased as part of bundle
        status: 'completed' as const,
        type: 'video' as const
      }));
      
      // Add all purchases
      data.purchases = data.purchases || [];
      data.purchases.push(bundlePurchase, ...contentPurchases);
      
      // Update user's purchased modules
      const user = data.users?.find(u => u.id === userId);
      if (user) {
        user.purchasedModules = user.purchasedModules || [];
        user.purchasedModules.push(bundleId, ...(bundle.contentIds || []));
        user.totalSpent = (user.totalSpent || 0) + (bundle.price || 0);
      }
      
      const success = await this.saveData(data);
      console.log(success ? '✅ Bundle purchase completed' : '❌ Bundle purchase failed');
      return success;
    } catch (error) {
      console.error('❌ Error purchasing bundle:', error);
      return false;
    }
  }

  // Package purchase method
  async purchasePackage(userId: string, packageId: string): Promise<boolean> {
    try {
      console.log('🛒 Processing package purchase:', { userId, packageId });
      const data = await this.loadData();
      
      // Get the package
      const package_ = data.packages?.find(p => p.id === packageId);
      if (!package_) {
        console.log('❌ Package not found');
        return false;
      }
      
      // Create purchase record for the package
      const packagePurchase = {
        id: `purchase_${Date.now()}_package`,
        userId,
        moduleId: packageId,
        packageId,
        purchaseDate: new Date().toISOString(),
        amount: package_.price || 0,
        status: 'completed' as const,
        type: 'package' as const
      };
      
      // Create individual purchase records for each content item in the package
      const contentPurchases = (package_.contentIds || []).map((contentId: string, index: number) => ({
        id: `purchase_${Date.now()}_${index}`,
        userId,
        moduleId: contentId,
        packageId,
        purchaseDate: new Date().toISOString(),
        amount: 0, // Individual items are free when purchased as part of package
        status: 'completed' as const,
        type: 'video' as const
      }));
      
      // Add all purchases
      data.purchases = data.purchases || [];
      data.purchases.push(packagePurchase, ...contentPurchases);
      
      // Update user's purchased modules - include both package and individual content
      const user = data.users?.find(u => u.id === userId);
      if (user) {
        user.purchasedModules = user.purchasedModules || [];
        // Add package ID
        if (!user.purchasedModules.includes(packageId)) {
          user.purchasedModules.push(packageId);
        }
        // Add all content IDs from the package
        (package_.contentIds || []).forEach((contentId: string) => {
          if (!user.purchasedModules!.includes(contentId)) {
            user.purchasedModules!.push(contentId);
          }
        });
        user.totalSpent = (user.totalSpent || 0) + (package_.price || 0);
      }
      
      const success = await this.saveData(data);
      console.log(success ? '✅ Package purchase completed' : '❌ Package purchase failed');
      return success;
    } catch (error) {
      console.error('❌ Error purchasing package:', error);
      return false;
    }
  }
}

// Export singleton instance
export const vpsDataStore = new VPSDataStore();
export type { UploadQueueItem, AppSettings };