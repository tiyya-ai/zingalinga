// Simplified Data Store
import { User, Module, Purchase, ContentFile } from '../types';
import { modules as defaultModules } from '../data/modules';
import { realTimeSync } from './realTimeSync';

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
}

class VPSDataStore {
  private currentUser: User | null = null;
  private storageKey = 'zinga-linga-app-data';
  private apiEndpoint = '/api/data'; // Global data API endpoint

  constructor() {
    // Simple data store initialized
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  // Get default data structure
  private getDefaultData(): AppData {
    return {
      users: [
        {
          id: 'admin_001',
          email: 'admin@zingalinga.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'admin',
          purchasedModules: [],
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        {
          id: 'user_001',
          email: 'test@example.com',
          password: 'test123',
          name: 'Test User',
          role: 'user',
          purchasedModules: [],
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      ],
      modules: [
        ...defaultModules,
        {
          id: 'sample_video_001',
          title: 'Sample Educational Video',
          description: 'A sample video for testing the admin dashboard',
          price: 9.99,
          category: 'education',
          thumbnail: '/placeholder-video.jpg',
          videoUrl: '/sample-video.mp4',
          duration: '15:30',
          estimatedDuration: '15:30',
          createdAt: new Date().toISOString(),
          isActive: true,
          rating: 4.5,
          ageRange: '3-8 years'
        },
        {
          id: 'sample_video_002',
          title: 'Interactive Learning Module',
          description: 'An interactive module for children',
          price: 14.99,
          category: 'interactive',
          thumbnail: '/placeholder-video.jpg',
          videoUrl: '/interactive-module.mp4',
          duration: '22:45',
          estimatedDuration: '22:45',
          createdAt: new Date().toISOString(),
          isActive: true,
          rating: 4.8,
          ageRange: '5-10 years'
        }
      ],
      purchases: [],
      contentFiles: [],
      uploadQueue: [
        {
          id: 'upload_001',
          fileName: 'educational-math-basics.mp4',
          title: 'Math Basics for Kids',
          size: '125 MB',
          status: 'processing',
          progress: 75,
          uploadedAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
          duration: '15:30'
        },
        {
          id: 'upload_002',
          fileName: 'science-experiments.mp4',
          title: 'Fun Science Experiments',
          size: '89 MB',
          status: 'encoding',
          progress: 45,
          uploadedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          duration: '12:15'
        },
        {
          id: 'upload_003',
          fileName: 'story-time-adventure.mp4',
          title: 'Adventure Story Time',
          size: '156 MB',
          status: 'completed',
          progress: 100,
          uploadedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          duration: '18:45'
        },
        {
          id: 'upload_004',
          fileName: 'alphabet-learning.mp4',
          title: 'Learning the Alphabet',
          size: '67 MB',
          status: 'failed',
          progress: 0,
          uploadedAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
          errorMessage: 'File format not supported'
        }
      ],
      settings: this.getDefaultSettings()
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

  // Load data with global synchronization
  async loadData(): Promise<AppData> {
    try {
      // Try to load from VPS API first
      const response = await fetch(this.apiEndpoint);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.warn('Failed to load data from VPS, trying localStorage:', error);
    }
    
    try {
      // Fallback to localStorage if API fails
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem(this.storageKey);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          const defaultData = this.getDefaultData();
          return {
            ...defaultData,
            ...parsedData,
            users: parsedData.users || defaultData.users,
            modules: parsedData.modules || defaultData.modules,
            purchases: parsedData.purchases || defaultData.purchases,
            contentFiles: parsedData.contentFiles || defaultData.contentFiles,
            uploadQueue: parsedData.uploadQueue || defaultData.uploadQueue,
            settings: parsedData.settings || defaultData.settings
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load saved data, using defaults:', error);
    }
    
    return this.getDefaultData();
  }

  // Save data with global synchronization
  async saveData(data: AppData): Promise<boolean> {
    try {
      // Try to save to VPS API first
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        // Also save to localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.storageKey, JSON.stringify(data));
        }
        
        // Trigger real-time updates
        realTimeSync.triggerUpdate('modules', data.modules);
        realTimeSync.triggerUpdate('users', data.users);
        realTimeSync.triggerUpdate('all', data);
        
        return true;
      }
    } catch (error) {
      console.error('Failed to save data to VPS:', error);
    }
    
    try {
      // Fallback to localStorage if API fails
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        
        // Trigger real-time updates
        realTimeSync.triggerUpdate('modules', data.modules);
        realTimeSync.triggerUpdate('users', data.users);
        realTimeSync.triggerUpdate('all', data);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save data:', error);
      return false;
    }
  }

  // Settings management methods
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await this.loadData();
      return data.settings || this.getDefaultSettings();
    } catch (error) {
      console.error('Error getting settings:', error);
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
        createdAt: product.createdAt || new Date().toISOString()
      };
      data.modules = data.modules || [];
      data.modules.push(newProduct);
      return await this.saveData(data);
    } catch (error) {
      console.error('Error adding product:', error);
      return false;
    }
  }

  async updateProduct(updatedProduct: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.modules = data.modules || [];
      const index = data.modules.findIndex(p => p.id === updatedProduct.id);
      if (index !== -1) {
        data.modules[index] = updatedProduct;
        return await this.saveData(data);
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
      data.modules = data.modules.filter(p => p.id !== productId);
      return await this.saveData(data);
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
        data.purchases[index].status = status;
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

  // User management methods
  async addUser(user: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      const newUser = {
        ...user,
        id: user.id || Date.now().toString(),
        createdAt: user.createdAt || new Date().toISOString(),
        purchasedModules: user.purchasedModules || [],
        totalSpent: user.totalSpent || 0
      };
      data.users = data.users || [];
      data.users.push(newUser);
      return await this.saveData(data);
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
        // In a real app, you'd verify the current password first
        data.users[index].password = newPassword;
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
        // Generate watch history from actual admin videos if user doesn't have any
        if (!user.watchHistory) {
          const availableVideos = data.modules || [];
          if (availableVideos.length > 0) {
            // Create watch history from first 3 available videos
            user.watchHistory = availableVideos.slice(0, 3).map((video, index) => ({
              id: video.id,
              title: video.title,
              thumbnail: video.thumbnail || video.imageUrl || '/placeholder-video.jpg',
              progress: [65, 30, 85][index] || 50, // Different progress levels
              duration: video.estimatedDuration || video.duration || '15:00',
              lastWatched: new Date(Date.now() - (86400000 * (index + 1))).toISOString() // Different days ago
            }));
          } else {
            // Fallback to empty array if no videos available
            user.watchHistory = [];
          }
        }
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
        delete data.users[index].watchHistory;
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
        // Return user profile data including referral information
        return {
          profileImage: user.profileImage || null,
          referralCode: user.referralCode || this.generateReferralCode(userId),
          points: user.points || 0,
          referredUsers: user.referredUsers || [],
          totalReferrals: user.totalReferrals || 0,
          theme: user.theme || null,
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
        // Update user with profile data
        data.users[index] = { 
          ...data.users[index], 
          ...profileData,
          // Ensure referral code is generated if not provided
          referralCode: profileData.referralCode || data.users[index].referralCode || this.generateReferralCode(userId)
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
      data.uploadQueue.unshift(uploadItem); // Add to beginning of queue
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
}

// Export singleton instance
export const vpsDataStore = new VPSDataStore();
export type { UploadQueueItem, AppSettings };