import React, { useState, useEffect } from 'react';
import { User, Module, Purchase, ContentFile } from '../types';
import { LoginModal } from './LoginModal';
import { PremiumUserDashboard } from './PremiumUserDashboard';
import NextUIVideoAdmin from './NextUIVideoAdmin';
import ComprehensiveAdminDashboard from './ComprehensiveAdminDashboard';
import EnhancedUserDashboard from './EnhancedUserDashboard';
import FixedUserDashboard from './FixedUserDashboard';
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
import { vpsDataStore } from '../utils/vpsDataStore';

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
      try {
        const data = await vpsDataStore.loadData();
        setModules(data.modules || []);
        setPurchases(data.purchases || []);
        setContentFiles(data.contentFiles || []);
        console.log('PageRouter loaded data:', { 
          modules: data.modules?.length || 0, 
          purchases: data.purchases?.length || 0 
        });
      } catch (error) {
        console.warn('⚠️ Cloud load failed, using fallback:', error);
        const data = await vpsDataStore.loadData();
        setModules(data.modules || []);
        setPurchases(data.purchases || []);
        setContentFiles(data.contentFiles || []);
      }
    };
    
    loadInitialData();
  }, []);

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
        <FixedUserDashboard
          user={user}
          modules={modules}
          purchases={purchases}
          contentFiles={contentFiles}
          onLogout={onLogout}
          onPurchase={(moduleId) => onPurchase([moduleId])}
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