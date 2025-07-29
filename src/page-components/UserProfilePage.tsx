import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface UserProfilePageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-green hover:text-green-600 transition-colors mb-6 font-mali">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <div className="bg-gradient-to-br from-brand-green to-brand-blue rounded-3xl p-8 text-white mb-8">
          <h1 className="text-4xl font-mali font-bold mb-4">User Profile</h1>
          <p className="text-xl font-mali">Manage your account settings and preferences.</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">Profile Settings</h2>
          <p className="font-mali text-gray-700">User profile content coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;