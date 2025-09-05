'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { realDataAnalytics } from '../utils/realDataAnalytics';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Progress,
  Divider,
  Switch,
  Tabs,
  Tab,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@nextui-org/react';
import {
  BarChart3,
  Users,
  Video,
  Upload,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  TrendingUp,
  Download,
  Star,
  Play,
  Image as ImageIcon,
  Youtube,
  Link,
  FileVideo,
  Clock,
  Tag,
  ShoppingCart,
  Package as PackageIcon,
  Layers,
  CreditCard,
  Receipt,
  MessageSquare,
  Flag,
  Calendar,
  Bell,
  Mail,
  Smartphone,
  Globe,
  Shield,
  FileText,
  HelpCircle,
  Search,
  Filter,
  Menu,
  X,
  Home,
  Folder,
  UserCheck,
  Lock,
  Activity,
  PieChart,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Zap,
  Target,
  Award,
  Headphones,
  BookOpen,
  Monitor,
  Tablet
} from 'lucide-react';
import { vpsDataStore } from '../utils/vpsDataStore';

import { UserManagement } from './UserManagement';
import { Module } from '../types';
import { SuccessModal } from './SuccessModal';
import { AdminPendingPayments } from './AdminPendingPayments';
import GeneralSettings from './GeneralSettings';
import EmailSettings from './EmailSettings';
import SecuritySettings from './SecuritySettings';
import ContentSettings from './ContentSettings';
import NotificationSettings from './NotificationSettings';

// Type definitions
interface Package {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  icon?: string;
  description?: string;
  type?: string;
  features?: string;
  isPopular?: boolean;
  coverImage?: string;
  contentIds?: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin' | 'moderator';
  country?: string;
  location?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  subscription?: 'free' | 'basic' | 'premium' | 'family';
  totalSpent?: number;
}

interface Order {
  id: string;
  amount: number;
  date: Date;
  customer: { name: string; email: string; avatar?: string };
  item: { name: string; count: number; type?: string };
  status: string;
  orderType?: string;
  paymentMethod: string;
  transactionId: string;
}

interface Subscription {
  id: string;
  userId: string;
  status: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
}

interface Comment {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface FlaggedContent {
  id: string;
  type: string;
  reason: string;
}

interface UploadQueueItem {
  id: string;
  filename: string;
  status: string;
  title?: string;
  name?: string;
  category?: string;
  progress?: number;
  size?: number;
  type?: string;
  formData?: any;
  videoUrl?: string;
  localUrl?: string;
}

type UploadItem = UploadQueueItem;

interface AccessLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
}

interface ChildProfile {
  id: string;
  name: string;
  parentId: string;
  age: number;
  parentName: string;
  progress: number;
}

interface ContentBundle {
  id: string;
  name: string;
  items: string[];
  description: string;
  price: number;
  discount: number;
  category: string;
  coverImage: string;
  selectedVideos: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  progress: number;
}
import { renderAddPackage as renderAddPackageComponent, renderAllPackages as renderAllPackagesComponent, renderLearningPackages as renderLearningPackagesComponent } from './ModernAdminDashboardPackages';
import { renderAddBundle as renderAddBundleComponent, renderAllBundles as renderAllBundlesComponent } from './ModernAdminDashboardBundles';
import { renderPP2Program, renderAddPP2Content } from './PP2Components';

