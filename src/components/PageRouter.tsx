import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { User, Module, Purchase, ContentFile } from '../types';
import { LoginModal } from './LoginModal';
import ModernAdminDashboard from './ModernAdminDashboard';

const ProfessionalUserDashboard = dynamic(() => import('./ProfessionalUserDashboard'), {
  ssr: false
});
import Header from './Header';
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
import UserProfilePage from '../page-components/UserProfilePage';
import AdminProfilePage from '../page-components/AdminProfilePage';

import { authManager, AuthSession } from '../utils/auth';
import { vpsDataStore } from '../utils/vpsDataStore';
import { CartProvider } from '../hooks/useCart';
import { ClientOnly } from './ClientOnly';

// Import the main landing page content
import { LandingPage } from './LandingPage';
import { PackagesPage } from './PackagesPage';

interface PageRouterProps {}

export const PageRouter: React.FC<PageRouterProps> = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<AuthSession | null>(null);

  const [currentPage, setCurrentPage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showGuestLoginModal, setShowGuestLoginModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [contentFiles, setContentFiles] = useState<ContentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on page load
    const initializeAuth = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        const session = authManager.getCurrentSession();
        if (session && authManager.isSessionValid(session)) {
          console.log('✅ Valid session found:', session.user.email, session.user.role);
          setUser(session.user);
          setCurrentSession(session);
          vpsDataStore.setCurrentUser(session.user);
        } else {
          console.log('❌ No valid session found');
          // Clear any invalid session data
          authManager.logout();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        try {
          authManager.logout();
        } catch (logoutError) {
          console.error('Error during logout:', logoutError);
        }
      }
    };
    
    if (typeof window !== 'undefined') {
      initializeAuth();
    }
    
    // Set page based on current URL
    const path = window.location.pathname;
    if (path === '/packages') {
      setCurrentPage('packages');
    } else if (path === '/about') {
      setCurrentPage('about');
    } else if (path === '/contact') {
      setCurrentPage('contact');
    } else if (path === '/help') {
      setCurrentPage('help');
    } else {
      setCurrentPage('home');
    }
    
    // Handle browser back/forward buttons
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (currentPath === '/packages') {
        setCurrentPage('packages');
      } else if (currentPath === '/about') {
        setCurrentPage('about');
      } else if (currentPath === '/contact') {
        setCurrentPage('contact');
      } else if (currentPath === '/help') {
        setCurrentPage('help');
      } else {
        setCurrentPage('home');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Listen for guest login modal trigger
    const handleShowGuestLogin = () => {
      setShowGuestLoginModal(true);
    };
    
    window.addEventListener('showGuestLogin', handleShowGuestLogin);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('showGuestLogin', handleShowGuestLogin);
    };
  }, []);

  const handleLogin = async (userData: User) => {
    console.log('🔐 User logged in:', userData.email, userData.role);
    setUser(userData);
    vpsDataStore.setCurrentUser(userData);
    const session = authManager.getCurrentSession();
    setCurrentSession(session);
    
    // Ensure session is properly saved
    if (session) {
      console.log('💾 Session saved for:', userData.email);
    }
  };

  const handleLogout = () => {
    authManager.logout();
    setUser(null);
    setCurrentSession(null);
    vpsDataStore.setCurrentUser(null);
  };

  const handlePurchase = async (moduleIds: string[]) => {
    if (!user) return;
    try {
      const data = await vpsDataStore.loadData();
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
      const updatedUser = {
        ...user,
        purchasedModules: [...(user.purchasedModules || []), ...moduleIds],
        totalSpent: (user.totalSpent || 0) + newPurchases.reduce((sum, p) => sum + p.amount, 0)
      };
      const updatedUsers = (data.users || []).map(u => u.id === user.id ? updatedUser : u);
      const updatedData = {
        ...data,
        users: updatedUsers,
        purchases: [...(data.purchases || []), ...newPurchases]
      };
      await vpsDataStore.saveData(updatedData);
      setUser(updatedUser);
    } catch (error) {

    }
  };

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const data = await vpsDataStore.loadData();
      setModules(data.modules || []);
      setPurchases(data.purchases || []);
      setContentFiles(data.contentFiles || []);

    } catch (error) {

      // Initialize with empty data on error
      setModules([]);
      setPurchases([]);
      setContentFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts with cloud sync
  useEffect(() => {
    loadInitialData();
  }, []);



  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    
    // Update URL without page reload
    const url = page === 'home' ? '/' : `/${page}`;
    window.history.pushState({}, '', url);
    
    // Scroll to top when navigating
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // If user is logged in, show appropriate dashboard
  if (user) {
    if (user.role === 'admin') {
      return (
        <ModernAdminDashboard 
          user={user} 
          onLogout={handleLogout}
          onNavigate={handleNavigation}
        />
      );
    } else {
      return (
        <ProfessionalUserDashboard 
          user={user}
          modules={modules}
          purchases={purchases}
          contentFiles={contentFiles}
          onLogout={handleLogout}
          onPurchase={(moduleId) => handlePurchase([moduleId])}
          setUser={setUser}
        />
      );
    }
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} onLoginClick={() => setShowLoginModal(true)} />;
      case 'help':
        return <HelpPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} onLoginClick={() => setShowLoginModal(true)} />;
      case 'privacy':
        return <PrivacyPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} onLoginClick={() => setShowLoginModal(true)} />;
      case 'terms':
        return <TermsPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} onLoginClick={() => setShowLoginModal(true)} />;
      case 'contact':
        return <ContactPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} onLoginClick={() => setShowLoginModal(true)} />;
      case 'guide':
        return <ParentGuidePage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} onLoginClick={() => setShowLoginModal(true)} />;
      case 'support':
        return <TechnicalSupportPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} onLoginClick={() => setShowLoginModal(true)} />;
      case 'requirements':
        return <SystemRequirementsPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} onLoginClick={() => setShowLoginModal(true)} />;
      case 'troubleshoot':
        return <TroubleshootingPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} onLoginClick={() => setShowLoginModal(true)} />;
      case 'cookies':
        return <CookiePolicyPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} onLoginClick={() => setShowLoginModal(true)} />;
      case 'refund':
        return <RefundPolicyPage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'coppa':
        return <COPPACompliancePage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} onLoginClick={() => setShowLoginModal(true)} />;
      case 'profile':
        return <UserProfilePage onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'packages':
        return <PackagesPage onBack={() => handleNavigation('home')} />;

      case 'home':
      default:
        return <LandingPage 
          onLoginClick={() => setShowLoginModal(true)} 
          onPackagesClick={() => handleNavigation('packages')}
        />;
    }
  };





  const content = renderCurrentPage();

  return (
    <>
      <div className="min-h-screen bg-white overflow-hidden font-mali" suppressHydrationWarning>
        <Header 
          onLoginClick={() => setShowLoginModal(true)}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onNavigate={handleNavigation}
        />
        <CartProvider>
          <ClientOnly>
            <div>
              {content}
            </div>
          </ClientOnly>
        </CartProvider>
        {/* Only show footer for non-dashboard pages */}
        {!user && <Footer onNavigate={handleNavigation} />}
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
      
      {/* Guest Login Modal */}
      {showGuestLoginModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50 rounded-2xl"></div>
            
            <button
              onClick={() => setShowGuestLoginModal(false)}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-white/20 rounded-full transition-all duration-200 group"
            >
              <span className="text-xl text-gray-600 group-hover:text-gray-800 transition-colors">×</span>
            </button>
            
            <div className="relative bg-gradient-to-r from-green-500 to-blue-500 backdrop-blur-sm p-6 rounded-t-2xl border-b border-white/20">
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-3 w-fit mx-auto mb-4">
                  <span className="text-2xl">🔑</span>
                </div>
                <h2 className="text-xl font-mali font-bold text-white mb-2">Login to Your Account</h2>
                <p className="text-gray-100 font-mali text-sm">🎬 Login to watch your purchased videos</p>
              </div>
            </div>
            
            <div className="relative p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-green-800 font-mali mb-2">🎉 Welcome Back!</h4>
                <p className="text-sm text-green-700 font-mali mb-3">
                  Your account: <strong>{typeof window !== 'undefined' ? localStorage.getItem('guestAccountEmail') : ''}</strong><br/>
                  Password: <span className="bg-green-200 px-2 py-1 rounded font-mono">guest123</span>
                </p>
              </div>
              
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 font-mali">Email Address</label>
                  <input
                    type="email"
                    defaultValue={typeof window !== 'undefined' ? localStorage.getItem('guestAccountEmail') || '' : ''}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-mali bg-gray-50 focus:bg-white"
                    readOnly
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 font-mali">Password</label>
                  <input
                    type="text"
                    defaultValue="guest123"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-mali bg-gray-50 focus:bg-white"
                    readOnly
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowGuestLoginModal(false);
                    setShowLoginModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 font-mali text-base shadow-lg"
                >
                  🚀 Login & Watch Videos
                </button>
              </form>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 font-mali text-center">
                  💡 Your videos are ready to watch after login!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};