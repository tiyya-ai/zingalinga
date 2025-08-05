'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Avatar,
  Divider,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Textarea,
  Switch,
  Select,
  SelectItem,
  Badge,
  Tooltip
} from '@nextui-org/react';
import {
  ArrowLeft,
  Edit3,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User as UserIcon,
  Lock,
  Receipt,
  Users,
  Share2,
  Copy,
  Check,
  Download,
  CreditCard,
  Gift,
  Settings,
  Bell,
  Shield,
  Heart,
  Send
} from 'lucide-react';
import { User as UserType, Purchase } from '../types';
import { vpsDataStore } from '../utils/vpsDataStore';

interface UserProfilePageProps {
  user: UserType;
  onBack: () => void;
  onNavigate: (page: string) => void;
  onUserUpdate?: (updatedUser: UserType) => void;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  items: string[];
  paymentMethod: string;
}

interface FriendInvite {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  sentAt: string;
  referralCode: string;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, onBack, onNavigate, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isInviteFriendOpen, setIsInviteFriendOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form states
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
    bio: user.bio || '',
    emergencyContact: user.emergencyContact || '',
    emergencyPhone: user.emergencyPhone || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [friendInvites, setFriendInvites] = useState<FriendInvite[]>([]);
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    pushNotifications: true,
    weeklyDigest: false,
    promotionalEmails: true
  });
  
  // Profile image upload states
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Load user data and invoices
  useEffect(() => {
    loadUserInvoices();
    loadFriendInvites();
  }, [user.id]);

  const loadUserInvoices = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const userPurchases = data.purchases.filter(p => p.userId === user.id);
      
      const invoiceData: Invoice[] = userPurchases.map(purchase => ({
        id: purchase.id,
        date: purchase.createdAt,
        amount: purchase.amount,
        status: purchase.status as 'paid' | 'pending' | 'failed',
        items: purchase.moduleIds,
        paymentMethod: purchase.paymentMethod
      }));
      
      setInvoices(invoiceData);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const loadFriendInvites = async () => {
    // Mock friend invites data - in real app, this would come from backend
    const mockInvites: FriendInvite[] = [
      {
        id: '1',
        email: 'friend1@example.com',
        status: 'pending',
        sentAt: new Date(Date.now() - 86400000).toISOString(),
        referralCode: 'ZL-' + user.id.slice(-4).toUpperCase() + '-001'
      },
      {
        id: '2',
        email: 'friend2@example.com',
        status: 'accepted',
        sentAt: new Date(Date.now() - 172800000).toISOString(),
        referralCode: 'ZL-' + user.id.slice(-4).toUpperCase() + '-002'
      }
    ];
    setFriendInvites(mockInvites);
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setProfileImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfileImage = async () => {
    if (!profileImageFile) return;
    
    setIsUploadingImage(true);
    try {
      // In a real app, you would upload to a server/cloud storage
      // For now, we'll simulate the upload and use the preview URL
      const imageUrl = profileImagePreview || user.profileImage;
      
      const updatedUser = {
        ...user,
        profileImage: imageUrl
      };
      
      await vpsDataStore.updateUser(user.id, updatedUser);
      
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      
      // Reset upload states
      setProfileImageFile(null);
      setProfileImagePreview(null);
      
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Upload profile image first if there's one
      if (profileImageFile) {
        await handleUploadProfileImage();
      }
      
      const updatedUser = {
        ...user,
        ...profileData
      };
      
      await vpsDataStore.updateUser(user.id, updatedUser);
      
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
      await vpsDataStore.changeUserPassword(user.id, passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangePasswordOpen(false);
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteFriend = async () => {
    if (!inviteEmail) return;
    
    setLoading(true);
    try {
      const newInvite: FriendInvite = {
        id: Date.now().toString(),
        email: inviteEmail,
        status: 'pending',
        sentAt: new Date().toISOString(),
        referralCode: 'ZL-' + user.id.slice(-4).toUpperCase() + '-' + String(friendInvites.length + 1).padStart(3, '0')
      };
      
      setFriendInvites(prev => [...prev, newInvite]);
      setInviteEmail('');
      setIsInviteFriendOpen(false);
      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadInvoice = (invoice: Invoice) => {
    // Generate invoice content as HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; }
          .company-name { font-size: 24px; font-weight: bold; color: #6366f1; }
          .invoice-title { font-size: 20px; margin: 20px 0; }
          .invoice-details { margin: 30px 0; }
          .details-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items-table th { background-color: #f8f9fa; }
          .total-section { text-align: right; margin: 30px 0; }
          .total-amount { font-size: 18px; font-weight: bold; color: #059669; }
          .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Zinga Linga</div>
          <div>Educational Videos for Kids</div>
        </div>
        
        <div class="invoice-title">INVOICE</div>
        
        <div class="invoice-details">
          <div class="details-row">
            <span><strong>Invoice ID:</strong> #${invoice.id.slice(-8)}</span>
            <span><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</span>
          </div>
          <div class="details-row">
            <span><strong>Customer:</strong> ${user.name}</span>
            <span><strong>Email:</strong> ${user.email}</span>
          </div>
          <div class="details-row">
            <span><strong>Payment Method:</strong> ${invoice.paymentMethod}</span>
            <span><strong>Status:</strong> ${invoice.status.toUpperCase()}</span>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(invoice.items || []).map(item => `
              <tr>
                <td>${item}</td>
                <td>Educational Video Module</td>
                <td>$${(invoice.amount / (invoice.items?.length || 1)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div><strong>Subtotal: $${invoice.amount.toFixed(2)}</strong></div>
          <div><strong>Tax: $0.00</strong></div>
          <div class="total-amount">Total: $${invoice.amount.toFixed(2)}</div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Zinga Linga!</p>
          <p>For support, contact us at support@zingalinga.com</p>
        </div>
      </body>
      </html>
    `;
    
    // Create and download the invoice
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.id.slice(-8)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Personal Information</h3>
            <p className="text-gray-500">Manage your account details</p>
          </div>
          <Button
            color={isEditing ? "success" : "primary"}
            variant={isEditing ? "solid" : "flat"}
            startContent={isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
            isLoading={loading}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar
                src={profileImagePreview || user.profileImage}
                name={user.name}
                size="lg"
                className="w-20 h-20"
              />
              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary-600 transition-colors shadow-lg"
                  >
                    <Edit3 className="w-3 h-3" />
                  </label>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold">{user.name}</h4>
              <p className="text-gray-500">{user.email}</p>
              <Chip size="sm" color="primary" variant="flat">
                {user.role === 'admin' ? 'Administrator' : 'User'}
              </Chip>
              {profileImageFile && isEditing && (
                <div className="mt-2 flex items-center gap-2">
                  <Chip size="sm" color="success" variant="flat">
                    New image selected: {profileImageFile.name}
                  </Chip>
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => {
                      setProfileImageFile(null);
                      setProfileImagePreview(null);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-grid">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                startContent={<UserIcon className="w-4 h-4" />}
                isReadOnly={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
                className="w-full"
              />
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <Input
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                startContent={<Mail className="w-4 h-4" />}
                isReadOnly={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
                type="email"
                className="w-full"
              />
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                startContent={<Phone className="w-4 h-4" />}
                isReadOnly={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
                placeholder="+1 (555) 123-4567"
                className="w-full"
              />
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <Input
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                startContent={<Calendar className="w-4 h-4" />}
                isReadOnly={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
                className="w-full"
              />
            </div>
          </div>
          
          <Divider className="my-6" />
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700">Address Information</h4>
            
            <div className="space-y-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Input
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  startContent={<MapPin className="w-4 h-4" />}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  placeholder="123 Main Street"
                  className="w-full"
                />
              </div>
              
              <div className="form-grid form-grid-3">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <Input
                    value={profileData.city}
                    onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                    isReadOnly={!isEditing}
                    variant={isEditing ? "bordered" : "flat"}
                    placeholder="New York"
                    className="w-full"
                  />
                </div>
                
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <Input
                    value={profileData.state}
                    onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                    isReadOnly={!isEditing}
                    variant={isEditing ? "bordered" : "flat"}
                    placeholder="NY"
                    className="w-full"
                  />
                </div>
                
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <Input
                    value={profileData.zipCode}
                    onChange={(e) => setProfileData(prev => ({ ...prev, zipCode: e.target.value }))}
                    isReadOnly={!isEditing}
                    variant={isEditing ? "bordered" : "flat"}
                    placeholder="10001"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <Input
                  value={profileData.country}
                  onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  placeholder="United States"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          <Divider className="my-6" />
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700">Emergency Contact</h4>
            
            <div className="form-grid">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                <Input
                  value={profileData.emergencyContact}
                  onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  startContent={<UserIcon className="w-4 h-4" />}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  placeholder="John Doe"
                  className="w-full"
                />
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                <Input
                  value={profileData.emergencyPhone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  startContent={<Phone className="w-4 h-4" />}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  placeholder="+1 (555) 987-6543"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <Textarea
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              isReadOnly={!isEditing}
              variant={isEditing ? "bordered" : "flat"}
              placeholder="Tell us about yourself..."
              minRows={3}
              className="w-full"
            />
          </div>
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-xl font-bold">Account Security</h3>
            <p className="text-gray-500">Manage your password and security settings</p>
          </div>
        </CardHeader>
        <CardBody>
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
            <h3 className="text-xl font-bold">Notification Preferences</h3>
            <p className="text-gray-500">Choose how you want to be notified</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Email Updates</p>
              <p className="text-sm text-gray-500">Receive important account updates</p>
            </div>
            <Switch
              isSelected={notifications.emailUpdates}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, emailUpdates: value }))}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-500">Get notified about new content</p>
            </div>
            <Switch
              isSelected={notifications.pushNotifications}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, pushNotifications: value }))}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Weekly Digest</p>
              <p className="text-sm text-gray-500">Weekly summary of activities</p>
            </div>
            <Switch
              isSelected={notifications.weeklyDigest}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, weeklyDigest: value }))}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
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

  const renderInvoicesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-xl font-bold">Purchase History & Invoices</h3>
            <p className="text-gray-500">View and download your purchase receipts</p>
          </div>
        </CardHeader>
        <CardBody>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No invoices found</p>
              <p className="text-sm text-gray-400">Your purchase history will appear here</p>
              <Button
                color="primary"
                variant="flat"
                className="mt-4"
                onPress={() => onNavigate('store')}
              >
                Browse Videos to Purchase
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <Receipt className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                  <p className="text-lg font-bold text-blue-600">{invoices.length}</p>
                  <p className="text-sm text-blue-600">Total Orders</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <CreditCard className="w-6 h-6 mx-auto text-green-600 mb-2" />
                  <p className="text-lg font-bold text-green-600">
                    ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">Total Spent</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <Check className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                  <p className="text-lg font-bold text-purple-600">
                    {invoices.filter(inv => inv.status === 'paid').length}
                  </p>
                  <p className="text-sm text-purple-600">Completed</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                  <p className="text-lg font-bold text-orange-600">
                    {invoices.length > 0 ? new Date(invoices[invoices.length - 1].date).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-sm text-orange-600">Last Purchase</p>
                </div>
              </div>

              {/* Invoices Table */}
              <Table aria-label="Invoices table">
                <TableHeader>
                  <TableColumn>INVOICE ID</TableColumn>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>ITEMS</TableColumn>
                  <TableColumn>AMOUNT</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>PAYMENT METHOD</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">#{invoice.id.slice(-8)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{new Date(invoice.date).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleTimeString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.items?.length || 0} item(s)</p>
                          <p className="text-xs text-gray-500">
                            {invoice.items?.slice(0, 2).join(', ') || 'No items'}
                            {(invoice.items?.length || 0) > 2 && ` +${(invoice.items?.length || 0) - 2} more`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={invoice.status === 'paid' ? 'success' : invoice.status === 'pending' ? 'warning' : 'danger'}
                          variant="flat"
                        >
                          {invoice.status.toUpperCase()}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{invoice.paymentMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Tooltip content="View Invoice Details">
                            <Button
                              size="sm"
                              variant="flat"
                              isIconOnly
                              onPress={() => {
                                alert(`Invoice Details:\n\nID: ${invoice.id}\nDate: ${new Date(invoice.date).toLocaleString()}\nAmount: ${invoice.amount.toFixed(2)}\nStatus: ${invoice.status}\nPayment: ${invoice.paymentMethod}\nItems: ${(invoice.items || []).join(', ') || 'No items'}`);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Download Invoice">
                            <Button
                              size="sm"
                              variant="flat"
                              isIconOnly
                              onPress={() => downloadInvoice(invoice)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-xl font-bold">Account Summary</h3>
            <p className="text-gray-500">Your account statistics</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <CreditCard className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-600">${user.totalSpent?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-blue-600">Total Spent</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <Gift className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">{user.purchasedModules?.length || 0}</p>
              <p className="text-sm text-green-600">Modules Owned</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <Calendar className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-purple-600">{new Date(user.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-purple-600">Member Since</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderFriendsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Invite Friends</h3>
            <p className="text-gray-500">Share Zinga Linga with your friends and family</p>
          </div>
          <Button
            color="primary"
            startContent={<Users className="w-4 h-4" />}
            onPress={() => setIsInviteFriendOpen(true)}
          >
            Send Invitation
          </Button>
        </CardHeader>
        <CardBody>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Gift className="w-8 h-8 text-purple-600" />
              <div>
                <h4 className="font-bold text-purple-800">Referral Program</h4>
                <p className="text-purple-600">Earn rewards when friends join!</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <Heart className="w-6 h-6 mx-auto text-red-500 mb-2" />
                <p className="font-semibold">You Get</p>
                <p className="text-sm text-gray-600">1 Free Module</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <Gift className="w-6 h-6 mx-auto text-green-500 mb-2" />
                <p className="font-semibold">Friend Gets</p>
                <p className="text-sm text-gray-600">20% Off First Purchase</p>
              </div>
            </div>
          </div>
          
          {friendInvites.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No invitations sent yet</p>
              <p className="text-sm text-gray-400">Start inviting friends to earn rewards!</p>
            </div>
          ) : (
            <Table aria-label="Friend invitations table">
              <TableHeader>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>SENT DATE</TableColumn>
                <TableColumn>REFERRAL CODE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {friendInvites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={invite.status === 'accepted' ? 'success' : invite.status === 'pending' ? 'warning' : 'danger'}
                        variant="flat"
                      >
                        {invite.status.toUpperCase()}
                      </Chip>
                    </TableCell>
                    <TableCell>{new Date(invite.sentAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{invite.referralCode}</code>
                        <Button
                          size="sm"
                          variant="flat"
                          isIconOnly
                          onPress={() => copyReferralCode(invite.referralCode)}
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<Share2 className="w-3 h-3" />}
                        onPress={() => {
                          const shareText = `Join me on Zinga Linga! Use code ${invite.referralCode} for 20% off your first purchase.`;
                          navigator.share ? navigator.share({ text: shareText }) : navigator.clipboard.writeText(shareText);
                        }}
                      >
                        Share
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white mb-8">
          <div className="flex items-center gap-6">
            <Avatar
              src={user.profileImage}
              name={user.name}
              size="lg"
              className="w-20 h-20 border-4 border-white/20"
            />
            <div>
              <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
              <p className="text-xl opacity-90">{user.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <Chip size="sm" color="warning" variant="solid">
                  {user.role === 'admin' ? 'Administrator' : 'Premium User'}
                </Chip>
                <p className="text-sm opacity-75">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        
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
          
          <Tab key="invoices" title={
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Invoices
            </div>
          }>
            {renderInvoicesTab()}
          </Tab>
          
          <Tab key="friends" title={
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Invite Friends
            </div>
          }>
            {renderFriendsTab()}
          </Tab>
        </Tabs>
      </div>
      
      {/* Change Password Modal */}
      <Modal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">Change Password</h3>
          </ModalHeader>
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
      
      {/* Invite Friend Modal */}
      <Modal isOpen={isInviteFriendOpen} onClose={() => setIsInviteFriendOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">Invite a Friend</h3>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Gift className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="font-semibold text-blue-800">Referral Rewards</p>
              <p className="text-sm text-blue-600">You both get rewards when they join!</p>
            </div>
            
            <Input
              label="Friend's Email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="friend@example.com"
              startContent={<Mail className="w-4 h-4" />}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsInviteFriendOpen(false)}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleInviteFriend}
              isLoading={loading}
              isDisabled={!inviteEmail}
              startContent={<Send className="w-4 h-4" />}
            >
              Send Invitation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserProfilePage;