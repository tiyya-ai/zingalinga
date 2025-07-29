// Neon PostgreSQL Data Store
import { db, users, modules, purchases, contentFiles } from '../../lib/neon';
import { eq, desc } from 'drizzle-orm';
import { User, Module, Purchase, ContentFile } from '../types';
import { modules as defaultModules } from '../data/modules';

interface AppData {
  users: User[];
  modules: Module[];
  purchases: Purchase[];
  contentFiles: ContentFile[];
  analytics: {
    totalUsers: number;
    totalRevenue: number;
    totalPurchases: number;
    activeModules: number;
  };
}

class NeonDataStore {
  private storageKey = 'zinga-linga-data';
  private currentUser: User | null = null;

  constructor() {
    console.log('🚀 Neon Data Store initialized');
  }

  // Set current user
  setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      console.log('👤 User set for Neon sync:', user.email);
    } else {
      console.log('👤 User cleared from Neon sync');
    }
  }

  // Load data from database and localStorage fallback
  async loadData(): Promise<AppData> {
    try {
      console.log('📖 Loading data from Neon database...');
      
      // For client-side, try to load from API routes
      if (typeof window !== 'undefined') {
        try {
          const response = await fetch('/api/data/load');
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Data loaded from Neon API:', {
              users: data.users?.length || 0,
              modules: data.modules?.length || 0,
              purchases: data.purchases?.length || 0
            });
            
            // Also save to localStorage as backup
            this.saveToLocalStorage(data);
            return data;
          }
        } catch (apiError) {
          console.warn('⚠️ API load failed, falling back to localStorage:', apiError);
        }
      }
      
      // Fallback to localStorage or default data
      console.log('📖 Loading from localStorage fallback...');
      return this.loadFromLocalStorage();
    } catch (error) {
      console.error('❌ Error loading data, using default:', error);
      return this.getDefaultData();
    }
  }

  // Save data to database
  async saveData(data: AppData): Promise<boolean> {
    try {
      console.log('💾 Saving data to Neon database...');
      
      // Save to localStorage immediately as backup
      this.saveToLocalStorage(data);
      
      // Save to database via API route
      if (typeof window !== 'undefined') {
        const response = await fetch('/api/data/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            users: data.users,
            modules: data.modules,
            purchases: data.purchases,
            contentFiles: data.contentFiles
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          console.log('✅ Data saved to Neon database successfully');
          return true;
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      }
      
      console.log('✅ Data saved to localStorage (server-side)');
      return true;
    } catch (error) {
      console.error('❌ Error saving to Neon:', error);
      return false;
    }
  }

  // Load users from database
  private async loadUsers(): Promise<User[]> {
    try {
      const result = await db.select().from(users).orderBy(desc(users.createdAt));
      return result.map(user => ({
        ...user,
        purchasedModules: user.purchasedModules || []
      }));
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  // Load modules from database
  private async loadModules(): Promise<Module[]> {
    try {
      const result = await db.select().from(modules).orderBy(desc(modules.createdAt));
      return result;
    } catch (error) {
      console.error('Error loading modules:', error);
      return [];
    }
  }

  // Load purchases from database
  private async loadPurchases(): Promise<Purchase[]> {
    try {
      const result = await db.select().from(purchases).orderBy(desc(purchases.purchaseDate));
      return result;
    } catch (error) {
      console.error('Error loading purchases:', error);
      return [];
    }
  }

  // Load content files from database
  private async loadContentFiles(): Promise<ContentFile[]> {
    try {
      const result = await db.select().from(contentFiles).orderBy(desc(contentFiles.uploadedAt));
      return result;
    } catch (error) {
      console.error('Error loading content files:', error);
      return [];
    }
  }

  // Initialize database with default data
  private async initializeDefaultData(): Promise<void> {
    try {
      console.log('🔧 Initializing database with default data...');
      
      // Insert default modules
      for (const module of defaultModules) {
        await db.insert(modules).values({
          id: module.id,
          title: module.title,
          description: module.description,
          price: module.price,
          category: module.category,
          difficulty: module.difficulty,
          duration: module.duration,
          videoUrl: module.videoUrl,
          thumbnailUrl: module.thumbnailUrl,
          fullContent: JSON.stringify(module.fullContent)
        }).onConflictDoNothing();
      }

      // Insert default admin user
      await db.insert(users).values({
        id: 'admin-001',
        email: 'admin@zingalinga.com',
        name: 'System Administrator',
        role: 'admin',
        purchasedModules: [],
        totalSpent: 0
      }).onConflictDoNothing();

      // Insert demo parent user
      await db.insert(users).values({
        id: 'parent-001',
        email: 'parent@demo.com',
        name: 'Demo Parent',
        role: 'user',
        purchasedModules: [],
        totalSpent: 0
      }).onConflictDoNothing();

      console.log('✅ Default data initialized');
    } catch (error) {
      console.error('❌ Error initializing default data:', error);
    }
  }

  // Save to localStorage as backup
  private saveToLocalStorage(data: AppData): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const dataToSave = {
        ...data,
        lastUpdated: new Date().toISOString(),
        deviceId: this.generateDeviceId()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
      console.log('💾 Data saved to localStorage as backup');
      return true;
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      return false;
    }
  }

  // Load from localStorage fallback
  private loadFromLocalStorage(): AppData {
    if (typeof window === 'undefined') {
      return this.getDefaultData();
    }
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        console.log('📖 Loaded data from localStorage fallback');
        return data;
      }
    } catch (error) {
      console.error('❌ Error parsing localStorage data:', error);
    }
    
    console.log('🔧 Using default data');
    return this.getDefaultData();
  }

  // Generate device ID
  private generateDeviceId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let deviceId = localStorage.getItem('zinga-device-id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('zinga-device-id', deviceId);
    }
    return deviceId;
  }

  // Get default data structure
  private getDefaultData(): AppData {
    return {
      users: [
        {
          id: 'admin-001',
          email: 'admin@zingalinga.com',
          name: 'System Administrator',
          role: 'admin' as const,
          purchasedModules: [],
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          totalSpent: 0
        },
        {
          id: 'parent-001',
          email: 'parent@demo.com',
          name: 'Demo Parent',
          role: 'user' as const,
          purchasedModules: [],
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          totalSpent: 0
        }
      ],
      modules: defaultModules,
      purchases: [],
      contentFiles: [],
      analytics: {
        totalUsers: 2,
        totalRevenue: 0,
        totalPurchases: 0,
        activeModules: defaultModules.length
      }
    };
  }
}

// Export singleton instance
export const neonDataStore = new NeonDataStore();