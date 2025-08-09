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
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const session = authManager.getCurrentSession();
        if (session && authManager.isSessionValid(session)) {
          // Redirect authenticated users to their dashboard
          if (session.user.role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/dashboard';
          }
          return session.user;
        }
      } catch (error) {
        // Handle error silently
      }
    }
    return null;
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Don't render anything if user is authenticated (they'll be redirected)
  if (user) {
    return null;
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}