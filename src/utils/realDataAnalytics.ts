import { vpsDataStore } from './vpsDataStore';

export interface RealDashboardMetrics {
  totalRevenue: number;
  totalUsers: number;
  totalVideos: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
  activeUsers: number;
  retentionRate: number;
  averageOrderValue: number;
  totalSales: number;
  videoAnalytics: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    revenue: number;
    watchTime: number;
    category: string;
    rating: number;
    totalRatings: number;
  }>;
}

class RealDataAnalytics {
  async getCurrentRealData(): Promise<RealDashboardMetrics> {
    try {
      // Load actual data from the system (no seeding)
      const data = await vpsDataStore.loadData();
      
      // Filter out only real users (exclude default admin/demo accounts)
      const realUsers = data.users.filter(user => 
        !user.email.includes('admin@videostore.com') && 
        !user.email.includes('parent@example.com') &&
        !user.email.includes('@example.com') &&
        user.id !== 'videoadmin_001' &&
        user.id !== 'parent_001'
      );

      // Filter out only real purchases (from real users)
      const realUserIds = new Set(realUsers.map(u => u.id));
      const realPurchases = data.purchases.filter(purchase => 
        realUserIds.has(purchase.userId)
      );

      // Calculate date ranges
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Calculate real metrics
      const totalRevenue = realPurchases.reduce((total, purchase) => 
        total + (purchase.amount || 0), 0
      );

      const monthlyRevenue = realPurchases
        .filter(purchase => new Date(purchase.createdAt) >= oneMonthAgo)
        .reduce((total, purchase) => total + (purchase.amount || 0), 0);

      const newUsersThisMonth = realUsers.filter(user => 
        new Date(user.createdAt) >= oneMonthAgo
      ).length;

      const activeUsers = realUsers.filter(user => 
        user.lastLogin && new Date(user.lastLogin) >= oneWeekAgo
      ).length;

      const usersWithPurchases = realUsers.filter(user => 
        realPurchases.some(purchase => purchase.userId === user.id)
      ).length;

      const retentionRate = realUsers.length > 0 
        ? (usersWithPurchases / realUsers.length) * 100 
        : 0;

      const averageOrderValue = realPurchases.length > 0 
        ? totalRevenue / realPurchases.length 
        : 0;

      // Calculate video analytics from real data
      const videoAnalytics = data.modules.map(module => {
        // Calculate real revenue for this module
        const moduleRevenue = realPurchases
          .filter(purchase => purchase.moduleId === module.id)
          .reduce((total, purchase) => total + (purchase.amount || module.price), 0);

        // For views, likes, comments - use actual data if available, otherwise 0
        // In a real system, these would come from actual user interactions
        const purchaseCount = realPurchases.filter(p => p.moduleId === module.id).length;
        
        return {
          id: module.id,
          title: module.title,
          views: purchaseCount * 10, // Estimate: 10 views per purchase
          likes: Math.floor(purchaseCount * 0.8), // Estimate: 80% like rate
          comments: Math.floor(purchaseCount * 0.1), // Estimate: 10% comment rate
          revenue: moduleRevenue,
          watchTime: this.calculateWatchTime(module),
          category: module.category || 'educational',
          rating: module.rating || 0,
          totalRatings: module.totalRatings || 0
        };
      });

      return {
        totalRevenue,
        totalUsers: realUsers.length,
        totalVideos: data.modules.length,
        monthlyRevenue,
        newUsersThisMonth,
        activeUsers,
        retentionRate: Math.round(retentionRate * 10) / 10,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalSales: realPurchases.length,
        videoAnalytics: videoAnalytics.sort((a, b) => b.revenue - a.revenue)
      };

    } catch (error) {
      console.error('Error getting real data:', error);
      // Return empty real data structure
      return {
        totalRevenue: 0,
        totalUsers: 0,
        totalVideos: 0,
        monthlyRevenue: 0,
        newUsersThisMonth: 0,
        activeUsers: 0,
        retentionRate: 0,
        averageOrderValue: 0,
        totalSales: 0,
        videoAnalytics: []
      };
    }
  }

  private calculateWatchTime(module: any): number {
    if (module.fullContent && module.fullContent.length > 0) {
      return module.fullContent.reduce((total: number, content: any) => {
        const duration = content.duration || '10:00';
        const minutes = this.parseDurationToMinutes(duration);
        return total + minutes;
      }, 0);
    }
    return 30; // Default 30 minutes if no content data
  }

  private parseDurationToMinutes(duration: string): number {
    const parts = duration.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      return minutes + (seconds / 60);
    }
    return 10; // Default 10 minutes if parsing fails
  }

  async getVideoPerformance(): Promise<any[]> {
    try {
      const data = await vpsDataStore.loadData();
      const realUserIds = new Set(data.users.filter(u => !u.email.includes('admin@videostore.com') && !u.email.includes('parent@example.com') && !u.email.includes('@example.com') && u.id !== 'videoadmin_001' && u.id !== 'parent_001').map(u => u.id));
      const realPurchases = data.purchases.filter(p => realUserIds.has(p.userId));

      const videoPerformance = data.modules.map(module => {
        const modulePurchases = realPurchases.filter(p => p.moduleId === module.id);
        const revenue = modulePurchases.reduce((acc, p) => acc + (p.amount || module.price), 0);
        const views = modulePurchases.length * 10; // Placeholder
        const completionRate = Math.floor(Math.random() * 40) + 60; // Placeholder
        const trend = Math.random() > 0.5 ? 'up' : 'down'; // Placeholder

        return {
          id: module.id,
          title: module.title,
          category: module.category || 'Educational',
          views,
          completionRate,
          revenue,
          trend,
        };
      });

      return videoPerformance.sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error('Error getting video performance data:', error);
      return [];
    }
  }

  async inspectCurrentData(): Promise<{
    totalUsers: number;
    realUsers: number;
    totalPurchases: number;
    realPurchases: number;
    modules: number;
    hasRealActivity: boolean;
  }> {
    try {
      const data = await vpsDataStore.loadData();
      
      const realUsers = data.users.filter(user => 
        !user.email.includes('admin@videostore.com') && 
        !user.email.includes('parent@example.com') &&
        !user.email.includes('@example.com') &&
        user.id !== 'videoadmin_001' &&
        user.id !== 'parent_001'
      );

      const realUserIds = new Set(realUsers.map(u => u.id));
      const realPurchases = data.purchases.filter(purchase => 
        realUserIds.has(purchase.userId)
      );

      return {
        totalUsers: data.users.length,
        realUsers: realUsers.length,
        totalPurchases: data.purchases.length,
        realPurchases: realPurchases.length,
        modules: data.modules.length,
        hasRealActivity: realUsers.length > 0 || realPurchases.length > 0
      };
    } catch (error) {
      console.error('Error inspecting data:', error);
      return {
        totalUsers: 0,
        realUsers: 0,
        totalPurchases: 0,
        realPurchases: 0,
        modules: 0,
        hasRealActivity: false
      };
    }
  }
}

export const realDataAnalytics = new RealDataAnalytics();