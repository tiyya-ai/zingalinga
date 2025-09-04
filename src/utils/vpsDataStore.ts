// VPS Data Store - Manages application data with database persistence
import { User, Module, Purchase, ContentFile } from '../types';
import { sanitizeInput, sanitizeForLog } from './securityUtils';
import { executeQuery } from './database';

// Security: Validate date strings
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

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
  private storageKey = 'zinga-linga-app-data';
  private memoryData: AppData | null = null;
  private videoMemoryCache: Map<string, string> | null = null;

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      const defaultPackages = this.getDefaultPackages();
      for (const pkg of defaultPackages) {
        await executeQuery(
          'INSERT IGNORE INTO packages (id, name, description, price, type, isActive, contentIds, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [pkg.id, pkg.name, pkg.description, pkg.price, pkg.type, pkg.isActive, JSON.stringify(pkg.contentIds), pkg.createdAt, pkg.updatedAt]
        );
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  clearMemoryCache() {
    console.log('Memory cache cleared for refresh');
    this.memoryData = null;
  }

  // Database methods
  async loadData(forceRefresh?: boolean): Promise<AppData> {
    try {
      const [users, modules, purchases, packages] = await Promise.all([
        executeQuery('SELECT * FROM users'),
        executeQuery('SELECT * FROM modules'),
        executeQuery('SELECT * FROM purchases'),
        executeQuery('SELECT * FROM packages')
      ]);

      return {
        users: (users as any[]).map(user => ({
          ...user,
          purchasedModules: JSON.parse(user.purchasedModules || '[]')
        })),
        modules: (modules as any[]).map(module => ({
          ...module,
          tags: JSON.parse(module.tags || '[]')
        })),
        purchases: purchases as any[],
        packages: (packages as any[]).map(pkg => ({
          ...pkg,
          contentIds: JSON.parse(pkg.contentIds || '[]')
        })),
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
    } catch (error) {
      console.error('Database load error:', error);
      throw error;
    }
  }

  async addProduct(product: Module): Promise<boolean> {
    try {
      await executeQuery(
        'INSERT INTO modules (id, title, description, category, type, rating, price, thumbnail, videoUrl, audioUrl, duration, tags, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [product.id, product.title, product.description, product.category, product.type, product.rating, product.price, product.thumbnail, product.videoUrl, product.audioUrl || '', product.duration || '', JSON.stringify(product.tags || []), product.isActive !== false]
      );
      return true;
    } catch (error) {
      console.error('Add product error:', error);
      return false;
    }
  }

  async updateProduct(product: Module): Promise<boolean> {
    try {
      await executeQuery(
        'UPDATE modules SET title=?, description=?, category=?, type=?, rating=?, price=?, thumbnail=?, videoUrl=?, audioUrl=?, duration=?, tags=?, isActive=?, updatedAt=NOW() WHERE id=?',
        [product.title, product.description, product.category, product.type, product.rating, product.price, product.thumbnail, product.videoUrl, product.audioUrl || '', product.duration || '', JSON.stringify(product.tags || []), product.isActive !== false, product.id]
      );
      return true;
    } catch (error) {
      console.error('Update product error:', error);
      return false;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      await executeQuery('DELETE FROM modules WHERE id=?', [productId]);
      return true;
    } catch (error) {
      console.error('Delete product error:', error);
      return false;
    }
  }

  async addUser(userData: any): Promise<boolean> {
    try {
      const userId = generateSecureId('user');
      await executeQuery(
        'INSERT INTO users (id, email, name, role, purchasedModules, totalSpent, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, userData.email, userData.name, userData.role, JSON.stringify([]), 0, userData.status || 'active']
      );
      return true;
    } catch (error) {
      console.error('Add user error:', error);
      return false;
    }
  }

  async updateUser(userId: string, userData: any): Promise<boolean> {
    try {
      await executeQuery(
        'UPDATE users SET name=?, email=?, role=?, status=?, lastLogin=NOW() WHERE id=?',
        [userData.name, userData.email, userData.role, userData.status, userId]
      );
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      await executeQuery('DELETE FROM purchases WHERE userId=?', [userId]);
      await executeQuery('DELETE FROM users WHERE id=?', [userId]);
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  }

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

  async saveData(data: AppData): Promise<boolean> {
    try {
      const preservedData = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      this.memoryData = preservedData;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('/api/data', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preservedData)
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.info('✅ Data saved to VPS database');
        return true;
      }
      
      throw new Error(`Database save failed with status: ${response.status}`);
    } catch (error) {
      console.error('❌ VPS database save failed:', error);
      return false;
    }
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

  async getProducts(): Promise<any[]> {
    try {
      const data = await this.loadData();
      return data.modules || [];
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
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

  async getOrders(): Promise<any[]> {
    try {
      const data = await this.loadData();
      return data.purchases || [];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
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

  // Order management methods
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

  // Package management methods
  async addPackage(packageData: any): Promise<boolean> {
    try {
      const data = await this.loadData();
      
      const existingPackage = data.packages?.find(p => p.name === packageData.name);
      if (existingPackage) {
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
      const originalLength = data.packages.length;
      data.packages = data.packages.filter(p => p.id !== packageId);
      
      if (data.packages.length < originalLength) {
        return await this.saveData(data);
      }
      return false;
    } catch (error) {
      console.error('Error deleting package:', error);
      return false;
    }
  }
}

// Export singleton instance
export const vpsDataStore = new VPSDataStore();
export type { UploadQueueItem, AppSettings };