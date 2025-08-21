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
  const [prefilledEmail, setPrefilledEmail] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [contentFiles, setContentFiles] = useState<ContentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      if (typeof window === 'undefined') return;
      
      // Set page based on current URL first
      const path = window.location.pathname;
      if (path === '/packages') {
        setCurrentPage('packages');
      } else if (path === '/about') {
        setCurrentPage('about');
      } else if (path === '/contact') {
        setCurrentPage('contact');
      } else if (path === '/help') {
        setCurrentPage('help');

      } else if (path === '/admin') {
        setCurrentPage('admin');
      } else if (path === '/dashboard') {
        setCurrentPage('dashboard');
      } else {
        // Don't set page to 'home' immediately - let auth check determine the correct page
        setCurrentPage('');
      }
      
      // Check for existing session
      try {
        const session = authManager.getCurrentSession();
        if (session && authManager.isSessionValid(session)) {
          console.log('✅ Valid session found:', session.user.email, session.user.role);
          setUser(session.user);
          setCurrentSession(session);
          vpsDataStore.setCurrentUser(session.user);
          
          // Handle URL-based routing for authenticated users
          if (path === '/admin' && session.user.role !== 'admin') {
            // Non-admin trying to access admin page - redirect to dashboard
            window.history.replaceState({}, '', '/dashboard');
            setCurrentPage('dashboard');

          } else if (path === '/dashboard' && session.user.role === 'admin') {
            // Admin trying to access user dashboard - redirect to admin
            window.history.replaceState({}, '', '/admin');
            setCurrentPage('admin');
          } else if (path === '/admin' || path === '/dashboard') {
            // Correct role for the URL - keep the current page
            // currentPage is already set above
          } else if (currentPage === '') {
            // No specific page set, redirect based on role
            if (session.user.role === 'admin') {
              window.history.replaceState({}, '', '/admin');
              setCurrentPage('admin');
            } else {
              window.history.replaceState({}, '', '/dashboard');
              setCurrentPage('dashboard');
            }
          }
        } else {
          console.log('❌ No valid session found');
          authManager.logout();
          // Redirect to home if trying to access protected routes without session
          if (path === '/admin' || path === '/dashboard') {
            window.history.replaceState({}, '', '/');
            setCurrentPage('home');
          } else if (currentPage === '') {
            setCurrentPage('home');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        try {
          authManager.logout();
        } catch (logoutError) {
          console.error('Error during logout:', logoutError);
        }
        // Redirect to home on error
        if (path === '/admin' || path === '/dashboard') {
          window.history.replaceState({}, '', '/');
          setCurrentPage('home');
        } else if (currentPage === '') {
          setCurrentPage('home');
        }
      }
      
      setIsLoading(false);
    };
    
    initializeApp();
    
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
      } else if (currentPath === '/admin') {
        if (user?.role === 'admin') {
          setCurrentPage('admin');
        } else {
          window.history.replaceState({}, '', '/');
          setCurrentPage('home');
        }
      } else if (currentPath === '/dashboard') {
        if (user && user.role !== 'admin') {
          setCurrentPage('dashboard');
        } else {
          window.history.replaceState({}, '', '/');
          setCurrentPage('home');
        }
      } else {
        // Only set to home if user is not logged in
        if (!user) {
          setCurrentPage('home');
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Listen for guest login modal trigger
    const handleShowGuestLogin = (event: any) => {
      const email = event.detail?.email || '';
      setPrefilledEmail(email);
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
    
    // Close any open login modals
    setShowLoginModal(false);
    setShowGuestLoginModal(false);
    setPrefilledEmail('');
    
    // Redirect to appropriate dashboard after login
    if (userData.role === 'admin') {
      window.history.pushState({}, '', '/admin');
      setCurrentPage('admin');
    } else {
      window.history.pushState({}, '', '/dashboard');
      setCurrentPage('dashboard');
    }
    
    // Ensure session is properly saved
    if (session) {
      console.log('💾 Session saved for:', userData.email);
    }
  };

  const handleLogout = () => {
    // Clear session immediately
    authManager.logout();
    
    // Update state immediately
    setUser(null);
    setCurrentSession(null);
    
    // Redirect immediately without waiting
    window.location.href = '/';
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

  const handlePackagePurchase = async (packageId: string) => {
    if (!user) return;
    try {
      const success = await vpsDataStore.purchasePackage(user.id, packageId);
      if (success) {
        // Reload user data to reflect the purchase
        const data = await vpsDataStore.loadData();
        const updatedUser = data.users?.find(u => u.id === user.id);
        if (updatedUser) {
          setUser(updatedUser);
        }
        alert('Package purchased successfully!');
      } else {
        alert('Package purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Package purchase error:', error);
      alert('Package purchase failed. Please try again.');
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

  // Show loading during initial authentication check for protected routes
  if (isLoading && (currentPage === 'admin' || currentPage === 'dashboard')) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // If user is logged in and on dashboard pages, show appropriate dashboard
  if (user && (currentPage === 'admin' || currentPage === 'dashboard')) {
    if (currentPage === 'admin' && user.role === 'admin') {
      return (
        <ModernAdminDashboard 
          currentUser={user} 
          onLogout={handleLogout}
          onNavigate={handleNavigation}
        />
      );
    } else if (currentPage === 'dashboard' && user.role !== 'admin') {
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

    } else {
      // Fallback for unauthorized access to protected pages
      if (user.role === 'admin') {
        handleNavigation('admin');
      } else {
        handleNavigation('dashboard');
      }
      return null;
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
        if (!user) {
          setShowLoginModal(true);
          return <div>Please login to view profile</div>;
        }
        return <UserProfilePage user={user} onBack={() => handleNavigation('home')} onNavigate={handleNavigation} />;
      case 'packages':
        return <PackagesPage 
          currentUser={user}
          onLoginClick={() => setShowLoginModal(true)}
          onPurchase={handlePackagePurchase}
          onBack={() => handleNavigation('home')} 
        />;

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
            <div suppressHydrationWarning>
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
      
      {/* Guest Login Modal (triggered after purchase) */}
      <LoginModal 
        isOpen={showGuestLoginModal}
        onClose={() => {
          setShowGuestLoginModal(false);
          setPrefilledEmail('');
        }}
        onLogin={handleLogin}
        prefilledEmail={prefilledEmail}
      />
      

    </>
  );
};