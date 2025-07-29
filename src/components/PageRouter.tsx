import React, { useState, useEffect } from 'react';
import { User, Module, Purchase, ContentFile } from '../types';
import { LoginModal } from './LoginModal';
import { ModernUserDashboard } from './ModernUserDashboard';
import { ComprehensiveAdminDashboard } from './ComprehensiveAdminDashboard';
import { Header } from './Header';
import { Footer } from './footer';
import AboutPage from '../page-components/AboutPage';
import HelpPage from '../page-components/HelpPage';
import PrivacyPage from '../page-components/PrivacyPage';
import TermsPage from '../page-components/TermsPage';
import ContactPage from '../page-components/ContactPage';
import { ParentGuidePage } from '../page-components/ParentGuidePage';
import { TechnicalSupportPage } from '../page-components/TechnicalSupportPage';
import { SystemRequirementsPage } from '../page-components/SystemRequirementsPage';
import { TroubleshootingPage } from '../page-components/TroubleshootingPage';
import { COPPACompliancePage } from '../page-components/COPPACompliancePage';
import { CookiePolicyPage } from '../page-components/CookiePolicyPage';
import { RefundPolicyPage } from '../page-components/RefundPolicyPage';
import { UserProfilePage } from '../page-components/UserProfilePage';

import { authManager, AuthSession } from '../utils/auth';
import { cloudDataStore } from '../utils/cloudDataStore';

// Import the main landing page content
import { LandingPage } from './LandingPage';

interface PageRouterProps {
  user: User | null;
  currentSession: AuthSession | null;
  onLogin: (userData: User) => void;
  onLogout: () => void;
  onPurchase: (moduleIds: string[]) => void;
}

export const PageRouter: React.FC<PageRouterProps> = ({
  user,
  currentSession,
  onLogin,
  onLogout,
  onPurchase
}) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [contentFiles, setContentFiles] = useState<ContentFile[]>([]);

  // Load data when component mounts with cloud sync
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('🔄 PageRouter: Loading initial data with cloud sync');
      try {
        const data = await cloudDataStore.loadData();
        setModules(data.modules || []);
        setPurchases(data.purchases || []);
        setContentFiles(data.contentFiles || []);
        console.log('📦 PageRouter: Loaded', data.modules?.length || 0, 'modules and', data.purchases?.length || 0, 'purchases');
      } catch (error) {
        console.warn('⚠️ Cloud load failed, using fallback:', error);
        const data = await cloudDataStore.loadData();
        setModules(data.modules || []);
        setPurchases(data.purchases || []);
        setContentFiles(data.contentFiles || []);
      }
    };
    
    loadInitialData();
  }, []);

  // Auto-refresh for user dashboard to see admin changes (modules, image covers, orders, etc.)
  useEffect(() => {
    if (!user || user.role === 'admin') return;
    
    console.log('🔄 Setting up auto-refresh for user dashboard to sync admin changes');
    
    let lastDataHash = '';
    
    const refreshData = async () => {
      const data = await cloudDataStore.loadData();
      
      // Create a simple hash of critical data to detect any changes
      const dataHash = JSON.stringify({
        moduleCount: data.modules?.length || 0,
        purchaseCount: data.purchases?.length || 0,
        contentCount: data.contentFiles?.length || 0,
        lastUpdated: data.lastUpdated,
        moduleUpdates: data.modules?.map(m => ({
          id: m.id,
          title: m.title,
          demoVideo: m.demoVideo,
          updatedAt: m.updatedAt,
          isActive: m.isActive,
          isVisible: m.isVisible
        })) || []
      });
      
      // If data hash changed, refresh everything
      if (dataHash !== lastDataHash) {
        console.log('🔄 Data changes detected, refreshing user dashboard...');
        setModules(data.modules || []);
        setPurchases(data.purchases || []);
        setContentFiles(data.contentFiles || []);
        lastDataHash = dataHash;
      }
      
      // Also check lastUpdated timestamp for immediate updates
      if (data.lastUpdated) {
        const storedTime = new Date(data.lastUpdated).getTime();
        const currentTime = Date.now();
        const timeDiff = currentTime - storedTime;
        
        // If data was updated within the last 3 seconds, force refresh
        if (timeDiff < 3000) {
          console.log('⚡ Recent admin update detected, forcing immediate refresh');
          setModules(data.modules || []);
          setPurchases(data.purchases || []);
          setContentFiles(data.contentFiles || []);
          lastDataHash = dataHash;
        }
      }
    };
    
    // Initial refresh
    refreshData();
    
    // Set up interval for continuous checking
    const interval = setInterval(refreshData, 1000); // Check every 1 second for faster updates
    return () => clearInterval(interval);
  }, [user]); // Only depend on user, not on modules/purchases to avoid restart loops

  // Refresh on tab focus to see admin changes immediately
  useEffect(() => {
    if (!user || user.role === 'admin') return;
    
    const handleFocus = async () => {
      console.log('👁️ Tab focused, refreshing data for modules and purchases');
      const data = await cloudDataStore.loadData();
      setModules(data.modules || []);
      setPurchases(data.purchases || []);
      setContentFiles(data.contentFiles || []);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // If user is logged in, show appropriate dashboard
  if (user) {
    if (user.role === 'admin') {
      return (
        <ComprehensiveAdminDashboard 
          user={user} 
          onLogout={onLogout}
        />
      );
    } else {
      return (
        <ModernUserDashboard 
          user={user} 
          modules={modules}
          purchases={purchases}
          contentFiles={contentFiles}
          onModuleUpdate={async (updatedModules) => {
            console.log('📝 User dashboard updating modules:', updatedModules.length);
            setModules(updatedModules);
            const data = await cloudDataStore.loadData();
      await cloudDataStore.saveData({ ...data, modules: updatedModules });
          }}
          onLogout={onLogout}
          onPurchase={onPurchase}
        />
      );
    }
  }

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'help':
        return <HelpPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'privacy':
        return <PrivacyPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'terms':
        return <TermsPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'contact':
        return <ContactPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'guide':
        return <ParentGuidePage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'support':
        return <TechnicalSupportPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'requirements':
        return <SystemRequirementsPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'troubleshoot':
        return <TroubleshootingPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'cookies':
        return <CookiePolicyPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'refund':
        return <RefundPolicyPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'coppa':
        return <COPPACompliancePage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;

      case 'home':
      default:
        return (
          <div className="min-h-screen bg-white overflow-hidden font-mali">
            <Header 
              onLoginClick={() => setShowLoginModal(true)}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              onNavigate={handleNavigation}
            />
            <LandingPage onLoginClick={() => setShowLoginModal(true)} />
            <Footer onNavigate={handleNavigation} />
          </div>
        );
    }
  };

  return (
    <>
      {renderCurrentPage()}
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={onLogin}
      />
    </>
  );
};