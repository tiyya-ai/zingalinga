import { User, Module, Purchase } from '../types';

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

      // Save to Prisma database only
      await this.savePurchaseToVPS(purchase);

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
   * Save purchase to Prisma database
   */
  private async savePurchaseToVPS(purchase: Purchase): Promise<void> {
    try {
      const purchaseData = {
        userId: purchase.userId,
        moduleId: purchase.moduleId,
        amount: purchase.amount,
        status: purchase.status || 'completed'
      };
      
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to save purchase to Prisma database: ${error}`);
      }
      
      console.log('✅ Purchase saved to Prisma database');
    } catch (error) {
      console.error('Error saving purchase to Prisma database:', error);
      throw error;
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
   * Get user purchases from Prisma database
   */
  async getUserPurchases(userId: string): Promise<Purchase[]> {
    try {
      // Check cache first
      if (this.purchaseCache.has(userId)) {
        return this.purchaseCache.get(userId)!;
      }

      // Load from Prisma API
      const response = await fetch('/api/purchases');
      if (response.ok) {
        const allPurchases = await response.json();
        const userPurchases = allPurchases.filter((p: any) => p.userId === userId);
        
        // Convert Prisma format to Purchase format
        const formattedPurchases = userPurchases.map((p: any) => ({
          id: p.id,
          userId: p.userId,
          moduleId: p.moduleId,
          moduleIds: [p.moduleId],
          amount: p.amount,
          status: p.status,
          purchaseDate: p.createdAt,
          createdAt: p.createdAt
        }));
        
        // Update cache
        this.purchaseCache.set(userId, formattedPurchases);
        return formattedPurchases;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting user purchases from Prisma:', error);
      return [];
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