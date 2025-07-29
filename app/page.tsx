'use client'

import React, { useState, useEffect } from 'react';
import { Header } from '../src/components/Header';
import { LandingPage } from '../src/components/LandingPage';
import { Footer } from '../src/components/footer';
import { LoginModal } from '../src/components/LoginModal';
import { ModernUserDashboard } from '../src/components/ModernUserDashboard';
import { AdminDashboard } from '../src/components/AdminDashboard';
import { User, Module, Purchase, ContentFile } from '../src/types';
import { neonDataStore } from '../src/utils/neonDataStore';

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [contentFiles, setContentFiles] = useState<ContentFile[]>([]);

  // Debug log for modal state
  console.log('Modal state:', { isLoginModalOpen, user, currentPage });

  // Load data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await neonDataStore.loadData();
        setModules(data.modules);
        setPurchases(data.purchases);
        setContentFiles(data.contentFiles);
        setUsers(data.users);
        setAnalytics(data.analytics);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  const handleLogin = async (userData: User) => {
    console.log('Login successful:', userData);
    setUser(userData);
    setIsLoginModalOpen(false);
    
    // Enable cloud sync for the user
    neonDataStore.setCurrentUser(userData);
    
    // Reload data with cloud sync enabled
    try {
      const data = await neonDataStore.loadData();
      setModules(data.modules || []);
      setPurchases(data.purchases || []);
      setContentFiles(data.contentFiles || []);
    } catch (error) {
      console.error('Error reloading data after login:', error);
    }
    
    // Navigate to appropriate dashboard based on user role
    if (userData.role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else {
      setCurrentPage('user-dashboard');
    }
  };

  const handleLogout = () => {
    console.log('Logout triggered');
    setUser(null);
    setCurrentPage('home');
    neonDataStore.setCurrentUser(null);
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const handlePurchase = async (moduleId: string) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const module = modules.find(m => m.id === moduleId);
      if (!module) return;

      const newPurchase: Purchase = {
        id: `purchase_${Date.now()}`,
        userId: user.id,
        moduleId: moduleId,
        purchaseDate: new Date().toISOString(),
        amount: module.price,
        status: 'completed'
      };

      const updatedPurchases = [...purchases, newPurchase];
      setPurchases(updatedPurchases);

      // Update user's purchased modules
      const updatedUser = {
        ...user,
        purchasedModules: [...(user.purchasedModules || []), moduleId]
      };
      setUser(updatedUser);

      // Save to cloud
      await neonDataStore.saveData({
        users: [updatedUser],
        modules,
        purchases: updatedPurchases,
        contentFiles,
        analytics: {
          totalUsers: 1,
          totalRevenue: updatedPurchases.reduce((sum, p) => sum + p.amount, 0),
          totalPurchases: updatedPurchases.length,
          activeModules: modules.length
        }
      });

      console.log('Purchase completed:', newPurchase);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'user-dashboard':
        return (
          <ModernUserDashboard 
            user={user!} 
            modules={modules}
            purchases={purchases}
            onPurchase={handlePurchase}
            onLogout={handleLogout}
          />
        );
      case 'admin-dashboard':
        return (
          <AdminDashboard 
            user={user!}
            modules={modules}
            purchases={purchases}
            onModulesUpdate={setModules}
            onPurchasesUpdate={setPurchases}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <LandingPage 
            onLoginClick={() => setIsLoginModalOpen(true)}
            modules={modules}
            onPurchase={handlePurchase}
          />
        );
    }
  };

  // Render dashboards without header/footer, landing page with header/footer
  if (currentPage === 'user-dashboard' || currentPage === 'admin-dashboard') {
    return (
      <div className="min-h-screen">
        {renderCurrentPage()}
        {isLoginModalOpen && (
          <LoginModal 
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLogin={handleLogin}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header 
        user={user}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      
      <main className="relative">
        {renderCurrentPage()}
      </main>
      
      <Footer />
      
      {isLoginModalOpen && (
        <LoginModal 
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}