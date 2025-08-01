'use client'

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { LandingPage } from '../components/LandingPage';
import { Footer } from '../components/footer';
import { LoginModal } from '../components/LoginModal';
import FixedUserDashboard from '../components/FixedUserDashboard';
import ComprehensiveAdminDashboard from '../components/ComprehensiveAdminDashboard';
import { User, Module, Purchase, ContentFile } from '../types';
import { vpsDataStore } from '../utils/vpsDataStore';

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
        const data = await vpsDataStore.loadData();
        setModules(data.modules || []);
        setPurchases(data.purchases || []);
        setContentFiles(data.contentFiles || []);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  const handleLogin = (userData: User) => {
    console.log('Login successful:', userData);
    setUser(userData);
    setIsLoginModalOpen(false);
    // Navigate to appropriate dashboard based on user role
    if (userData.role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else {
      setCurrentPage('user-dashboard');
    }
  };

  const handleLoginClick = () => {
    console.log('Login button clicked, opening modal');
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  const handlePurchase = async (moduleIds: string[]) => {
    if (!user) return;

    try {
      // Update user's purchased modules
      const updatedUser = {
        ...user,
        purchasedModules: [...(user.purchasedModules || []), ...moduleIds.filter(id => !(user.purchasedModules || []).includes(id))]
      };
      
      // Calculate total amount
      const purchasedModules = (modules || []).filter(module => moduleIds.includes(module.id));
      const totalAmount = purchasedModules.reduce((sum, module) => sum + module.price, 0);
      updatedUser.totalSpent = (updatedUser.totalSpent || 0) + totalAmount;
      
      // Create purchase record
      const purchase: Purchase = {
        id: `purchase-${Date.now()}`,
        userId: user.id,
        moduleIds: moduleIds,
        amount: totalAmount,
        status: 'completed',
        createdAt: new Date().toISOString(),
        paymentMethod: 'stripe'
      };

      // Update data store
      const currentData = await vpsDataStore.loadData();
      const updatedData = {
        ...currentData,
        users: (currentData.users || []).map(u => u.id === user.id ? updatedUser : u),
        purchases: [...(currentData.purchases || []), purchase]
      };
      
      await vpsDataStore.saveData(updatedData);
      
      // Update local state
      setUser(updatedUser);
      setPurchases(updatedData.purchases);
      
      console.log('Purchase completed successfully:', moduleIds);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  // Render different pages based on currentPage state
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'user-dashboard':
        return user && user.role !== 'admin' ? (
          <FixedUserDashboard 
            user={user} 
            modules={modules}
            purchases={purchases}
            contentFiles={contentFiles}
            onModuleUpdate={async (updatedModules) => {
              setModules(updatedModules);
              const data = await vpsDataStore.loadData();
              await vpsDataStore.saveData({ ...data, modules: updatedModules });
            }}
            onLogout={handleLogout}
            onPurchase={handlePurchase}
          />
        ) : (
          <LandingPage onLoginClick={handleLoginClick} />
        );
      
      case 'admin-dashboard':
        return user && user.role === 'admin' ? (
          <ComprehensiveAdminDashboard user={user} onLogout={handleLogout} />
        ) : (
          <LandingPage onLoginClick={handleLoginClick} />
        );
      
      default:
        return (
          <>
            <LandingPage onLoginClick={handleLoginClick} />
            <Footer onNavigate={handleNavigation} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Only show header on home page or when not logged in */}
      {(currentPage === 'home' || !user) && (
        <Header 
          onLoginClick={handleLoginClick}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onNavigate={handleNavigation}
        />
      )}
      
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