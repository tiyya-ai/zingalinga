// Real-time data synchronization utility
export class RealTimeSync {
  private static instance: RealTimeSync;
  private listeners: Map<string, Function[]> = new Map();
  private storageKey = 'zinga-linga-app-data';

  static getInstance(): RealTimeSync {
    if (!RealTimeSync.instance) {
      RealTimeSync.instance = new RealTimeSync();
    }
    return RealTimeSync.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for storage changes across tabs
      window.addEventListener('storage', this.handleStorageChange.bind(this));
      
      // Listen for custom events within the same tab
      window.addEventListener('dataUpdated', this.handleDataUpdate.bind(this));
    }
  }

  // Subscribe to data changes
  subscribe(key: string, callback: Function) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(callback);
  }

  // Unsubscribe from data changes
  unsubscribe(key: string, callback: Function) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners of data changes
  notify(key: string, data: any) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Trigger data update event
  triggerUpdate(key: string, data: any) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dataUpdated', {
        detail: { key, data }
      }));
    }
  }

  // Handle storage changes from other tabs
  private handleStorageChange(event: StorageEvent) {
    if (event.key === this.storageKey && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        this.notify('modules', data.modules);
        this.notify('users', data.users);
        this.notify('all', data);
      } catch (error) {
        console.error('Error parsing storage data:', error);
      }
    }
  }

  // Handle data updates within the same tab
  private handleDataUpdate(event: CustomEvent) {
    const { key, data } = event.detail;
    this.notify(key, data);
  }
}

export const realTimeSync = RealTimeSync.getInstance();