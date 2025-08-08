import { User, Module, Purchase } from '../types';
import { vpsDataStore } from './vpsDataStore';

export class PurchaseManager {
  private static instance: PurchaseManager;
  private purchaseCache = new Map<string, Purchase[]>();

  static getInstance(): PurchaseManager {
    if (!PurchaseManager.instance) {
      PurchaseManager.instance = new PurchaseManager();
    }
    return PurchaseManager.instance;
  }

  /**
   * Process a video purchase and ensure it persists
   */
  async purchaseVideo(userId: string, moduleId: string, price: number): Promise<boolean> {
    try {
      console.log('🛒 Processing purchase:', { userId, moduleId, price });

      // Create purchase record
      const purchase: Purchase = {
        id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        moduleId,
        moduleIds: [moduleId],
        amount: price,
        status: 'completed',
        purchaseDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Save to multiple places for redundancy
      await Promise.all([
        this.savePurchaseToVPS(purchase),
        this.savePurchaseToLocalStorage(purchase),
        this.updateUserPurchasedModules(userId, moduleId)
      ]);

      // Update cache
      this.updatePurchaseCache(userId, purchase);

      console.log('✅ Purchase completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      return false;
    }
  }

  /**
   * Save purchase to VPS data store
   */
  private async savePurchaseToVPS(purchase: Purchase): Promise<void> {
    try {
      const data = await vpsDataStore.loadData();
      if (!data.purchases) data.purchases = [];
      
      // Remove any existing purchase for this user/module
      data.purchases = data.purchases.filter(p => 
        !(p.userId === purchase.userId && p.moduleId === purchase.moduleId)
      );
      
      data.purchases.push(purchase);
      await vpsDataStore.saveData(data);
    } catch (error) {
      console.error('Error saving purchase to VPS:', error);
      throw error;
    }
  }

  /**
   * Save purchase to localStorage as backup
   */
  private async savePurchaseToLocalStorage(purchase: Purchase): Promise<void> {
    try {
      const key = `user_purchases_${purchase.userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      
      // Remove duplicates
      const filtered = existing.filter((p: Purchase) => 
        !(p.moduleId === purchase.moduleId)
      );
      
      filtered.push(purchase);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error saving purchase to localStorage:', error);
    }
  }

  /**
   * Update user's purchased modules list
   */
  private async updateUserPurchasedModules(userId: string, moduleId: string): Promise<void> {
    try {
      const data = await vpsDataStore.loadData();
      const user = data.users?.find((u: User) => u.id === userId);
      
      if (user) {
        if (!user.purchasedModules) user.purchasedModules = [];
        if (!user.purchasedModules.includes(moduleId)) {
          user.purchasedModules.push(moduleId);
          await vpsDataStore.saveData(data);
        }
      }
    } catch (error) {
      console.error('Error updating user purchased modules:', error);
    }
  }

  /**
   * Update purchase cache
   */
  private updatePurchaseCache(userId: string, purchase: Purchase): void {
    const userPurchases = this.purchaseCache.get(userId) || [];
    const filtered = userPurchases.filter(p => p.moduleId !== purchase.moduleId);
    filtered.push(purchase);
    this.purchaseCache.set(userId, filtered);
  }

  /**
   * Get user purchases with fallback to localStorage
   */
  async getUserPurchases(userId: string): Promise<Purchase[]> {
    try {
      // Check cache first
      if (this.purchaseCache.has(userId)) {
        return this.purchaseCache.get(userId)!;
      }

      // Try VPS data store
      const data = await vpsDataStore.loadData();
      const vpsPurchases = data.purchases?.filter((p: Purchase) => p.userId === userId) || [];

      // Try localStorage as fallback
      const localKey = `user_purchases_${userId}`;
      const localPurchases = JSON.parse(localStorage.getItem(localKey) || '[]');

      // Merge and deduplicate
      const allPurchases = [...vpsPurchases, ...localPurchases];
      const uniquePurchases = allPurchases.filter((purchase, index, self) => 
        index === self.findIndex(p => p.moduleId === purchase.moduleId)
      );

      // Update cache
      this.purchaseCache.set(userId, uniquePurchases);

      return uniquePurchases;
    } catch (error) {
      console.error('Error getting user purchases:', error);
      
      // Fallback to localStorage only
      const localKey = `user_purchases_${userId}`;
      return JSON.parse(localStorage.getItem(localKey) || '[]');
    }
  }

  /**
   * Check if user has purchased a specific module
   */
  async hasPurchased(userId: string, moduleId: string): Promise<boolean> {
    try {
      const purchases = await this.getUserPurchases(userId);
      return purchases.some(p => 
        p.moduleId === moduleId && p.status === 'completed'
      );
    } catch (error) {
      console.error('Error checking purchase status:', error);
      return false;
    }
  }

  /**
   * Clear purchase cache (useful for testing or data refresh)
   */
  clearCache(): void {
    this.purchaseCache.clear();
  }
}

export const purchaseManager = PurchaseManager.getInstance();