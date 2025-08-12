'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminProfilePage from '../../page-components/AdminProfilePage';
import { authManager } from '../../utils/auth';
import { User } from '../../types';

export default function AdminProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const session = authManager.getCurrentSession();
        if (session && authManager.isSessionValid(session)) {
          if (session.user.role === 'admin') {
            setUser(session.user);
          } else {
            // Non-admin user trying to access admin profile
            router.push('/dashboard');
            return;
          }
        } else {
          // No valid session, redirect to home
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/');
        return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleBack = () => {
    router.push('/admin');
  };

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      router.push('/');
    } else if (page === 'admin') {
      router.push('/admin');
    } else {
      router.push(`/${page}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <AdminProfilePage 
      onBack={handleBack} 
      onNavigate={handleNavigate} 
    />
  );
}