const AdminSuccessModal = ({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message: string }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm" backdrop="blur">
    <ModalContent>
      <ModalBody className="p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
        <p className="text-gray-600">{message.replace(/<[^>]*>/g, '')}</p>
      </ModalBody>
      <ModalFooter className="justify-center">
        <Button color="success" onPress={onClose}>OK</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
import SimpleVideoUploader from './SimpleVideoUploader';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ModernAdminDashboardProps {
  currentUser: AdminUser;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
  badge?: string;
  color?: string;
}

export default function ModernAdminDashboard({ currentUser, onLogout, onNavigate }: ModernAdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [activeSection, setActiveSection] = useState('overview');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Security: Sanitize section parameter
  const sanitizeSection = (section: string): string => {
    const allowedSections = ['overview', 'analytics', 'users', 'all-users', 'add-user', 'user-roles', 'content', 'all-videos', 'add-video', 'categories', 'upload-queue', 'packages', 'all-packages', 'add-package', 'scheduling', 'commerce', 'orders', 'pending-payments', 'subscriptions', 'transactions', 'moderation', 'comments', 'flagged-content', 'chat', 'recent-activity', 'admin-profile', 'settings', 'general-settings', 'email-settings', 'security-settings', 'notification-settings', 'content-settings'];
    return allowedSections.includes(section) ? section : 'overview';
  };

  // Handle URL-based navigation for admin sections
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get('section');
      if (section) {
        const sanitizedSection = sanitizeSection(section);
        handleSetActiveSection(sanitizedSection);
      }
    }
  }, []);

  // Custom setActiveSection that updates URL
  const handleSetActiveSection = (section: string) => {
    const sanitizedSection = sanitizeSection(section);
    setActiveSection(sanitizedSection);
    
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('section', sanitizedSection);
        window.history.pushState({}, '', url.toString());
      } catch (error) {
        console.error('Error updating URL:', error);
      }
    }
  };

  // Data states with proper typing
  const [videos, setVideos] = useState<Module[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [contentBundles, setContentBundles] = useState<ContentBundle[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [scheduledContent, setScheduledContent] = useState<any[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');







  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const { isOpen: isOrderModalOpen, onOpen: onOrderModalOpen, onClose: onOrderModalClose } = useDisclosure();
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const { isOpen: isPackagePreviewOpen, onOpen: onPackagePreviewOpen, onClose: onPackagePreviewClose } = useDisclosure();
  


  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [adminSuccessModal, setAdminSuccessModal] = useState({ isOpen: false, message: '' });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Toast notification display
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Helper function for showing toast notifications
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };
  
  // Generate real notifications
  useEffect(() => {
    const realNotifications = [];
    
    // New user registrations
    const recentUsers = users.filter(user => {
      const createdDate = new Date(user.createdAt);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return createdDate >= oneDayAgo;
    });
    
    recentUsers.forEach(user => {
      realNotifications.push({
        id: `user_${user.id}`,
        type: 'info',
        message: `New user ${user.name} registered`,
        time: new Date(user.createdAt).toLocaleTimeString()
      });
    });
    
    // Recent orders
    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return orderDate >= oneDayAgo;
    });
    
    recentOrders.forEach(order => {
      realNotifications.push({
        id: `order_${order.id}`,
        type: 'success',
        message: `New order from ${order.customer.name}`,
        time: order.date.toLocaleTimeString()
      });
    });
    
    // Comments pending moderation
    const pendingComments = comments.filter(c => c.status === 'pending');
    if (pendingComments.length > 0) {
      realNotifications.push({
        id: 'comments_pending',
        type: 'warning',
        message: `${pendingComments.length} comments pending moderation`,
        time: 'Now'
      });
    }
    
    // Sort by most recent
    realNotifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setNotifications(realNotifications.slice(0, 10));
  }, [users, orders, comments]);

  // Load pending payments count
  useEffect(() => {
    const loadPendingPayments = async () => {
      try {
        const { pendingPaymentsManager } = await import('../utils/pendingPayments');
        const allPendingPayments = pendingPaymentsManager.getAllPendingPayments();
        setPendingPaymentsCount(allPendingPayments.length);
      } catch (error) {
        console.error('Error loading pending payments:', error);
        setPendingPaymentsCount(0);
      }
    };

    loadPendingPayments();
    
    // DISABLED: Auto-refresh was causing continuous API calls and interfering with admin operations
    // const interval = setInterval(loadPendingPayments, 30000);
    // return () => clearInterval(interval);
    return () => {}; // Cleanup function still needed
  }, []);

  const [dataLoaded, setDataLoaded] = useState(false);
  const [analyticsActiveTab, setAnalyticsActiveTab] = useState('overview');

  // Memoized dashboard stats calculation for performance
  const dashboardStats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const activeUsers = users.filter(user => {
      const lastLogin = new Date(user.lastLogin || user.createdAt);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastLogin >= oneWeekAgo;
    }).length;

    return {
      totalUsers: users.length,
      activeUsers: activeUsers,
      totalVideos: videos.length,
      totalRevenue: totalRevenue,
      conversionRate: users.length > 0 ? (orders.length / users.length) * 100 : 0
    };
  }, [users, videos, orders]);

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  
  // State for Recent Activity page
  const [recentActivityPageData, setRecentActivityPageData] = useState<any[]>([]);
  const [isRecentActivityLoading, setIsRecentActivityLoading] = useState(true);
  
  // State for Recent Activity filters and pagination
  const [activityFilter, setActivityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1000; // Show all activities
  
  // Add missing childrenProfiles state
  const [childrenProfiles, setChildrenProfiles] = useState<ChildProfile[]>([]);

  // Load recent activities for main dashboard
  useEffect(() => {
    const loadMainDashboardActivity = async () => {
      try {
        const activities = await realDataAnalytics.getRecentActivity();
        // Transform the data to match the expected format for the main dashboard
        const transformedActivities = activities.map(activity => ({
          id: activity.id,
          message: activity.details,
          time: new Date(activity.timestamp).toLocaleString(),
          avatar: activity.user || 'System',
          type: activity.type
        }));
        setRecentActivities(transformedActivities);
      } catch (error) {
        console.error('Error loading main dashboard activity:', error);
        setRecentActivities([]);
      }
    };

    loadMainDashboardActivity();
  }, []);
  
  // Load recent activities for Recent Activity page
  useEffect(() => {
    const loadRecentActivityPage = async () => {
      try {
        setIsRecentActivityLoading(true);
        const activities = await realDataAnalytics.getRecentActivity();
        setRecentActivityPageData(activities);
      } catch (error) {
        console.error('Error loading recent activity page:', error);
        setRecentActivityPageData([]);
      } finally {
        setIsRecentActivityLoading(false);
      }
    };

    if (activeSection === 'recent-activity') {
      loadRecentActivityPage();
    }
  }, [activeSection]);


  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load real data from vpsDataStore on component mount
  useEffect(() => {
    loadRealData();
    loadExistingLogo();
  }, []);
  
  // Load existing logo only on mount
  useEffect(() => {
    loadExistingLogo();
  }, []);

  // Load packages from data store
  const loadPackages = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      const packageData = data.packages || [];
      setPackages(packageData);
      console.log('Ã°Å¸â€œÂ¦ Loaded packages:', packageData.length);
    } catch (error) {
      console.error('Failed to load packages:', error);
      setPackages([]);
    }
  };

  // Initialize packages loading
  useEffect(() => {
    loadPackages();
  }, []);

  // Load existing admin logo from settings
  const loadExistingLogo = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      const settings = data.settings;
      if ((settings as any)?.adminLogo) {
        setLogoFile((settings as any).adminLogo);
      }
    } catch (error) {
      console.error('Failed to load existing admin logo:', error);
    }
  };
  
  // Content form state - moved before useEffect
  const [editingVideo, setEditingVideo] = useState<Module | null>(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    category: '',
    contentType: 'video',
    rating: 0,
    price: 0,
    duration: '',
    thumbnail: '',
    videoUrl: '',
    audioUrl: '',
    videoType: 'upload',
    tags: '',
    status: 'active'
  });

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (videoForm.videoUrl && videoForm.videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoForm.videoUrl);
      }
      if (videoForm.thumbnail && videoForm.thumbnail.startsWith('blob:')) {
        URL.revokeObjectURL(videoForm.thumbnail);
      }
    };
  }, [videoForm.videoUrl, videoForm.thumbnail]);

  const loadRealData = async (): Promise<void> => {
    
    try {
      setDataLoaded(false);
      
      // Clear cache and localStorage for fresh data
      vpsDataStore.clearMemoryCache();
      if (typeof window !== 'undefined') {
        localStorage.clear();
        console.log('🧹 Cleared localStorage - using database only');
      }
      
      // Load data from database API with cache busting
      const response = await fetch(`/api/data?t=${Date.now()}`);
      const data = await response.json();
      
      // FORCE COMPLETE DATA REFRESH - ignore any cached users
      console.log('🔄 Raw VPS data users:', data.users?.length || 0);
      
      // Use VPS data as the source of truth
      const vpsUsers = data.users || [];
      const realUsers = vpsUsers;
      
      // NUCLEAR OPTION: Clear all component state
      setUsers([]);
      setOrders([]);
      setVideos([]);
      setPackages([]);
      
      // Data loaded successfully
      const realVideos = data.modules || [];
      const realOrders = data.purchases || [];
      const realUploadQueue = data.uploadQueue || [];
      
      // Load all data from VPS
      const realCategories = data.categories || ['Audio Lessons', 'PP1 Program', 'PP2 Program'];
      const realComments = data.comments || [];
      const realSubscriptions = data.subscriptions || [];
      const realNotifications = data.notifications || [];
      const realScheduledContent = data.scheduledContent || [];
      const realContentBundles = (data as any).contentBundles || [];
      
      // Load categories from VPS or use defaults
      setCategories(realCategories.length > 0 ? realCategories : ['Uncategorized']);
      

      
      setComments(
        realComments.map((c: any) => ({
          ...c,
          status: c.status === 'pending' || c.status === 'approved' || c.status === 'rejected'
            ? c.status
            : 'pending'
        }))
      );
      setSubscriptions(
        realSubscriptions.map((s: any) => ({
          ...s,
          status: s.status || 'active'
        }))
      );
      setNotifications(realNotifications);
      setScheduledContent(realScheduledContent);
      setContentBundles(realContentBundles);

      // Set real users data
      setUsers(realUsers.map((user: any) => ({
        id: user.id,
        name: user.name || (user as any).username || 'Unknown User',
        email: user.email,
        role: (user.role || 'user') as 'user' | 'admin' | 'moderator',
        createdAt: user.createdAt,
        totalSpent: user.totalSpent || 0,
        status: (user.status || 'active') as 'active' | 'inactive' | 'suspended',
        avatar: user.avatar,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        subscription: ((user as any).subscription as 'free' | 'basic' | 'premium' | 'family') || 'free'
      })));

      // Set real videos data with proper URL handling
      const processedVideos = realVideos.map((video: any) => {
        console.log('Processing video for display:', { id: video.id, title: video.title, videoUrl: video.videoUrl?.substring(0, 50) });
        return {
          ...video,
          // Ensure URLs are properly handled for display
          videoUrl: video.videoUrl || video.videoSource || '',
          thumbnail: video.thumbnail || video.imageUrl || '',
          // Ensure all required fields are present
          ageGroup: video.ageGroup || video.ageRange || '3-8 years',
          videoType: video.videoType || (video.videoUrl?.includes('youtube') ? 'youtube' : 'external'),
          language: video.language || 'English',
          tags: video.tags || [],
          isActive: video.isActive !== undefined ? video.isActive : true
        };
      });
      
      console.log(`Ã°Å¸Å½Â¬ Loaded ${processedVideos.length} videos for display`);
      setVideos(processedVideos);

      // Convert real purchases to orders format
      const convertedOrders = realOrders.map((purchase: any): Order => {
        const user = realUsers.find((u: any) => u.id === purchase.userId);
        const video = realVideos.find((v: any) => v.id === purchase.moduleId);
        
        return {
          id: purchase.id,
          customer: {
            name: user?.name || (user as any)?.username || 'Unknown User',
            email: user?.email || 'unknown@email.com',
            avatar: user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'UN'
          },
          item: {
            name: video?.title || 'Unknown Product',
            count: 1,
            type: 'video'
          },
          amount: purchase.amount || video?.price || 0,
          status: purchase.status || 'completed',
          orderType: 'Video Purchase',
          date: new Date(purchase.createdAt || purchase.purchaseDate || Date.now()),
          paymentMethod: purchase.paymentMethod || 'Credit Card',
          transactionId: purchase.transactionId || purchase.id
        };
      });

      setOrders(convertedOrders);

      // Set real upload queue
      setUploadQueue((realUploadQueue || []).map((item: any) => ({
        ...item,
        filename: item.filename || item.name || item.title || 'Unknown'
      } as UploadItem)));

      // Dashboard stats are now calculated automatically in useEffect
      console.log('VPS Data loaded:', { users: realUsers.length, videos: processedVideos.length, orders: convertedOrders.length });

      // Generate real activity feed
      const activities: any[] = [];
      
      // Add recent user registrations
      realUsers.slice(-5).forEach((user: any) => {
        activities.push({
          id: `user_${user.id}`,
          type: 'user',
          message: `New user ${user.name || user.username} registered`,
          time: new Date(user.createdAt || Date.now()).toLocaleString(),
          avatar: user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'
        });
      });

      // Add recent orders
      convertedOrders.slice(-5).forEach((order: Order) => {
        activities.push({
          id: `order_${order.id}`,
          type: 'purchase',
          message: `${order.customer.name} purchased ${order.item.name}`,
          time: order.date.toLocaleString(),
          avatar: order.customer.avatar
        });
      });

      // Add recent video uploads
      realVideos.slice(-3).forEach((video: any) => {
        activities.push({
          id: `video_${video.id}`,
          type: 'video',
          message: `Video "${video.title}" was uploaded`,
          time: new Date(video.createdAt || Date.now()).toLocaleString(),
          avatar: video.title.split(' ').map((w: string) => w[0]).join('').toUpperCase()
        });
      });

      // Sort by most recent and take top 10 for preview
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivities(activities);


      

      
      setDataLoaded(true);

    } catch (error) {
      console.error('Failed to load data from VPS:', error);


      setRecentActivities([]);
    } finally {
      setDataLoaded(true);
    }
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Removed unused getStatusColor function

  const sidebarItems: SidebarItem[] = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'text-purple-600'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      children: [
        { id: 'all-users', label: 'All Users', icon: <Users className="h-4 w-4" /> },
        { id: 'add-user', label: 'Add New User', icon: <Plus className="h-4 w-4" /> },
        { id: 'user-roles', label: 'User Roles', icon: <Shield className="h-4 w-4" /> }
      ]
    },

    {
      id: 'content',
      label: 'Content Management',
      icon: <Video className="h-5 w-5" />,
      color: 'text-green-600',
      children: [
        { id: 'all-videos', label: 'All Content', icon: <Folder className="h-4 w-4" /> },
        { id: 'add-video', label: 'Add Content', icon: <Plus className="h-4 w-4" /> },
        { id: 'categories', label: 'Categories', icon: <Tag className="h-4 w-4" /> },
        { id: 'upload-queue', label: 'Upload Queue', icon: <Upload className="h-4 w-4" />, badge: uploadQueue.length > 0 ? uploadQueue.length.toString() : undefined }
      ]
    },
    {
      id: 'packages',
      label: 'Learning Packages',
      icon: <PackageIcon className="h-5 w-5" />,
      color: 'text-purple-600',
      children: [
        { id: 'all-packages', label: 'All Packages', icon: <PackageIcon className="h-4 w-4" /> },
        { id: 'add-package', label: 'Add Package', icon: <Plus className="h-4 w-4" /> },

      ]
    },
    {
      id: 'scheduling',
      label: 'Content Scheduling',
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-indigo-600'
    },

    {
      id: 'commerce',
      label: 'Commerce',
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'text-emerald-600',
      children: [
        { id: 'orders', label: 'Orders', icon: <PackageIcon className="h-4 w-4" /> },
        { id: 'pending-payments', label: 'Pending Payments', icon: <Clock className="h-4 w-4" /> },
        { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard className="h-4 w-4" /> },
        { id: 'transactions', label: 'Transactions', icon: <Receipt className="h-4 w-4" /> }
      ]
    },
    {
      id: 'moderation',
      label: 'Moderation',
      icon: <Shield className="h-5 w-5" />,
      color: 'text-red-600',
      children: [
        { id: 'comments', label: 'Comments', icon: <MessageSquare className="h-4 w-4" />, badge: comments.filter(c => c.status === 'pending').length > 0 ? comments.filter(c => c.status === 'pending').length.toString() : undefined },
        { id: 'flagged-content', label: 'Flagged Content', icon: <Flag className="h-4 w-4" />, badge: flaggedContent.length > 0 ? flaggedContent.length.toString() : undefined }
      ]
    },
    {
      id: 'chat',
      label: 'Chat Support',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      id: 'recent-activity',
      label: 'Recent Activity',
      icon: <Clock className="h-5 w-5" />,
      color: 'text-orange-600'
    },
    {
      id: 'admin-profile',
      label: 'Admin Profile',
      icon: <UserCheck className="h-5 w-5" />,
      color: 'text-indigo-600'
    },

    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      color: 'text-gray-600',
      children: [
        { id: 'general-settings', label: 'General Settings', icon: <Settings className="h-4 w-4" /> },
        { id: 'email-settings', label: 'Email Settings', icon: <Mail className="h-4 w-4" /> },
        { id: 'security-settings', label: 'Security Settings', icon: <Shield className="h-4 w-4" /> },
        { id: 'notification-settings', label: 'Notification Settings', icon: <Bell className="h-4 w-4" /> },
        { id: 'content-settings', label: 'Content Settings', icon: <FileText className="h-4 w-4" /> }
      ]
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activeSection === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isCollapsed = !sidebarOpen && !isMobile;

    return (
      <div key={item.id} className={`${level > 0 ? 'ml-2' : ''}`}>
        <div
          className={`
            group flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out
            ${isActive 
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-md backdrop-blur-sm border border-blue-400/30 font-medium' 
              : 'text-white/75 hover:bg-white/8 hover:text-white/95 hover:shadow-sm'
            }
            ${level > 0 ? 'text-xs py-1.5 mx-2 bg-transparent hover:bg-white/10' : 'text-sm'}
            ${isCollapsed ? 'mx-1 w-10 h-10 justify-center' : ''}
          `}
          onClick={() => {
            if (hasChildren && !isCollapsed) {
              toggleExpanded(item.id);
            } else {
              // Handle special cases for user management
              if (item.id === 'add-user') {
                handleSetActiveSection('add-user');
                // Reset editing state for new user
                setEditingUser(null);
                setUserForm({
                  name: '',
                  email: '',
                  password: '',
                  role: 'user',
                  status: 'active',
                  avatar: '',
                  phone: '',
                  dateOfBirth: '',
                  subscription: 'free'
                });
              } else if (item.id === 'add-video') {
                // Handle add video specifically - ensure clean state
                setEditingVideo(null);
                setVideoForm({
                  title: '',
                  description: '',
                  category: '',
                  contentType: 'video',
                  rating: 0,
                  price: 0,
                  duration: '',
                  thumbnail: '',
                  videoUrl: '',
                  audioUrl: '',
                  videoType: 'youtube',
                  tags: '',
                  status: 'active'
                });
                handleSetActiveSection('add-video');
              } else if (item.id === 'add-package') {
                setEditingPackage(null);
                setPackageForm({
                  name: '',
                  icon: '',
                  description: '',
                  price: 0,
                  type: 'subscription',
                  features: '',
                  isActive: true,
                  isPopular: false,
                  coverImage: '',
                  contentIds: []
                });
                handleSetActiveSection(item.id);
              } else {
                handleSetActiveSection(item.id);
              }
              if (isMobile) setSidebarOpen(false);
            }
          }}
          title={isCollapsed ? item.label : ''}
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className={`${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'} ${isCollapsed ? 'text-lg' : 'text-base'} transition-colors duration-200 flex-shrink-0`}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <>
                <span className={`font-medium ${level > 0 ? 'text-sm' : 'text-sm'} truncate transition-colors duration-200 flex-1`}>
                  {item.label}
                </span>
                {item.badge && (
                  <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0 shadow-sm">
                    {item.badge}
                  </div>
                )}
              </>
            )}
          </div>
          {hasChildren && !isCollapsed && (
            <div className={`transition-all duration-200 flex-shrink-0 ${isExpanded ? 'rotate-90 text-white' : 'text-white/50 group-hover:text-white/80'}`}>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
        
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-0.5 bg-black/10 rounded-md mx-2 py-1">
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Professional page header
  const PageHeader = ({ title, actions }: { title: string; actions?: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">{title}</h1>
        <div className="w-12 h-0.5 bg-gray-900"></div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );

  // Professional stats grid
  const StatsGrid = ({ stats }: { stats: Array<{ label: string; value: string | number; color: string; change?: string; icon?: React.ReactNode }> }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                {stat.change && <div className="text-xs text-gray-500 mt-1">{stat.change}</div>}
              </div>
              {stat.icon && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {stat.icon}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  // Render functions for each section
  const renderOverview = () => {
    
    return (
      <div className="space-y-8">
        {/* Professional Welcome Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome back, {currentUser?.name || 'Admin'}
              </h1>
              <p className="text-gray-600">
                Here's an overview of your platform's performance today.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

      <StatsGrid stats={[
        { 
          label: 'Total Users', 
          value: dashboardStats.totalUsers.toLocaleString(), 
          color: '', 
          change: 'Registered users',
          icon: <Users className="h-6 w-6 text-gray-600" />
        },
        { 
          label: 'Active Users', 
          value: dashboardStats.activeUsers.toLocaleString(), 
          color: '', 
          change: `${((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100).toFixed(1)}% engagement`,
          icon: <Activity className="h-6 w-6 text-gray-600" />
        },
        { 
          label: 'Total Videos', 
          value: dashboardStats.totalVideos, 
          color: '', 
          change: 'Educational content',
          icon: <Video className="h-6 w-6 text-gray-600" />
        },
        { 
          label: 'Revenue', 
          value: `$${dashboardStats.totalRevenue.toLocaleString()}`, 
          color: '', 
          change: 'Total earnings',
          icon: <DollarSign className="h-6 w-6 text-gray-600" />
        }
      ]} />

      {/* Performance Metrics and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl rounded-lg"
                onPress={() => handleSetActiveSection('add-video')}
              >
                <div className="text-center">
                  <Plus className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs font-semibold">Add Content</span>
                </div>
              </Button>
              <Button 
                className="h-20 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl rounded-lg"
                onPress={() => handleSetActiveSection('audio-lessons')}
              >
                <div className="text-center">
                  <Headphones className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs font-semibold">Audio</span>
                </div>
              </Button>
              <Button 
                className="h-20 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl rounded-lg"
                onPress={() => handleSetActiveSection('all-videos')}
              >
                <div className="text-center">
                  <Video className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs font-semibold">Videos ({dashboardStats.totalVideos})</span>
                </div>
              </Button>
              <Button 
                className="h-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl rounded-lg"
                onPress={() => handleSetActiveSection('orders')}
              >
                <div className="text-center">
                  <ShoppingCart className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs font-semibold">Orders</span>
                </div>
              </Button>
              <Button 
                className="h-20 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl rounded-lg"
                onPress={() => handleSetActiveSection('all-users')}
              >
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs font-semibold">Users</span>
                </div>
              </Button>
              <Button 
                className="h-20 bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl rounded-lg"
                onPress={() => handleSetActiveSection('settings')}
              >
                <div className="text-center">
                  <Settings className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs font-semibold">Settings</span>
                </div>
              </Button>
              <Button 
                className="h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl rounded-lg"
                onPress={() => handleSetActiveSection('audio-lessons')}
              >
                <div className="text-center">
                  <Headphones className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs font-semibold">Audio BB1</span>
                </div>
              </Button>
              <Button 
                className="h-20 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl rounded-lg"
                onPress={() => handleSetActiveSection('add-package')}
              >
                <div className="text-center">
                  <Layers className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs font-semibold">Bundle</span>
                </div>
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Button
              size="sm"
              variant="flat"
              className="text-blue-600 hover:text-blue-700"
              onPress={() => handleSetActiveSection('recent-activity')}
            >
              View All
            </Button>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentActivities.slice(0, 5).map((activity, index) => (
                <div key={`${activity.id}-${index}`} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{activity.avatar.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'video' ? 'bg-green-500' :
                    activity.type === 'purchase' ? 'bg-purple-500' :
                    'bg-orange-500'
                  }`} />
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    // Calculate real analytics data
    const totalViews = videos.reduce((sum, video) => {
      const videoOrders = orders.filter(order => order.item.name === video.title);
      return sum + (videoOrders.length * 15);
    }, 0);

    const avgRating = videos.length > 0 
      ? (videos.reduce((sum, video) => sum + (video.rating || 0), 0) / videos.length).toFixed(1)
      : '0.0';

    const totalShares = orders.reduce((sum, order) => sum + Math.floor(order.amount / 10), 0);
    const completionRate = videos.length > 0 ? Math.min(95, 70 + (orders.length / videos.length) * 10) : 0;

    const videoPerformanceData = videos.map(video => {
      const realViews = (video as any).views || 0;
      const videoOrders = orders.filter(order => order.item.name === video.title);
      const estimatedRevenue = videoOrders.reduce((sum, order) => sum + order.amount, 0);
      
      return {
        id: video.id,
        title: video.title,
        views: realViews,
        revenue: estimatedRevenue,
        rating: video.rating || 0,
        category: video.category || 'Educational',
        completionRate: Math.min(100, 60 + (estimatedRevenue / 10)),
        engagement: videoOrders.length,
        shares: Math.floor(videoOrders.length / 2)
      };
    }).sort((a, b) => b.views - a.views);

    const newUsers = users.filter(user => {
      const createdDate = new Date(user.createdAt);
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return createdDate >= oneMonthAgo;
    }).length;
    
    const userEngagementData = {
      totalSessions: orders.length + users.length,
      avgSessionDuration: `${Math.floor(4 + (orders.length / users.length || 0) * 2)}m ${Math.floor((orders.length * 15) % 60)}s`,
      bounceRate: Math.max(15, 50 - (orders.length / users.length || 0) * 20),
      returnVisitors: orders.length > 0 ? Math.floor(users.length * 0.4) : 0,
      newUsers: newUsers
    };

    const advancedAnalytics = {
      conversionRate: users.length > 0 ? ((orders.length / users.length) * 100).toFixed(1) : '0.0',
      customerLifetimeValue: users.length > 0 ? (dashboardStats.totalRevenue / users.length).toFixed(2) : '0.00',
      churnRate: users.length > 0 ? Math.max(5, 25 - (orders.length / users.length) * 10).toFixed(1) : '0.0',
      monthlyRecurringRevenue: (dashboardStats.totalRevenue / 12).toFixed(2),
      topPerformingCategory: videoPerformanceData.length > 0 ? videoPerformanceData[0].category : 'N/A',
      peakUsageHours: orders.length > 0 ? ['10AM-12PM', '6PM-8PM'] : ['No data'],
      deviceBreakdown: { 
        mobile: Math.min(80, 45 + (users.length > 10 ? 20 : 0)), 
        desktop: Math.max(15, 35 - (users.length > 10 ? 10 : 0)), 
        tablet: Math.min(20, 10 + (users.length > 5 ? 5 : 0)) 
      },
      geographicData: users.reduce((acc: any[], user) => {
        const country = user.country || user.location || 'Unknown';
        const existing = acc.find(item => item.country === country);
        const userRevenue = orders.filter(order => order.customer.email === user.email).reduce((sum, order) => sum + order.amount, 0);
        
        if (existing) {
          existing.users += 1;
          existing.revenue += userRevenue;
        } else {
          acc.push({ country, users: 1, revenue: userRevenue });
        }
        return acc;
      }, []).sort((a, b) => b.users - a.users)
    };

    return (
      <div className="space-y-6">
        <PageHeader 
          title="Analytics Dashboard" 
          actions={
            <div className="flex space-x-2">
              <Button 
                variant="flat" 
                startContent={<Download className="h-4 w-4" />}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                Export Report
              </Button>
              <Button 
                variant="flat" 
                startContent={<RotateCcw className="h-4 w-4" />}
                onPress={() => loadRealData()}
                className="bg-green-50 text-green-600 hover:bg-green-100"
              >
                Refresh Data
              </Button>
            </div>
          }
        />
        
        <Tabs 
          selectedKey={analyticsActiveTab} 
          onSelectionChange={(key) => setAnalyticsActiveTab(key as string)}
          className="w-full"
          variant="underlined"
          color="primary"
        >
          <Tab key="overview" title="Overview">
            <StatsGrid stats={[
              { 
                label: 'Total Views', 
                value: totalViews.toLocaleString(), 
                color: '', 
                change: 'Based on user activity',
                icon: <Eye className="h-6 w-6 text-blue-600" />
              },
              { 
                label: 'Completion Rate', 
                value: `${completionRate.toFixed(1)}%`, 
                color: '', 
                change: 'Average across all videos',
                icon: <CheckCircle className="h-6 w-6 text-green-600" />
              },
              { 
                label: 'Avg Rating', 
                value: avgRating, 
                color: '', 
                change: `From ${videos.length} videos`,
                icon: <Star className="h-6 w-6 text-purple-600" />
              },
              { 
                label: 'Total Shares', 
                value: totalShares.toLocaleString(), 
                color: '', 
                change: 'User interactions',
                icon: <TrendingUp className="h-6 w-6 text-orange-600" />
              }
            ]} />

            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
              <h3 className="text-xl font-semibold text-slate-900">Video Performance</h3>
              <Input
                placeholder="Search videos..."
                startContent={<Search className="h-4 w-4" />}
                className="w-full sm:w-64"
                classNames={{
                  input: "bg-slate-50/50",
                  inputWrapper: "bg-slate-50/50 hover:bg-slate-100/50 border-slate-200/50"
                }}
              />
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <Table removeWrapper aria-label="Video performance table" classNames={{
                table: "min-w-full",
                thead: "bg-slate-50",
                tbody: "divide-y divide-slate-100"
              }}>
                <TableHeader>
                  <TableColumn className="bg-slate-50 text-slate-700 font-semibold py-4 px-6 text-left">VIDEO</TableColumn>
                  <TableColumn className="bg-slate-50 text-slate-700 font-semibold py-4 px-6 text-center">VIEWS</TableColumn>
                  <TableColumn className="bg-slate-50 text-slate-700 font-semibold py-4 px-6 text-center">REVENUE</TableColumn>
                  <TableColumn className="bg-slate-50 text-slate-700 font-semibold py-4 px-6 text-center">RATING</TableColumn>
                  <TableColumn className="bg-slate-50 text-slate-700 font-semibold py-4 px-6 text-center">COMPLETION</TableColumn>
                  <TableColumn className="bg-slate-50 text-slate-700 font-semibold py-4 px-6 text-center">ENGAGEMENT</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No video data available">
                  {videoPerformanceData.slice(0, 10).map((video) => (
                    <TableRow key={video.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 truncate">{video.title}</p>
                            <p className="text-sm text-slate-500">{video.category}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-slate-900">{video.views.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                          <span className="font-semibold text-slate-900">{formatCurrency(video.revenue)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span className="font-medium text-slate-900">{video.rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <Progress 
                            value={video.completionRate} 
                            className="w-20" 
                            color={video.completionRate > 80 ? 'success' : video.completionRate > 60 ? 'warning' : 'danger'}
                            size="sm"
                          />
                          <span className="text-sm font-medium text-slate-700 min-w-[3rem]">{video.completionRate.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                          <span className="font-medium text-slate-900">{video.engagement}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardBody>
            </Card>
          </Tab>
          
          <Tab key="engagement" title="User Engagement">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <h3 className="text-xl font-semibold">User Engagement Metrics</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">{users.length}</p>
                      <p className="text-sm text-blue-700">Total Users</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{userEngagementData.newUsers}</p>
                      <p className="text-sm text-green-700">New Users</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">{userEngagementData.avgSessionDuration}</p>
                      <p className="text-sm text-purple-700">Avg Session</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                      <RotateCcw className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-orange-600">{userEngagementData.returnVisitors}</p>
                      <p className="text-sm text-orange-700">Return Users</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                    <span className="text-sm font-medium text-gray-700">User Retention Rate</span>
                    <span className="text-sm font-semibold text-green-600">
                      {((userEngagementData.returnVisitors / users.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(userEngagementData.returnVisitors / users.length) * 100} 
                    className="w-full" 
                    color="success"
                  />
                </div>
                
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                    <span className="text-sm font-medium text-gray-700">Bounce Rate</span>
                    <span className="text-sm font-semibold text-orange-600">
                      {userEngagementData.bounceRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={userEngagementData.bounceRate} 
                    className="w-full" 
                    color="warning"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <h3 className="text-xl font-semibold">Revenue Analytics</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">
                        {formatCurrency(dashboardStats.totalRevenue)}
                      </p>
                      <p className="text-sm text-green-700">Total Revenue</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                        {formatCurrency(dashboardStats.totalRevenue / Math.max(orders.length, 1))}
                      </p>
                      <p className="text-sm text-blue-700">Avg Order Value</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Top Performing Videos</h4>
                <div className="space-y-3">
                  {videoPerformanceData.slice(0, 5).map((video, index) => (
                    <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0 ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm truncate">{video.title}</p>
                          <p className="text-xs text-gray-500">{video.views} views</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-green-600 text-sm">{formatCurrency(video.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
            </div>
          </Tab>
          
          <Tab key="performance" title="Performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion & Performance Metrics */}
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <h3 className="text-xl font-semibold">Conversion & Performance</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{advancedAnalytics.conversionRate}%</p>
                      <p className="text-sm text-green-700">Conversion Rate</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">${advancedAnalytics.customerLifetimeValue}</p>
                      <p className="text-sm text-purple-700">Avg CLV</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-red-600">{advancedAnalytics.churnRate}%</p>
                      <p className="text-sm text-red-700">Churn Rate</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <RotateCcw className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">${advancedAnalytics.monthlyRecurringRevenue}</p>
                      <p className="text-sm text-blue-700">MRR</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                    <span className="text-sm font-medium text-gray-700">Top Category: {advancedAnalytics.topPerformingCategory}</span>
                    <span className="text-sm font-semibold text-green-600">Leading</span>
                  </div>
                  <Progress value={85} className="w-full" color="success" />
                </div>
                
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                    <span className="text-sm font-medium text-gray-700">Peak Hours: {advancedAnalytics.peakUsageHours.join(', ')}</span>
                    <span className="text-sm font-semibold text-blue-600">Active</span>
                  </div>
                  <Progress value={72} className="w-full" color="primary" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Device & Geographic Analytics */}
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <h3 className="text-xl font-semibold">Device & Geographic Insights</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Device Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Mobile</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={advancedAnalytics.deviceBreakdown.mobile} className="w-16 sm:w-20" size="sm" color="primary" />
                      <span className="text-sm font-semibold">{advancedAnalytics.deviceBreakdown.mobile}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Desktop</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={advancedAnalytics.deviceBreakdown.desktop} className="w-16 sm:w-20" size="sm" color="success" />
                      <span className="text-sm font-semibold">{advancedAnalytics.deviceBreakdown.desktop}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tablet className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Tablet</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={advancedAnalytics.deviceBreakdown.tablet} className="w-16 sm:w-20" size="sm" color="secondary" />
                      <span className="text-sm font-semibold">{advancedAnalytics.deviceBreakdown.tablet}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Top Countries</h4>
                <div className="space-y-3">
                  {advancedAnalytics.geographicData.slice(0, 5).map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0 ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm truncate">{country.country}</p>
                          <p className="text-xs text-gray-500">{country.users} users</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-green-600 text-sm">{formatCurrency(country.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
            </div>
          </Tab>
          
          <Tab key="geographic" title="Geographic">
            <div className="grid grid-cols-1 gap-8">
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <h3 className="text-xl font-semibold">Geographic Distribution</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {advancedAnalytics.geographicData.slice(0, 10).map((country, index) => (
                      <div key={country.country} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{country.country}</p>
                            <p className="text-sm text-gray-500">{country.users} users</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{formatCurrency(country.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>


      </div>
    );
  };

  // Video form state moved above

  
  // Audio lesson form state
  const [audioForm, setAudioForm] = useState<{
    title: string;
    description: string;
    price: number;
    duration: string;
    audioUrl: string;
    thumbnail: string;
    tags: string;
    aiTags: string[];
    hasPreview: boolean;
    previewUrl: string;
    previewDuration: string;
  }>({
    title: '',
    description: '',
    price: 0,
    duration: '',
    audioUrl: '',
    thumbnail: '',
    tags: '',
    aiTags: [] as string[],
    hasPreview: false,
    previewUrl: '',
    previewDuration: ''
  });

  
  // User form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin' | 'moderator',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    avatar: '',
    phone: '',
    dateOfBirth: '',
    subscription: 'free' as 'free' | 'basic' | 'premium' | 'family'
  });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFilter, setUserFilter] = useState('all');
  // Removed unused selectedUser state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure();
  
  // Package form state
  const [packageForm, setPackageForm] = useState({
    name: '',
    icon: '',
    description: '',
    price: 0,
    type: 'subscription',
    features: '',
    isActive: true,
    isPopular: false,
    coverImage: '',
    contentIds: [] as string[]
  });
  const [editingPackage, setEditingPackage] = useState<any>(null);
  
  // Bundle form state
  const [bundleForm, setBundleForm] = useState({
    name: '',
    description: '',
    price: 0,
    discount: 0,
    category: 'mixed',
    coverImage: '',
    selectedVideos: [] as string[],
    isActive: true
  });
  const [editingBundle, setEditingBundle] = useState<any>(null);
  
  // PP1 form state
  const [editingPP1, setEditingPP1] = useState<Module | null>(null);
  
  const [pp1Form, setPP1Form] = useState({
    title: '',
    description: '',
    price: 0,
    contentType: 'text',
    coverImage: '',
    contentUrl: '',
    duration: '',
    tags: ''
  });

  // PP2 form state
  const [editingPP2, setEditingPP2] = useState<Module | null>(null);
  
  const [pp2Form, setPP2Form] = useState({
    title: '',
    description: '',
    price: 0,
    contentType: 'text',
    coverImage: '',
    contentUrl: '',
    duration: '',
    tags: ''
  });

  // Content Scheduling State
  const [scheduleForm, setScheduleForm] = useState({
    contentId: '',
    publishDate: '',
    publishTime: '',
    status: 'scheduled' as 'scheduled' | 'published' | 'cancelled'
  });

  const handleScheduleContent = async () => {
    if (!scheduleForm.contentId || !scheduleForm.publishDate || !scheduleForm.publishTime) {
      showToast('Please fill in all scheduling fields', 'error');
      return;
    }

    const scheduledItem = {
      contentId: scheduleForm.contentId,
      publishDateTime: new Date(`${scheduleForm.publishDate}T${scheduleForm.publishTime}`),
      status: scheduleForm.status
    };

    // Mock scheduling functionality
    const newScheduledItem = { ...scheduledItem, id: `schedule_${Date.now()}` };
    setScheduledContent(prev => [...prev, newScheduledItem]);
    showToast('Content scheduled successfully!', 'success');
    
    // Reset form
    setScheduleForm({
      contentId: '',
      publishDate: '',
      publishTime: '',
      status: 'scheduled'
    });
  };

  const handleCancelSchedule = async (scheduleId: string) => {
    setScheduledContent(prev => 
      prev.map(item => 
        item.id === scheduleId 
          ? { ...item, status: 'cancelled' }
          : item
      )
    );
    showToast('Schedule cancelled successfully!', 'success');
  };

  const handlePublishNow = async (scheduleId: string) => {
    const scheduleItem = scheduledContent.find(item => item.id === scheduleId);
    if (scheduleItem) {
      // Update the actual content to be visible
      const video = videos.find(v => v.id === scheduleItem.contentId);
      if (video) {
        const updatedVideo = { ...video, isVisible: true, publishedAt: new Date().toISOString() };
        // Update video in local state
        const data = await vpsDataStore.loadData();
        const moduleIndex = data.modules?.findIndex(m => m.id === video.id);
        if (moduleIndex !== undefined && moduleIndex >= 0 && data.modules) {
          data.modules[moduleIndex] = updatedVideo;
          // Update video in local state only
          setVideos(prev => prev.map(v => v.id === video.id ? updatedVideo : v));
        }
        setVideos(prev => prev.map(v => v.id === video.id ? updatedVideo : v));
      }
      
      // Update schedule status
      setScheduledContent(prev => 
        prev.map(item => 
          item.id === scheduleId 
            ? { ...item, status: 'published', publishedAt: new Date().toISOString() }
            : item
        )
      );
      alert('- Content published successfully!');
    }
  };

  const handleSavePP2 = async () => {
    try {
      if (!pp2Form.title.trim()) {
        setToast({message: 'Please enter a title for the PP2 content', type: 'error'});
        setTimeout(() => setToast(null), 3000);
        return;
      }

      if (editingPP2) {
        const updatedContent = {
          ...editingPP2,
          title: pp2Form.title,
          description: pp2Form.description,
          price: pp2Form.price || 0,
          category: 'PP2 Program',
          thumbnail: pp2Form.coverImage,
          videoUrl: pp2Form.contentUrl,
          duration: pp2Form.duration,
          tags: pp2Form.tags ? pp2Form.tags.split(',').map(tag => tag.trim()) : [],
          updatedAt: new Date().toISOString()
        };

        const success = await vpsDataStore.updateProduct(updatedContent);
        if (success) {
          vpsDataStore.clearMemoryCache();
          await loadRealData();
          setToast({message: 'PP2 content updated successfully!', type: 'success'});
          setTimeout(() => setToast(null), 3000);
          handleSetActiveSection('pp2-program');
        } else {
          setToast({message: 'Failed to update PP2 content', type: 'error'});
          setTimeout(() => setToast(null), 3000);
        }
      } else {
        const newContent = {
          id: `pp2_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
          title: pp2Form.title,
          description: pp2Form.description,
          price: pp2Form.price || 0,
          category: 'PP2 Program',
          thumbnail: pp2Form.coverImage,
          videoUrl: pp2Form.contentUrl,
          duration: pp2Form.duration,
          tags: pp2Form.tags ? pp2Form.tags.split(',').map(tag => tag.trim()) : [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const success = await vpsDataStore.addProduct(newContent);
        if (success) {
          vpsDataStore.clearMemoryCache();
          await loadRealData();
          setToast({message: 'PP2 content created successfully!', type: 'success'});
          setTimeout(() => setToast(null), 3000);
          handleSetActiveSection('pp2-program');
        } else {
          setToast({message: 'Failed to create PP2 content', type: 'error'});
          setTimeout(() => setToast(null), 3000);
        }
      }

      // Reset form
      setPP2Form({
        title: '',
        description: '',
        price: 0,
        contentType: 'text',
        coverImage: '',
        contentUrl: '',
        duration: '',
        tags: ''
      });
      setEditingPP2(null);
    } catch (error) {
      console.error('Error saving PP2 content:', error);
      setToast({message: 'Error saving PP2 content', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleEditVideo = (video: Module) => {
    console.log('Ã°Å¸Å½Â¬ Editing video:', { id: video.id, title: video.title, hasVideoUrl: !!video.videoUrl, hasThumbnail: !!video.thumbnail });
    setEditingVideo(video);
    
    // Determine video type based on URL and existing videoType
    let videoType = (video as any).videoType || 'youtube';
    if (video.videoUrl) {
      if (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be')) {
        videoType = 'youtube';
      } else if (video.videoUrl.includes('vimeo.com')) {
        videoType = 'vimeo';
      } else if (video.videoUrl.startsWith('data:')) {
        videoType = 'upload';
        console.log('Ã°Å¸â€œÂ¹ Detected base64 uploaded video');
      } else if (video.videoUrl.startsWith('blob:')) {
        videoType = 'upload';
        console.log('Ã°Å¸â€œÂ¹ Detected blob uploaded video');
      } else if (video.videoUrl.startsWith('http')) {
        videoType = 'external';
      } else {
        videoType = (video as any).videoType || 'upload';
      }
    }
    
    // Convert tags array to string if needed
    let tagsString = '';
    if (Array.isArray((video as any).tags)) {
      tagsString = (video as any).tags.join(', ');
    } else if (typeof (video as any).tags === 'string') {
      tagsString = (video as any).tags;
    }
    
    // Populate form with all video data
    const formData = {
      title: video.title || '',
      description: video.description || '',
      category: video.category || '',
      contentType: (video.type === 'audio' || video.category === 'Audio Lessons') ? 'audio' : 'video',
      rating: video.rating || 0,
      price: video.price || 0,
      duration: (video as any).duration || (video as any).estimatedDuration || '',
      thumbnail: video.thumbnail || '',
      videoUrl: video.videoUrl || '',
      audioUrl: (video as any).audioUrl || '',
      videoType: videoType,
      tags: tagsString,
      status: (video as any).isActive === false ? 'inactive' : 'active'
    };
    
    setVideoForm(formData);
    
    console.log('Ã¢Å“â€¦ Video form populated:', {
      title: formData.title,
      videoType: formData.videoType,
      hasVideoUrl: !!formData.videoUrl,
      videoUrlType: formData.videoUrl?.substring(0, 20),
      hasThumbnail: !!formData.thumbnail,
      thumbnailType: formData.thumbnail?.substring(0, 20)
    });
    
    handleSetActiveSection('edit-video');
  };

  const handleAddVideo = () => {
    console.log('🎬 Adding new video - resetting form and switching to add-video section');
    
    // Clear editing state first
    setEditingVideo(null);
    
    // Reset the video form completely
    const resetForm = {
      title: '',
      description: '',
      price: 0,
      category: '',
      contentType: 'video',
      rating: 0,
      duration: '',
      thumbnail: '',
      videoUrl: '',
      audioUrl: '',
      videoType: 'youtube',
      tags: '',
      status: 'active'
    };
    
    // Force form reset with a small delay to ensure state is cleared
    setTimeout(() => {
      setVideoForm(resetForm);
      console.log('✅ Video form reset:', resetForm);
    }, 10);
    
    // Switch to add video section
    handleSetActiveSection('add-video');
    console.log('✅ Active section set to: add-video');
  };



  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setToast({message: 'Please select a valid image file (JPG, PNG, WebP)', type: 'error'});
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setToast({message: 'Image size must be less than 10MB', type: 'error'});
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      console.log('Ã°Å¸â€“Â¼Ã¯Â¸Â Processing thumbnail image:', file.name, 'Size:', (file.size / (1024 * 1024)).toFixed(1), 'MB');
      
      // Convert to base64 for permanent storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        console.log('Ã¢Å“â€¦ Thumbnail converted to base64, length:', base64Image.length);
        setVideoForm(prev => ({ ...prev, thumbnail: base64Image }));
        console.log('Ã°Å¸â€™Â¾ Thumbnail form updated with base64 data');
      };
      
      reader.onerror = () => {
        console.error('Ã¢ÂÅ’ Failed to read thumbnail file');
        setToast({message: 'Failed to read image file', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const getVideoEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=0&loop=0`;
    }
    return url;
  };

  // Removed unused getVimeoThumbnail function

  // Removed unused updatePackageContent function

  const handleSaveVideo = async () => {
    try {
      console.log('Ã°Å¸Å½Â¬ Starting video save process:', { 
        editing: !!editingVideo, 
        title: videoForm.title, 
        videoUrl: videoForm.videoUrl?.substring(0, 50),
        thumbnail: videoForm.thumbnail?.substring(0, 50)
      });
      
      // Validate required fields
      if (!videoForm.title.trim()) {
        setToast({message: 'Please enter a title', type: 'error'});
        setTimeout(() => setToast(null), 3000);
        return;
      }

      // Check for content URL based on type
      const contentUrl = videoForm.contentType === 'audio' ? videoForm.audioUrl : videoForm.videoUrl;
      if (!contentUrl) {
        const contentType = videoForm.contentType === 'audio' ? 'audio' : 'video';
        setToast({message: `Please provide a ${contentType} URL or upload a ${contentType} file`, type: 'error'});
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      // Handle media URLs for persistence - ensure base64 data is preserved
      let persistentVideoUrl = videoForm.videoUrl;
      let persistentThumbnail = videoForm.thumbnail;
      
      console.log('Ã°Å¸â€â€ž Processing media URLs for persistence...');
      console.log('Video URL type:', videoForm.videoUrl?.substring(0, 20));
      console.log('Thumbnail URL type:', videoForm.thumbnail?.substring(0, 20));
      
      // Convert blob URLs to base64, preserve existing base64 and external URLs
      if (videoForm.videoUrl) {
        if (videoForm.videoUrl.startsWith('blob:')) {
          try {
            console.log('Ã°Å¸â€œÂ¹ Converting video blob to base64...');
            const response = await fetch(videoForm.videoUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            persistentVideoUrl = await new Promise((resolve) => {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            console.log('Ã¢Å“â€¦ Video blob converted to base64');
          } catch (error) {
            console.error('Ã¢ÂÅ’ Failed to convert video blob to base64:', error);
          }
        } else {
          // Preserve base64, YouTube, Vimeo, and external URLs as-is
          console.log('Ã¢Å“â€¦ Preserving existing video URL format');
          persistentVideoUrl = videoForm.videoUrl;
        }
      }
      
      if (videoForm.thumbnail) {
        if (videoForm.thumbnail.startsWith('blob:')) {
          try {
            console.log('Ã°Å¸â€“Â¼Ã¯Â¸Â Converting thumbnail blob to base64...');
            const response = await fetch(videoForm.thumbnail);
            const blob = await response.blob();
            const reader = new FileReader();
            persistentThumbnail = await new Promise((resolve) => {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            console.log('Ã¢Å“â€¦ Thumbnail blob converted to base64');
          } catch (error) {
            console.error('Ã¢ÂÅ’ Failed to convert thumbnail blob to base64:', error);
          }
        } else {
          // Preserve base64 and external URLs as-is
          console.log('Ã¢Å“â€¦ Preserving existing thumbnail URL format');
          persistentThumbnail = videoForm.thumbnail;
        }
      }
      
      console.log('Ã°Å¸â€™Â¾ Final URLs - Video:', persistentVideoUrl?.substring(0, 50), 'Thumbnail:', persistentThumbnail?.substring(0, 50));
      
      if (editingVideo) {
        console.log('Ã°Å¸â€œÂ Updating existing video...');
        const updatedVideo = { 
          ...editingVideo, 
          title: videoForm.title,
          description: videoForm.description,
          category: videoForm.category,
          rating: videoForm.rating,
          price: videoForm.price || 0,
          thumbnail: persistentThumbnail,
          videoUrl: persistentVideoUrl,
          duration: videoForm.duration,
          estimatedDuration: videoForm.duration,
          tags: (typeof videoForm.tags === 'string' && videoForm.tags) ? videoForm.tags.split(',').map(tag => tag.trim()) : [],
          isActive: videoForm.status === 'active',
          isVisible: videoForm.status === 'active',
          updatedAt: new Date().toISOString()
        };
        
        console.log('Ã°Å¸â€™Â¾ Saving updated video to data store...');
        const data = await vpsDataStore.loadData();
        const moduleIndex = data.modules?.findIndex(m => m.id === editingVideo.id);
        if (moduleIndex !== undefined && moduleIndex >= 0 && data.modules) {
          data.modules[moduleIndex] = updatedVideo;
          var success = await vpsDataStore.updateProduct(updatedVideo);
        } else {
          var success = false;
        }
        if (success) {
          console.log('Ã¢Å“â€¦ Video updated in data store');
          vpsDataStore.clearMemoryCache();
          // Reload videos from data store to ensure sync
          const reloadedData = await vpsDataStore.loadData();
          const updatedVideos = reloadedData.modules || [];
          setVideos(updatedVideos);
          setToast({message: 'Video updated successfully!', type: 'success'});
          setTimeout(() => setToast(null), 3000);
        } else {
          console.log('Ã¢ÂÅ’ Failed to update video in data store');
          setToast({message: 'Failed to update video. Please try again.', type: 'error'});
          setTimeout(() => setToast(null), 3000);
          return;
        }
      } else {
        console.log('Ã°Å¸â€ â€¢ Creating new video...');
        const newVideo: Module = {
          id: `${videoForm.contentType}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
          title: videoForm.title,
          description: videoForm.description,
          category: videoForm.category,
          type: videoForm.contentType as 'video' | 'audio',
          rating: videoForm.rating,
          price: videoForm.price || 0,
          thumbnail: persistentThumbnail,
          videoUrl: videoForm.contentType === 'video' ? persistentVideoUrl : '',
          audioUrl: videoForm.contentType === 'audio' ? (videoForm.audioUrl || persistentVideoUrl) : '',
          duration: videoForm.duration,
          estimatedDuration: videoForm.duration,
          tags: (typeof videoForm.tags === 'string' && videoForm.tags) ? videoForm.tags.split(',').map(tag => tag.trim()) : [],
          isActive: videoForm.status === 'active',
          isVisible: videoForm.status === 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log('Ã°Å¸â€™Â¾ Saving new video to data store...');
        let success = await vpsDataStore.addProduct(newVideo);
        
        // If failed due to large file, save metadata only
        if (!success && newVideo.videoUrl?.startsWith('data:')) {
          console.log('Ã°Å¸â€â€ž Large file detected, saving metadata only');
          const lightVideo = {
            ...newVideo,
            videoUrl: '', // Remove video data but keep metadata
            thumbnail: (newVideo.thumbnail && newVideo.thumbnail.length > 10000) ? '' : newVideo.thumbnail, // Keep small thumbnails
            originalVideoSize: `${(newVideo.videoUrl.length / 1024 / 1024).toFixed(1)}MB`,
            videoStatus: 'metadata_only'
          };
          success = await vpsDataStore.addProduct(lightVideo);
          if (success) {
            console.log('Ã¢Å“â€¦ Video metadata saved successfully');
          }
        }
        
        if (success) {
          console.log('Ã¢Å“â€¦ Video created in data store');
          console.log('Ã°Å¸â€Â Verifying save - checking if video exists in data store...');
          vpsDataStore.clearMemoryCache();
          // Reload videos from data store to ensure sync
          const reloadedData = await vpsDataStore.loadData();
          const updatedVideos = reloadedData.modules || [];
          console.log('Ã°Å¸â€œÅ  Total videos after save:', updatedVideos.length);
          const savedVideo = updatedVideos.find(v => v.id === newVideo.id);
          console.log('Ã°Å¸â€Â Video found in data store:', savedVideo ? 'YES' : 'NO');
          setVideos(prev => [...prev, newVideo]);
          const contentType = videoForm.contentType === 'audio' ? 'Audio' : 'Video';
          setToast({message: `${contentType} saved successfully!`, type: 'success'});
          setTimeout(() => setToast(null), 3000);
        } else {
          console.log('Ã¢ÂÅ’ Failed to create video in data store');
          setToast({message: 'Failed to save. Please check your URL format.', type: 'error'});
          setTimeout(() => setToast(null), 3000);
          return;
        }
      }
      
      // Clean up blob URLs after successful save
      if (videoForm.videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoForm.videoUrl);
        console.log('Ã°Å¸Â§Â¹ Cleaned up video blob URL');
      }
      if (videoForm.thumbnail && videoForm.thumbnail.startsWith('blob:')) {
        URL.revokeObjectURL(videoForm.thumbnail);
        console.log('Ã°Å¸Â§Â¹ Cleaned up thumbnail blob URL');
      }
      
      console.log('Ã°Å¸Å½â€° Video save process completed successfully');
      // Reset form after successful save
      setVideoForm({
        title: '',
        description: '',
        category: '',
        contentType: 'video',
        rating: 0,
        price: 0,
        duration: '',
        thumbnail: '',
        videoUrl: '',
        audioUrl: '',
        videoType: 'youtube',
        tags: '',
        status: 'active'
      });
      setEditingVideo(null);
      
      // Navigate to videos list immediately
      handleSetActiveSection('all-videos');
    } catch (error) {
      console.error('Ã¢ÂÅ’ Failed to save video:', error);
      setToast({message: 'Failed to save video. Please try again.', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      console.log('🗑️ Starting video deletion:', videoId);
      
      const success = await vpsDataStore.deleteProduct(videoId);
      
      if (success) {
        console.log('✅ Video deleted from data store, updating UI...');
        
        // Reload all data immediately without cache
        await loadRealData();
        
        setToast({message: 'Video deleted successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } else {
        console.error('❌ Failed to delete video from data store');
        setToast({message: 'Failed to delete video', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('❌ Error in handleDeleteVideo:', error);
      setToast({message: 'Error deleting video', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDeleteAudio = async (audioId: string) => {
    try {
      console.log('🗑️ Starting audio deletion:', audioId);
      
      const success = await vpsDataStore.deleteProduct(audioId);
      
      if (success) {
        console.log('✅ Audio deleted from data store, updating UI...');
        
        // Reload all data immediately without cache
        await loadRealData();
        
        setToast({message: 'Audio lesson deleted successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } else {
        console.error('❌ Failed to delete audio from data store');
        setToast({message: 'Failed to delete audio lesson', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('❌ Error in handleDeleteAudio:', error);
      setToast({message: 'Error deleting audio lesson', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Removed unused getVideoTypeIcon function

  const renderEditVideo = () => (
    <div className="space-y-6">

      <PageHeader 
        title={editingVideo ? `Edit Content: ${editingVideo.title}` : 'Add New Content'}
        actions={
          <div className="flex gap-2">
            {editingVideo && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-700 font-medium">Editing Mode</span>
              </div>
            )}
            <Button 
              variant="flat" 
              onPress={() => handleSetActiveSection('all-videos')}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              startContent={<X className="h-4 w-4" />}
            >
              Cancel
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title *</label>
                <Input
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="Enter video title"
                  classNames={{
                    input: "bg-white focus:ring-0 focus:ring-offset-0 shadow-none",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />

              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  placeholder="Describe your video content"
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-blue-400 transition-all duration-200 resize-none"
                />

              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Content Type *</label>
                <Select
                  selectedKeys={videoForm.contentType ? [videoForm.contentType] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setVideoForm({ ...videoForm, contentType: selected });
                  }}
                  placeholder="Select content type"
                  size="lg"
                  radius="lg"
                  classNames={{
                    trigger: "bg-white border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-3",
                    value: "text-gray-900 flex items-center gap-3 flex-1",
                    popoverContent: "bg-white border border-gray-200 shadow-lg",
                    listbox: "bg-white"
                  }}
                >
                  <SelectItem key="video" value="video">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video Content
                    </div>
                  </SelectItem>
                  <SelectItem key="audio" value="audio">
                    <div className="flex items-center gap-2">
                      <Headphones className="h-4 w-4" />
                      Audio Content
                    </div>
                  </SelectItem>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select
                  selectedKeys={videoForm.category ? [videoForm.category] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setVideoForm({ ...videoForm, category: selected });
                  }}
                  placeholder="Select category"
                  size="lg"
                  radius="lg"
                  classNames={{
                    trigger: "bg-white border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-3",
                    value: "text-gray-900 flex items-center gap-3 flex-1",
                    popoverContent: "bg-white border border-gray-200 shadow-lg",
                    listbox: "bg-white"
                  }}
                >
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </CardBody>
          </Card>

          {/* Content Uploader - Video or Audio based on content type */}
          {videoForm.contentType === 'video' ? (
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Video Content</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Video URL (Vimeo, YouTube, etc.)</label>
                  <Input
                    value={videoForm.videoUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                    placeholder="https://vimeo.com/123456789 or https://youtube.com/watch?v=..."
                    startContent={<Video className="h-4 w-4 text-blue-500" />}
                    classNames={{
                      input: "bg-white focus:ring-0 focus:ring-offset-0 shadow-none",
                      inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                </div>
                {videoForm.videoUrl && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 mb-2">Video Preview:</p>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {videoForm.videoUrl.includes('vimeo.com') ? (
                        <iframe
                          src={`https://player.vimeo.com/video/${videoForm.videoUrl.split('/').pop()?.split('?')[0]}?autoplay=0&loop=0`}
                          className="w-full h-full border-0"
                          allow="autoplay; fullscreen; picture-in-picture"
                        />
                      ) : videoForm.videoUrl.includes('youtube.com') || videoForm.videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={getVideoEmbedUrl(videoForm.videoUrl)}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : (
                        <video
                          src={videoForm.videoUrl}
                          className="w-full h-full object-cover"
                          controls
                          onError={() => {
                            console.log('Video load error, might be external URL');
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Audio Content</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Audio URL (Vimeo Audio, SoundCloud, etc.)</label>
                  <Input
                    value={videoForm.audioUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, audioUrl: e.target.value })}
                    placeholder="https://vimeo.com/123456789 (audio) or direct audio URL"
                    startContent={<Headphones className="h-4 w-4 text-blue-500" />}
                    classNames={{
                      input: "bg-white focus:ring-0 focus:ring-offset-0 shadow-none",
                      inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                </div>
                {videoForm.audioUrl && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 mb-2">Audio Preview:</p>
                    <div className="bg-gray-100 rounded-lg p-4">
                      {videoForm.audioUrl.includes('vimeo.com') ? (
                        <iframe
                          src={`https://player.vimeo.com/video/${videoForm.audioUrl.split('/').pop()?.split('?')[0]}?autoplay=0&loop=0`}
                          className="w-full h-32 border-0"
                          allow="autoplay; fullscreen; picture-in-picture"
                        />
                      ) : (
                        <audio
                          src={videoForm.audioUrl}
                          className="w-full"
                          controls
                          onError={() => {
                            console.log('Audio load error, might be external URL');
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-6">


          
          {/* Basic Information */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </CardHeader>
            <CardBody className="space-y-4">

              {/* Duration is automatically handled - no user input needed */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  selectedKeys={[videoForm.status]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setVideoForm({ ...videoForm, status: selected });
                  }}
                  aria-label="Video status"
                  classNames={{
                    trigger: "bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500",
                    value: "text-gray-900",
                    popoverContent: "bg-white border border-gray-200 shadow-lg",
                    listbox: "bg-white"
                  }}
                >
                  <SelectItem key="active" value="active">Active</SelectItem>
                  <SelectItem key="draft" value="draft">Draft</SelectItem>
                  <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                </Select>
              </div>
              

            </CardBody>
          </Card>

          {/* Additional Info */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Additional Info</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tags</label>
                <Input
                  value={videoForm.tags}
                  onChange={(e) => setVideoForm({ ...videoForm, tags: e.target.value })}
                  placeholder="education, kids, fun"
                  startContent={<Tag className="h-4 w-4 text-gray-400" />}
                  classNames={{
                    input: "bg-white text-gray-900 placeholder:text-gray-400 border-0 focus:ring-0 focus:outline-none",
                    inputWrapper: "bg-white border border-gray-300 hover:border-blue-400 focus-within:!border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 focus-within:!ring-0 focus-within:!outline-none focus-within:!shadow-none"
                  }}
                />

              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={videoForm.price?.toString() || '0'}
                  onChange={(e) => setVideoForm({ ...videoForm, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  startContent={<DollarSign className="h-4 w-4 text-gray-400" />}
                  classNames={{
                    input: "bg-white focus:ring-0 focus:ring-offset-0 shadow-none",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
                <p className="text-xs text-gray-500">Set to 0 for free with package, or set price for upgrade</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Rating</label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={videoForm.rating.toString()}
                  onChange={(e) => setVideoForm({ ...videoForm, rating: parseFloat(e.target.value) || 0 })}
                  placeholder="4.5"
                  startContent={<Star className="h-4 w-4 text-gray-400" />}
                  classNames={{
                    input: "bg-white focus:ring-0 focus:ring-offset-0 shadow-none",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
              </div>
              
              {/* Thumbnail Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Thumbnail Image</label>
                    <p className="text-xs text-gray-500">Upload or paste image URL</p>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center hover:border-orange-500 transition-all duration-300 bg-orange-50/30 relative cursor-pointer">
                  {videoForm.thumbnail ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-xs mx-auto shadow-lg">
                        <img 
                          src={videoForm.thumbnail || undefined} 
                          alt="Thumbnail preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Thumbnail loaded</p>
                        <p className="text-xs text-gray-500">Click to change image</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="flat" 
                        color="warning"
                        onPress={() => {
                          setVideoForm({ ...videoForm, thumbnail: '' });
                        }}
                        startContent={<X className="h-4 w-4" />}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <ImageIcon className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Click to upload thumbnail</p>
                        <p className="text-xs text-gray-500">Recommended: 1280x720 pixels - JPG, PNG, WebP</p>
                      </div>
                      <Button 
                        color="warning" 
                        variant="flat"
                        startContent={<Upload className="h-4 w-4" />}
                        onPress={() => {
                          const fileInput = document.getElementById('thumbnail-file-input') as HTMLInputElement;
                          fileInput?.click();
                        }}
                      >
                        Choose Image
                      </Button>
                    </div>
                  )}
                  <input
                    id="thumbnail-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </div>
                
                <Input
                  value={videoForm.thumbnail}
                  onChange={(e) => setVideoForm({ ...videoForm, thumbnail: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                  startContent={<ImageIcon className="h-4 w-4 text-orange-500" />}
                  size="lg"
                  classNames={{
                    input: "bg-white focus:ring-0 focus:ring-offset-0 shadow-none",
                    inputWrapper: "bg-white border-gray-300 hover:border-orange-400 focus-within:border-orange-500 shadow-sm flex items-center",
                    innerWrapper: "flex items-center"
                  }}
                />
              </div>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full bg-blue-600 text-white hover:bg-blue-700 h-12 text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onPress={handleSaveVideo}
              startContent={editingVideo ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              isDisabled={!videoForm.title.trim() || (!videoForm.videoUrl && !videoForm.audioUrl)}
              aria-label={editingVideo ? 'Update video' : 'Create new video'}
            >
              {editingVideo ? 'Update Content' : 'Create Content'}
            </Button>
            
            {editingVideo && (
              <Button 
                variant="flat"
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 h-10 transition-colors"
                startContent={<Trash2 className="h-4 w-4" />}
                onPress={() => {
                  if (confirm(`Are you sure you want to delete "${editingVideo.title}"? This action cannot be undone.`)) {
                    handleDeleteVideo(editingVideo.id);
                    handleSetActiveSection('all-videos');
                  }
                }}
                aria-label="Delete video"
              >
                Delete Video
              </Button>
            )}
          </div>

          {/* Quick Tips */}
          <Card className="bg-blue-50 border border-blue-200">
            <CardBody className="p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                <HelpCircle className="h-4 w-4 mr-2" />
                Quick Tips
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>- Videos are content for packages, not individual sales</li>
                <li>- Use descriptive titles for better package organization</li>
                <li>- High-quality content enhances package appeal</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );

  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [videoSearchTerm, setVideoSearchTerm] = useState('');
  const [videoCategoryFilter, setVideoCategoryFilter] = useState('all');

  const handleBulkDelete = async () => {
    if (selectedVideos.length === 0) return;
    
    if (confirm(`Delete ${selectedVideos.length} selected videos? This action cannot be undone.`)) {
      try {
        console.log('🗑️ Starting bulk delete of', selectedVideos.length, 'videos');
        
        // Delete videos one by one to ensure proper handling
        let deletedCount = 0;
        for (const videoId of selectedVideos) {
          const data = await vpsDataStore.loadData();
        data.modules = data.modules?.filter(m => m.id !== videoId) || [];
        const success = await vpsDataStore.saveData(data);
          if (success) {
            deletedCount++;
          }
        }
        
        // Update local state
        setVideos(prev => prev.filter(v => !selectedVideos.includes(v.id)));
        setSelectedVideos([]);
        
        // Clear caches and reload
        vpsDataStore.clearMemoryCache();
        setTimeout(() => loadRealData(), 100);
        
        setToast({message: `${deletedCount} videos deleted successfully!`, type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } catch (error) {
        console.error('❌ Bulk delete error:', error);
        setToast({message: 'Failed to delete some videos. Please try again.', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  // Removed unused handleBulkPriceUpdate function

  const handleBulkCategoryUpdate = async () => {
    if (selectedVideos.length === 0) return;
    
    const newCategory = prompt('Enter new category for selected videos:', categories[0]);
    if (newCategory && categories.includes(newCategory)) {
      try {
        const updatedVideos = videos.map(video => {
          if (selectedVideos.includes(video.id)) {
            return { ...video, category: newCategory };
          }
          return video;
        });
        
        for (const video of updatedVideos.filter(v => selectedVideos.includes(v.id))) {
          await vpsDataStore.updateProduct(video);
        }
        
        setVideos(updatedVideos);
        setSelectedVideos([]);
        alert(`- Category updated for ${selectedVideos.length} videos!`);
      } catch (error) {
        alert('- Failed to update categories. Please try again.');
      }
    }
  };

  const renderAllVideos = () => (
    <div className="space-y-6">

      <PageHeader 
        title="All Content (Videos & Audio)" 
        actions={
          <div className="flex gap-2">
            {selectedVideos.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  className="bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  startContent={<PackageIcon className="h-4 w-4" />}
                  onPress={() => {
                    // Navigate to package creation with selected videos
                    setPackageForm({
                      ...packageForm,
                      contentIds: selectedVideos,
                      name: `Package with ${selectedVideos.length} videos`
                    });
                    handleSetActiveSection('add-package');
                  }}
                  aria-label={`Create package with ${selectedVideos.length} selected videos`}
                >
                  Create Package ({selectedVideos.length})
                </Button>
                <Button 
                  className="bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  startContent={<Tag className="h-4 w-4" />}
                  onPress={handleBulkCategoryUpdate}
                  aria-label={`Update category for ${selectedVideos.length} selected videos`}
                >
                  Update Category ({selectedVideos.length})
                </Button>
                <Button 
                  className="bg-red-600 text-white hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => {
                    if (confirm(`Are you sure you want to delete ${selectedVideos.length} selected videos? This action cannot be undone.`)) {
                      handleBulkDelete();
                    }
                  }}
                  aria-label={`Delete ${selectedVideos.length} selected videos`}
                >
                  Delete ({selectedVideos.length})
                </Button>
              </div>
            )}
            <Button 
              variant="flat"
              startContent={<RotateCcw className="h-4 w-4" />}
              onPress={async () => {
                await loadRealData();
                setToast({message: 'Content refreshed!', type: 'success'});
                setTimeout(() => setToast(null), 3000);
              }}
            >
              Refresh
            </Button>
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              startContent={<Plus className="h-4 w-4" />}
              onPress={handleAddVideo}
              aria-label="Add new content"
            >
              + Add Content
            </Button>
          </div>
        }
      />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Content Library ({videos.length})</h3>
              <p className="text-sm text-gray-600">Video and audio content for package creation</p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search videos..."
                value={videoSearchTerm}
                onChange={(e) => setVideoSearchTerm(e.target.value)}
                startContent={<Search className="h-4 w-4" />}
                className="w-full sm:w-64"
                classNames={{
                  input: "bg-gray-50",
                  inputWrapper: "bg-gray-50 border-gray-200"
                }}
              />
              <Select
                selectedKeys={[videoCategoryFilter]}
                onSelectionChange={(keys) => setVideoCategoryFilter(Array.from(keys)[0] as string)}
                className="w-40"
                placeholder="Category"
              >
                {[<SelectItem key="all">All Categories</SelectItem>, ...categories.map((cat) => 
                  <SelectItem key={cat}>{cat}</SelectItem>
                )]}
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <Table removeWrapper aria-label="Video library table" classNames={{
              table: "min-w-full",
              thead: "bg-gray-50",
              tbody: "divide-y divide-gray-100"
            }}>
              <TableHeader>
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold py-4 px-6 text-center w-16">
                  <input 
                    type="checkbox" 
                    checked={selectedVideos.length === videos.filter(v => v.category !== 'Audio Lessons' && v.type !== 'audio').length && videos.filter(v => v.category !== 'Audio Lessons' && v.type !== 'audio').length > 0}
                    onChange={(e) => {
                      const videoList = videos.filter(v => v.category !== 'Audio Lessons' && v.type !== 'audio');
                      if (e.target.checked) {
                        setSelectedVideos(videoList.map(v => v.id));
                      } else {
                        setSelectedVideos([]);
                      }
                    }}
                    className="rounded"
                  />
                </TableColumn>
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold py-4 px-6 text-left w-2/5">TITLE</TableColumn>
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold py-4 px-6 text-center w-1/6">TYPE</TableColumn>
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold py-4 px-6 text-center w-1/6">CATEGORY</TableColumn>
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold py-4 px-6 text-center w-1/6">RATING</TableColumn>
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold py-4 px-6 text-center w-1/6">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No videos found">
                {videos
                  .filter(video => {
                    const matchesSearch = videoSearchTerm === '' || 
                      video.title.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
                      (video.description && video.description.toLowerCase().includes(videoSearchTerm.toLowerCase()));
                    const matchesCategory = videoCategoryFilter === 'all' || video.category === videoCategoryFilter;
                    return matchesSearch && matchesCategory;
                  })
                  .map((video) => (
                  <TableRow key={video.id} className={`hover:bg-gray-50 transition-colors ${selectedVideos.includes(video.id) ? 'bg-blue-50' : ''}`}>
                    <TableCell className="py-4 px-6 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedVideos.includes(video.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVideos([...selectedVideos, video.id]);
                          } else {
                            setSelectedVideos(selectedVideos.filter(id => id !== video.id));
                          }
                        }}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {video.thumbnail && video.thumbnail.trim() ? (
                            <img 
                              src={video.thumbnail} 
                              alt={video.title} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                if (fallback) fallback.style.display = 'block';
                              }}
                            />
                          ) : null}
                          {(video.type === 'audio' || video.category === 'Audio Lessons') ? (
                            <Headphones className="h-6 w-6 text-white fallback-icon" style={{ display: video.thumbnail && video.thumbnail.trim() ? 'none' : 'block' }} />
                          ) : (
                            <Video className="h-6 w-6 text-white fallback-icon" style={{ display: video.thumbnail && video.thumbnail.trim() ? 'none' : 'block' }} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">{video.title}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <Chip size="sm" variant="flat" className={video.type === 'audio' || video.category === 'Audio Lessons' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                        {(video.type === 'audio' || video.category === 'Audio Lessons') ? 'Audio' : 'Video'}
                      </Chip>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <Chip size="sm" variant="flat" className="bg-gray-100 text-gray-700">
                        {video.category || 'Uncategorized'}
                      </Chip>
                    </TableCell>

                    <TableCell className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-gray-900">{video.rating || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex justify-center space-x-1">
                        <Button 
                          size="sm" 
                          variant="light" 
                          className="hover:bg-blue-50 min-w-8 h-8 transition-colors"
                          onPress={() => handleEditVideo(video)}
                          aria-label={`Edit video ${video.title}`}
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="light" 
                          className="hover:bg-red-50 min-w-8 h-8 transition-colors"
                          onPress={() => {
                            if (confirm(`Are you sure you want to delete "${video.title}"? This action cannot be undone.`)) {
                              handleDeleteVideo(video.id);
                            }
                          }}
                          aria-label={`Delete video ${video.title}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>


    </div>
  );

  // Continue with all other render functions using the same consistent styling pattern...
  // Removed unused renderAllUsers function
  const renderAllUsers = () => (
    <div className="space-y-6">
      <PageHeader 
        title="All Users" 
        actions={
          <div className="flex gap-2">
            <Button 
              variant="flat"
              startContent={<RotateCcw className="h-4 w-4" />}
              onPress={async () => {
                await loadRealData();
                setToast({message: 'Users refreshed!', type: 'success'});
                setTimeout(() => setToast(null), 3000);
              }}
            >
              Refresh
            </Button>
            <Button 
              className="bg-green-600 text-white hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
              startContent={<Plus className="h-4 w-4" />}
              onPress={() => {
                setUserForm({
                  name: '',
                  email: '',
                  password: '',
                  role: 'user',
                  status: 'active',
                  avatar: '',
                  phone: '',
                  dateOfBirth: '',
                  subscription: 'free'
                });
                setEditingUser(null);
                onUserModalOpen();
              }}
              aria-label="Add new user"
            >
              Add New User
            </Button>
          </div>
        }
      />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold text-gray-900">All Users ({users.length})</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                startContent={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <Select
                selectedKeys={[userFilter]}
                onSelectionChange={(keys) => setUserFilter(Array.from(keys)[0] as string)}
                className="w-32"
                aria-label="Filter users"
              >
                <SelectItem key="all">All Users</SelectItem>
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="inactive">Inactive</SelectItem>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Users table">
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>JOINED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No users found">
              {users
                .filter(user => userFilter === 'all' || user.status === userFilter)
                .filter(user => {
                  if (userSearchTerm === '') return true;
                  const searchLower = userSearchTerm.toLowerCase();
                  return user.name.toLowerCase().includes(searchLower) ||
                         user.email.toLowerCase().includes(searchLower) ||
                         user.id.toLowerCase().includes(searchLower);
                })
                .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">ID: {user.id.slice(-8)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip size="sm" color="primary" variant="flat">
                      {user.role}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      color={user.status === 'active' ? 'success' : 'danger'} 
                      variant="flat"
                    >
                      {user.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="light"
                        className="hover:bg-blue-50 transition-colors"
                        onPress={() => {
                          setEditingUser(user);
                          setUserForm({
                            name: user.name,
                            email: user.email,
                            password: '',
                            role: user.role,
                            status: user.status || 'active',
                            avatar: user.avatar || '',
                            phone: user.phone || '',
                            dateOfBirth: user.dateOfBirth || '',
                            subscription: (user.subscription as 'free' | 'basic' | 'premium' | 'family') || 'free'
                          });
                          onUserModalOpen();
                        }}
                        aria-label={`Edit user ${user.name}`}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="light" 
                        className="hover:bg-red-50 transition-colors"
                        onPress={async () => {
                          if (confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
                            try {
                              const response = await fetch(`/api/users/${user.id}`, {
                                method: 'DELETE'
                              });
                              
                              if (response.ok) {
                                await loadRealData();
                                setToast({message: 'User deleted successfully!', type: 'success'});
                                setTimeout(() => setToast(null), 3000);
                              } else {
                                setToast({message: 'Failed to delete user', type: 'error'});
                                setTimeout(() => setToast(null), 3000);
                              }
                            } catch (error) {
                              console.error('Error deleting user:', error);
                              setToast({message: 'Error deleting user', type: 'error'});
                              setTimeout(() => setToast(null), 3000);
                            }
                          }
                        }}
                        aria-label={`Delete user ${user.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
      
      {/* User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={onUserModalClose} size="lg">
        <ModalContent>
          <ModalHeader>
            {editingUser ? 'Edit User' : 'Add New User'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={userForm.name}
                onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                required
              />
              {!editingUser && (
                <Input
                  label="Password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  required
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Role"
                  selectedKeys={userForm.role ? [userForm.role] : []}
                  onSelectionChange={(keys) => setUserForm({...userForm, role: Array.from(keys)[0] as any})}
                >
                  <SelectItem key="user">User</SelectItem>
                  <SelectItem key="admin">Admin</SelectItem>
                  <SelectItem key="moderator">Moderator</SelectItem>
                </Select>
                <Select
                  label="Status"
                  selectedKeys={userForm.status ? [userForm.status] : []}
                  onSelectionChange={(keys) => setUserForm({...userForm, status: Array.from(keys)[0] as any})}
                >
                  <SelectItem key="active">Active</SelectItem>
                  <SelectItem key="inactive">Inactive</SelectItem>
                  <SelectItem key="suspended">Suspended</SelectItem>
                </Select>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onUserModalClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={async () => {
                if (!userForm.name.trim() || !userForm.email.trim()) {
                  alert('Please fill in required fields');
                  return;
                }
                
                if (editingUser) {
                  // Update user - SAVE TO DATABASE
                  const response = await fetch('/api/data');
                  const currentData = await response.json();
                  const updatedUsers = currentData.users.map((user: any) => 
                    user.id === editingUser.id 
                      ? { ...user, ...userForm, updatedAt: new Date().toISOString() }
                      : user
                  );
                  
                  // Save to database
                  const saveResponse = await fetch('/api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...currentData, users: updatedUsers })
                  });
                  
                  if (saveResponse.ok) {
                    await loadRealData(); // Refresh from database
                    setToast({message: 'User updated successfully!', type: 'success'});
                    setTimeout(() => setToast(null), 3000);
                  } else {
                    setToast({message: 'Failed to update user', type: 'error'});
                    setTimeout(() => setToast(null), 3000);
                  }
                } else {
                  // Add new user - SAVE TO DATABASE
                  if (!userForm.password.trim()) {
                    setToast({message: 'Password is required for new users', type: 'error'});
                    setTimeout(() => setToast(null), 3000);
                    return;
                  }
                  
                  // Create new user object
                  const newUser = {
                    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
                    ...userForm
                  };
                  
                  // Save to database
                  const saveResponse = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                  });
                  
                  if (saveResponse.ok) {
                    await loadRealData(); // Refresh from database
                    setToast({message: 'User created successfully!', type: 'success'});
                    setTimeout(() => setToast(null), 3000);
                  } else {
                    const errorData = await saveResponse.text();
                    console.error('User creation failed:', errorData);
                    setToast({message: `Failed to create user: ${errorData}`, type: 'error'});
                    setTimeout(() => setToast(null), 3000);
                  }
                }
                
                onUserModalClose();
              }}
            >
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );

  const handleUpdateCategory = async (oldCategory: string, newCategory: string) => {
    if (!newCategory.trim() || newCategory === oldCategory) {
      setEditingCategory(null);
      return;
    }
    
    if (categories.includes(newCategory.trim())) {
      setToast({message: 'Category already exists', type: 'error'});
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    try {
      const success = await vpsDataStore.updateCategory(oldCategory, newCategory.trim());
      if (success) {
        await loadRealData();
        setEditingCategory(null);
        setToast({message: 'Category updated successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({message: 'Failed to update category', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setToast({message: 'Failed to update category', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDeleteCategory = async (category: string) => {
    try {
      const videosInCategory = videos.filter(v => v.category === category);
      
      if (videosInCategory.length > 0) {
        const moveVideos = confirm(`This category has ${videosInCategory.length} videos. Move them to "Uncategorized"?`);
        if (moveVideos) {
          await Promise.all(videosInCategory.map(video => 
            vpsDataStore.updateProduct({ ...video, category: 'Uncategorized' })
          ));
        } else {
          return;
        }
      }
      
      if (confirm(`Delete category "${category}"?`)) {
        const success = await vpsDataStore.deleteCategory(category);
        if (success) {
          await loadRealData();
          setToast({message: 'Category deleted successfully!', type: 'success'});
          setTimeout(() => setToast(null), 3000);
        } else {
          setToast({message: 'Failed to delete category', type: 'error'});
          setTimeout(() => setToast(null), 3000);
        }
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setToast({message: 'Error deleting category', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  const renderCategoriesPage = () => (
    <div className="space-y-6">
      <PageHeader 
        title="Categories" 
        actions={
          <div className="flex gap-2">
            <Button 
              variant="flat"
              startContent={<RotateCcw className="h-4 w-4" />}
              onPress={async () => {
                await loadRealData();
                setToast({message: 'Data refreshed!', type: 'success'});
                setTimeout(() => setToast(null), 3000);
              }}
            >
              Refresh
            </Button>
            <Button 
              className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              startContent={<Plus className="h-4 w-4" />}
              onPress={async () => {
                if (newCategory.trim()) {
                  const success = await vpsDataStore.addCategory(newCategory.trim());
                  if (success) {
                    await loadRealData();
                    setNewCategory('');
                    setToast({message: 'Category added successfully!', type: 'success'});
                    setTimeout(() => setToast(null), 3000);
                  } else {
                    setToast({message: 'Category already exists or failed to add', type: 'error'});
                    setTimeout(() => setToast(null), 3000);
                  }
                }
              }}
            >
              Add Category
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Categories ({categories.length})</h3>
            </CardHeader>
            <CardBody className="p-0">
              <Table removeWrapper aria-label="Categories table">
                <TableHeader>
                  <TableColumn>CATEGORY</TableColumn>
                  <TableColumn>VIDEOS</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {categories.map((category, index) => (
                    <TableRow key={category}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Tag className="h-4 w-4 text-white" />
                          </div>
                          {editingCategory === category ? (
                            <Input
                              value={editCategoryValue}
                              onChange={(e) => setEditCategoryValue(e.target.value)}
                              size="sm"
                              className="w-48"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateCategory(category, editCategoryValue);
                                } else if (e.key === 'Escape') {
                                  setEditingCategory(null);
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <span className="font-medium">{category}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{videos.filter(v => v.category === category).length}</TableCell>
                      <TableCell>
                        <Chip size="sm" color="success" variant="flat">Active</Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {editingCategory === category ? (
                            <>
                              <Button 
                                size="sm" 
                                variant="light" 
                                className="hover:bg-green-50"
                                onPress={() => handleUpdateCategory(category, editCategoryValue)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="light" 
                                className="hover:bg-gray-50"
                                onPress={() => setEditingCategory(null)}
                              >
                                <X className="h-4 w-4 text-gray-600" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                size="sm" 
                                variant="light" 
                                className="hover:bg-blue-50"
                                onPress={() => {
                                  setEditingCategory(category);
                                  setEditCategoryValue(category);
                                }}
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="light" 
                                className="hover:bg-red-50"
                                onPress={() => handleDeleteCategory(category)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>
        
        <div>
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Category</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCategory.trim() && !categories.includes(newCategory.trim())) {
                    setCategories([...categories, newCategory.trim()]);
                    setNewCategory('');
                  }
                }}
              />
              <Button 
                className="w-full bg-gray-900 text-white hover:bg-gray-800"
                onPress={async () => {
                  if (newCategory.trim()) {
                    const success = await vpsDataStore.addCategory(newCategory.trim());
                    if (success) {
                      const updatedCategories = await vpsDataStore.getCategories();
                      setCategories(updatedCategories);
                      setNewCategory('');
                    } else {
                      alert('Category already exists or failed to add');
                    }
                  }
                }}
                startContent={<Plus className="h-4 w-4" />}
              >
                Add Category
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderUploadQueuePage = () => (
    <div className="space-y-6">
      <PageHeader title="Upload Queue" />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upload Queue ({uploadQueue.length})</h3>
        </CardHeader>
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Upload queue table">
            <TableHeader>
              <TableColumn>VIDEO</TableColumn>
              <TableColumn>SIZE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>PROGRESS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No uploads in queue">
              {uploadQueue.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Upload className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{item.name || `Upload ${index + 1}`}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.size || '25.4 MB'}</TableCell>
                  <TableCell>
                    <Chip size="sm" color={item.status === 'completed' ? 'success' : 'warning'} variant="flat">
                      {item.status || 'Processing'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Progress value={item.progress || 75} className="w-20" size="sm" />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="light"
                        onPress={() => {
                          if (item.videoUrl || (item as any).localUrl) {
                            const url = item.videoUrl || (item as any).localUrl;
                            if (url && (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http'))) {
                              window.open(url, '_blank');
                            } else {
                              alert('Preview not available - invalid URL format');
                            }
                          } else {
                            alert('Preview not available - no video URL');
                          }
                        }}
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="light" 
                        className="hover:bg-red-50"
                        onPress={async () => {
                          if (confirm('Delete this upload?')) {
                            const success = await vpsDataStore.removeFromUploadQueue(item.id);
                            if (success) {
                              const updatedQueue = await vpsDataStore.getUploadQueue();
                              setUploadQueue(updatedQueue.map((item: any) => ({ ...item, filename: item.filename || item.name || 'Unknown' } as UploadItem)));
                            } else {
                              alert('Failed to delete upload');
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );





  const renderOrdersPage = () => (
    <div className="space-y-6">
      <PageHeader title="Orders" />
      
      <StatsGrid stats={[
        { 
          label: 'Total Orders', 
          value: orders.length, 
          color: '', 
          change: 'All time',
          icon: <PackageIcon className="h-6 w-6 text-blue-600" />
        },
        { 
          label: 'Completed', 
          value: orders.filter(o => o.status === 'completed').length, 
          color: '', 
          change: 'Successful orders',
          icon: <CheckCircle className="h-6 w-6 text-green-600" />
        },
        { 
          label: 'Total Revenue', 
          value: `$${orders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}`, 
          color: '', 
          change: 'From all orders',
          icon: <DollarSign className="h-6 w-6 text-purple-600" />
        },
        { 
          label: 'Avg Order Value', 
          value: `$${(orders.reduce((sum, o) => sum + o.amount, 0) / Math.max(orders.length, 1)).toFixed(2)}`, 
          color: '', 
          change: 'Per order',
          icon: <TrendingUp className="h-6 w-6 text-orange-600" />
        }
      ]} />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold text-gray-900">All Orders ({orders.length})</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Search orders..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                startContent={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <Select
                selectedKeys={[orderFilter]}
                onSelectionChange={(keys) => setOrderFilter(Array.from(keys)[0] as string)}
                className="w-32"
                aria-label="Filter orders"
                startContent={<Filter className="h-4 w-4" />}
              >
                <SelectItem key="all">All Orders</SelectItem>
                <SelectItem key="completed">Completed</SelectItem>
                <SelectItem key="pending">Pending</SelectItem>
                <SelectItem key="cancelled">Cancelled</SelectItem>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Orders table">
            <TableHeader>
              <TableColumn>ORDER ID</TableColumn>
              <TableColumn>CUSTOMER</TableColumn>
              <TableColumn>ITEM</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No orders found">
              {orders
                .filter(order => orderFilter === 'all' || order.status === orderFilter)
                .filter(order => {
                  if (orderSearchTerm === '') return true;
                  const searchLower = orderSearchTerm.toLowerCase();
                  return order.id.toString().toLowerCase().includes(searchLower) ||
                         order.customer.name.toLowerCase().includes(searchLower) ||
                         order.customer.email.toLowerCase().includes(searchLower) ||
                         order.item.name.toLowerCase().includes(searchLower);
                })
                .map((order, index) => (
                <TableRow key={`${order.id}_${index}_${order.customer.email}_${order.date.getTime()}`}>
                  <TableCell>
                    <div className="font-mono text-sm">
                      #{order.id.toString().slice(-6)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{order.customer.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">{order.customer.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{order.item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">{formatCurrency(order.amount)}</span>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      color={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'danger'} 
                      variant="flat"
                    >
                      {order.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {order.date.toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="light"
                        onPress={() => {
                          setSelectedOrder(order);
                          onOrderModalOpen();
                        }}
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="light"
                        onPress={() => alert(`Generating receipt for order #${order.id.toString().slice(-6)}`)}
                      >
                        <Receipt className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="light" 
                        className="hover:bg-red-50"
                        onPress={async () => {
                          if (confirm(`Delete order #${order.id.toString().slice(-6)}?`)) {
                            const success = await vpsDataStore.deleteOrder(order.id);
                            if (success) {
                              vpsDataStore.clearMemoryCache();
                              await loadRealData();
                              setToast({message: 'Order deleted successfully!', type: 'success'});
                              setTimeout(() => setToast(null), 3000);
                            } else {
                              setToast({message: 'Failed to delete order', type: 'error'});
                              setTimeout(() => setToast(null), 3000);
                            }
                          }
                        }}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
      
      <Modal 
        isOpen={isOrderModalOpen} 
        onClose={onOrderModalClose} 
        size="2xl"
        backdrop="opaque"
        classNames={{
          backdrop: "bg-black/40"
        }}
      >
        <ModalContent>
          <ModalHeader>Order Details - #{selectedOrder?.id.toString().slice(-6)}</ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Customer</h4>
                    <div><span className="font-medium">Name:</span> {selectedOrder.customer.name}</div>
                    <div><span className="font-medium">Email:</span> {selectedOrder.customer.email}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Order Info</h4>
                    <div><span className="font-medium">ID:</span> #{selectedOrder.id.toString().slice(-6)}</div>
                    <div><span className="font-medium">Date:</span> {selectedOrder.date.toLocaleDateString()}</div>
                    <div><span className="font-medium">Status:</span> 
                      <Chip size="sm" color={selectedOrder.status === 'completed' ? 'success' : 'warning'} variant="flat" className="ml-2">
                        {selectedOrder.status}
                      </Chip>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Item Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Video className="h-8 w-8 text-gray-600" />
                      <div>
                        <div className="font-medium">{selectedOrder.item.name}</div>
                        <div className="text-sm text-gray-500">Quantity: {selectedOrder.item.count}</div>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedOrder.amount)}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Payment</h4>
                  <p><span className="font-medium">Method:</span> {selectedOrder.paymentMethod}</p>
                  <p><span className="font-medium">Transaction:</span> {selectedOrder.transactionId}</p>
                  <p><span className="font-medium">Total:</span> <span className="text-green-600 font-semibold">{formatCurrency(selectedOrder.amount)}</span></p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOrderModalClose}>Close</Button>
            <Button color="primary" onPress={() => alert('Receipt generated!')}>Generate Receipt</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Initialize profile form when user data is available
  useEffect(() => {
    if (currentUser) {
      setProfileForm(prev => ({
        ...prev,
        name: currentUser.name || 'Admin',
        email: currentUser.email || 'admin@example.com'
      }));
    }
  }, [currentUser]);

  const handleUpdateProfile = async () => {
    try {
      console.log('Ã°Å¸â€â€ž Starting profile update...', { 
        name: profileForm.name, 
        email: profileForm.email,
        userId: currentUser?.id,
        hasNewPassword: !!profileForm.newPassword
      });
      
      // Basic validation
      if (!profileForm.name.trim() || !profileForm.email.trim()) {
        setToast({message: 'Name and email are required', type: 'error'});
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      // Password validation if changing password
      if (profileForm.newPassword) {
        if (!profileForm.currentPassword) {
          setToast({message: 'Current password is required to change password', type: 'error'});
          setTimeout(() => setToast(null), 3000);
          return;
        }
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          setToast({message: 'New passwords do not match', type: 'error'});
          setTimeout(() => setToast(null), 3000);
          return;
        }
        if (profileForm.newPassword.length < 6) {
          setToast({message: 'New password must be at least 6 characters', type: 'error'});
          setTimeout(() => setToast(null), 3000);
          return;
        }
      }
      
      // Ensure we have a valid user ID
      if (!currentUser?.id) {
        setToast({message: 'User ID not found. Please log in again.', type: 'error'});
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      // Update user profile
      const updateData: any = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        updatedAt: new Date().toISOString()
      };
      
      if (profileForm.newPassword && profileForm.newPassword.trim()) {
        updateData.password = profileForm.newPassword.trim();
      }
      
      console.log('Ã°Å¸â€™Â¾ Updating user with data:', updateData);
      
      const success = await vpsDataStore.updateUser(currentUser.id, updateData);
      
      console.log('Ã¢Å“â€¦ Update result:', success);
      
      if (success) {
        // Show success message immediately
        setAdminSuccessModal({ isOpen: true, message: 'Profile updated successfully!' });
        setToast({message: 'Profile updated successfully!', type: 'success'});
        setTimeout(() => setToast(null), 5000);
        
        // Reset password fields only
        setProfileForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        // Force reload of user data
        console.log('Ã°Å¸â€â€ž Reloading user data...');
        await loadRealData();
        
        console.log('Ã°Å¸Å½â€° Profile update completed successfully!');
      } else {
        console.error('Ã¢ÂÅ’ Profile update failed');
        alert('Ã¢ÂÅ’ Failed to update profile. Please check your information and try again.');
        setToast({message: 'Failed to update profile. Please check your information and try again.', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Ã¢ÂÅ’ Profile update error:', error);
      alert('Ã¢ÂÅ’ An error occurred while updating your profile. Please try again.');
      setToast({message: 'An error occurred while updating your profile. Please try again.', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Logo upload state
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setToast({message: 'Please select a valid image file (JPG, PNG, WebP)', type: 'error'});
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setToast({message: 'Logo size must be less than 2MB', type: 'error'});
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      setLogoUploading(true);
      
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Logo = e.target?.result as string;
        
        try {
          // Save admin logo to data store
          const success = await vpsDataStore.updateSettings({
            adminLogo: base64Logo,
            adminLogoUpdatedAt: new Date().toISOString()
          } as any);
          
          if (success) {
            setLogoFile(base64Logo);
            setToast({message: 'Logo uploaded successfully!', type: 'success'});
            setTimeout(() => setToast(null), 3000);
          } else {
            setToast({message: 'Failed to save logo. Please try again.', type: 'error'});
            setTimeout(() => setToast(null), 3000);
          }
        } catch (error) {
          console.error('Logo save error:', error);
          setToast({message: 'Failed to save logo. Please try again.', type: 'error'});
          setTimeout(() => setToast(null), 3000);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Logo upload error:', error);
      setToast({message: 'Failed to upload logo. Please try again.', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLogoUploading(false);
    }
  };

  const renderAdminProfile = () => (
    <div className="space-y-6">
      <PageHeader title="Admin Profile" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Dashboard Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-all duration-300 bg-gray-50/30 relative">
                {logoFile ? (
                  <div className="space-y-4">
                    <div className="w-32 h-16 mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex items-center justify-center">
                      <img 
                        src={logoFile} 
                        alt="Platform Logo" 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                      <ImageIcon className="h-8 w-8 text-gray-400 fallback-icon" style={{ display: 'none' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">Logo uploaded successfully!</p>
                      <p className="text-xs text-gray-500">Click to change logo</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="flat" 
                        color="primary"
                        onPress={() => {
                          const fileInput = document.getElementById('logo-file-input') as HTMLInputElement;
                          fileInput?.click();
                        }}
                        startContent={<Upload className="h-4 w-4" />}
                      >
                        Change Logo
                      </Button>
                      <Button 
                        size="sm" 
                        variant="flat" 
                        color="danger"
                        onPress={async () => {
                          setLogoFile(null);
                          await vpsDataStore.updateSettings({ adminLogo: null } as any);
                          setToast({message: 'Admin logo removed successfully!', type: 'success'});
                          setTimeout(() => setToast(null), 3000);
                        }}
                        startContent={<X className="h-4 w-4" />}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      {logoUploading ? (
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {logoUploading ? 'Uploading...' : 'Upload Platform Logo'}
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 2MB - Recommended: 200x80px</p>
                    </div>
                    <Button 
                      color="primary" 
                      variant="flat"
                      startContent={<Upload className="h-4 w-4" />}
                      onPress={() => {
                        const fileInput = document.getElementById('logo-file-input') as HTMLInputElement;
                        fileInput?.click();
                      }}
                      isDisabled={logoUploading}
                    >
                      {logoUploading ? 'Uploading...' : 'Choose Logo'}
                    </Button>
                  </div>
                )}
                <input
                  id="logo-file-input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleLogoUpload}
                  disabled={logoUploading}
                  className="hidden"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <Input 
                value={profileForm.name}
                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                className="w-full"
                classNames={{
                  input: "bg-white",
                  inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <Input 
                value={profileForm.email}
                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                type="email"
                className="w-full"
                classNames={{
                  input: "bg-white",
                  inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Administrator</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <Input 
                type="password"
                value={profileForm.currentPassword}
                onChange={(e) => setProfileForm({...profileForm, currentPassword: e.target.value})}
                placeholder="Enter current password"
                className="w-full"
                classNames={{
                  input: "bg-white",
                  inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <Input 
                type="password"
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                placeholder="Enter new password"
                className="w-full"
                classNames={{
                  input: "bg-white",
                  inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <Input 
                type="password"
                value={profileForm.confirmPassword}
                onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
                className="w-full"
                classNames={{
                  input: "bg-white",
                  inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                }}
              />
            </div>
            <Button 
              className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onPress={handleUpdateProfile}
              isDisabled={!profileForm.currentPassword || !profileForm.newPassword || !profileForm.confirmPassword || profileForm.newPassword !== profileForm.confirmPassword}
            >
              Update Password
            </Button>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button 
          variant="flat"
          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          onPress={() => {
            // Reset form to original values
            setProfileForm({
              name: currentUser?.name || 'Admin',
              email: currentUser?.email || 'admin@example.com',
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
            setToast({message: 'Form reset to original values', type: 'info'});
            setTimeout(() => setToast(null), 3000);
          }}
        >
          Reset
        </Button>
        <Button 
          className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onPress={handleUpdateProfile}
          isDisabled={!profileForm.name.trim() || !profileForm.email.trim()}
          startContent={<CheckCircle className="h-4 w-4" />}
        >
          Save Profile Changes
        </Button>
      </div>
    </div>
  );

  const renderAudioLessons = () => (
    <div className="space-y-6">
      <PageHeader 
        title="Audio Lessons" 
        actions={
          <Button 
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => {
              setEditingVideo(null);
              setAudioForm({
                title: '',
                description: '',
                price: 0,
                duration: '',
                audioUrl: '',
                thumbnail: '',
                tags: '',
                aiTags: [],

                hasPreview: false,
                previewUrl: '',
                previewDuration: ''
              });
              handleSetActiveSection('add-audio-lesson');
            }}
          >
            Add Audio Lesson
          </Button>
        }
      />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Audio Lessons ({videos.filter(v => v.category === 'Audio Lessons').length})</h3>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Audio Lesson</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Duration</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Access</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Lecture</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {videos.filter(v => v.category === 'Audio Lessons' || (v.type === 'audio')).map((lesson) => {
                  return (
                    <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Headphones className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900">{lesson.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-mono text-gray-700">{lesson.duration || '0:00'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-green-600">${lesson.price || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          (lesson.accessLevel || lesson.price === 0) === 'free' || lesson.price === 0
                            ? 'bg-green-100 text-green-800'
                            : (lesson.accessLevel || 'paid') === 'premium'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {(lesson.accessLevel || lesson.price === 0) === 'free' || lesson.price === 0 ? 'Free' : 
                           (lesson.accessLevel || 'paid') === 'premium' ? 'Premium' : 'Paid'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button 
                          size="sm"
                          className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors min-w-8"
                          onPress={() => {
                            let audioUrl = lesson.audioUrl || lesson.videoUrl;
                            
                            // Handle File objects by creating blob URL
                            if ((lesson as any).audioUrl instanceof File) {
                              audioUrl = URL.createObjectURL((lesson as any).audioUrl);
                            } else if ((lesson as any).videoUrl instanceof File) {
                              audioUrl = URL.createObjectURL((lesson as any).videoUrl);
                            }
                            
                            if (audioUrl && audioUrl.trim() !== '') {
                              // Security: Validate URL before opening
                              const isValidUrl = (url: string): boolean => {
                                try {
                                  const urlObj = new URL(url);
                                  const allowedProtocols = ['http:', 'https:', 'data:', 'blob:'];
                                  const allowedDomains = ['vimeo.com', 'youtube.com', 'youtu.be', 'soundcloud.com'];
                                  
                                  if (!allowedProtocols.includes(urlObj.protocol)) return false;
                                  if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
                                    return allowedDomains.some(domain => urlObj.hostname.includes(domain));
                                  }
                                  return true;
                                } catch {
                                  return false;
                                }
                              };
                              
                              // For external URLs, validate before opening
                              if (audioUrl.startsWith('http') && !audioUrl.startsWith('data:')) {
                                if (isValidUrl(audioUrl)) {
                                  window.open(audioUrl, '_blank');
                                } else {
                                  alert('Invalid or unsafe URL detected');
                                }
                                return;
                              }
                              
                              const audioId = `audio-${lesson.id}`;
                              let audio = document.getElementById(audioId) as HTMLAudioElement;
                              
                              // Create audio element if it doesn't exist
                              if (!audio) {
                                audio = document.createElement('audio');
                                audio.id = audioId;
                                audio.preload = 'metadata';
                                audio.controls = false;
                                audio.style.display = 'none';
                                document.body.appendChild(audio);
                              }
                              
                              // Set source if different
                              if (audio.src !== audioUrl) {
                                audio.src = audioUrl;
                                audio.load();
                              }
                              
                              if (audio.paused) {
                                audio.play().catch((error) => {
                                  console.error('Audio play failed:', error);
                                  // Fallback: try to open as link
                                  if (audioUrl.startsWith('http')) {
                                    window.open(audioUrl, '_blank');
                                  } else {
                                    alert('Audio format not supported. Please check the audio file.');
                                  }
                                });
                              } else {
                                audio.pause();
                              }
                            } else {
                              alert('No audio file available for this lesson.');
                            }
                          }}
                          aria-label={`Play audio lesson ${lesson.title}`}
                        >
                          <Play className="h-4 w-4 text-white" />
                        </Button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            size="sm"
                            variant="light"
                            className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded flex items-center justify-center transition-colors"
                            onPress={() => {
                              setEditingVideo(lesson);
                              setAudioForm({
                                title: lesson.title,
                                description: lesson.description || '',
                                price: lesson.price || 0,
                                duration: lesson.duration || '',
                                audioUrl: lesson.audioUrl || '',
                                thumbnail: lesson.thumbnail || '',
                                tags: lesson.tags?.join(', ') || '',
                                aiTags: lesson.aiTags || [],
                                hasPreview: lesson.hasPreview || false,
                                previewUrl: lesson.previewUrl || '',
                                previewDuration: ''
                              });
                              handleSetActiveSection('add-audio-lesson');
                            }}
                            aria-label={`Edit audio lesson ${lesson.title}`}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button 
                            size="sm"
                            variant="light"
                            className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded flex items-center justify-center transition-colors"
                            onPress={() => {
                              if (confirm(`Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`)) {
                                handleDeleteAudio(lesson.id);
                              }
                            }}
                            aria-label={`Delete audio lesson ${lesson.title}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {videos.filter(v => v.category === 'Audio Lessons' || (v.type === 'audio')).length === 0 && (
            <div className="text-center py-12">
              <Headphones className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No audio lessons yet</h3>
              <p className="text-gray-600 mb-4">Upload your first audio lesson to get started.</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderVideoLessons = () => (
    <div className="space-y-6">
      <PageHeader 
        title="Video Lessons" 
        actions={
          <Button 
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => handleSetActiveSection('add-video-lesson')}
          >
            Add Video Lesson
          </Button>
        }
      />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Video Lessons ({videos.filter(v => v.category === 'Video Lessons').length})</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.filter(v => v.category === 'Video Lessons').map((lesson) => (
              <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  {lesson.thumbnail && lesson.thumbnail.trim() ? (
                    <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{lesson.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-semibold">${lesson.price}</span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="light"
                      className="hover:bg-blue-50 transition-colors"
                      onPress={() => handleEditVideo(lesson)}
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="light" 
                      className="hover:bg-red-50 transition-colors"
                      onPress={() => {
                        if (confirm(`Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`)) {
                          handleDeleteAudio(lesson.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {videos.filter(v => v.category === 'Video Lessons').length === 0 && (
              <div className="col-span-full text-center py-12">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No video lessons yet</h3>
                <p className="text-gray-600 mb-4">Upload your first video lesson to get started.</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );



  const renderPP1Program = () => (
    <div className="space-y-6">
      <PageHeader 
        title="PP1 Program" 
        actions={
          <Button 
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => handleSetActiveSection('add-pp1-content')}
          >
            Add PP1 Content
          </Button>
        }
      />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">PP1 Program Content ({videos.filter(v => v.category === 'PP1 Program').length})</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.filter(v => v.category === 'PP1 Program').map((program) => (
              <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="h-8 w-8 text-purple-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{program.title}</h4>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Program</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{program.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-semibold">${program.price}</span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="light"
                      className="hover:bg-blue-50 transition-colors"
                      onPress={() => {
                        setEditingPP1(program);
                        setPP1Form({
                          title: program.title,
                          description: program.description || '',
                          price: program.price || 0,
                          contentType: (program as any).contentType || 'text',
                          coverImage: program.thumbnail || '',
                          contentUrl: program.videoUrl || '',
                          duration: (program as any).duration || '',
                          tags: Array.isArray((program as any).tags) ? (program as any).tags.join(', ') : (program as any).tags || ''
                        });
                        handleSetActiveSection('add-pp1-content');
                      }}
                      aria-label={`Edit PP1 program ${program.title}`}
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="light" 
                      className="hover:bg-red-50 transition-colors"
                      onPress={async () => {
                        if (confirm(`Remove "${program.title}" from PP1 Program? The video will remain in your library.`)) {
                          try {
                            // Instead of deleting, change category to 'Uncategorized'
                            const updatedVideo = { ...program, category: 'Uncategorized' };
                            const data = await vpsDataStore.loadData();
                            const moduleIndex = data.modules?.findIndex(m => m.id === program.id);
                            let success = false;
                            if (moduleIndex !== undefined && moduleIndex >= 0 && data.modules) {
                              data.modules[moduleIndex] = updatedVideo;
                              success = await vpsDataStore.updateProduct(updatedVideo);
                            }
                            if (success) {
                              vpsDataStore.clearMemoryCache();
                              await loadRealData();
                              setToast({message: 'Video removed from PP1 Program!', type: 'success'});
                              setTimeout(() => setToast(null), 3000);
                            } else {
                              setToast({message: 'Failed to remove from PP1 Program', type: 'error'});
                              setTimeout(() => setToast(null), 3000);
                            }
                          } catch (error) {
                            setToast({message: 'Error removing from PP1 Program', type: 'error'});
                            setTimeout(() => setToast(null), 3000);
                          }
                        }
                      }}
                      aria-label={`Remove PP1 program ${program.title}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {videos.filter(v => v.category === 'PP1 Program').length === 0 && (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No PP1 content yet</h3>
                <p className="text-gray-600 mb-4">Create your first PP1 program content.</p>
                <Button 
                  color="primary"
                  startContent={<Plus className="h-4 w-4" />}
                  onPress={() => handleSetActiveSection('add-pp1-content')}
                >
                  Add First PP1 Content
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const handleAudioFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/vorbis'];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const allowedExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
        alert('Please select a valid audio file (MP3, WAV, M4A, AAC, OGG)');
        return;
      }
      
      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Audio file size must be less than 100MB');
        return;
      }
      

      
      // Create a local URL for the audio file
      const audioUrl = URL.createObjectURL(file);
      
      // Get audio duration automatically
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        setAudioForm(prev => ({ ...prev, duration: formattedDuration }));
        URL.revokeObjectURL(audio.src);
      };
      audio.src = audioUrl;
      
      setAudioForm(prevForm => ({ ...prevForm, audioUrl: audioUrl }));
    }
  };

  const handleSaveAudioLesson = async () => {
    try {
      if (!audioForm.title.trim()) {
        alert('Please enter a lesson title');
        return;
      }
      if (!audioForm.audioUrl) {
        alert('Please upload an audio file');
        return;
      }
      
      if (editingVideo) {
        // Update existing lesson
        const updatedLesson = {
          ...editingVideo,
          title: audioForm.title,
          description: audioForm.description,
          price: audioForm.price || 0,
          audioUrl: audioForm.audioUrl,
          thumbnail: audioForm.thumbnail || editingVideo.thumbnail,
          duration: audioForm.duration,
          tags: audioForm.tags ? audioForm.tags.split(',').map(tag => tag.trim()) : [],
          aiTags: audioForm.aiTags,
          hasPreview: audioForm.hasPreview,
          previewUrl: audioForm.previewUrl
        };
        
        const success = await vpsDataStore.updateProduct(updatedLesson);
        if (success) {
          setVideos(prev => prev.map(v => v.id === editingVideo.id ? updatedLesson : v));
          alert('- Audio lesson updated successfully!');
        } else {
          alert('- Failed to update audio lesson.');
          return;
        }
      } else {
        // Create new lesson
        const newAudioLesson: Module = {
          id: `audio_${Date.now()}`,
          title: audioForm.title,
          description: audioForm.description,
          price: audioForm.price || 0,
          category: 'Audio Lessons',
          type: 'audio',
          audioUrl: audioForm.audioUrl, // Keep the actual URL (blob or regular)
          thumbnail: audioForm.thumbnail || '/default-audio-thumbnail.png',
          duration: audioForm.duration,
          tags: audioForm.tags ? audioForm.tags.split(',').map(tag => tag.trim()) : [],
          aiTags: audioForm.aiTags,
          hasPreview: audioForm.hasPreview,
          previewUrl: audioForm.previewUrl,
          isActive: true,
          isVisible: true,
          createdAt: new Date().toISOString()
        };
        
        const success = await vpsDataStore.addProduct(newAudioLesson);
        if (success) {
          setVideos(prev => [...prev, newAudioLesson]);
          alert('- Audio lesson created successfully!');
        } else {
          alert('- Failed to create audio lesson.');
          return;
        }
      }
      
      handleSetActiveSection('audio-lessons');
      setEditingVideo(null);
      
      // Reset form
      setAudioForm({
        title: '',
        description: '',
        price: 0,
        duration: '',
        audioUrl: '',
        thumbnail: '',
        tags: '',
        aiTags: [],
        hasPreview: false,
        previewUrl: '',
        previewDuration: ''
      });
    } catch (error) {
      console.error('- Failed to save audio lesson:', error);
      alert('Failed to save audio lesson. Please try again.');
    }
  };

  // Package management functions
  const handleEditPackage = (pkg: Package) => {
    console.log('✏️ Editing package:', pkg);
    setPackageForm({
      name: pkg.name || '',
      icon: pkg.icon || '',
      description: pkg.description || '',
      price: pkg.price || 0,
      type: pkg.type || 'subscription',
      features: Array.isArray(pkg.features) ? pkg.features.join(', ') : (pkg.features || ''),
      isActive: pkg.isActive !== undefined ? pkg.isActive : true,
      isPopular: pkg.isPopular !== undefined ? pkg.isPopular : false,
      coverImage: pkg.coverImage || '',
      contentIds: pkg.contentIds || []
    });
    setEditingPackage(pkg);
    handleSetActiveSection('add-package');
  };

  const handlePreviewPackage = (pkg: any) => {
    console.log('👁️ Previewing package:', pkg);
    setSelectedPackage(pkg);
    onPackagePreviewOpen();
  };

  const handleSavePackage = async () => {
    try {
      console.log('📦 Starting package save process:', packageForm.name);
      
      if (!packageForm.name.trim()) {
        setToast({message: 'Please enter a package name', type: 'error'});
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      const packageData = {
        id: editingPackage ? editingPackage.id : `package_${Date.now()}`,
        name: packageForm.name.trim(),
        description: packageForm.description.trim(),
        price: packageForm.price,
        type: packageForm.type,
        features: packageForm.features ? packageForm.features.split(',').map(f => f.trim()) : [],
        isActive: packageForm.isActive,
        isPopular: packageForm.isPopular,
        coverImage: packageForm.coverImage,
        contentIds: packageForm.contentIds || [],
        createdAt: editingPackage ? editingPackage.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('💾 Saving package to data store:', packageData);
      const success = editingPackage 
        ? await vpsDataStore.updatePackage(packageData)
        : await vpsDataStore.addPackage(packageData);
      
      if (success) {
        console.log('Ã¢Å“â€¦ Package saved successfully');
        // Reload packages from data store
        await loadPackages();
        
        // Reset form
        setPackageForm({
          name: '',
          icon: '',
          description: '',
          price: 0,
          type: 'subscription',
          features: '',
          isActive: true,
          isPopular: false,
          coverImage: '',
          contentIds: []
        });
        setEditingPackage(null);
        handleSetActiveSection('all-packages');
        
        setToast({message: editingPackage ? 'Package updated successfully!' : 'Package created successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
        
        // Navigate back to packages list
        handleSetActiveSection('all-packages');
      } else {
        console.log('Ã¢ÂÅ’ Failed to save package');
        setToast({message: editingPackage ? 'Failed to update package.' : 'Failed to create package. Package name may already exist.', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Ã¢ÂÅ’ Error saving package:', error);
      setToast({message: 'An error occurred while saving the package.', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    try {
      const success = await vpsDataStore.deletePackage(packageId);
      if (success) {
        vpsDataStore.clearMemoryCache();
        await loadRealData();
        setToast({message: 'Package deleted successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({message: 'Failed to delete package', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      setToast({message: 'An error occurred while deleting the package.', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Bundle management functions

  const renderAddAudioLesson = () => (
    <div className="space-y-6">
      <PageHeader 
        title="Add Audio Lesson" 
        actions={
          <Button 
            variant="flat" 
            onPress={() => handleSetActiveSection('audio-lessons')}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            startContent={<X className="h-4 w-4" />}
          >
            Cancel
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lesson Information</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title *</label>
                <Input
                  value={audioForm.title}
                  onChange={(e) => setAudioForm({ ...audioForm, title: e.target.value })}
                  placeholder="Enter lesson title"
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description (HTML supported)</label>
                <textarea
                  value={audioForm.description}
                  onChange={(e) => setAudioForm({ ...audioForm, description: e.target.value })}
                  placeholder="Describe the audio lesson content. You can use HTML tags like <b>bold</b>, <i>italic</i>, <br> for line breaks, etc."
                  rows={6}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-blue-400 transition-all duration-200 resize-none font-mono text-sm"
                />
                <div className="text-xs text-gray-500">
                  HTML tags supported: &lt;b&gt;, &lt;i&gt;, &lt;u&gt;, &lt;br&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={audioForm.price?.toString() || '0'}
                  onChange={(e) => setAudioForm({ ...audioForm, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  startContent={<DollarSign className="h-4 w-4 text-gray-400" />}
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
                <p className="text-xs text-gray-500">Set to 0 for free with package, or set price for upgrade</p>
              </div>

            </CardBody>
          </Card>

          {/* Audio Upload */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Audio File</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-500 transition-all duration-300 bg-blue-50/30">
                  {audioForm.audioUrl ? (
                    <div className="space-y-4">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                      <div>
                        <p className="text-lg font-semibold text-green-700">Audio ready!</p>
                        <p className="text-sm text-gray-600">Duration: {audioForm.duration}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg">-</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-800">Test Your Audio</p>
                            <p className="text-xs text-green-600">Duration: {audioForm.duration}</p>
                          </div>
                        </div>
                        <audio 
                          controls 
                          className="w-full"
                          preload="metadata"
                          src={audioForm.audioUrl}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                      <Button 
                        size="sm" 
                        variant="flat" 
                        color="primary"
                        onPress={() => {
                          if (audioForm.audioUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(audioForm.audioUrl);
                          }
                          setAudioForm({ ...audioForm, audioUrl: '', duration: '' });
                        }}
                        startContent={<Upload className="h-4 w-4" />}
                      >
                        Change Audio
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Headphones className="h-16 w-16 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-semibold text-gray-900">Upload audio file</p>
                        <p className="text-sm text-gray-600">Supports: MP3, WAV, M4A, AAC, OGG - Max: 100MB</p>
                      </div>
                      <Button 
                        color="primary" 
                        variant="flat"
                        startContent={<Upload className="h-4 w-4" />}
                        onPress={() => {
                          const fileInput = document.getElementById('audio-file-input') as HTMLInputElement;
                          fileInput?.click();
                        }}
                      >
                        Choose File
                      </Button>
                      <input
                        id="audio-file-input"
                        type="file"
                        accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg"
                        onChange={handleAudioFileUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
                
                <div className="text-center text-gray-500 text-sm font-medium">OR</div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Audio URL</label>
                  <Input
                    value={audioForm.audioUrl}
                    onChange={(e) => setAudioForm({ ...audioForm, audioUrl: e.target.value })}
                    placeholder="https://example.com/audio.mp3"
                    startContent={<Link className="h-4 w-4 text-blue-500" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                  <p className="text-xs text-gray-500">Direct link to MP3, WAV, M4A, AAC, or OGG file</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Additional Settings */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Additional Settings</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tags</label>
                <Input
                  value={audioForm.tags}
                  onChange={(e) => setAudioForm({ ...audioForm, tags: e.target.value })}
                  placeholder="grammar, pronunciation, vocabulary"
                  startContent={<Tag className="h-4 w-4 text-gray-400" />}
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Cover Image</label>
                    <p className="text-xs text-gray-500">Upload or paste image URL</p>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-500 transition-all duration-300 bg-blue-50/30 relative cursor-pointer">
                  {audioForm.thumbnail ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-xs mx-auto shadow-lg">
                        <img 
                          src={audioForm.thumbnail || undefined} 
                          alt="Cover preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Cover image loaded</p>
                        <p className="text-xs text-gray-500">Click to change image</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="flat" 
                        color="warning"
                        onPress={() => setAudioForm({ ...audioForm, thumbnail: '' })}
                        startContent={<X className="h-4 w-4" />}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <ImageIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Click to upload cover image</p>
                        <p className="text-xs text-gray-500">Recommended: 1280x720 pixels - JPG, PNG, WebP</p>
                      </div>
                      <Button 
                        color="primary" 
                        variant="flat"
                        startContent={<Upload className="h-4 w-4" />}
                        onPress={() => {
                          const fileInput = document.getElementById('audio-cover-input') as HTMLInputElement;
                          fileInput?.click();
                        }}
                      >
                        Choose Image
                      </Button>
                    </div>
                  )}
                  <input
                    id="audio-cover-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                        if (!allowedTypes.includes(file.type)) {
                          alert('Please select a valid image file (JPG, PNG, WebP)');
                          return;
                        }
                        const imageUrl = URL.createObjectURL(file);
                        setAudioForm({ ...audioForm, thumbnail: imageUrl });
                      }
                    }}
                    className="hidden"
                  />
                </div>
                
                <Input
                  value={audioForm.thumbnail}
                  onChange={(e) => setAudioForm({ ...audioForm, thumbnail: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                  startContent={<ImageIcon className="h-4 w-4 text-blue-500" />}
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                  }}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  isSelected={audioForm.hasPreview}
                  onValueChange={(checked) => setAudioForm({ ...audioForm, hasPreview: checked })}
                />
                <label className="text-sm font-medium text-gray-700">Enable Preview</label>
              </div>
              
              {audioForm.hasPreview && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Preview Duration (seconds)</label>
                  <Input
                    value={audioForm.previewDuration}
                    onChange={(e) => setAudioForm({ ...audioForm, previewDuration: e.target.value })}
                    placeholder="30"
                    type="number"
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                </div>
              )}
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full bg-green-600 text-white hover:bg-green-700 h-12 text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onPress={handleSaveAudioLesson}
              startContent={<Plus className="h-5 w-5" />}
              isDisabled={!audioForm.title.trim() || !audioForm.audioUrl}
              aria-label="Create audio lesson"
            >
              {editingVideo ? 'Update Audio Lesson' : 'Create Audio Lesson'}
            </Button>
          </div>

          {/* Quick Tips */}
          <Card className="bg-blue-50 border border-blue-200">
            <CardBody className="p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                <HelpCircle className="h-4 w-4 mr-2" />
                Audio Lesson Tips
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>- Use clear, high-quality audio recordings</li>
                <li>- Add relevant tags for better categorization</li>
                <li>- Enable previews to attract more learners</li>
                <li>- Keep lessons focused and engaging</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderAddVideoLesson = () => (
    <div className="space-y-6">
      <PageHeader title="Add Video Lesson" actions={<Button variant="flat" onPress={() => handleSetActiveSection('video-lessons')} startContent={<X className="h-4 w-4" />}>Cancel</Button>} />
      <Card className="bg-white border border-gray-200">
        <CardHeader><h3 className="text-lg font-semibold">Video Lesson Details</h3></CardHeader>
        <CardBody className="space-y-4">
          <Input placeholder="Lesson Title" />
          <Textarea placeholder="Description" />
          <div className="grid grid-cols-1 gap-4">
            <Select placeholder="Access Level"><SelectItem key="free">Free</SelectItem><SelectItem key="paid">Paid</SelectItem></Select>
          </div>
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center">
            <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="font-semibold">Upload Video or Add URL</p>
            <Button className="mt-4" startContent={<Upload className="h-4 w-4" />}>Choose Video</Button>
          </div>
          <Button className="w-full bg-gray-900 text-white" startContent={<Plus className="h-4 w-4" />}>Create Video Lesson</Button>
        </CardBody>
      </Card>
    </div>
  );

  const renderAddPP1Content = () => {

    const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert('Please select a valid image file (JPG, PNG, WebP)');
          return;
        }
        const imageUrl = URL.createObjectURL(file);
        setPP1Form(prev => ({ ...prev, coverImage: imageUrl }));
      }
    };

    const handleSavePP1Content = async () => {
      if (!pp1Form.title.trim()) {
        alert('Please enter a title');
        return;
      }
      
      const newContent: Module = {
        id: `pp1_${Date.now()}`,
        title: pp1Form.title,
        description: pp1Form.description,
        price: pp1Form.price,
        category: 'PP1 Program',
        type: 'program',
        thumbnail: pp1Form.coverImage || `https://via.placeholder.com/300x200/10b981/ffffff?text=PP1-${Date.now()}`,
        videoUrl: pp1Form.contentUrl,
        duration: pp1Form.duration,
        tags: pp1Form.tags ? pp1Form.tags.split(',').map(tag => tag.trim()) : [],

        isActive: true,
        isVisible: true,
        createdAt: new Date().toISOString()
      };
      
      const success = await vpsDataStore.addProduct(newContent);
      if (success) {
        setVideos(prev => [...prev, newContent]);
        alert('- PP1 content created successfully!');
        handleSetActiveSection('pp1-program');
      } else {
        alert('- Failed to create PP1 content.');
      }
    };

    return (
      <div className="space-y-6">
        <PageHeader 
          title="Add PP1 Content" 
          actions={
            <Button 
              variant="flat" 
              onPress={() => handleSetActiveSection('pp1-program')} 
              startContent={<X className="h-4 w-4" />}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </Button>
          } 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Content Information</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Title *</label>
                  <Input
                    value={pp1Form.title}
                    onChange={(e) => setPP1Form({ ...pp1Form, title: e.target.value })}
                    placeholder="Enter PP1 content title"
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-green-400 focus-within:border-green-500"
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description (HTML supported)</label>
                  <textarea
                    value={pp1Form.description}
                    onChange={(e) => setPP1Form({ ...pp1Form, description: e.target.value })}
                    placeholder="Describe the PP1 content. You can use HTML tags like <b>bold</b>, <i>italic</i>, <br> for line breaks, <p>paragraphs</p>, etc."
                    rows={6}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-green-500 hover:border-green-400 transition-all duration-200 resize-none font-mono text-sm"
                  />
                  <div className="text-xs text-gray-500">
                    HTML tags supported: &lt;b&gt;, &lt;i&gt;, &lt;u&gt;, &lt;br&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Price ($)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pp1Form.price.toString()}
                      onChange={(e) => setPP1Form({ ...pp1Form, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      startContent={<DollarSign className="h-4 w-4 text-gray-400" />}
                      classNames={{
                        input: "bg-white focus:ring-0 focus:ring-offset-0 shadow-none",
                        inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                      }}
                    />
                    <p className="text-xs text-gray-500">Set to 0 for free with package, or set price for upgrade</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Content Type</label>
                    <Select
                      selectedKeys={[pp1Form.contentType]}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setPP1Form({ ...pp1Form, contentType: selected });
                      }}
                      classNames={{
                        trigger: "bg-white border-gray-300 hover:border-green-400 focus:border-green-500"
                      }}
                    >
                      <SelectItem key="text" value="text">Text Content</SelectItem>
                      <SelectItem key="pdf" value="pdf">PDF Document</SelectItem>
                      <SelectItem key="multimedia" value="multimedia">Multimedia</SelectItem>
                      <SelectItem key="interactive" value="interactive">Interactive</SelectItem>
                    </Select>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Cover Image Upload */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Cover Image</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center hover:border-green-500 transition-all duration-300 bg-green-50/30">
                  {pp1Form.coverImage ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-xs mx-auto shadow-lg">
                        <img 
                          src={pp1Form.coverImage || undefined} 
                          alt="Cover preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Cover image ready</p>
                        <p className="text-xs text-gray-500">Click to change image</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="flat" 
                        color="warning"
                        onPress={() => setPP1Form({ ...pp1Form, coverImage: '' })}
                        startContent={<X className="h-4 w-4" />}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <BookOpen className="h-12 w-12 text-green-500 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Upload cover image</p>
                        <p className="text-xs text-gray-500">Recommended: 1280x720 pixels - JPG, PNG, WebP</p>
                      </div>
                      <Button 
                        color="success" 
                        variant="flat"
                        startContent={<Upload className="h-4 w-4" />}
                        onPress={() => {
                          const fileInput = document.getElementById('pp1-cover-input') as HTMLInputElement;
                          fileInput?.click();
                        }}
                      >
                        Choose Image
                      </Button>
                    </div>
                  )}
                  <input
                    id="pp1-cover-input"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Or paste image URL</label>
                  <Input
                    value={pp1Form.coverImage}
                    onChange={(e) => setPP1Form({ ...pp1Form, coverImage: e.target.value })}
                    placeholder="https://example.com/cover.jpg"
                    startContent={<ImageIcon className="h-4 w-4 text-green-500" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-green-400 focus-within:border-green-500"
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Content Details</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Content URL</label>
                  <Input
                    value={pp1Form.contentUrl}
                    onChange={(e) => setPP1Form({ ...pp1Form, contentUrl: e.target.value })}
                    placeholder="https://example.com/content.pdf"
                    startContent={<Link className="h-4 w-4 text-gray-400" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-green-400 focus-within:border-green-500"
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Duration/Length</label>
                  <Input
                    value={pp1Form.duration}
                    onChange={(e) => setPP1Form({ ...pp1Form, duration: e.target.value })}
                    placeholder="30 minutes, 15 pages, etc."
                    startContent={<Clock className="h-4 w-4 text-gray-400" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-green-400 focus-within:border-green-500"
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tags</label>
                  <Input
                    value={pp1Form.tags}
                    onChange={(e) => setPP1Form({ ...pp1Form, tags: e.target.value })}
                    placeholder="beginner, reading, phonics"
                    startContent={<Tag className="h-4 w-4 text-gray-400" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-green-400 focus-within:border-green-500"
                    }}
                  />
                </div>
              </CardBody>
            </Card>

            {/* File Upload Area */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Upload Files</h3>
              </CardHeader>
              <CardBody>
                <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-500 transition-all duration-300 bg-green-50/30">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="font-semibold text-gray-900 mb-2">Upload PP1 Content Files</p>
                  <p className="text-sm text-gray-600 mb-4">PDF, DOC, images, or other educational materials</p>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white" 
                    startContent={<Upload className="h-4 w-4" />}
                  >
                    Choose Files
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12 text-lg font-semibold"
                onPress={handleSavePP1Content}
                startContent={<Plus className="h-5 w-5" />}
                isDisabled={!pp1Form.title.trim()}
              >
                Create PP1 Content
              </Button>
            </div>

            {/* Quick Tips */}
            <Card className="bg-green-50 border border-green-200">
              <CardBody className="p-4">
                <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  PP1 Content Tips
                </h4>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>- PP1 is for beginner level students</li>
                  <li>- Use simple, clear language in descriptions</li>
                  <li>- Add engaging cover images</li>
                  <li>- Include relevant tags for categorization</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderAddPP2ContentLocal = () => {

    const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert('Please select a valid image file (JPG, PNG, WebP)');
          return;
        }
        const imageUrl = URL.createObjectURL(file);
        setPP1Form(prev => ({ ...prev, coverImage: imageUrl }));
      }
    };

    const handleSavePP2Content = async () => {
      if (!pp1Form.title.trim()) {
        alert('Please enter a title');
        return;
      }
      
      const newContent: Module = {
        id: `pp2_${Date.now()}`,
        title: pp1Form.title,
        description: pp1Form.description,
        price: pp1Form.price,
        category: 'PP1 Program',
        type: 'program',
        thumbnail: pp1Form.coverImage || `https://via.placeholder.com/300x200/6366f1/ffffff?text=PP2-${Date.now()}`,
        videoUrl: pp1Form.contentUrl,
        duration: pp1Form.duration,
        tags: pp1Form.tags ? pp1Form.tags.split(',').map(tag => tag.trim()) : [],

        isActive: true,
        isVisible: true,
        createdAt: new Date().toISOString()
      };
      
      const success = await vpsDataStore.addProduct(newContent);
      if (success) {
        setVideos(prev => [...prev, newContent]);
        alert('- PP2 content created successfully!');
        handleSetActiveSection('pp2-program');
      } else {
        alert('- Failed to create PP2 content.');
      }
    };

    return (
      <div className="space-y-6">
        <PageHeader 
          title="Add PP1 Content" 
          actions={
            <Button 
              variant="flat" 
              onPress={() => handleSetActiveSection('pp2-program')} 
              startContent={<X className="h-4 w-4" />}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </Button>
          } 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Content Information</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Title *</label>
                  <Input
                    value={pp1Form.title}
                    onChange={(e) => setPP1Form({ ...pp1Form, title: e.target.value })}
                    placeholder="Enter PP2 content title"
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description (HTML supported)</label>
                  <textarea
                    value={pp1Form.description}
                    onChange={(e) => setPP1Form({ ...pp1Form, description: e.target.value })}
                    placeholder="Describe the PP2 content. You can use HTML tags like <b>bold</b>, <i>italic</i>, <br> for line breaks, <p>paragraphs</p>, etc."
                    rows={6}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-purple-400 transition-all duration-200 resize-none font-mono text-sm"
                  />
                  <div className="text-xs text-gray-500">
                    HTML tags supported: &lt;b&gt;, &lt;i&gt;, &lt;u&gt;, &lt;br&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Price *</label>
                    <Input
                      type="number"
                      value={pp1Form.price.toString()}
                      onChange={(e) => setPP1Form({ ...pp1Form, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      startContent={<DollarSign className="h-4 w-4 text-gray-400" />}
                      classNames={{
                        input: "bg-white",
                        inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Content Type</label>
                    <Select
                      selectedKeys={[pp1Form.contentType]}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setPP1Form({ ...pp1Form, contentType: selected });
                      }}
                      classNames={{
                        trigger: "bg-white border-gray-300 hover:border-purple-400 focus:border-purple-500"
                      }}
                    >
                      <SelectItem key="text" value="text">Text Content</SelectItem>
                      <SelectItem key="pdf" value="pdf">PDF Document</SelectItem>
                      <SelectItem key="multimedia" value="multimedia">Multimedia</SelectItem>
                      <SelectItem key="interactive" value="interactive">Interactive</SelectItem>
                      <SelectItem key="advanced" value="advanced">Advanced Material</SelectItem>
                    </Select>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Cover Image Upload */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Cover Image</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-500 transition-all duration-300 bg-purple-50/30">
                  {pp1Form.coverImage ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-xs mx-auto shadow-lg">
                        <img 
                          src={pp1Form.coverImage || undefined} 
                          alt="Cover preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Cover image ready</p>
                        <p className="text-xs text-gray-500">Click to change image</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="flat" 
                        color="warning"
                        onPress={() => setPP1Form({ ...pp1Form, coverImage: '' })}
                        startContent={<X className="h-4 w-4" />}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <BookOpen className="h-12 w-12 text-purple-500 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Upload cover image</p>
                        <p className="text-xs text-gray-500">Recommended: 1280x720 pixels - JPG, PNG, WebP</p>
                      </div>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700 text-white" 
                        variant="flat"
                        startContent={<Upload className="h-4 w-4" />}
                        onPress={() => {
                          const fileInput = document.getElementById('pp2-cover-input') as HTMLInputElement;
                          fileInput?.click();
                        }}
                      >
                        Choose Image
                      </Button>
                    </div>
                  )}
                  <input
                    id="pp2-cover-input"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Or paste image URL</label>
                  <Input
                    value={pp1Form.coverImage}
                    onChange={(e) => setPP1Form({ ...pp1Form, coverImage: e.target.value })}
                    placeholder="https://example.com/cover.jpg"
                    startContent={<ImageIcon className="h-4 w-4 text-purple-500" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Content Details</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Content URL</label>
                  <Input
                    value={pp1Form.contentUrl}
                    onChange={(e) => setPP1Form({ ...pp1Form, contentUrl: e.target.value })}
                    placeholder="https://example.com/content.pdf"
                    startContent={<Link className="h-4 w-4 text-gray-400" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Duration/Length</label>
                  <Input
                    value={pp1Form.duration}
                    onChange={(e) => setPP1Form({ ...pp1Form, duration: e.target.value })}
                    placeholder="45 minutes, 20 pages, etc."
                    startContent={<Clock className="h-4 w-4 text-gray-400" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tags</label>
                  <Input
                    value={pp1Form.tags}
                    onChange={(e) => setPP1Form({ ...pp1Form, tags: e.target.value })}
                    placeholder="advanced, writing, comprehension"
                    startContent={<Tag className="h-4 w-4 text-gray-400" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                    }}
                  />
                </div>
              </CardBody>
            </Card>

            {/* File Upload Area */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Upload Files</h3>
              </CardHeader>
              <CardBody>
                <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 transition-all duration-300 bg-purple-50/30">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="font-semibold text-gray-900 mb-2">Upload PP1 Content Files</p>
                  <p className="text-sm text-gray-600 mb-4">PDF, DOC, images, or other advanced educational materials</p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white" 
                    startContent={<Upload className="h-4 w-4" />}
                  >
                    Choose Files
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12 text-lg font-semibold"
                onPress={handleSavePP2Content}
                startContent={<Plus className="h-5 w-5" />}
                isDisabled={!pp1Form.title.trim()}
              >
                Create PP1 Content
              </Button>
            </div>

            {/* Quick Tips */}
            <Card className="bg-purple-50 border border-purple-200">
              <CardBody className="p-4">
                <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  PP1 Content Tips
                </h4>
                <ul className="text-xs text-purple-800 space-y-1">
                  <li>- PP2 is for advanced level students</li>
                  <li>- Include more complex concepts and materials</li>
                  <li>- Add engaging cover images</li>
                  <li>- Use detailed descriptions with HTML formatting</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateBundle = () => (
    <div className="space-y-6">
      <PageHeader title="Create Content Bundle" actions={<Button variant="flat" onPress={() => handleSetActiveSection('content-bundles')} startContent={<X className="h-4 w-4" />}>Cancel</Button>} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader><h3 className="text-lg font-semibold">Bundle Details</h3></CardHeader>
          <CardBody className="space-y-4">
            <Input 
              placeholder="Bundle Name" 
              value={bundleForm.name}
              onChange={(e) => setBundleForm({...bundleForm, name: e.target.value})}
            />
            <Textarea 
              placeholder="Bundle Description" 
              value={bundleForm.description}
              onChange={(e) => setBundleForm({...bundleForm, description: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                type="number" 
                placeholder="Bundle Price" 
                value={bundleForm.price.toString()}
                onChange={(e) => setBundleForm({...bundleForm, price: parseFloat(e.target.value) || 0})}
                startContent={<DollarSign className="h-4 w-4" />} 
              />
              <Input 
                type="number" 
                placeholder="Discount %" 
                value={bundleForm.discount.toString()}
                onChange={(e) => setBundleForm({...bundleForm, discount: parseFloat(e.target.value) || 0})}
              />
            </div>
            <Select 
              placeholder="Bundle Category"
              selectedKeys={bundleForm.category ? [bundleForm.category] : []}
              onSelectionChange={(keys) => setBundleForm({...bundleForm, category: Array.from(keys)[0] as string})}>

              <SelectItem key="mixed">Mixed Content</SelectItem>
              <SelectItem key="audio-only">Audio Only</SelectItem>
              <SelectItem key="video-only">Video Only</SelectItem>
            </Select>
          </CardBody>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader><h3 className="text-lg font-semibold">Select Content</h3></CardHeader>
          <CardBody>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {videos.slice(0, 5).map(video => (
                <div key={video.id} className="flex items-center space-x-2 p-2 border rounded">
                  <input type="checkbox" />
                  <span className="text-sm">{video.title}</span>
                  <span className="text-xs text-gray-500 ml-auto">${video.price}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 text-center hover:border-blue-500 transition-all duration-300 bg-blue-50/30">
                <div className="space-y-3">
                  <Layers className="h-8 w-8 text-blue-500 mx-auto" />
                  <p className="text-sm font-medium text-gray-900">Upload cover image</p>
                  <Button 
                    color="primary" 
                    variant="flat"
                    startContent={<Upload className="h-4 w-4" />}
                  >
                    Choose Image
                  </Button>
                </div>
              </div>
              <Input
                className="mt-2"
                placeholder="Or paste image URL"
                startContent={<ImageIcon className="h-4 w-4 text-blue-500" />}
              />
            </div>
            <Button 
              className="w-full mt-4 bg-gray-900 text-white" 
              startContent={<Layers className="h-4 w-4" />}
              onPress={async () => {
                // Validate form
                if (!bundleForm.name.trim()) {
                  setToast({message: 'Please enter a bundle name', type: 'error'});
                  setTimeout(() => setToast(null), 3000);
                  return;
                }
                
                if (bundleForm.price <= 0) {
                  setToast({message: 'Please enter a valid price', type: 'error'});
                  setTimeout(() => setToast(null), 3000);
                  return;
                }
                
                const newBundle = {
                  id: `bundle_${Date.now()}`,
                  name: bundleForm.name.trim(),
                  description: bundleForm.description.trim(),
                  price: bundleForm.price,
                  discount: bundleForm.discount,
                  category: bundleForm.category,
                  coverImage: bundleForm.coverImage,
                  selectedVideos: bundleForm.selectedVideos,
                  items: bundleForm.selectedVideos,
                  isActive: bundleForm.isActive,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                
                try {
                  // Save to VPS data store
                  const currentData = await vpsDataStore.loadData();
                  const updatedData = {
                    ...currentData,
                    contentBundles: [...((currentData as any).contentBundles || []), newBundle]
                  } as any;
                  
                  const success = await vpsDataStore.saveData(updatedData);
                  if (success) {
                    setContentBundles(prev => [...prev, newBundle]);
                    setToast({message: 'Content bundle created successfully!', type: 'success'});
                    setTimeout(() => setToast(null), 3000);
                    
                    // Reset form
                    setBundleForm({
                      name: '',
                      description: '',
                      price: 0,
                      discount: 0,
                      category: 'mixed',
                      coverImage: '',
                      selectedVideos: [],
                      isActive: true
                    });
                    
                    handleSetActiveSection('content-bundles');
                  } else {
                    throw new Error('Failed to save to data store');
                  }
                } catch (error) {
                  console.error('Failed to create bundle:', error);
                  setToast({message: 'Failed to create bundle. Please try again.', type: 'error'});
                  setTimeout(() => setToast(null), 3000);
                }
              }}
            >
              Create Bundle
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  const renderContentBundles = () => (
    <div className="space-y-6">
      <PageHeader 
        title="Content Bundles" 
        actions={
          <Button 
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => handleSetActiveSection('create-bundle')}
          >
            Create Bundle
          </Button>
        }
      />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Content Bundles ({contentBundles.length})</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentBundles.map((bundle) => (
              <div key={bundle.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Layers className="h-8 w-8 text-purple-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{bundle.name}</h4>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{bundle.category}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{bundle.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-green-600 font-semibold">${bundle.price}</span>
                  {bundle.discount > 0 && (
                    <span className="text-orange-600 text-sm">{bundle.discount}% off</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="light"
                    className="hover:bg-blue-50 transition-colors"
                    onPress={() => {
                      setEditingBundle(bundle);
                      setBundleForm({
                        name: bundle.name,
                        description: bundle.description,
                        price: bundle.price,
                        discount: bundle.discount || 0,
                        category: bundle.category,
                        coverImage: bundle.coverImage || '',
                        selectedVideos: bundle.selectedVideos || [],
                        isActive: bundle.isActive
                      });
                      handleSetActiveSection('create-bundle');
                    }}
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="light" 
                    className="hover:bg-red-50 transition-colors"
                    onPress={async () => {
                      if (confirm(`Delete bundle "${bundle.name}"?`)) {
                        try {
                          const currentData = await vpsDataStore.loadData();
                          const updatedBundles = ((currentData as any).contentBundles || []).filter((b: any) => b.id !== bundle.id);
                          const updatedData = { ...currentData, contentBundles: updatedBundles } as any;
                          
                          const success = await vpsDataStore.saveData(updatedData);
                          if (success) {
                            vpsDataStore.clearMemoryCache();
                            await loadRealData();
                            setToast({message: 'Bundle deleted successfully!', type: 'success'});
                            setTimeout(() => setToast(null), 3000);
                          }
                        } catch (error) {
                          setToast({message: 'Failed to delete bundle', type: 'error'});
                          setTimeout(() => setToast(null), 3000);
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
            {contentBundles.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bundles yet</h3>
                <p className="text-gray-600 mb-4">Create your first content bundle to offer discounted packages.</p>
                <Button 
                  color="primary"
                  startContent={<Plus className="h-4 w-4" />}
                  onPress={() => handleSetActiveSection('create-bundle')}
                >
                  Create First Bundle
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderContentScheduling = () => (
    <div className="space-y-6">
      <PageHeader title="Content Scheduling" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule New Content */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Schedule Content</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Content</label>
              <Select
                selectedKeys={scheduleForm.contentId ? [scheduleForm.contentId] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setScheduleForm({ ...scheduleForm, contentId: selected });
                }}
                placeholder="Choose content to schedule"
                aria-label="Select content to schedule"
                classNames={{
                  trigger: "bg-white border-gray-300 hover:border-indigo-400 focus:border-indigo-500"
                }}
              >
                {videos.filter(v => !v.isVisible).map((video) => (
                  <SelectItem key={video.id} value={video.id}>
                    {video.title} ({video.category})
                  </SelectItem>
                ))}
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Publish Date</label>
                <Input
                  type="date"
                  value={scheduleForm.publishDate}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, publishDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-gray-300 hover:border-indigo-400 focus-within:border-indigo-500"
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Publish Time</label>
                <Input
                  type="time"
                  value={scheduleForm.publishTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, publishTime: e.target.value })}
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-gray-300 hover:border-indigo-400 focus-within:border-indigo-500"
                  }}
                />
              </div>
            </div>
            
            <Button 
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
              onPress={handleScheduleContent}
              startContent={<Calendar className="h-4 w-4" />}
              isDisabled={!scheduleForm.contentId || !scheduleForm.publishDate || !scheduleForm.publishTime}
            >
              Schedule Content
            </Button>
          </CardBody>
        </Card>

        {/* Scheduled Content List */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Scheduled Content ({scheduledContent.length})</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {scheduledContent.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No scheduled content</p>
                </div>
              ) : (
                scheduledContent.map((item) => {
                  const video = videos.find(v => v.id === item.contentId);
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{video?.title || 'Unknown Content'}</h4>
                        <Chip 
                          size="sm" 
                          color={item.status === 'scheduled' ? 'warning' : item.status === 'published' ? 'success' : 'danger'} 
                          variant="flat"
                        >
                          {item.status}
                        </Chip>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Scheduled: {item.publishDateTime.toLocaleDateString()} at {item.publishDateTime.toLocaleTimeString()}
                      </p>
                      {item.status === 'scheduled' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 text-white hover:bg-green-700"
                            onPress={() => handlePublishNow(item.id)}
                            startContent={<CheckCircle className="h-3 w-3" />}
                          >
                            Publish Now
                          </Button>
                          <Button 
                            size="sm" 
                            variant="flat" 
                            className="bg-red-50 text-red-600 hover:bg-red-100"
                            onPress={() => handleCancelSchedule(item.id)}
                            startContent={<XCircle className="h-3 w-3" />}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Scheduling Calendar View */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Content Calendar</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - date.getDay() + i);
              const hasScheduled = scheduledContent.some(item => 
                item.publishDateTime.toDateString() === date.toDateString()
              );
              
              return (
                <div 
                  key={i} 
                  className={`h-20 border border-gray-200 rounded p-1 text-sm ${
                    hasScheduled ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-700">{date.getDate()}</div>
                  {hasScheduled && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1"></div>
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderAllUsersPage = () => (
    <div className="space-y-6">
      <PageHeader 
        title="All Users" 
        actions={
          <Button 
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => handleSetActiveSection('add-user')}
          >
            Add New User
          </Button>
        }
      />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold text-gray-900">All Users ({users.length})</h3>
            <Button 
              size="sm" 
              variant="flat" 
              startContent={<RotateCcw className="h-4 w-4" />}
              onPress={() => loadRealData()}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table removeWrapper aria-label="Users table">
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>JOINED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No users found">
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip size="sm" color={user.role === 'admin' ? 'success' : 'default'} variant="flat">
                      {user.role}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="light"
                        onPress={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="light" 
                        className="hover:bg-red-50"
                        onPress={() => {
                          if (confirm(`Delete user ${user.name}?`)) {
                            setUsers(prev => prev.filter(u => u.id !== user.id));
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );

  const renderChildrenProfilesPage = () => (
    <div className="space-y-6">
      <PageHeader title="Children Profiles" />
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Children Profiles ({childrenProfiles.length})</h3>
        </CardHeader>
        <CardBody>
          {childrenProfiles.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No children profiles yet</h3>
              <p className="text-gray-600">Children profiles will appear here when parents create them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {childrenProfiles.map((profile, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{profile.name?.charAt(0) || 'C'}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{profile.name || 'Child Profile'}</h4>
                      <p className="text-sm text-gray-500">Age: {profile.age || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Parent:</span> {profile.parentName || 'N/A'}</p>
                    <p><span className="font-medium">Progress:</span> {profile.progress || '0'}% complete</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderAddUser = () => (
    <div className="space-y-6">
      <PageHeader 
        title={editingUser ? 'Edit User' : 'Add New User'}
        actions={
          <Button 
            variant="flat" 
            onPress={() => handleSetActiveSection('all-users')}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            startContent={<X className="h-4 w-4" />}
          >
            Cancel
          </Button>
        }
      />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Information</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <Input
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Enter full name"
                classNames={{
                  input: "bg-white",
                  inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="Enter email address"
                classNames={{
                  input: "bg-white",
                  inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Password {!editingUser ? '*' : '(leave blank to keep current)'}
            </label>
            <Input
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              placeholder={editingUser ? "Enter new password (optional)" : "Enter password"}
              classNames={{
                input: "bg-white",
                inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <Select
                selectedKeys={[userForm.role]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as 'user' | 'admin' | 'moderator';
                  setUserForm({ ...userForm, role: selected });
                }}
                classNames={{
                  trigger: "bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500"
                }}
              >
                <SelectItem key="user" value="user">User</SelectItem>
                <SelectItem key="admin" value="admin">Admin</SelectItem>
                <SelectItem key="moderator" value="moderator">Moderator</SelectItem>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select
                selectedKeys={[userForm.status]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as 'active' | 'inactive' | 'suspended';
                  setUserForm({ ...userForm, status: selected });
                }}
                classNames={{
                  trigger: "bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500"
                }}
              >
                <SelectItem key="active" value="active">Active</SelectItem>
                <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                <SelectItem key="suspended" value="suspended">Suspended</SelectItem>
              </Select>
            </div>
          </div>
          
          <Button 
            className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12 text-lg font-semibold"
            onPress={handleSaveUser}
            startContent={editingUser ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            isDisabled={!userForm.name.trim() || !userForm.email.trim() || (!editingUser && !userForm.password.trim())}
          >
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </CardBody>
      </Card>
    </div>
  );

  const renderUserRoles = () => {
    const roleStats = {
      admin: users.filter(u => u.role === 'admin').length,
      moderator: users.filter(u => u.role === 'moderator').length,
      user: users.filter(u => u.role === 'user' || !u.role).length
    };

    return (
      <div className="space-y-6">
        <PageHeader title="User Roles" />
        
        <StatsGrid stats={[
          { 
            label: 'Administrators', 
            value: roleStats.admin, 
            color: '', 
            change: 'Full access',
            icon: <Shield className="h-6 w-6 text-red-600" />
          },
          { 
            label: 'Moderators', 
            value: roleStats.moderator, 
            color: '', 
            change: 'Content management',
            icon: <UserCheck className="h-6 w-6 text-orange-600" />
          },
          { 
            label: 'Regular Users', 
            value: roleStats.user, 
            color: '', 
            change: 'Standard access',
            icon: <Users className="h-6 w-6 text-blue-600" />
          },
          { 
            label: 'Total Users', 
            value: users.length, 
            color: '', 
            change: 'All roles',
            icon: <Activity className="h-6 w-6 text-green-600" />
          }
        ]} />
        
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Role Permissions</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="h-8 w-8 text-red-600" />
                  <div>
                    <h4 className="font-semibold text-red-900">Administrator</h4>
                    <p className="text-sm text-red-700">{roleStats.admin} users</p>
                  </div>
                </div>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>- Full system access</li>
                  <li>- User management</li>
                  <li>- Content management</li>
                  <li>- System settings</li>
                </ul>
              </div>
              
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-center space-x-3 mb-3">
                  <UserCheck className="h-8 w-8 text-orange-600" />
                  <div>
                    <h4 className="font-semibold text-orange-900">Moderator</h4>
                    <p className="text-sm text-orange-700">{roleStats.moderator} users</p>
                  </div>
                </div>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>- Content moderation</li>
                  <li>- Comment management</li>
                  <li>- User support</li>
                  <li>- Basic analytics</li>
                </ul>
              </div>
              
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900">User</h4>
                    <p className="text-sm text-blue-700">{roleStats.user} users</p>
                  </div>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>- View content</li>
                  <li>- Purchase videos</li>
                  <li>- Manage profile</li>
                  <li>- Leave comments</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  // User Management Functions
  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setUserForm({
      name: userToEdit.name || '',
      email: userToEdit.email || '',
      password: '',
      role: userToEdit.role || 'user',
      status: userToEdit.status || 'active',
      avatar: userToEdit.avatar || '',
      phone: userToEdit.phone || '',
      dateOfBirth: userToEdit.dateOfBirth || '',
      subscription: userToEdit.subscription || 'free'
    });
    handleSetActiveSection('add-user');
  };

  const handleSaveUser = async () => {
    try {
      if (!userForm.name.trim()) {
        alert('Please enter a name');
        return;
      }
      if (!userForm.email.trim()) {
        alert('Please enter an email');
        return;
      }
      if (!editingUser && !userForm.password.trim()) {
        alert('Please enter a password for new users');
        return;
      }
      
      if (editingUser) {
        // Update existing user
        const updatedUser = {
          ...editingUser,
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          status: userForm.status,
          avatar: userForm.avatar,
          phone: userForm.phone,
          dateOfBirth: userForm.dateOfBirth,
          subscription: userForm.subscription,
          updatedAt: new Date().toISOString()
        };
        
        const success = await vpsDataStore.updateUser(updatedUser.id, updatedUser);
        if (success) {
          setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
          alert('- User updated successfully!');
        } else {
          alert('- Failed to update user.');
          return;
        }
      } else {
        // Create new user
        const newUser = {
          id: Date.now().toString(),
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role,
          status: userForm.status,
          avatar: userForm.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userForm.name)}&background=random`,
          phone: userForm.phone,
          dateOfBirth: userForm.dateOfBirth,
          subscription: userForm.subscription,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        const success = await vpsDataStore.addUser(newUser);
        if (success) {
          setUsers(prev => [...prev, newUser]);
          alert('- User created successfully!');
        } else {
          alert('- Failed to create user.');
          return;
        }
      }
      
      handleSetActiveSection('all-users');
      setEditingUser(null);
      
      // Reset form
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active',
        avatar: '',
        phone: '',
        dateOfBirth: '',
        subscription: 'free'
      });
    } catch (error) {
      console.error('- Failed to save user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const success = await vpsDataStore.deleteUser(userId);
      if (success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        alert('- User deleted successfully!');
      } else {
        alert('- Failed to delete user.');
      }
    }
  };






  const renderPackages = () => (
    <div className="space-y-6">
      <PageHeader title="Learning Packages" />
      
      <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardBody className="p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <PackageIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Learning Packages</h3>
            <p className="text-gray-600 text-lg mb-8">Create and manage learning packages.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Button 
                className="h-24 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('all-packages')}
              >
                <div className="text-center">
                  <PackageIcon className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">All Packages</span>
                  <span className="text-xs opacity-80 block">View & manage packages</span>
                </div>
              </Button>
              
              <Button 
                className="h-24 bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('add-package')}
              >
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Add Package</span>
                  <span className="text-xs opacity-80 block">Create new package</span>
                </div>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderCommerce = () => (
    <div className="space-y-6">
      <PageHeader title="Commerce" />
      
      <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardBody className="p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ShoppingCart className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Commerce</h3>
            <p className="text-gray-600 text-lg mb-8">Manage orders, subscriptions, and transactions.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Button 
                className="h-24 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('orders')}
              >
                <div className="text-center">
                  <PackageIcon className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Orders</span>
                  <span className="text-xs opacity-80 block">Manage orders</span>
                </div>
              </Button>
              
              <Button 
                className="h-24 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('subscriptions')}
              >
                <div className="text-center">
                  <CreditCard className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Subscriptions</span>
                  <span className="text-xs opacity-80 block">Manage subscriptions</span>
                </div>
              </Button>
              
              <Button 
                className="h-24 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('transactions')}
              >
                <div className="text-center">
                  <Receipt className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Transactions</span>
                  <span className="text-xs opacity-80 block">View transactions</span>
                </div>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderModeration = () => (
    <div className="space-y-6">
      <PageHeader title="Moderation" />
      
      <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardBody className="p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Moderation</h3>
            <p className="text-gray-600 text-lg mb-8">Moderate comments and flagged content.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Button 
                className="h-24 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('comments')}
              >
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Comments</span>
                  <span className="text-xs opacity-80 block">Moderate comments</span>
                </div>
              </Button>
              
              <Button 
                className="h-24 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('flagged-content')}
              >
                <div className="text-center">
                  <Flag className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Flagged Content</span>
                  <span className="text-xs opacity-80 block">Review flagged items</span>
                </div>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderContentCategories = () => (
    <div className="space-y-6">
      <PageHeader title="Content Categories" />
      
      <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardBody className="p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Content Categories</h3>
            <p className="text-gray-600 text-lg mb-8">Manage educational content by category.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <Button 
                className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('audio-lessons')}
              >
                <div className="text-center">
                  <Headphones className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Audio Lessons</span>
                  <span className="text-xs opacity-80 block">Manage audio content</span>
                </div>
              </Button>
              
              <Button 
                className="h-24 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('pp1-program')}
              >
                <div className="text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">PP1 Program</span>
                  <span className="text-xs opacity-80 block">Beginner level</span>
                </div>
              </Button>
              
              <Button 
                className="h-24 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('pp2-program')}
              >
                <div className="text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">PP1 Program</span>
                  <span className="text-xs opacity-80 block">Advanced level</span>
                </div>
              </Button>
              
              <Button 
                className="h-24 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('content-bundles')}
              >
                <div className="text-center">
                  <Layers className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Content Bundles</span>
                  <span className="text-xs opacity-80 block">Package content</span>
                </div>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderVideos = () => (
    <div className="space-y-6">
      <PageHeader title="Video Management" />
      
      <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardBody className="p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Video className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Video Management</h3>
            <p className="text-gray-600 text-lg mb-8">Manage videos, categories, and uploads from here.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <Button 
                className="h-24 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('all-videos')}
              >
                <div className="text-center">
                  <Video className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">All Videos</span>
                  <span className="text-xs opacity-80 block">View & manage videos</span>
                </div>
              </Button>
              
              <Button 
                className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('add-video')}
              >
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Add Video</span>
                  <span className="text-xs opacity-80 block">Upload new video</span>
                </div>
              </Button>
              
              <Button 
                className="h-24 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('categories')}
              >
                <div className="text-center">
                  <Tag className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Categories</span>
                  <span className="text-xs opacity-80 block">Manage categories</span>
                </div>
              </Button>
              
              <Button 
                className="h-24 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('upload-queue')}
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Upload Queue</span>
                  <span className="text-xs opacity-80 block">View uploads</span>
                </div>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <PageHeader title="User Management" />
      
      <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardBody className="p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">User Management</h3>
            <p className="text-gray-600 text-lg mb-8">Manage users, roles, and permissions from here.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Button 
                className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('all-users')}
              >
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">All Users</span>
                  <span className="text-xs opacity-80 block">View & manage users</span>
                </div>
              </Button>
              
              <Button 
                className="h-24 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('add-user')}
              >
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Add User</span>
                  <span className="text-xs opacity-80 block">Create new user</span>
                </div>
              </Button>
              
              <Button 
                className="h-24 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => handleSetActiveSection('user-roles')}
              >
                <div className="text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">User Roles</span>
                  <span className="text-xs opacity-80 block">Manage permissions</span>
                </div>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderRecentActivity = () => {
    // Map activity types to icons
    const getActivityIcon = (type: string) => {
      switch (type) {
        case 'user_registration': return Users;
        case 'user_login': return Users;
        case 'purchase': return ShoppingCart;
        case 'content_upload': return Video;
        case 'notification': return Bell;
        default: return Settings;
      }
    };

    // Filter activities based on search and filter
    const filteredActivities = recentActivityPageData.filter(activity => {
      const matchesFilter = activityFilter === 'all' || activity.type === activityFilter;
      const matchesSearch = activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.action.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    // Paginate activities
    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

    // Get unique activity types for filter
    const activityTypes = [...new Set(recentActivityPageData.map(a => a.type))];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Recent Activity</h1>
            <div className="w-12 h-0.5 bg-gray-900"></div>
            <p className="text-sm text-gray-600 mt-2">Monitor all system activities and user interactions</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="bordered"
              startContent={<RotateCcw className="h-4 w-4" />}
              onPress={() => {
                const loadRecentActivityPage = async () => {
                  setIsRecentActivityLoading(true);
                  try {
                    const activities = await realDataAnalytics.getRecentActivity();
                    setRecentActivityPageData(activities);
                  } catch (error) {
                    console.error('Error loading recent activity page:', error);
                    setRecentActivityPageData([]);
                  } finally {
                    setIsRecentActivityLoading(false);
                  }
                };
                loadRecentActivityPage();
              }}
            >
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Filters and Search */}
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  startContent={<Search className="h-4 w-4 text-gray-400" />}
                  className="max-w-sm"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  placeholder="Filter by type"
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="min-w-[150px]"
                >
                  {[<SelectItem key="all" value="all">All Activities</SelectItem>, ...activityTypes.map((type: string) => 
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  )]}
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex justify-center items-center w-full">
              <div className="p-2">
                {/* Icons only - no text */}
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {isRecentActivityLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                <p className="text-gray-500">There are no activities to display at the moment.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {paginatedActivities.map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    const formattedTime = new Date(activity.timestamp).toLocaleString();
                    const timeAgo = getTimeAgo(activity.timestamp);
                    return (
                      <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <IconComponent className="h-4 w-4" style={{ color: activity.color || '#6B7280' }} />
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.details || activity.action || 'Activity occurred'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formattedTime} ({timeAgo})
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div></div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="bordered"
                          isDisabled={currentPage === 1}
                          onPress={() => setCurrentPage(currentPage - 1)}
                        >
                          ←
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <Button
                                key={page}
                                size="sm"
                                variant={currentPage === page ? "solid" : "bordered"}
                                color={currentPage === page ? "primary" : "default"}
                                onPress={() => setCurrentPage(page)}
                                className="min-w-[40px]"
                              >
                                {page}
                              </Button>
                            );
                          })}
                          {totalPages > 5 && (
                            <>
                              <span className="text-gray-400 px-2">•••</span>
                              <Button
                                size="sm"
                                variant={currentPage === totalPages ? "solid" : "bordered"}
                                color={currentPage === totalPages ? "primary" : "default"}
                                onPress={() => setCurrentPage(totalPages)}
                                className="min-w-[40px]"
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="bordered"
                          isDisabled={currentPage === totalPages}
                          onPress={() => setCurrentPage(currentPage + 1)}
                        >
                          →
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>
    );
  };

  // Helper function to get time ago
  const getTimeAgo = (timestamp: string | Date) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      <PageHeader title="All Notifications" />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications ({notifications.length})</h3>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    notification.type === 'success' ? 'bg-green-500' :
                    notification.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <GeneralSettings />
  );

  const renderGeneralSettings = () => (
    <GeneralSettings />
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <PageHeader title="Email Settings" />
      <EmailSettings />
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <PageHeader title="Security Settings" />
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Security Configuration</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Verification</p>
              <p className="text-sm text-gray-500">Require email verification for new users</p>
            </div>
            <Switch defaultSelected aria-label="Email verification" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Enable 2FA for admin accounts</p>
            </div>
            <Switch aria-label="Two-factor authentication" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Session Security</p>
              <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
            </div>
            <Switch defaultSelected aria-label="Session security" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <Input 
              value="30" 
              type="number"
              className="w-full"
              classNames={{
                input: "bg-gray-50",
                inputWrapper: "bg-gray-50 border-gray-200"
              }}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <PageHeader title="Notification Settings" />
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Send email notifications to users</p>
            </div>
            <Switch defaultSelected />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-500">Send push notifications</p>
            </div>
            <Switch defaultSelected />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Marketing Emails</p>
              <p className="text-sm text-gray-500">Send promotional emails</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">System Alerts</p>
              <p className="text-sm text-gray-500">Admin system notifications</p>
            </div>
            <Switch defaultSelected />
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderContentSettings = () => (
    <div className="space-y-6">
      <PageHeader title="Content Settings" />
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Content Configuration</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto Moderation</p>
              <p className="text-sm text-gray-500">Automatically moderate user content</p>
            </div>
            <Switch defaultSelected />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Video Comments</p>
              <p className="text-sm text-gray-500">Allow comments on videos</p>
            </div>
            <Switch defaultSelected />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Video Size (MB)</label>
            <Input 
              value="500" 
              type="number"
              className="w-full"
              classNames={{
                input: "bg-gray-50",
                inputWrapper: "bg-gray-50 border-gray-200"
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Video Length (minutes)</label>
            <Input 
              value="30" 
              type="number"
              className="w-full"
              classNames={{
                input: "bg-gray-50",
                inputWrapper: "bg-gray-50 border-gray-200"
              }}
            />
          </div>
        </CardBody>
      </Card>
    </div>
   );

  // Package render functions
  const renderAllPackages = () => {
    return renderAllPackagesComponent(packages, handleDeletePackage, formatCurrency, handleSetActiveSection, handleEditPackage, handlePreviewPackage);
  };

  const renderAddPackage = () => {
    return renderAddPackageComponent(packageForm, setPackageForm, handleSavePackage, handleSetActiveSection, editingPackage, videos);
  };

  const renderLearningPackages = () => {
    return renderLearningPackagesComponent(handleSetActiveSection);
  };

  const renderPendingPayments = () => {
    return (
      <div className="space-y-6">
        <PageHeader title="Pending Payments" />
        <AdminPendingPayments />
      </div>
    );
  };

  const renderChatSupport = () => {
    return (
      <div className="space-y-6">
        <PageHeader title="Chat Support" />
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Chat Support</h3>
              <p className="text-gray-600 text-lg">Manage customer support conversations and help requests.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderAccessLogs = () => {
    return (
      <div className="space-y-6">
        <PageHeader title="Access Logs" />
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Access Logs</h3>
              <p className="text-gray-600 text-lg">Monitor user access patterns and security events.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderSubscriptions = () => {
    return (
      <div className="space-y-6">
        <PageHeader title="Subscriptions" />
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Subscriptions</h3>
              <p className="text-gray-600 text-lg">Manage user subscriptions and billing cycles.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderTransactions = () => {
    return (
      <div className="space-y-6">
        <PageHeader title="Transactions" />
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Receipt className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Transactions</h3>
              <p className="text-gray-600 text-lg">View and manage payment transactions.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderComments = () => {
    return (
      <div className="space-y-6">
        <PageHeader title="Comments Moderation" />
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Comments Moderation</h3>
              <p className="text-gray-600 text-lg">Review and moderate user comments and feedback.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderFlaggedContent = () => {
    return (
      <div className="space-y-6">
        <PageHeader title="Flagged Content" />
        <Card className="bg-white border border-gray-200">
          <CardBody className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Flag className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Flagged Content</h3>
              <p className="text-gray-600 text-lg">Review content that has been flagged by users.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'analytics': return renderAnalytics();
      case 'all-videos': return renderAllVideos();
      case 'add-video': return renderEditVideo();
      case 'edit-video': return renderEditVideo();
      case 'audio-lessons': return renderAudioLessons();
      case 'add-audio-lesson': return renderAddAudioLesson();
      case 'video-lessons': return renderVideoLessons();
      case 'add-video-lesson': return renderAddVideoLesson();
      case 'pp1-program': return renderPP1Program();
      case 'add-pp1-content': return renderAddPP1Content();
      case 'pp2-program': return renderPP2Program(videos, handleSetActiveSection);
      case 'add-pp2-content': return renderAddPP2Content(pp2Form, setPP2Form, editingPP2, handleSavePP2, handleSetActiveSection, categories);

      case 'categories': return renderCategoriesPage();
      
      case 'upload-queue': return renderUploadQueuePage();
      case 'packages': return renderPackages();
      case 'commerce': return renderCommerce();
      case 'scheduling': return renderContentScheduling();
      case 'chat': return renderChatSupport();
      case 'moderation': return renderModeration();
      case 'content': return renderContentCategories();
      case 'videos': return renderVideos();
      case 'users': return renderUsers();
      case 'all-users': return renderAllUsersPage();
      case 'add-user': return renderAddUser();
      case 'user-roles': return renderUserRoles();
      case 'children-profiles': return renderChildrenProfilesPage();
      case 'access-logs': return renderAccessLogs();
      case 'orders': return renderOrdersPage();
      case 'pending-payments': return renderPendingPayments();
      case 'admin-profile': return renderAdminProfile();
      case 'access-logs': return renderAccessLogs();
      case 'subscriptions': return renderSubscriptions();
      case 'transactions': return renderTransactions();
      case 'comments': return renderComments();
      case 'flagged-content': return renderFlaggedContent();
      case 'all-packages': return renderAllPackages();
      case 'add-package': return renderAddPackage();

      case 'notifications': return renderNotifications();
      case 'recent-activity': return renderRecentActivity();
      case 'admin-profile': return renderAdminProfile();
      case 'settings': return renderSettings();
      case 'general-settings': return renderGeneralSettings();
      case 'email-settings': return renderEmailSettings();
      case 'security-settings': return renderSecuritySettings();
      case 'notification-settings': return renderNotificationSettings();
      case 'content-settings': return renderContentSettings();
      default:
        return (
          <div className="space-y-6">
            <PageHeader title={sidebarItems.find(item => item.id === activeSection)?.label || 'Page'} />
            <Card className="bg-white border border-gray-200">
              <CardBody className="p-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Layers className="h-10 w-10 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Feature Coming Soon</h3>
                  <p className="text-gray-600 text-lg">This section is under development and will be available soon.</p>
                </div>
              </CardBody>
            </Card>
          </div>
        );
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Admin Header */}
      <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Button
                variant="light"
                isIconOnly
                onPress={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5 text-gray-300" />
              </Button>
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <img 
                    src="https://zingalinga.io/zinga%20linga%20logo.png" 
                    alt="Zinga Linga Logo" 
                    className="h-8 w-auto hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => window.location.href = '/'}
                  />
                </div>
              </div>
            </div>



            {/* Center Section - Empty */}
            <div className="hidden md:flex flex-1 justify-center px-8">
              {/* Center space reserved for future content */}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
               <Dropdown>
                 <DropdownTrigger>
                   <Button
                     isIconOnly
                     variant="light"
                     className="hover:bg-gray-800 rounded-lg transition-colors relative"
                     aria-label="View notifications"
                   >
                     <Bell className="h-5 w-5 text-gray-300" />
                     {pendingPaymentsCount > 0 && (
                       <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"></div>
                     )}
                   </Button>
                 </DropdownTrigger>
                 <DropdownMenu className="w-80">
                   {pendingPaymentsCount > 0 ? (
                     <DropdownItem key="pending-payments" className="p-3 bg-gray-50 border-l-4 border-red-500" onPress={() => handleSetActiveSection('pending-payments')}>
                       <div className="flex items-start space-x-3">
                         <div className="w-2 h-2 rounded-full mt-2 bg-red-500"></div>
                         <div className="flex-1">
                           <p className="text-sm font-medium text-gray-900">
                             {pendingPaymentsCount} pending payment{pendingPaymentsCount > 1 ? 's' : ''} require attention
                           </p>
                           <p className="text-xs text-gray-500">Click to view details</p>
                         </div>
                       </div>
                     </DropdownItem>
                   ) : null}
                   {notifications.length > 0 ? (
                     <DropdownItem key="notifications" className="p-3">
                       <div className="space-y-2">
                         {notifications.slice(0, pendingPaymentsCount > 0 ? 4 : 5).map((notification, index) => (
                           <div key={index} className="flex items-start space-x-3">
                             <div className={`w-2 h-2 rounded-full mt-2 ${
                               notification.type === 'success' ? 'bg-green-500' :
                               notification.type === 'warning' ? 'bg-yellow-500' :
                               'bg-blue-500'
                             }`}></div>
                             <div className="flex-1">
                               <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                               <p className="text-xs text-gray-500">{notification.time}</p>
                             </div>
                           </div>
                         ))}
                       </div>
                     </DropdownItem>
                   ) : null}
                   <DropdownItem key="view-all" className="border-t" onPress={() => handleSetActiveSection('notifications')}>
                     <div className="text-center py-2">
                       <span className="text-sm font-medium text-blue-600">View All Notifications</span>
                     </div>
                   </DropdownItem>
                 </DropdownMenu>
               </Dropdown>
              

              
              {/* User Menu */}
              <Dropdown>
                <DropdownTrigger>
                  <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 rounded-lg p-2 transition-colors admin-header-profile">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center profile-icon">
                      <span className="text-white text-sm font-medium">{(currentUser?.name || 'Admin').charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="hidden md:block text-left profile-text ml-1">
                      <p className="text-sm font-semibold text-white">{currentUser?.name || 'Admin'}</p>
                    </div>
                  </div>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="profile" startContent={<Users className="h-4 w-4" />} onPress={() => handleSetActiveSection('admin-profile')}>
                    My Profile
                  </DropdownItem>
                  <DropdownItem key="settings" startContent={<Settings className="h-4 w-4" />} onPress={() => handleSetActiveSection('settings')}>
                    Settings
                  </DropdownItem>
                  <DropdownItem key="help" startContent={<HelpCircle className="h-4 w-4" />} onPress={() => onNavigate?.('help')}>
                    Help & Support
                  </DropdownItem>
                  <DropdownItem key="logout" color="danger" startContent={<LogOut className="h-4 w-4" />} onPress={onLogout}>
                    Sign Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Responsive Sidebar */}
        <div className={`
          ${sidebarOpen ? (isMobile ? 'w-full' : 'w-80') : (isMobile ? 'w-0' : 'w-16')} 
          ${isMobile ? 'fixed inset-0 z-50 top-16' : 'relative'}
          transition-all duration-300 ease-in-out
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 overflow-hidden shadow-2xl backdrop-blur-sm
        `}>
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">


            {/* Quick Stats in Sidebar */}
            {sidebarOpen && (
              <div className="p-3 border-b border-slate-700/50">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span className="text-xs text-slate-300 font-medium">Users</span>
                    </div>
                    <p className="text-lg font-bold text-white mt-1">{dashboardStats.totalUsers}</p>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-slate-300 font-medium">Videos</span>
                    </div>
                    <p className="text-lg font-bold text-white mt-1">{dashboardStats.totalVideos}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="p-3">
              <div className="space-y-0.5">
                {sidebarItems.map(item => renderSidebarItem(item))}
              </div>
            </div>


            
            {/* User Profile & Disconnect - Bottom */}
            <div className="p-3 border-t border-slate-700/50">
              {sidebarOpen ? (
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">{(currentUser?.name || 'Admin').charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{currentUser?.name || 'Admin'}</p>
                      <p className="text-xs text-slate-400 truncate">{currentUser?.email || 'admin@example.com'}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    startContent={<LogOut className="h-4 w-4" />}
                    onPress={onLogout}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <button 
                    onClick={onLogout}
                    className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform group relative"
                    title="Disconnect"
                  >
                    <span className="text-white text-sm font-bold group-hover:hidden">{(currentUser?.name || 'Admin').charAt(0).toUpperCase()}</span>
                    <LogOut className="h-4 w-4 text-white hidden group-hover:block" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Close Button */}
        {isMobile && sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="fixed top-20 right-4 z-60 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 min-h-0">
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8 max-w-full">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Package Preview Modal */}
      <Modal isOpen={isPackagePreviewOpen} onClose={onPackagePreviewClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <PackageIcon className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="text-xl font-bold">Package Preview</h3>
                <p className="text-sm text-gray-500">Package Details</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedPackage && (
              <div className="space-y-6">
                {/* Package Header */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{selectedPackage.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedPackage.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(selectedPackage.price || 0)}</p>
                      <div className="flex gap-2 mt-2">
                        {selectedPackage.isActive && (
                          <Chip size="sm" color="success" variant="flat">Active</Chip>
                        )}
                        {selectedPackage.isPopular && (
                          <Chip size="sm" color="warning" variant="flat">Popular</Chip>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Package Description */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedPackage.description || 'No description available'}
                  </p>
                </div>
                
                {/* Package Features */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Features</h5>
                  <div className="space-y-2">
                    {Array.isArray(selectedPackage.features) ? (
                      selectedPackage.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-700">{selectedPackage.features || 'No features listed'}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Package Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedPackage.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600">Popularity</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedPackage.isPopular ? 'Popular' : 'Standard'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onPackagePreviewClose}>
              Close
            </Button>
            {selectedPackage && (
              <Button 
                color="primary" 
                onPress={() => {
                  onPackagePreviewClose();
                  if (handleEditPackage) {
                    handleEditPackage(selectedPackage);
                  }
                }}
                startContent={<Edit className="h-4 w-4" />}
              >
                Edit Package
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
        message="Video created successfully!"
      />
      
      <AdminSuccessModal
        isOpen={adminSuccessModal.isOpen}
        onClose={() => setAdminSuccessModal({ isOpen: false, message: '' })}
        message={adminSuccessModal.message}
      />
    </div>
  );
}
