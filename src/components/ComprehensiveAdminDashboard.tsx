import React from 'react';
import { User } from '../types';

interface ComprehensiveAdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const ComprehensiveAdminDashboard: React.FC<ComprehensiveAdminDashboardProps> = ({
  user,
  onLogout
}) => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-mali font-bold text-brand-green">
              Admin Dashboard - Welcome, {user.name}!
            </h1>
            <button
              onClick={onLogout}
              className="bg-brand-red text-white px-4 py-2 rounded-lg font-mali hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-brand-blue to-brand-pink rounded-lg p-6 text-white">
              <h2 className="text-xl font-mali font-bold mb-2">User Management</h2>
              <p className="font-mali">Manage users and permissions</p>
            </div>
            
            <div className="bg-gradient-to-br from-brand-yellow to-brand-red rounded-lg p-6 text-white">
              <h2 className="text-xl font-mali font-bold mb-2">Content Management</h2>
              <p className="font-mali">Upload and manage learning modules</p>
            </div>
            
            <div className="bg-gradient-to-br from-brand-green to-teal-500 rounded-lg p-6 text-white">
              <h2 className="text-xl font-mali font-bold mb-2">Analytics</h2>
              <p className="font-mali">View usage statistics and reports</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-2xl font-mali font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="bg-brand-blue text-white p-4 rounded-lg font-mali hover:bg-blue-600 transition-colors">
                Add New Module
              </button>
              <button className="bg-brand-green text-white p-4 rounded-lg font-mali hover:bg-green-600 transition-colors">
                Manage Users
              </button>
              <button className="bg-brand-yellow text-white p-4 rounded-lg font-mali hover:bg-yellow-600 transition-colors">
                View Reports
              </button>
              <button className="bg-brand-pink text-white p-4 rounded-lg font-mali hover:bg-pink-600 transition-colors">
                System Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};