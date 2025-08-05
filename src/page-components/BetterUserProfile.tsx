'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Switch,
  Tabs,
  Tab,
  Divider
} from '@nextui-org/react';
import {
  ArrowLeft,
  Edit3,
  Save,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Bell,
  Shield
} from 'lucide-react';
import { User as UserType } from '../types';

interface BetterUserProfileProps {
  user: UserType;
  onBack: () => void;
  onUserUpdate?: (updatedUser: UserType) => void;
}

const BetterUserProfile: React.FC<BetterUserProfileProps> = ({ user, onBack, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    zipCode: user.zipCode || '',
    country: user.country || '',
    dateOfBirth: user.dateOfBirth || '',
    bio: user.bio || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    pushNotifications: true,
    weeklyDigest: false,
    promotionalEmails: true
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

  const renderProfileTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Personal Information</h3>
            <p className="text-gray-500 text-sm">Update your personal details</p>
          </div>
          <Button
            color={isEditing ? "success" : "primary"}
            startContent={isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
            isLoading={loading}
            size="sm"
          >
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar
              src={user.profileImage}
              name={user.name}
              size="lg"
              className="w-20 h-20"
            />
            <div>
              <h4 className="text-lg font-semibold">{user.name}</h4>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                startContent={<UserIcon className="w-4 h-4 text-gray-400" />}
                isReadOnly={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
                isReadOnly={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
                type="email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                startContent={<Phone className="w-4 h-4 text-gray-400" />}
                isReadOnly={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth</label>
              <Input
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                startContent={<Calendar className="w-4 h-4 text-gray-400" />}
                isReadOnly={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
              />
            </div>
          </div>
          
          <Divider className="my-6" />
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Address</h4>
            
            <div>
              <label className="block text-sm font-medium mb-2">Street Address</label>
              <Input
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                startContent={<MapPin className="w-4 h-4 text-gray-400" />}
                isReadOnly={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
                placeholder="123 Main Street"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <Input
                  value={profileData.city}
                  onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  placeholder="New York"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <Input
                  value={profileData.state}
                  onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  placeholder="NY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">ZIP Code</label>
                <Input
                  value={profileData.zipCode}
                  onChange={(e) => setProfileData(prev => ({ ...prev, zipCode: e.target.value }))}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  placeholder="10001"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <Input
                value={profileData.country}
                onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                isReadOnly={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
                placeholder="United States"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <Textarea
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              isReadOnly={!isEditing}
              variant={isEditing ? "bordered" : "flat"}
              placeholder="Tell us about yourself..."
              minRows={3}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-xl font-bold">Security Settings</h3>
            <p className="text-gray-500 text-sm">Manage your account security</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Button
            color="warning"
            variant="flat"
            startContent={<Lock className="w-4 h-4" />}
            onPress={() => setIsChangePasswordOpen(true)}
          >
            Change Password
          </Button>
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-xl font-bold">Notifications</h3>
            <p className="text-gray-500 text-sm">Choose how you want to be notified</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex-1 pr-4">
              <p className="font-medium">Email Updates</p>
              <p className="text-sm text-gray-500">Receive important account updates</p>
            </div>
            <Switch
              isSelected={notifications.emailUpdates}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, emailUpdates: value }))}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex-1 pr-4">
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-500">Get notified about new content</p>
            </div>
            <Switch
              isSelected={notifications.pushNotifications}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, pushNotifications: value }))}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex-1 pr-4">
              <p className="font-medium">Weekly Digest</p>
              <p className="text-sm text-gray-500">Weekly summary of activities</p>
            </div>
            <Switch
              isSelected={notifications.weeklyDigest}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, weeklyDigest: value }))}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex-1 pr-4">
              <p className="font-medium">Promotional Emails</p>
              <p className="text-sm text-gray-500">Special offers and promotions</p>
            </div>
            <Switch
              isSelected={notifications.promotionalEmails}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, promotionalEmails: value }))}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <div className="profile-container bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
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
              className="w-16 h-16 border-4 border-white/20"
            />
            <div>
              <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
              <p className="text-lg opacity-90">{user.email}</p>
              <p className="text-sm opacity-75">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-content max-w-5xl mx-auto px-4">
        <Tabs 
          selectedKey={activeTab} 
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="w-full"
          size="lg"
        >
          <Tab key="profile" title={
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Profile
            </div>
          }>
            {renderProfileTab()}
          </Tab>
          
          <Tab key="security" title={
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security & Notifications
            </div>
          }>
            {renderSecurityTab()}
          </Tab>
        </Tabs>
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

export default BetterUserProfile;