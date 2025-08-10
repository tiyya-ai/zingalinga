// File-based Data Store
import { User, Module, Purchase, ContentFile } from '../types';
import { modules as defaultModules } from '../data/modules';

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
  formData?: any;
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
  lastUpdated?: string;
  lastLoaded?: string;
}

class VPSDataStore {
  private currentUser: User | null = null;
  private storageKey = 'zinga-linga-app-data';
  private memoryData: AppData | null = null;

  constructor() {
    // File-based data store initialized
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  clearMemoryCache() {
    this.memoryData = null;

  }

  // Get default data structure
  private getDefaultData(): AppData {
    return {
      users: [
        {
          id: 'admin_001',
          email: 'admin@zingalinga.com',
          name: 'Admin User',
          role: 'admin' as 'user' | 'admin',
          purchasedModules: [],
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
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
      modules: [...defaultModules],
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
      settings: this.getDefaultSettings(),
      lastUpdated: new Date().toISOString(),
      lastLoaded: new Date().toISOString()
    };
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
  async loadData(): Promise<AppData> {
    try {
      // Return memory data if available and recent
      if (this.memoryData) {

        return this.memoryData;
      }
      
      // Load from API
      const response = await fetch('/api/data');
      if (response.ok) {
        const data = await response.json();
        this.memoryData = data;

        return data;
      }
    } catch (error) {

    }
    
    try {
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem(this.storageKey);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          this.memoryData = parsedData;

          return parsedData;
        }
      }
    } catch (error) {

    }
    
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
        } else {
          console.error('❌ API save failed:', await response.text());
        }
      } catch (apiError) {
        console.error('❌ API save error:', apiError);
      }

      // Always save to localStorage for persistence
      if (typeof window !== 'undefined') {
        try {
          // Compress data for localStorage - remove large base64 files
          const compressedData = {
            ...this.memoryData,
            modules: this.memoryData.modules?.map(m => ({
              ...m,
              // Keep URLs but remove large base64 data
              videoUrl: m.videoUrl?.startsWith('data:') ? '[BASE64_VIDEO_REMOVED]' : m.videoUrl,
              thumbnail: m.thumbnail?.startsWith('data:') ? '[BASE64_IMAGE_REMOVED]' : m.thumbnail,
              audioUrl: m.audioUrl?.startsWith?.('data:') ? '[BASE64_AUDIO_REMOVED]' : m.audioUrl
            }))
          };
          
          const dataToSave = JSON.stringify(compressedData);
          localStorage.setItem(this.storageKey, dataToSave);
          console.log('✅ Data saved to localStorage');
        } catch (storageError) {
          console.error('❌ VPS localStorage save failed:', storageError);
        }
      }
      
      return true;
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
      const data = await this.loadData();
      
      const newProduct = {
        ...product,
        id: product.id || Date.now().toString(),
        createdAt: product.createdAt || new Date().toISOString(),
        isActive: product.isActive !== undefined ? product.isActive : true,
        isVisible: product.isVisible !== undefined ? product.isVisible : true,
        rating: product.rating || 0,
        totalRatings: product.totalRatings || 0,
        features: product.features || [],
        fullContent: product.fullContent || [],
        difficulty: product.difficulty || 'beginner',
        tags: product.tags || []
      };
      
      data.modules = data.modules || [];
      data.modules.push(newProduct);
      
      const success = await this.saveData(data);
      return success;
    } catch (error) {
      console.error('❌ Error adding product:', error);
      return false;
    }
  }

  async updateProduct(updatedProduct: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.modules = data.modules || [];
      const index = data.modules.findIndex(p => p.id === updatedProduct.id);
      if (index !== -1) {
        data.modules[index] = {
          ...data.modules[index],
          ...updatedProduct,
          updatedAt: new Date().toISOString()
        };
        const success = await this.saveData(data);
        return success;
      }
      return false;
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
      const data = await this.loadData();
      data.users = data.users || [];
      const index = data.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        data.users[index] = { ...data.users[index], ...updatedUser };
        return await this.saveData(data);
      }
      return false;
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
      return data.uploadQueue || [];
    } catch (error) {
      console.error('Error getting upload queue:', error);
      return [];
    }
  }

  async addToUploadQueue(uploadItem: UploadQueueItem): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.uploadQueue = data.uploadQueue || [];
      data.uploadQueue.unshift(uploadItem);
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
      data.uploadQueue = data.uploadQueue.filter(item => item.status !== 'completed');
      return await this.saveData(data);
    } catch (error) {
      console.error('Error clearing completed uploads:', error);
      return false;
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
}

// Export singleton instance
export const vpsDataStore = new VPSDataStore();
export type { UploadQueueItem, AppSettings };