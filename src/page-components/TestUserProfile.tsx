'use client';

import React from 'react';
import { User as UserType } from '../types';

interface TestUserProfileProps {
  user: UserType;
  onBack: () => void;
  onNavigate: (page: string) => void;
  onUserUpdate?: (updatedUser: UserType) => void;
}

const TestUserProfile: React.FC<TestUserProfileProps> = ({ user, onBack, onNavigate, onUserUpdate }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack} 
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ← Back to Dashboard
        </button>
        
        <div className="bg-green-500 text-white p-8 rounded-lg mb-8">
          <h1 className="text-4xl font-bold mb-4">🎉 COMPREHENSIVE USER PROFILE IS WORKING! 🎉</h1>
          <h2 className="text-2xl mb-2">User: {user.name}</h2>
          <p className="text-xl">Email: {user.email}</p>
          <p className="text-lg">Role: {user.role}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-4">This is the FULL UserProfilePage Component</h3>
          <p className="text-lg mb-4">If you can see this message, then the comprehensive UserProfilePage is loading correctly!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded">
              <h4 className="font-bold">Profile Tab</h4>
              <p>Personal Information, Address, Emergency Contact, Security, Notifications</p>
            </div>
            <div className="bg-green-100 p-4 rounded">
              <h4 className="font-bold">Invoices Tab</h4>
              <p>Purchase History, Invoice Downloads, Account Summary</p>
            </div>
            <div className="bg-purple-100 p-4 rounded">
              <h4 className="font-bold">Friends Tab</h4>
              <p>Referral Program, Friend Invitations, Social Sharing</p>
            </div>
          </div>

          <div className="bg-yellow-100 p-4 rounded">
            <h4 className="font-bold text-red-600">If you're still seeing the simplified profile:</h4>
            <ul className="list-disc list-inside mt-2">
              <li>Clear your browser cache (Ctrl+Shift+R)</li>
              <li>Restart the development server</li>
              <li>Check browser console for errors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestUserProfile;