import React, { useState, useRef } from 'react';
import { ArrowLeft, User, Mail, Shield, Settings, Upload, Download, Camera } from 'lucide-react';
import Header from '../components/Header';
import { Footer } from '../components/footer';

interface AdminProfilePageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const AdminProfilePage: React.FC<AdminProfilePageProps> = ({ onBack, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('/zinga-linga-logo.png');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state for editable fields
  const [formData, setFormData] = useState({
    fullName: 'Admin User',
    email: 'admin@zingalinga.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setProfileImage(result.url);
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      alert('Upload failed: ' + error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDownload = () => {
    const link = document.createElement('a');
    link.href = profileImage;
    link.download = 'admin-profile-image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Validate required fields
      if (!formData.fullName.trim()) {
        alert('❌ Full name is required!');
        return;
      }
      if (!formData.email.trim()) {
        alert('❌ Email is required!');
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('❌ Please enter a valid email address!');
        return;
      }
      
      // If changing password, validate password fields
      if (formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword) {
          alert('❌ Current password is required to change password!');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          alert('❌ New passwords do not match!');
          return;
        }
        if (formData.newPassword.length < 6) {
          alert('❌ New password must be at least 6 characters long!');
          return;
        }
      }
      
      // Simulate API call to save profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear password fields after successful save
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('❌ Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };}

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
            <div className="relative w-24 h-24 mx-auto mb-6">
              <img 
                src={profileImage} 
                alt="Admin Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }}
                className="absolute -bottom-2 -right-2 bg-white text-brand-green p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <h1 className="text-5xl font-mali font-bold mb-6">Admin Profile</h1>
            <p className="text-2xl font-mali mb-4">
              Manage your administrator account settings
            </p>
            <button
              onClick={handleImageDownload}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Profile Image
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-mali font-bold text-brand-green mb-6">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleFormChange('fullName', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="Enter your email address"
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
                    value={formData.currentPassword}
                    onChange={(e) => handleFormChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                    className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleFormChange('newPassword', e.target.value)}
                    placeholder="Enter new password (optional)"
                    className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className={`font-mali font-bold py-4 px-12 rounded-xl transition-all duration-300 transform shadow-lg ${
                isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-brand-green to-brand-blue text-white hover:from-brand-green hover:to-brand-blue hover:scale-105'
              }`}
            >
              {isSaving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      </div>
      
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default AdminProfilePage;