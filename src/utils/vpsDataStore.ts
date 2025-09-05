// VPS Data Store - Manages application data with database persistence
import { User, Module, Purchase, ContentFile } from '../types';

// Security: Generate secure IDs
const generateSecureId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

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
  hasLargeVideo?: boolean;
  videoStorageType?: string;
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  isActive: boolean;
  contentIds?: string[];
  lastContentUpdate?: string;
  createdAt: string;
  updatedAt: string;
  upgradeFrom?: string;
  upgradePrice?: number;
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
  savedVideos?: Array<{id: string; userId: string; savedAt: string; [key: string]: unknown}>;
  categories?: string[];
  comments?: Array<{id: string; userId: string; content: string; createdAt: string; status?: string}>;
  subscriptions?: Array<{id: string; userId: string; type: string; createdAt: string}>;
  transactions?: Array<{id: string; userId: string; amount: number; createdAt: string}>;
  notifications?: Array<{id: string; userId: string; message: string; createdAt: string}>;
  scheduledContent?: Array<{id: string; title: string; scheduledAt: string; createdAt: string}>;
  flaggedContent?: Array<{id: string; contentId: string; reason: string; createdAt: string}>;
  accessLogs?: Array<{id: string; userId: string; action: string; timestamp: string}>;
  packages?: Package[];
  bundles?: Array<{id: string; name: string; moduleIds: string[]; price: number}>;
  ageGroups?: Array<{id: string; name: string; minAge: number; maxAge: number}>;
  lastUpdated?: string;
  lastLoaded?: string;
}

class VPSDataStore {
  private currentUser: User | null = null;
  private memoryData: AppData | null = null;

  constructor() {
    // Initialize with default data
    this.memoryData = this.getDefaultData();
  }

  private getDefaultData(): AppData {
    return {
      users: [],
      modules: [],
      purchases: [],
      packages: this.getDefaultPackages(),
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
      bundles: [],
      ageGroups: [],
      settings: this.getDefaultSettings(),
      lastUpdated: new Date().toISOString(),
      lastLoaded: new Date().toISOString()
    };
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  clearMemoryCache() {
    console.log('Memory cache cleared for refresh');
    this.memoryData = this.getDefaultData();
  }

  async loadData(forceRefresh?: boolean): Promise<AppData> {
    try {
      const response = await fetch('/api/data');
      if (response.ok) {
        const data = await response.json();
        this.memoryData = data;
        return data;
      }
      return this.getDefaultData();
    } catch (error) {
      console.error('Data load error:', error);
      return this.getDefaultData();
    }
  }

  async saveData(data: AppData): Promise<boolean> {
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          lastUpdated: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        this.memoryData = data;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Data save failed:', error);
      return false;
    }
  }

