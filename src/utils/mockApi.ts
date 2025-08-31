// Mock API implementation for data persistence
let persistentData: any = null;

// Initialize with localStorage data if available
const initializeData = () => {
  try {
    const stored = localStorage.getItem('zinga-linga-persistent-data');
    if (stored) {
      persistentData = JSON.parse(stored);
      console.log('📦 Loaded persistent data with', persistentData?.modules?.length || 0, 'modules');
    }
  } catch (error) {
    console.error('Failed to load persistent data:', error);
  }
};

// Save to localStorage
const saveToStorage = (data: any) => {
  try {
    localStorage.setItem('zinga-linga-persistent-data', JSON.stringify(data));
    console.log('💾 Saved to localStorage with', data?.modules?.length || 0, 'modules');
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Mock fetch implementation
export const mockFetch = (url: string, options?: RequestInit): Promise<Response> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (url === '/api/data') {
        if (options?.method === 'POST') {
          // Handle POST - save data
          try {
            const data = JSON.parse(options.body as string);
            persistentData = data;
            saveToStorage(data);
            
            resolve(new Response(JSON.stringify({
              success: true,
              moduleCount: data.modules?.length || 0,
              timestamp: new Date().toISOString()
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }));
          } catch (error) {
            resolve(new Response(JSON.stringify({
              success: false,
              error: 'Invalid JSON'
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }));
          }
        } else {
          // Handle GET - return data
          if (persistentData) {
            resolve(new Response(JSON.stringify(persistentData), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }));
          } else {
            // Return empty structure
            const emptyData = {
              users: [],
              modules: [],
              purchases: [],
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
              packages: [],
              bundles: [],
              ageGroups: [],
              settings: {
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
                apiEndpoint: '/api/data',
                enableRealTimeSync: true
              },
              lastUpdated: new Date().toISOString(),
              lastLoaded: new Date().toISOString()
            };
            
            resolve(new Response(JSON.stringify(emptyData), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }));
          }
        }
      } else {
        // Handle other URLs with original fetch
        resolve(fetch(url, options));
      }
    }, 100); // Small delay to simulate network
  });
};

// Initialize on module load
initializeData();

// Override global fetch for /api/data requests
const originalFetch = window.fetch;
window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString();
  
  if (url === '/api/data') {
    return mockFetch(url, init);
  }
  
  return originalFetch(input, init);
};

export default mockFetch;