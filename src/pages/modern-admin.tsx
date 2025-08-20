import React, { useState } from 'react';
import ModernAdminDashboard from '../components/ModernAdminDashboard';

export default function ModernAdminPage() {
  const [user] = useState({
    id: '1',
    name: 'Admin User',
    email: 'admin@zingalinga.com',
    role: 'administrator',
    avatar: null
  });

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
    // Redirect to login page or clear session
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <ModernAdminDashboard 
        currentUser={user} 
        onLogout={handleLogout} 
      />
    </div>
  );
}