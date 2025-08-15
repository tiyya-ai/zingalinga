'use client';

import { useState, useEffect } from 'react';
import { authManager } from '../utils/auth';
import { User } from '../types';
import { LandingPage } from '../components/LandingPage';
import Header from '../components/Header';
import { Footer } from '../components/footer';
import { LoginModal } from '../components/LoginModal';
import { CartProvider } from '../hooks/useCart';
import { ClientOnly } from '../components/ClientOnly';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function RootPage() {
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're coming from a logout (no delay needed)
    const urlParams = new URLSearchParams(window.location.search);
    const fromLogout = urlParams.get('logout') === 'true';
    
    if (fromLogout) {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsLoading(false);
      return;
    }

    try {
      const session = authManager.getCurrentSession();
      if (session && authManager.isSessionValid(session)) {
        setUser(session.user);
        // Redirect authenticated users to their dashboard
        if (session.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
        return;
      }
    } catch (error) {
      // Handle error silently
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (userData: User) => {
    setUser(userData);
    // Redirect after login
    if (userData.role === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handleNavigation = (page: string) => {
    window.location.href = `/${page}`;
  };

  // Show loading or redirect if user is authenticated
  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ClientOnly>
        <div className="min-h-screen bg-white overflow-hidden font-mali">
          <Header 
            onLoginClick={() => setShowLoginModal(true)}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            onNavigate={handleNavigation}
          />
          <CartProvider>
            <LandingPage 
              onLoginClick={() => setShowLoginModal(true)} 
              onPackagesClick={() => handleNavigation('packages')}
            />
          </CartProvider>
          <Footer onNavigate={handleNavigation} />
        </div>
        
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      </ClientOnly>
    </ErrorBoundary>
  );
}