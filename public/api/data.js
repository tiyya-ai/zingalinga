const fs = require('fs');
const path = require('path');

const dataFilePath = path.resolve(process.cwd(), 'data', 'global-app-data.json');

// Handle GET requests
function handleGet() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
      if (fileContent) {
        return new Response(fileContent, {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
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
  } catch (error) {
    console.error('Read error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle POST requests
function handlePost(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
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