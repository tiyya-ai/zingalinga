// Enhanced Cloud Data Store with Auto-Save Functionality
import { User, Module, Purchase, Analytics, ContentFile } from '../types';
import { modules as defaultModules } from '../data/modules';

interface CloudData {
  users: User[];
  modules: Module[];
  purchases: Purchase[];
  contentFiles: ContentFile[];
  analytics: Analytics;
  lastUpdated: string;
  deviceId: string;
}

interface AppData {
  users: User[];
  modules: Module[];
  purchases: Purchase[];
  contentFiles: ContentFile[];
  analytics: Analytics;
  lastUpdated?: string;
}

class CloudDataStore {
  private storageKey = 'zinga-linga-data';
  private deviceId: string;
  private autoSaveEnabled = true;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private lastCloudSync = 0;
  private syncInProgress = false;
  private currentUser: User | null = null;

  constructor() {
    this.deviceId = this.generateDeviceId();
    this.initializeAutoSave();
    console.log('🚀 Cloud Data Store initialized with device ID:', this.deviceId);
  }

  // Generate unique device identifier
  private generateDeviceId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let deviceId = localStorage.getItem('zinga-device-id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('zinga-device-id', deviceId);
    }
    return deviceId;
  }

  // Initialize auto-save functionality
  private initializeAutoSave() {
    if (typeof window === 'undefined') return;
    
    // Auto-save disabled to simplify the application

    // Local storage only - no cloud sync
  }

  // Set current user for cloud sync
  setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      console.log('👤 Cloud sync enabled for user:', user.email);
      // Don't automatically load from cloud to prevent overriding local changes
      // Cloud sync will happen during normal loadData() calls
    } else {
      console.log('👤 Cloud sync disabled - no user');
    }
  }

  // Get default data
  private getDefaultData(): CloudData {
    return {
      users: [
        // Demo admin user
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
        // Demo parent user
        {
          id: 'parent-001',
          email: 'parent@demo.com',
          name: 'Demo Parent',
          role: 'user' as const,
          purchasedModules: [],
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          totalSpent: 0
        },
        // Additional parent user account
        {
          id: 'parent-002',
          email: 'parent.user@zingalinga.com',
          name: 'Parent User Account',
          role: 'user' as const,
          purchasedModules: ['jungle-basics'],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          totalSpent: 32.99,
          phone: '+1-555-0123',
          address: '123 Family Street, Parent City, PC 12345'
        }
        // All other users will be real users who register through the system
      ] as User[],
      modules: defaultModules,
      purchases: [] as Purchase[],
      contentFiles: [] as ContentFile[],
      analytics: {
        totalUsers: 3,
        totalRevenue: 32.99,
        totalPurchases: 1,
        activeModules: 1,
        revenueByMonth: [],
        popularModules: [],
        userGrowth: []
      } as Analytics,
      lastUpdated: new Date().toISOString(),
      deviceId: this.deviceId
    };
  }

  // Load data with cloud sync
  async loadData(): Promise<CloudData> {
    try {
      // First try to load from localStorage
      const localData = this.loadFromLocalStorage();
      
      // Cloud sync disabled - using local storage only
      
      return localData;
    } catch (error) {
      console.error('❌ Error loading data:', error);
      return this.getDefaultData();
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): CloudData {
    if (typeof window === 'undefined') return this.getDefaultData();
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Check if modules have proper fullContent and fix only those modules
        if (data.modules && (data.modules || []).length > 0) {
          const defaultData = this.getDefaultData();
          let needsUpdate = false;
          
          data.modules = (data.modules || []).map((module: Module) => {
            if (!module.fullContent || (module.fullContent || []).length === 0) {
              const defaultModule = (defaultData.modules || []).find(dm => dm.id === module.id);
              if (defaultModule) {
                console.log('🔄 Fixing content for module:', module.title);
                needsUpdate = true;
                return { ...module, fullContent: defaultModule.fullContent };
              }
            }
            return module;
          });
          
          if (needsUpdate) {
            this.saveToLocalStorage(data);
          }
        }
        
        console.log('📖 Loaded data from localStorage');
        return { ...data, deviceId: this.deviceId };
      }
    } catch (error) {
      console.error('❌ Error parsing localStorage data:', error);
    }
    
    console.log('🔧 Initializing with default data');
    const defaultData = this.getDefaultData();
    this.saveToLocalStorage(defaultData);
    return defaultData;
  }



  // Check if cloud data is newer
  private isCloudDataNewer(cloudData: CloudData, localData: CloudData): boolean {
    const cloudTime = new Date(cloudData.lastUpdated).getTime();
    const localTime = new Date(localData.lastUpdated).getTime();
    return cloudTime > localTime;
  }

  // Merge cloud and local data intelligently
  private mergeCloudAndLocalData(cloudData: CloudData, localData: CloudData): CloudData {
    console.log('🔄 Merging cloud and local data');
    console.log('Local data:', { 
      users: (localData.users || []).length, 
      modules: (localData.modules || []).length,
      lastUpdated: localData.lastUpdated 
    });
    console.log('Cloud data:', { 
      users: (cloudData.users || []).length, 
      modules: (cloudData.modules || []).length,
      lastUpdated: cloudData.lastUpdated 
    });
    
    // Check if local data was recently modified (within last 10 minutes)
    const localTime = new Date(localData.lastUpdated).getTime();
    const cloudTime = new Date(cloudData.lastUpdated).getTime();
    const now = Date.now();
    const isRecentLocalChange = (now - localTime) < (10 * 60 * 1000); // 10 minutes
    
    // If local data is very recent, it likely contains intentional deletions
    if (isRecentLocalChange) {
      console.log('🗑️ Recent local changes detected, preserving local deletions');
      
      // For modules: preserve local deletions but add new cloud modules
      const localModuleIds = new Set((localData.modules || []).map(m => m.id));
      const mergedModules = [
        ...(localData.modules || []),
        ...(cloudData.modules || []).filter(cloudModule => 
          !localModuleIds.has(cloudModule.id)
        )
      ];
      
      // For users: preserve local deletions but add new cloud users
      const localUserIds = new Set((localData.users || []).map(u => u.id));
      const mergedUsers = [
        ...(localData.users || []),
        ...(cloudData.users || []).filter(cloudUser => 
          !localUserIds.has(cloudUser.id)
        )
      ];
      
      console.log('✅ Merged data preserving deletions:', {
        users: mergedUsers.length,
        modules: mergedModules.length
      });
      
      return {
        ...localData,
        modules: mergedModules,
        users: mergedUsers,
        // Keep other local data as is
        lastUpdated: new Date().toISOString()
      };
    }
    
    // If cloud data is significantly newer, prefer cloud data but still be careful about deletions
    console.log('☁️ Cloud data is newer, using cloud data with careful merge');
    return {
      ...cloudData,
      lastUpdated: new Date().toISOString()
    };
  }

  // Save data with auto cloud sync
  async saveData(data: AppData): Promise<boolean> {
    try {
      const dataToSave: CloudData = {
        users: data.users || [],
        modules: data.modules || [],
        purchases: data.purchases || [],
        contentFiles: data.contentFiles || [],
        analytics: data.analytics || this.getDefaultData().analytics,
        lastUpdated: new Date().toISOString(),
        deviceId: this.deviceId
      };
      
      console.log('💾 Saving data:', {
        modules: (dataToSave.modules || []).length,
        users: (dataToSave.users || []).length,
        purchases: (dataToSave.purchases || []).length,
        hasUser: !!this.currentUser,
        userEmail: this.currentUser?.email,
        autoSaveEnabled: this.autoSaveEnabled
      });
      
      // Save to localStorage immediately (primary storage)
      const localSaved = this.saveToLocalStorage(dataToSave);
      console.log('💾 Data saved locally, modules count:', (dataToSave.modules || []).length);
      
      // Cloud sync disabled
      
      return localSaved;
    } catch (error) {
      console.error('❌ Error saving data:', error);
      return false;
    }
  }

  // Save to localStorage
  private saveToLocalStorage(data: CloudData): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log('💾 Data saved to localStorage');
      return true;
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      return false;
    }
  }







  // Force save (alias for compatibility) - ensures immediate save to both local and cloud
  async forceSave(data: AppData): Promise<boolean> {
    console.log('💾 Force saving data...', { 
      users: data.users?.length, 
      modules: data.modules?.length,
      cloudSyncEnabled: !!this.currentUser
    });
    
    // Always save to localStorage first
    const dataToSave: CloudData = {
      users: data.users || [],
      modules: data.modules || [],
      purchases: data.purchases || [],
      contentFiles: data.contentFiles || [],
      analytics: data.analytics || this.getDefaultData().analytics,
      lastUpdated: new Date().toISOString(),
      deviceId: this.deviceId
    };
    this.saveToLocalStorage(dataToSave);
    
    // Cloud sync disabled
    
    console.log('✅ Force save to localStorage completed');
    return true;
  }

  // Enable/disable auto-save
  setAutoSave(enabled: boolean) {
    this.autoSaveEnabled = enabled;
    console.log(`🔄 Auto-save ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Get sync status
  getSyncStatus() {
    return {
      autoSaveEnabled: this.autoSaveEnabled,
      lastCloudSync: this.lastCloudSync,
      currentUser: this.currentUser?.email || null,
      deviceId: this.deviceId,
      cloudAvailable: false
    };
  }

  // Manual cloud sync disabled
  async manualSync(): Promise<boolean> {
    console.log('⚠️ Cloud sync disabled');
    return false;
  }

  // Generate analytics from actual data
  generateAnalytics(users: User[], modules: Module[], purchases: Purchase[]): Analytics {
    const completedPurchases = (purchases || []).filter(p => p.status === 'completed');
    const totalRevenue = (completedPurchases || []).reduce((sum, p) => sum + p.amount, 0);
    
    return {
      totalUsers: (users || []).length,
      totalRevenue,
      totalPurchases: (purchases || []).length,
      activeModules: (modules || []).filter(m => m.isActive).length,
      revenueByMonth: [],
      popularModules: [],
      userGrowth: []
    };
  }

  // Generate content stats
  generateContentStats(contentFiles: ContentFile[]): Record<string, any> {
    const totalSize = (contentFiles || []).reduce((sum, file) => sum + file.size, 0);
    const byType = {
      video: (contentFiles || []).filter(f => f.type === 'video').length,
      audio: (contentFiles || []).filter(f => f.type === 'audio').length,
      // game: contentFiles.filter(f => f.type === 'game').length, // 'game' type not supported in ContentFile
      image: (contentFiles || []).filter(f => f.type === 'image').length,
      document: (contentFiles || []).filter(f => f.type === 'document').length,
    };
    const recentUploads = (contentFiles || [])
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 10);

    return {
      totalFiles: (contentFiles || []).length,
      totalSize,
      byType,
      recentUploads
    };
  }

  // Cleanup
  destroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }
}

// Export singleton instance
export const cloudDataStore = new CloudDataStore();
export default cloudDataStore;