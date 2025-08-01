'use client'

import React, { useState, useEffect } from 'react';
import { PageRouter } from '../src/components/PageRouter';
import { User } from '../src/types';
import { authManager } from '../src/utils/auth';
import { vpsDataStore } from '../src/utils/vpsDataStore';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);

  // Check for existing session on mount
  useEffect(() => {
    const session = authManager.getCurrentSession();
    if (session && authManager.isSessionValid(session)) {
      setUser(session.user);
      setCurrentSession(session);
      vpsDataStore.setCurrentUser(session.user);
    }
  }, []);

  const handleLogin = async (userData: User) => {
    setUser(userData);
    
    // Enable cloud sync for the user
    vpsDataStore.setCurrentUser(userData);
    
    // Get the current session
    const session = authManager.getCurrentSession();
    setCurrentSession(session);
  };

  const handleLogout = () => {
    authManager.logout();
    setUser(null);
    setCurrentSession(null);
    vpsDataStore.setCurrentUser(null);
  };

  const handlePurchase = async (moduleIds: string[]) => {
    if (!user) {
      return;
    }

    try {
      
      // Load current data
      const data = await vpsDataStore.loadData();
      
      // Create purchase records
      const newPurchases = moduleIds.map(moduleId => {
        const module = (data.modules || []).find(m => m.id === moduleId);
        return {
          id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          moduleId: moduleId,
          purchaseDate: new Date().toISOString(),
          amount: module?.price || 0,
          status: 'completed' as const
        };
      });

      // Update user's purchased modules
      const updatedUser = {
        ...user,
        purchasedModules: [...(user.purchasedModules || []), ...moduleIds],
        totalSpent: (user.totalSpent || 0) + newPurchases.reduce((sum, p) => sum + p.amount, 0)
      };

      // Update users array
      const updatedUsers = (data.users || []).map(u => 
        u.id === user.id ? updatedUser : u
      );

      // Save updated data
      const updatedData = {
        ...data,
        users: updatedUsers,
        purchases: [...(data.purchases || []), ...newPurchases]
      };

      await vpsDataStore.saveData(updatedData);
      
      // Update local user state
      setUser(updatedUser);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <PageRouter 
      user={user}
      currentSession={currentSession}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onPurchase={handlePurchase}
    />
  );
}