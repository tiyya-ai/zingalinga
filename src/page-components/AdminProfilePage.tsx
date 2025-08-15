import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, User, Mail, Shield, Settings, Upload, Download, Camera } from 'lucide-react';
import Header from '../components/Header';
import { Footer } from '../components/footer';

interface AdminProfilePageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const AdminProfilePage: React.FC<AdminProfilePageProps> = ({ onBack, onNavigate }): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('/zinga-linga-logo.png');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state for editable fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Load admin data on component mount
  useEffect(() => {
    loadAdminData();
  }, []);
  
  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };
  
  const loadAdminData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      const adminUser = data.users?.find((user: any) => user.role === 'admin');
      
      if (adminUser) {
        setFormData(prev => ({
          ...prev,
          fullName: adminUser.name || '',
          email: adminUser.email || ''
        }));
      }
    } catch (error) {
      showNotification('error', 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSaveProfile = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent any default browser behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    // Prevent any potential navigation
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
    
    setIsSaving(true);
    
    try {
      // Validate required fields
      if (!formData.fullName.trim()) {
        showNotification('error', 'Full name is required!');
        setIsSaving(false);
        return;
      }
      if (!formData.email.trim()) {
        showNotification('error', 'Email is required!');
        setIsSaving(false);
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showNotification('error', 'Please enter a valid email address!');
        setIsSaving(false);
        return;
      }
      
      // If changing password, validate password fields
      if (formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword) {
          showNotification('error', 'Current password is required to change password!');
          setIsSaving(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          showNotification('error', 'New passwords do not match!');
          setIsSaving(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          showNotification('error', 'New password must be at least 6 characters long!');
          setIsSaving(false);
          return;
        }
      }
      
      // Load current data
      const response = await fetch('/api/data');
      const data = await response.json();
      
      // Find and update admin user
      const adminUserIndex = data.users?.findIndex((user: any) => user.role === 'admin');
      if (adminUserIndex === -1) {
        showNotification('error', 'Admin user not found!');
        setIsSaving(false);
        return;
      }
      
      // Update admin user data
      data.users[adminUserIndex] = {
        ...data.users[adminUserIndex],
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        ...(formData.newPassword && { password: formData.newPassword })
      };
      
      // Save updated data to VPS
      const saveResponse = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const saveResult = await saveResponse.json();
      
      if (saveResult.success) {
        // Clear password fields after successful save
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        showNotification('success', 'Profile updated successfully and saved to VPS!');
      } else {
        throw new Error(saveResult.error || 'Failed to save data');
      }
    } catch (error) {
      showNotification('error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-mali font-bold text-brand-green mb-6">Account Information</h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Loading admin data...</span>
                </div>
              ) : (
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
              )}
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
            <div 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="inline-block"
            >
              <button 
                type="button"
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  (e as any).stopImmediatePropagation?.();
                  handleSaveProfile(e); 
                }}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
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
      </div>
      
      <Footer onNavigate={onNavigate} />
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg font-mali font-bold text-white ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <div className="flex items-center gap-2">
            <span>{notification.type === 'success' ? '✅' : '❌'}</span>
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfilePage;