'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@nextui-org/react';
import {
  ArrowLeft,
  Edit3,
  Save,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { User as UserType } from '../types';

interface SimpleUserProfileProps {
  user: UserType;
  onBack: () => void;
  onUserUpdate?: (updatedUser: UserType) => void;
}

const SimpleUserProfile: React.FC<SimpleUserProfileProps> = ({ user, onBack, onUserUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updatedUser = { ...user, ...profileData };
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    setLoading(true);
    try {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangePasswordOpen(false);
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={user.profileImage}
              name={user.name}
              size="lg"
              className="w-16 h-16"
            />
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="opacity-90">{user.email}</p>
            </div>
          </div>
        </div>
        
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Profile Settings</h3>
            <Button
              color={isEditing ? "success" : "primary"}
              startContent={isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              isLoading={loading}
            >
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  type="email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <Button
                variant="flat"
                startContent={<Lock className="w-4 h-4" />}
                onPress={() => setIsChangePasswordOpen(true)}
              >
                Change Password
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <Modal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)}>
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Current Password"
              type={showPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              endContent={
                <button onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            />
            
            <Input
              label="Confirm New Password"
              type={showPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleChangePassword}
              isLoading={loading}
              isDisabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SimpleUserProfile;