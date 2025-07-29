// Enhanced Firebase Configuration with Robust Error Handling
import { initializeApp } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration for tutor-chat-lms project
// Using environment variables for better security
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBVtYLaXMsL-I5ZUzKaTQec5kR1d-YNEP8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "tutor-chat-lms.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "tutor-chat-lms",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "tutor-chat-lms.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "343459362630",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:343459362630:web:890b7e87069d0b067b1747"
};

// Firebase instances
let app: any = null;
let db: any = null;
let auth: any = null;
let isInitialized = false;
let initializationAttempts = 0;
const maxRetries = 3;

// Firebase availability checker
export function isFirebaseAvailable(): boolean {
  return !!(app && db && isInitialized);
}

// Initialize Firebase with retry logic
async function initializeFirebase(): Promise<boolean> {
  if (isInitialized && app && db) {
    return true;
  }

  initializationAttempts++;
  console.log(`🔥 Firebase initialization attempt ${initializationAttempts}/${maxRetries}`);

  try {
    // Firebase can work in both browser and server environments
    // No need to restrict to browser only

    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');

    // Initialize Firestore
    db = getFirestore(app);
    console.log('✅ Firestore initialized');

    // Initialize Auth
    auth = getAuth(app);
    console.log('✅ Firebase Auth initialized');

    // Test connection with a simple operation
    await testFirebaseConnection();

    // Setup network monitoring
    setupNetworkMonitoring();

    isInitialized = true;
    console.log('🎉 Firebase fully initialized and tested');
    console.log(`📊 Project: ${firebaseConfig.projectId}`);
    
    return true;

  } catch (error: any) {
    console.error(`❌ Firebase initialization failed (attempt ${initializationAttempts}):`, error);
    
    // Reset instances on failure
    app = null;
    db = null;
    auth = null;
    isInitialized = false;

    // Retry logic
    if (initializationAttempts < maxRetries) {
      const delay = Math.pow(2, initializationAttempts) * 1000; // Exponential backoff
      console.log(`🔄 Retrying Firebase initialization in ${delay}ms...`);
      
      return new Promise((resolve) => {
        setTimeout(async () => {
          const result = await initializeFirebase();
          resolve(result);
        }, delay);
      });
    } else {
      console.warn('⚠️ Firebase initialization failed after all retries, falling back to localStorage');
      return false;
    }
  }
}

// Test Firebase connection
async function testFirebaseConnection(): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    // Import Firestore functions dynamically to avoid issues
    const { doc, getDoc } = await import('firebase/firestore');
    
    // Test with a simple read operation
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    
    console.log('✅ Firebase connection test successful');
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn('⚠️ Firebase permissions may need configuration, but connection is working');
    } else {
      throw error;
    }
  }
}

// Setup network monitoring
function setupNetworkMonitoring(): void {
  if (typeof window === 'undefined' || !db) return;

  // Handle online/offline events
  window.addEventListener('online', async () => {
    console.log('🌐 Network restored, enabling Firestore');
    try {
      await enableNetwork(db);
      console.log('✅ Firestore network enabled');
    } catch (error) {
      console.warn('⚠️ Failed to enable Firestore network:', error);
    }
  });

  window.addEventListener('offline', () => {
    console.log('📴 Network lost, Firestore will use offline cache');
  });

  // Periodic connection check
  setInterval(async () => {
    if (isInitialized && navigator.onLine) {
      try {
        await testFirebaseConnection();
      } catch (error) {
        console.warn('⚠️ Periodic Firebase connection check failed:', error);
      }
    }
  }, 60000); // Check every minute
}

// Get Firebase status
function getFirebaseStatus() {
  return {
    isInitialized,
    hasApp: !!app,
    hasDb: !!db,
    hasAuth: !!auth,
    attempts: initializationAttempts,
    projectId: firebaseConfig.projectId,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true
  };
}

// Force reinitialize Firebase
async function reinitializeFirebase(): Promise<boolean> {
  console.log('🔄 Force reinitializing Firebase...');
  
  // Reset state
  app = null;
  db = null;
  auth = null;
  isInitialized = false;
  initializationAttempts = 0;
  
  return await initializeFirebase();
}

// Initialize Firebase immediately for both client and server
initializeFirebase().then((success) => {
  if (success) {
    console.log('🚀 Firebase initialization completed successfully');
  } else {
    console.warn('⚠️ Firebase initialization failed, app will run in offline mode');
  }
}).catch((error) => {
  console.error('💥 Critical Firebase initialization error:', error);
});

// Also initialize on window load for better reliability
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (!isInitialized) {
      console.log('🔄 Reinitializing Firebase on window load...');
      initializeFirebase();
    }
  });
}

// Export Firebase instances and utilities
export { db, auth, initializeFirebase, getFirebaseStatus, reinitializeFirebase };
export default app;