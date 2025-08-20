'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { authManager } from '../../utils/auth';
import { User } from '../../types';

const ModernAdminDashboard = dynamic(() => import('../../components/ModernAdminDashboard'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>
});

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      try {
        const session = authManager.getCurrentSession();
        if (session && authManager.isSessionValid(session) && session.user.role === 'admin') {
          setUser(session.user);
        } else {
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '/';
      }
    }
  }, []);

  const handleLogout = () => {
    authManager.logout();
    window.location.href = '/';
  };

  if (!mounted || !user) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  }

  return (
    <ModernAdminDashboard 
      currentUser={user} 
      onLogout={handleLogout}
      onNavigate={(page) => window.location.href = `/${page}`}
    />
  );
}