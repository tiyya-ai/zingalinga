// Optimized Data Store with Caching and Performance Improvements
import { User, Module, Purchase, ContentFile } from '../types';
import { vpsDataStore } from './vpsDataStore';

interface CachedData {
  data: any;
  timestamp: number;
  expiresAt: number;
}

interface DataSubscriber {
  id: string;
  callback: (data: any) => void;
  dataType: string;
}

class OptimizedDataStore {
  private cache = new Map<string, CachedData>();
  private subscribers = new Map<string, DataSubscriber[]>();
  private loadingPromises = new Map<string, Promise<any>>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly STALE_WHILE_REVALIDATE = 10 * 60 * 1000; // 10 minutes

  constructor() {
    // Initialize with empty cache
  }

  // Get cached data or load fresh data
  async getData(dataType: string, forceRefresh = false): Promise<any> {
    const cacheKey = `data_${dataType}`;
    
    // Check if we're already loading this data
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        // Return fresh cached data
        return cached.data;
      }
      
      if (cached && Date.now() < cached.timestamp + this.STALE_WHILE_REVALIDATE) {
        // Return stale data immediately, refresh in background
        this.refreshDataInBackground(dataType);
        return cached.data;
      }
    }

    // Load fresh data
    const loadPromise = this.loadFreshData(dataType);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const data = await loadPromise;
      this.cacheData(cacheKey, data);
      this.notifySubscribers(dataType, data);
      return data;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  // Load specific data types efficiently
  private async loadFreshData(dataType: string): Promise<any> {
    try {
      switch (dataType) {
        case 'modules':
          return await this.loadModulesOptimized();
        case 'users':
          return await this.loadUsersOptimized();
        case 'purchases':
          return await this.loadPurchasesOptimized();
        case 'settings':
          return await this.loadSettingsOptimized();
        case 'uploadQueue':
          return await this.loadUploadQueueOptimized();
        case 'all':
        default:
          return await this.loadAllDataOptimized();
      }
    } catch (error) {
      console.error(`Error loading ${dataType}:`, error);
      // Return cached data if available, even if expired
      const cached = this.cache.get(`data_${dataType}`);
      return cached?.data || this.getDefaultData(dataType);
    }
  }

  // Optimized data loaders that only fetch what's needed
  private async loadModulesOptimized(): Promise<Module[]> {
    try {
      // Try to get from localStorage first for speed
      const localData = this.getLocalStorageData();
      if (localData?.modules) {
        // Return local data immediately, sync in background
        this.syncWithServerInBackground();
        return localData.modules;
      }
      
      // Fallback to full data load
      const fullData = await vpsDataStore.loadData();
      return fullData.modules || [];
    } catch (error) {
      console.error('Error loading modules:', error);
      return [];
    }
  }

  private async loadUsersOptimized(): Promise<User[]> {
    try {
      const localData = this.getLocalStorageData();
      if (localData?.users) {
        this.syncWithServerInBackground();
        return localData.users;
      }
      
      const fullData = await vpsDataStore.loadData();
      return fullData.users || [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  private async loadPurchasesOptimized(): Promise<Purchase[]> {
    try {
      const localData = this.getLocalStorageData();
      if (localData?.purchases) {
        this.syncWithServerInBackground();
        return localData.purchases;
      }
      
      const fullData = await vpsDataStore.loadData();
      return fullData.purchases || [];
    } catch (error) {
      console.error('Error loading purchases:', error);
      return [];
    }
  }

  private async loadSettingsOptimized(): Promise<any> {
    try {
      const localData = this.getLocalStorageData();
      if (localData?.settings) {
        return localData.settings;
      }
      
      return await vpsDataStore.getSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      return vpsDataStore.getDefaultSettings();
    }
  }

  private async loadUploadQueueOptimized(): Promise<any[]> {
    try {
      const localData = this.getLocalStorageData();
      if (localData?.uploadQueue) {
        return localData.uploadQueue;
      }
      
      return await vpsDataStore.getUploadQueue();
    } catch (error) {
      console.error('Error loading upload queue:', error);
      return [];
    }
  }

  private async loadAllDataOptimized(): Promise<any> {
    try {
      // Check if we have recent local data
      const localData = this.getLocalStorageData();
      const localTimestamp = localStorage.getItem('zinga-linga-app-data-timestamp');
      
      if (localData && localTimestamp) {
        const age = Date.now() - parseInt(localTimestamp);
        if (age < this.CACHE_DURATION) {
          // Return local data, sync in background
          this.syncWithServerInBackground();
          return localData;
        }
      }
      
      // Load fresh data
      return await vpsDataStore.loadData();
    } catch (error) {
      console.error('Error loading all data:', error);
      return this.getLocalStorageData() || {};
    }
  }

  // Get data from localStorage without parsing large objects
  private getLocalStorageData(): any {
    try {
      const data = localStorage.getItem('zinga-linga-app-data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      return null;
    }
  }

  // Background sync with server
  private async syncWithServerInBackground(): Promise<void> {
    try {
      // Don't await this - let it run in background
      setTimeout(async () => {
        try {
          const freshData = await vpsDataStore.loadData();
          this.cacheData('data_all', freshData);
          this.notifySubscribers('all', freshData);
        } catch (error) {
          console.warn('Background sync failed:', error);
        }
      }, 100);
    } catch (error) {
      console.warn('Background sync error:', error);
    }
  }

  // Refresh data in background for stale-while-revalidate
  private async refreshDataInBackground(dataType: string): Promise<void> {
    setTimeout(async () => {
      try {
        const freshData = await this.loadFreshData(dataType);
        this.cacheData(`data_${dataType}`, freshData);
        this.notifySubscribers(dataType, freshData);
      } catch (error) {
        console.warn(`Background refresh failed for ${dataType}:`, error);
      }
    }, 50);
  }

  // Cache data with timestamp
  private cacheData(key: string, data: any): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    });

    // Also update localStorage timestamp
    if (key === 'data_all') {
      localStorage.setItem('zinga-linga-app-data-timestamp', now.toString());
    }
  }

  // Subscribe to data changes
  subscribe(dataType: string, callback: (data: any) => void): string {
    const id = Math.random().toString(36).substr(2, 9);
    
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, []);
    }
    
    this.subscribers.get(dataType)!.push({ id, callback, dataType });
    
    return id;
  }

  // Unsubscribe from data changes
  unsubscribe(dataType: string, subscriptionId: string): void {
    const subs = this.subscribers.get(dataType);
    if (subs) {
      const filtered = subs.filter(sub => sub.id !== subscriptionId);
      this.subscribers.set(dataType, filtered);
    }
  }

  // Notify subscribers of data changes
  private notifySubscribers(dataType: string, data: any): void {
    const subs = this.subscribers.get(dataType);
    if (subs) {
      subs.forEach(sub => {
        try {
          sub.callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  // Get default data for fallbacks
  private getDefaultData(dataType: string): any {
    switch (dataType) {
      case 'modules':
        return [];
      case 'users':
        return [];
      case 'purchases':
        return [];
      case 'uploadQueue':
        return [];
      case 'settings':
        return vpsDataStore.getDefaultSettings();
      default:
        return {};
    }
  }

  // Clear cache
  clearCache(dataType?: string): void {
    if (dataType) {
      this.cache.delete(`data_${dataType}`);
    } else {
      this.cache.clear();
    }
  }

  // Preload data for better performance
  async preloadData(): Promise<void> {
    try {
      // Preload essential data
      const promises = [
        this.getData('modules'),
        this.getData('settings')
      ];
      
      await Promise.allSettled(promises);
    } catch (error) {
      console.warn('Preload failed:', error);
    }
  }

  // Get cache stats for debugging
  getCacheStats(): any {
    const stats = {
      cacheSize: this.cache.size,
      subscriberCount: Array.from(this.subscribers.values()).reduce((sum, subs) => sum + subs.length, 0),
      cachedKeys: Array.from(this.cache.keys()),
      loadingPromises: this.loadingPromises.size
    };
    
    return stats;
  }
}

// Export singleton instance
export const optimizedDataStore = new OptimizedDataStore();