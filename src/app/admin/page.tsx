'use client';

import { useState, useEffect } from 'react';
import ModernAdminDashboard from '../../components/ModernAdminDashboard';
import { authManager } from '../../utils/auth';
import { User } from '../../types';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const session = authManager.getCurrentSession();
        if (session && authManager.isSessionValid(session) && session.user.role === 'admin') {
          return session.user;
        }
      } catch (error) {
        // Handle error silently
      }
    }
    return null;
  });

  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, [user]);

  const handleLogout = () => {
    authManager.logout();
    window.location.href = '/';
  };

  if (!user) {
    return null;
  }

  return (
    <ModernAdminDashboard 
      user={user} 
      onLogout={handleLogout}
      onNavigate={(page) => window.location.href = `/${page}`}
    />
  );
}