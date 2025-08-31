// Simple data persistence API
let appData = null;

// Handle GET requests
function handleGet() {
  if (appData) {
    return new Response(JSON.stringify(appData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Return empty structure if no data
  return new Response(JSON.stringify({
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
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle POST requests
function handlePost(data) {
  try {
    appData = data;
    console.log('Data saved successfully with', data.modules?.length || 0, 'modules');
    
    return new Response(JSON.stringify({
      success: true,
      moduleCount: data.modules?.length || 0,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Save error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Export for use in fetch requests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handleGet, handlePost };
}