  // Product/Module methods
  async addProduct(product: Module): Promise<boolean> {
    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      return response.ok;
    } catch (error) {
      console.error('Add product error:', error);
      return false;
    }
  }

  async updateProduct(product: Module): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.modules = data.modules || [];
      const index = data.modules.findIndex(m => m.id === product.id);
      if (index !== -1) {
        data.modules[index] = product;
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Update product error:', error);
      return false;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.modules = data.modules || [];
      data.modules = data.modules.filter(m => m.id !== productId);
      return await this.saveData(data);
    } catch (error) {
      console.error('Delete product error:', error);
      return false;
    }
  }

  async getProducts(): Promise<any[]> {
    try {
      const data = await this.loadData();
      return data.modules || [];
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  // User methods
  async addUser(userData: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.users = data.users || [];
      const newUser = {
        ...userData,
        id: userData.id || generateSecureId('user'),
        createdAt: new Date().toISOString(),
        purchasedModules: userData.purchasedModules || []
      };
      data.users.push(newUser);
      return await this.saveData(data);
    } catch (error) {
      console.error('Add user error:', error);
      return false;
    }
  }

  async updateUser(userId: string, userData: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.users = data.users || [];
      const index = data.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        data.users[index] = { ...data.users[index], ...userData };
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.users = data.users || [];
      data.users = data.users.filter(u => u.id !== userId);
      data.purchases = data.purchases?.filter(p => p.userId !== userId) || [];
      return await this.saveData(data);
    } catch (error) {
      console.error('Delete user error:', error);
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

  async getUserProfile(userId: string): Promise<any> {
    try {
      const data = await this.loadData();
      const user = data.users?.find(u => u.id === userId);
      if (user) {
        return {
          profileImage: (user as any).profileImage || null,
          theme: (user as any).theme || null,
          avatar: (user as any).avatar || null
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<boolean> {
    return await this.updateUser(userId, preferences);
  }

  async changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      return await this.updateUser(userId, { password: newPassword });
    } catch (error) {
      console.error('Error changing user password:', error);
      return false;
    }
  }

  // Package methods
  getDefaultPackages(): any[] {
    return [
      {
        id: 'explorer-pack',
        name: 'Explorer Pack',
        description: 'Where Letters Come to Life!',
        price: 30,
        type: 'subscription',
        isActive: true,
        contentIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async getPackages(): Promise<any[]> {
    try {
      const data = await this.loadData();
      return data.packages || this.getDefaultPackages();
    } catch (error) {
      console.error('Error getting packages:', error);
      return this.getDefaultPackages();
    }
  }

  async addPackage(packageData: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.packages = data.packages || [];
      const newPackage = {
        ...packageData,
        id: packageData.id || generateSecureId('package'),
        createdAt: packageData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: packageData.isActive !== undefined ? packageData.isActive : true
      };
      data.packages.push(newPackage);
      return await this.saveData(data);
    } catch (error) {
      console.error('Error adding package:', error);
      return false;
    }
  }

  async updatePackage(updatedPackage: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.packages = data.packages || [];
      const index = data.packages.findIndex(p => p.id === updatedPackage.id);
      if (index !== -1) {
        data.packages[index] = {
          ...data.packages[index],
          ...updatedPackage,
          updatedAt: new Date().toISOString()
        };
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Error updating package:', error);
      return false;
    }
  }

  async deletePackage(packageId: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.packages = data.packages || [];
      data.packages = data.packages.filter(p => p.id !== packageId);
      return await this.saveData(data);
    } catch (error) {
      console.error('Error deleting package:', error);
      return false;
    }
  }

  async getAvailableUpgrades(userId: string): Promise<any[]> {
    try {
      const data = await this.loadData();
      const user = data.users?.find(u => u.id === userId);
      if (!user) return [];
      
      const userPackages = (user as any).purchasedModules || [];
      const allPackages = data.packages || [];
      
      return allPackages.filter(pkg => 
        pkg.upgradeFrom && 
        userPackages.includes(pkg.upgradeFrom) && 
        !userPackages.includes(pkg.id)
      );
    } catch (error) {
      console.error('Error getting available upgrades:', error);
      return [];
    }
  }

  async upgradePackage(userId: string, fromPackageId: string, toPackageId: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      const user = data.users?.find(u => u.id === userId);
      if (!user) return false;
      
      const userPackages = (user as any).purchasedModules || [];
      if (!userPackages.includes(fromPackageId)) return false;
      
      const updatedPackages = userPackages.filter((id: string) => id !== fromPackageId);
      updatedPackages.push(toPackageId);
      
      return await this.updateUser(userId, { purchasedModules: updatedPackages });
    } catch (error) {
      console.error('Error upgrading package:', error);
      return false;
    }
  }

  async purchasePackage(userId: string, packageId: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.purchases = data.purchases || [];
      const newPurchase = {
        id: generateSecureId('purchase'),
        userId,
        moduleId: packageId,
        amount: 0,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      data.purchases.push(newPurchase as any);
      return await this.saveData(data);
    } catch (error) {
      console.error('Error purchasing package:', error);
      return false;
    }
  }

  // Order/Purchase methods
  async getOrders(): Promise<any[]> {
    try {
      const data = await this.loadData();
      return data.purchases || [];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  async addPurchase(purchase: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.purchases = data.purchases || [];
      const newPurchase = {
        ...purchase,
        id: purchase.id || generateSecureId('purchase'),
        createdAt: purchase.createdAt || new Date().toISOString()
      };
      data.purchases.push(newPurchase);
      return await this.saveData(data);
    } catch (error) {
      console.error('Error adding purchase:', error);
      return false;
    }
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.purchases = data.purchases || [];
      data.purchases = data.purchases.filter(o => o.id !== orderId);
      return await this.saveData(data);
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  // Category methods
  async getCategories(): Promise<string[]> {
    try {
      const data = await this.loadData();
      return data.categories || ['Audio Lessons', 'PP1 Program', 'PP2 Program'];
    } catch (error) {
      console.error('Error getting categories:', error);
      return ['Audio Lessons', 'PP1 Program', 'PP2 Program'];
    }
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
      
      if (data.categories.includes(newCategory)) {
        return false;
      }
      
      const index = data.categories.indexOf(oldCategory);
      if (index !== -1) {
        data.categories[index] = newCategory;
        
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

  // Audio lesson methods
  async getAudioLessons(): Promise<any[]> {
    try {
      const data = await this.loadData();
      return data.modules?.filter(m => m.category === 'Audio Lessons' || m.type === 'audio') || [];
    } catch (error) {
      console.error('Error getting audio lessons:', error);
      return [];
    }
  }

  async addAudioLesson(lesson: any): Promise<boolean> {
    try {
      const lessonData = {
        ...lesson,
        id: lesson.id || generateSecureId('audio'),
        category: 'Audio Lessons',
        type: 'audio',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return await this.addProduct(lessonData);
    } catch (error) {
      console.error('Error adding audio lesson:', error);
      return false;
    }
  }

  async updateAudioLesson(id: string, lesson: any): Promise<boolean> {
    try {
      const updatedLesson = {
        ...lesson,
        id,
        category: 'Audio Lessons',
        type: 'audio',
        updatedAt: new Date().toISOString()
      };
      return await this.updateProduct(updatedLesson);
    } catch (error) {
      console.error('Error updating audio lesson:', error);
      return false;
    }
  }

  async deleteAudioLesson(id: string): Promise<boolean> {
    return await this.deleteProduct(id);
  }

  // Saved videos methods
  async getSavedVideos(userId: string): Promise<any[]> {
    try {
      const data = await this.loadData();
      return data.savedVideos?.filter(sv => sv.userId === userId) || [];
    } catch (error) {
      console.error('Error getting saved videos:', error);
      return [];
    }
  }

  async addSavedVideo(userId: string, videoId: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.savedVideos = data.savedVideos || [];
      
      const exists = data.savedVideos.some(sv => sv.userId === userId && sv.id === videoId);
      if (exists) return false;
      
      data.savedVideos.push({
        id: videoId,
        userId,
        savedAt: new Date().toISOString()
      });
      
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
      data.savedVideos = data.savedVideos.filter(sv => !(sv.userId === userId && sv.id === videoId));
      return await this.saveData(data);
    } catch (error) {
      console.error('Error removing saved video:', error);
      return false;
    }
  }

  // Upload queue methods
  async getUploadQueue(): Promise<UploadQueueItem[]> {
    try {
      const data = await this.loadData();
      return data.uploadQueue || [];
    } catch (error) {
      console.error('Error getting upload queue:', error);
      return [];
    }
  }

  async addToUploadQueue(item: UploadQueueItem): Promise<boolean> {
    try {
      const data = await this.loadData();
      data.uploadQueue = data.uploadQueue || [];
      data.uploadQueue.push(item);
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

  // Settings methods
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
      enableRealTimeSync: true
    };
  }

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
}

// Export singleton instance
export const vpsDataStore = new VPSDataStore();
export type { UploadQueueItem, AppSettings };