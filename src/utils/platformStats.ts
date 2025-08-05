import { vpsDataStore } from './vpsDataStore';

export interface PlatformStatistics {
  totalUsers: number;
  activeVideos: number;
  monthlyRevenue: number;
  uptime: number;
  totalPurchases: number;
  averageRating: number;
  totalWatchTime: number;
  newUsersThisMonth: number;
}

export class PlatformStatsCalculator {
  private static instance: PlatformStatsCalculator;
  private cachedStats: PlatformStatistics | null = null;
  private lastCalculated: number = 0;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache

  static getInstance(): PlatformStatsCalculator {
    if (!PlatformStatsCalculator.instance) {
      PlatformStatsCalculator.instance = new PlatformStatsCalculator();
    }
    return PlatformStatsCalculator.instance;
  }

  async getPlatformStatistics(forceRefresh = false): Promise<PlatformStatistics> {
    const now = Date.now();
    
    // Return cached data if still valid and not forcing refresh
    if (!forceRefresh && this.cachedStats && (now - this.lastCalculated) < this.cacheTimeout) {
      return this.cachedStats;
    }

    try {
      const data = await vpsDataStore.loadData();
      const stats = await this.calculateStatistics(data);
      
      // Cache the results
      this.cachedStats = stats;
      this.lastCalculated = now;
      
      return stats;
    } catch (error) {
      console.error('Error calculating platform statistics:', error);
      
      // Return cached data if available, otherwise return default stats
      if (this.cachedStats) {
        return this.cachedStats;
      }
      
      return this.getDefaultStatistics();
    }
  }

  private async calculateStatistics(data: any): Promise<PlatformStatistics> {
    const users = data.users || [];
    const modules = data.modules || [];
    const purchases = data.purchases || [];
    
    // Calculate total users
    const totalUsers = users.length;
    
    // Calculate active videos (modules that are active)
    const activeVideos = modules.filter((module: any) => 
      module.isActive !== false && module.videoUrl
    ).length;
    
    // Calculate monthly revenue from purchases
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyRevenue = purchases
      .filter((purchase: any) => {
        if (!purchase.createdAt) return false;
        const purchaseDate = new Date(purchase.createdAt);
        return purchaseDate.getMonth() === currentMonth && 
               purchaseDate.getFullYear() === currentYear;
      })
      .reduce((total: number, purchase: any) => {
        return total + (purchase.amount || purchase.price || 0);
      }, 0);
    
    // Calculate uptime (simulate based on system health)
    const uptime = this.calculateUptime();
    
    // Calculate total purchases
    const totalPurchases = purchases.length;
    
    // Calculate average rating from modules
    const modulesWithRatings = modules.filter((module: any) => module.rating);
    const averageRating = modulesWithRatings.length > 0 
      ? modulesWithRatings.reduce((sum: number, module: any) => sum + module.rating, 0) / modulesWithRatings.length
      : 0;
    
    // Calculate total watch time (estimate based on video durations and user activity)
    const totalWatchTime = this.calculateTotalWatchTime(users, modules);
    
    // Calculate new users this month
    const newUsersThisMonth = users.filter((user: any) => {
      if (!user.createdAt) return false;
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === currentMonth && 
             userDate.getFullYear() === currentYear;
    }).length;

    return {
      totalUsers,
      activeVideos,
      monthlyRevenue,
      uptime,
      totalPurchases,
      averageRating,
      totalWatchTime,
      newUsersThisMonth
    };
  }

  private calculateUptime(): number {
    // Simulate uptime calculation based on various factors
    // In a real system, this would come from monitoring services
    const baseUptime = 99.5;
    const randomVariation = (Math.random() - 0.5) * 0.5; // ±0.25%
    return Math.min(100, Math.max(95, baseUptime + randomVariation));
  }

  private calculateTotalWatchTime(users: any[], modules: any[]): number {
    // Estimate total watch time in hours
    let totalMinutes = 0;
    
    users.forEach(user => {
      if (user.watchHistory && Array.isArray(user.watchHistory)) {
        user.watchHistory.forEach((watch: any) => {
          if (watch.duration) {
            // Parse duration string (e.g., "15:30" -> 15.5 minutes)
            const [minutes, seconds] = watch.duration.split(':').map(Number);
            const watchedMinutes = minutes + (seconds || 0) / 60;
            
            // Apply progress percentage if available
            const progress = watch.progress || 100;
            totalMinutes += (watchedMinutes * progress) / 100;
          }
        });
      }
      
      // Estimate additional watch time based on purchased modules
      if (user.purchasedModules && Array.isArray(user.purchasedModules)) {
        user.purchasedModules.forEach((moduleId: string) => {
          const module = modules.find((m: any) => m.id === moduleId);
          if (module && module.duration) {
            const [minutes, seconds] = module.duration.split(':').map(Number);
            const moduleMinutes = minutes + (seconds || 0) / 60;
            totalMinutes += moduleMinutes * 0.7; // Assume 70% completion rate
          }
        });
      }
    });
    
    return Math.round(totalMinutes / 60); // Convert to hours
  }

  private getDefaultStatistics(): PlatformStatistics {
    return {
      totalUsers: 0,
      activeVideos: 0,
      monthlyRevenue: 0,
      uptime: 99.5,
      totalPurchases: 0,
      averageRating: 0,
      totalWatchTime: 0,
      newUsersThisMonth: 0
    };
  }

  // Method to invalidate cache
  invalidateCache(): void {
    this.cachedStats = null;
    this.lastCalculated = 0;
  }

  // Method to get formatted statistics for display
  getFormattedStatistics(stats: PlatformStatistics) {
    return {
      totalUsers: stats.totalUsers.toLocaleString(),
      activeVideos: stats.activeVideos.toLocaleString(),
      monthlyRevenue: `$${stats.monthlyRevenue.toLocaleString()}`,
      uptime: `${stats.uptime.toFixed(1)}%`,
      totalPurchases: stats.totalPurchases.toLocaleString(),
      averageRating: stats.averageRating.toFixed(1),
      totalWatchTime: `${stats.totalWatchTime.toLocaleString()}h`,
      newUsersThisMonth: stats.newUsersThisMonth.toLocaleString()
    };
  }
}

// Export singleton instance
export const platformStatsCalculator = PlatformStatsCalculator.getInstance();