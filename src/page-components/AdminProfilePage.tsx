import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Shield, Settings } from 'lucide-react';
import Header from '../components/Header';
import { Footer } from '../components/footer';

interface AdminProfilePageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const AdminProfilePage: React.FC<AdminProfilePageProps> = ({ onBack, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-mali">
      <Header 
        onLoginClick={() => {}}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onNavigate={onNavigate}
      />
      
      <div className="pt-32">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-brand-green hover:text-green-600 transition-colors mb-8 font-mali font-bold text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <div className="bg-gradient-to-br from-brand-green via-brand-blue to-brand-pink rounded-3xl p-12 text-white mb-12 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-brand-green" />
            </div>
            <h1 className="text-5xl font-mali font-bold mb-6">Admin Profile</h1>
            <p className="text-2xl font-mali mb-4">
              Manage your administrator account settings
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-mali font-bold text-brand-green mb-6">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Admin User"
                    className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    defaultValue="admin@zingalinga.com"
                    className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-brand-green" />
                    <span className="font-mali font-bold text-brand-green">Administrator</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-mali font-bold text-brand-green mb-6">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button className="bg-gradient-to-r from-brand-green to-brand-blue text-white font-mali font-bold py-4 px-12 rounded-xl hover:from-brand-green hover:to-brand-blue transform hover:scale-105 transition-all duration-300 shadow-lg">
              Save Changes
            </button>
          </div>
        </div>
      </div>
      
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default AdminProfilePage;