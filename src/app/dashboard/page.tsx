'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { authManager } from '../../utils/auth';
import { vpsDataStore } from '../../utils/vpsDataStore';
import { User, Module, Purchase, ContentFile } from '../../types';

const ProfessionalUserDashboard = dynamic(() => import('../../components/ProfessionalUserDashboard'), {
  ssr: false
});

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [contentFiles, setContentFiles] = useState<ContentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const session = authManager.getCurrentSession();
      if (session && authManager.isSessionValid(session) && session.user.role !== 'admin') {
        vpsDataStore.setCurrentUser(session.user);
        setUser(session.user);
      } else {
        window.location.href = '/';
        return;
      }
    } catch (error) {
      window.location.href = '/';
      return;
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    if (user) {
      // Load data after user is confirmed
      const loadData = async () => {
        try {
          // Clear cache to get fresh data
          vpsDataStore.clearMemoryCache();
          const data = await vpsDataStore.loadData();
          setModules(data.modules || []);
          setPurchases(data.purchases || []);
          setContentFiles(data.contentFiles || []);
          
          // Check if user data has been updated in VPS and sync it
          const updatedUser = data.users?.find(u => u.id === user.id);
          if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(user)) {
            setUser(updatedUser);
            // Update session storage
            const currentSession = authManager.getCurrentSession();
            if (currentSession) {
              const updatedSession = { ...currentSession, user: updatedUser };
              authManager.setSession(updatedSession);
            }
          }
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      };
      loadData();
      
      // Set up periodic sync for profile updates
      const syncInterval = setInterval(() => {
        vpsDataStore.clearMemoryCache();
        loadData();
      }, 5000);
      return () => clearInterval(syncInterval);
    }
  }, [user]);

  const handleLogout = () => {
    authManager.logout();
    // Clear any intervals or timeouts
    vpsDataStore.clearMemoryCache();
    // Redirect with logout parameter to avoid loading screen
    window.location.href = '/?logout=true';
  };

  const handlePurchase = async (moduleId: string) => {
    if (!user) return;
    try {
      const data = await vpsDataStore.loadData();
      const module = (data.modules || []).find(m => m.id === moduleId);
      const newPurchase = {
        id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        moduleId: moduleId,
        purchaseDate: new Date().toISOString(),
        amount: module?.price || 0,
        status: 'completed' as const
      };
      const updatedUser = {
        ...user,
        purchasedModules: [...(user.purchasedModules || []), moduleId],
        totalSpent: (user.totalSpent || 0) + (module?.price || 0)
      };
      const updatedUsers = (data.users || []).map(u => u.id === user.id ? updatedUser : u);
      const updatedData = {
        ...data,
        users: updatedUsers,
        purchases: [...(data.purchases || []), newPurchase]
      };
      await vpsDataStore.saveData(updatedData);
      setUser(updatedUser);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProfessionalUserDashboard 
      user={user}
      modules={modules}
      purchases={purchases}
      contentFiles={contentFiles}
      onLogout={handleLogout}
      onPurchase={handlePurchase}
      setUser={setUser}
    />
  );
}