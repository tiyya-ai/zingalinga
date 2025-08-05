// React Hook for Optimized Data Loading
import { useState, useEffect, useCallback, useRef } from 'react';
import { optimizedDataStore } from '../utils/optimizedDataStore';

interface UseOptimizedDataOptions {
  dataType: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  suspense?: boolean;
}

interface UseOptimizedDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useOptimizedData<T = any>(
  options: UseOptimizedDataOptions
): UseOptimizedDataReturn<T> {
  const { dataType, autoRefresh = false, refreshInterval = 30000, suspense = false } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const subscriptionRef = useRef<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Load data function
  const loadData = useCallback(async (forceRefresh = false) => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await optimizedDataStore.getData(dataType, forceRefresh);
      
      if (mountedRef.current) {
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error(`Error loading ${dataType}:`, err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [dataType]);

  // Refresh function
  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  // Setup subscription and initial load
  useEffect(() => {
    mountedRef.current = true;
    
    // Subscribe to data changes
    subscriptionRef.current = optimizedDataStore.subscribe(dataType, (newData) => {
      if (mountedRef.current) {
        setData(newData);
        setLastUpdated(new Date());
      }
    });

    // Initial load
    loadData();

    // Setup auto-refresh if enabled
    if (autoRefresh && refreshInterval > 0) {
      const setupAutoRefresh = () => {
        refreshTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            loadData(true);
            setupAutoRefresh(); // Schedule next refresh
          }
        }, refreshInterval);
      };
      setupAutoRefresh();
    }

    // Cleanup function
    return () => {
      mountedRef.current = false;
      
      if (subscriptionRef.current) {
        optimizedDataStore.unsubscribe(dataType, subscriptionRef.current);
      }
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [dataType, autoRefresh, refreshInterval, loadData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdated
  };
}

// Specialized hooks for common data types
export function useModules(options?: Omit<UseOptimizedDataOptions, 'dataType'>) {
  return useOptimizedData<any[]>({
    dataType: 'modules',
    ...options
  });
}

export function useUsers(options?: Omit<UseOptimizedDataOptions, 'dataType'>) {
  return useOptimizedData<any[]>({
    dataType: 'users',
    ...options
  });
}

export function usePurchases(options?: Omit<UseOptimizedDataOptions, 'dataType'>) {
  return useOptimizedData<any[]>({
    dataType: 'purchases',
    ...options
  });
}

export function useSettings(options?: Omit<UseOptimizedDataOptions, 'dataType'>) {
  return useOptimizedData<any>({
    dataType: 'settings',
    ...options
  });
}

export function useUploadQueue(options?: Omit<UseOptimizedDataOptions, 'dataType'>) {
  return useOptimizedData<any[]>({
    dataType: 'uploadQueue',
    ...options
  });
}

// Hook for multiple data types
export function useMultipleData(dataTypes: string[], options?: Omit<UseOptimizedDataOptions, 'dataType'>) {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAllData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const promises = dataTypes.map(type => 
        optimizedDataStore.getData(type, forceRefresh)
      );

      const results = await Promise.allSettled(promises);
      const newData: Record<string, any> = {};

      results.forEach((result, index) => {
        const dataType = dataTypes[index];
        if (result.status === 'fulfilled') {
          newData[dataType] = result.value;
        } else {
          console.error(`Failed to load ${dataType}:`, result.reason);
          newData[dataType] = null;
        }
      });

      setData(newData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [dataTypes]);

  const refresh = useCallback(async () => {
    await loadAllData(true);
  }, [loadAllData]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdated
  };
}

// Performance monitoring hook
export function useDataPerformance() {
  const [stats, setStats] = useState<any>(null);

  const updateStats = useCallback(() => {
    setStats(optimizedDataStore.getCacheStats());
  }, []);

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [updateStats]);

  return {
    stats,
    clearCache: (dataType?: string) => {
      optimizedDataStore.clearCache(dataType);
      updateStats();
    },
    preloadData: () => optimizedDataStore.preloadData()
  };
}