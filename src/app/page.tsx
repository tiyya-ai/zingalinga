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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
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
      console.error('Session check error:', error);
    }
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