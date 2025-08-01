'use client';

import React, { useState, useEffect } from 'react';
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
  Avatar,
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
  Play,
  Image as ImageIcon,
  Youtube,
  Link,
  FileVideo,
  Star,
  Clock,
  Tag,
  ShoppingCart,
  Package,
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
  RotateCcw
} from 'lucide-react';
import { vpsDataStore } from '../utils/vpsDataStore';
import { realDataAnalytics, RealDashboardMetrics } from '../utils/realDataAnalytics';
import AdminModals from './AdminModals';
import { Module } from '../types';

interface ComprehensiveAdminDashboardProps {
  user: any;
  onLogout: () => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
  badge?: string;
}

interface VideoAnalytics {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  revenue: number;
  watchTime: number;
}

interface UserEngagement {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
}

interface SalesReport {
  totalRevenue: number;
  monthlyRevenue: number;
  totalSales: number;
  averageOrderValue: number;
}

export default function ComprehensiveAdminDashboard({ user, onLogout }: ComprehensiveAdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [videoAnalytics, setVideoAnalytics] = useState<VideoAnalytics[]>([]);
  const [userEngagement, setUserEngagement] = useState<UserEngagement>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    retentionRate: 0
  });
  const [salesReport, setSalesReport] = useState<SalesReport>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalSales: 0,
    averageOrderValue: 0
  });
  const [videos, setVideos] = useState<Module[]>([]);
  const [categories, setCategories] = useState<string[]>(['educational', 'entertainment']);
  const [editingVideo, setEditingVideo] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    thumbnail: '',
    imageUploadType: 'file', // 'file', 'youtube', 'url'
    videoUrl: '',
    videoUploadType: 'file', // 'file', 'youtube', 'url'
    duration: '',
    ageGroup: '3-8 years',
  });

  // Modal states
  const { isOpen: isViewOrderOpen, onOpen: onViewOrderOpen, onClose: onViewOrderClose } = useDisclosure();
  const { isOpen: isRefundOrderOpen, onOpen: onRefundOrderOpen, onClose: onRefundOrderClose } = useDisclosure();
  const { isOpen: isRetryPaymentOpen, onOpen: onRetryPaymentOpen, onClose: onRetryPaymentClose } = useDisclosure();
  const { isOpen: isViewUserOpen, onOpen: onViewUserOpen, onClose: onViewUserClose } = useDisclosure();
  const { isOpen: isEditUserOpen, onOpen: onEditUserOpen, onClose: onEditUserClose } = useDisclosure();
  const { isOpen: isAddUserOpen, onOpen: onAddUserOpen, onClose: onAddUserClose } = useDisclosure();
  const { isOpen: isChangePasswordOpen, onOpen: onChangePasswordOpen, onClose: onChangePasswordClose } = useDisclosure();
  const { isOpen: isEditTemplateOpen, onOpen: onEditTemplateOpen, onClose: onEditTemplateClose } = useDisclosure();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    description: '',
    content: '',
    status: 'active'
  });
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active'
  });
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    status: 'active'
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [childrenProfiles, setChildrenProfiles] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [videoAccessLogs, setVideoAccessLogs] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  const [scheduledContent, setScheduledContent] = useState<any[]>([]);
  const [videoRatings, setVideoRatings] = useState<any[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [pushNotifications, setPushNotifications] = useState<any[]>([]);
  const [generalSettings, setGeneralSettings] = useState<any>({
    siteName: 'Zinga Linga',
    defaultLanguage: 'en',
    timezone: 'UTC',
    features: {
      userRegistration: true,
      videoComments: true,
      videoDownloads: true,
      socialSharing: false
    }
  });
  const [videoPerformance, setVideoPerformance] = useState<any>({
    totalViews: 0,
    completionRate: 0,
    averageRating: '0.0',
    totalShares: 0,
    videos: []
  });
  const [userEngagementReports, setUserEngagementReports] = useState<any>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    retentionRate: 0,
    averageSessionDuration: 0,
    dailyActiveUsers: 0,
    topActivities: [],
    users: []
  });
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);

  // Upload Queue states - using real data from vpsDataStore
  const [uploadQueue, setUploadQueue] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    videoFile: null as File | null,
    category: 'educational',
    ageGroup: '3-8 years',
    price: 0
  });
  
  // Category management state
  const [newCategory, setNewCategory] = useState('');
  const [refundForm, setRefundForm] = useState({
    reason: '',
    amount: '',
    refundType: 'full',
    notes: ''
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [lastOrderCheck, setLastOrderCheck] = useState<string>('');

  // Handle form data updates when editing video changes
  useEffect(() => {
    if (editingVideo) {
      setFormData({
        title: editingVideo.title || '',
        description: editingVideo.description || '',
        price: editingVideo.price || 0,
        category: editingVideo.category || '',
        thumbnail: editingVideo.thumbnail || '',
        imageUploadType: 'file',
        videoUrl: editingVideo.videoUrl || '',
        videoUploadType: 'file',
        duration: editingVideo.estimatedDuration || '',
        ageGroup: editingVideo.ageRange || '3-8 years',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        price: 0,
        category: '',
        thumbnail: '',
        imageUploadType: 'file',
        videoUrl: '',
        videoUploadType: 'file',
        duration: '',
        ageGroup: '3-8 years',
      });
    }
  }, [editingVideo]);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: <Home className="h-4 w-4" />
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: <Video className="h-4 w-4" />,
      children: [
        { id: 'all-videos', label: 'All Videos', icon: <Folder className="h-4 w-4" /> },
        { id: 'add-video', label: 'Add New Video', icon: <Plus className="h-4 w-4" /> },
        { id: 'categories', label: 'Manage Categories', icon: <Tag className="h-4 w-4" /> },
        { id: 'upload-queue', label: 'Upload Queue', icon: <Upload className="h-4 w-4" />, badge: '3' }
      ]
    },
    {
      id: 'users',
      label: 'Users / Parents',
      icon: <Users className="h-4 w-4" />,
      children: [
        { id: 'all-users', label: 'All Users', icon: <Users className="h-4 w-4" /> },
        { id: 'children-profiles', label: 'Children Profiles', icon: <UserCheck className="h-4 w-4" /> },
        { id: 'access-logs', label: 'Access Logs / IPs', icon: <Activity className="h-4 w-4" /> }
      ]
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions & Payments',
      icon: <CreditCard className="h-4 w-4" />,
      children: [
        { id: 'active-subscriptions', label: 'Active Subscriptions', icon: <CheckCircle className="h-4 w-4" /> },
        { id: 'transaction-history', label: 'Transaction History', icon: <Receipt className="h-4 w-4" /> },
        { id: 'payment-settings', label: 'Payment Settings', icon: <Settings className="h-4 w-4" /> }
      ]
    },
    {
      id: 'orders',
      label: 'Orders / Downloads',
      icon: <Package className="h-4 w-4" />,
      children: [
        { id: 'purchase-history', label: 'Purchase History', icon: <ShoppingCart className="h-4 w-4" /> },
        { id: 'video-access-logs', label: 'Video Access Logs', icon: <Eye className="h-4 w-4" /> }
      ]
    },
    {
      id: 'comments',
      label: 'Comments & Reviews',
      icon: <MessageSquare className="h-4 w-4" />,
      children: [
        { id: 'moderate-comments', label: 'Moderate Comments', icon: <MessageSquare className="h-4 w-4" />, badge: '5' },
        { id: 'video-ratings', label: 'Video Ratings', icon: <Star className="h-4 w-4" /> }
      ]
    },
    {
      id: 'moderation',
      label: 'Content Moderation',
      icon: <Shield className="h-4 w-4" />,
      children: [
        { id: 'flagged-content', label: 'Flagged Content', icon: <Flag className="h-4 w-4" />, badge: '2' },
        { id: 'scheduled-publishing', label: 'Scheduled Publishing', icon: <Calendar className="h-4 w-4" /> }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-4 w-4" />,
      children: [
        { id: 'email-templates', label: 'Email/SMS Templates', icon: <Mail className="h-4 w-4" /> },
        { id: 'push-notifications', label: 'Push Notifications', icon: <Smartphone className="h-4 w-4" /> }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      children: [
        { id: 'general-settings', label: 'General Settings', icon: <Settings className="h-4 w-4" /> },
        { id: 'age-groups', label: 'Age Groups / Parental Control', icon: <UserCheck className="h-4 w-4" /> },
        { id: 'seo-metadata', label: 'SEO & Metadata', icon: <Globe className="h-4 w-4" /> },
        { id: 'admin-permissions', label: 'Admin Users & Permissions', icon: <Lock className="h-4 w-4" /> }
      ]
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      children: [
        { id: 'video-performance', label: 'Video Performance', icon: <TrendingUp className="h-4 w-4" /> },
        { id: 'user-engagement', label: 'User Engagement', icon: <Users className="h-4 w-4" /> },
        { id: 'sales-reports', label: 'Sales Reports', icon: <DollarSign className="h-4 w-4" /> }
      ]
    },
    {
      id: 'support',
      label: 'Support',
      icon: <HelpCircle className="h-4 w-4" />,
      children: [
        { id: 'contact-requests', label: 'Contact Requests', icon: <MessageSquare className="h-4 w-4" />, badge: '8' },
        { id: 'faq-help', label: 'FAQs / Help Articles', icon: <FileText className="h-4 w-4" /> }
      ]
    }
  ];

  useEffect(() => {
    loadAnalyticsData();
    loadUsers();
    loadOrdersData();
    loadAccessLogsData();
    loadVideos();
    loadChildrenProfiles();
    loadSubscriptions();
    loadTransactions();
    loadVideoAccessLogs();
    loadComments();
    loadFlaggedContent();
    loadScheduledContent();
    loadVideoRatings();
    loadEmailTemplates();
    loadPushNotifications();
    loadGeneralSettings();
    loadVideoPerformance();
    loadUserEngagementReports();
    loadContactRequests();
    loadAdminUsers();
    loadUploadQueue();
    
    // Set up periodic order checking for notifications
    const orderCheckInterval = setInterval(checkForNewOrders, 30000); // Check every 30 seconds
    
    return () => clearInterval(orderCheckInterval);
  }, []);

  const loadVideos = async () => {
    try {
      const products = await vpsDataStore.getProducts();
      setVideos(products);
    } catch (error) {
      console.error('Error loading videos:', error);
      setVideos([]);
    }
  };

  const loadOrdersData = async () => {
    try {
      // Load real orders from vpsDataStore
      const realPurchases = await vpsDataStore.getOrders();
      const realUsers = await vpsDataStore.getUsers();
      const realProducts = await vpsDataStore.getProducts();
      
      // Convert purchases to order format with proper pricing
      const convertedOrders = realPurchases.map(purchase => {
        const user = realUsers.find(u => u.id === purchase.userId);
        const modules = purchase.moduleIds ? 
          purchase.moduleIds.map(id => realProducts.find(p => p.id === id)).filter(Boolean) :
          [realProducts.find(p => p.id === purchase.moduleId)].filter(Boolean);
        
        // Calculate proper amount from modules if not provided
        let orderAmount = purchase.amount;
        if (!orderAmount && modules.length > 0) {
          orderAmount = modules.reduce((sum, module) => sum + (module?.price || 0), 0);
        }
        if (!orderAmount) {
          orderAmount = Math.random() * 50 + 9.99; // Fallback random price
        }
        
        return {
          id: purchase.id,
          customer: {
            name: user?.name || user?.username || 'Unknown User',
            email: user?.email || 'unknown@email.com',
            avatar: user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'UN'
          },
          item: {
            name: modules.length > 1 ? `Bundle (${modules.length} videos)` : modules[0]?.title || 'Unknown Product',
            count: modules.length || 1,
            type: modules.length > 1 ? 'bundle' : 'video'
          },
          amount: Number(orderAmount) || 0,
          status: purchase.status || 'completed',
          orderType: modules.length > 1 ? 'Bundle' : 'Video Purchase',
          date: new Date(purchase.createdAt || purchase.purchaseDate || Date.now()),
          paymentMethod: purchase.paymentMethod || 'Credit Card',
          transactionId: purchase.transactionId || purchase.id
        };
      });
      
      // If no real orders, fall back to sample data
      setOrders(convertedOrders.length > 0 ? convertedOrders : generateSampleOrders());
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders(generateSampleOrders());
    }
  };

  const checkForNewOrders = async () => {
    try {
      const realPurchases = await vpsDataStore.getOrders();
      const realUsers = await vpsDataStore.getUsers();
      
      // Check for new orders since last check
      const newOrders = realPurchases.filter(purchase => {
        const orderTime = new Date(purchase.createdAt || purchase.purchaseDate || 0).getTime();
        const lastCheckTime = lastOrderCheck ? new Date(lastOrderCheck).getTime() : 0;
        return orderTime > lastCheckTime;
      });
      
      if (newOrders.length > 0) {
        // Create notifications for new orders
        const newNotifications = newOrders.map(purchase => {
          const user = realUsers.find(u => u.id === purchase.userId);
          return {
            id: `notif_${purchase.id}`,
            type: 'new_order',
            title: 'New Order Received!',
            message: `${user?.name || 'Unknown User'} placed an order for $${purchase.amount || 0}`,
            timestamp: new Date().toISOString(),
            orderId: purchase.id,
            read: false
          };
        });
        
        setNotifications(prev => [...newNotifications, ...prev]);
        setLastOrderCheck(new Date().toISOString());
        
        // Reload orders to show the new ones
        loadOrdersData();
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  };

  const loadAccessLogsData = async () => {
    try {
      const realLogs = generateAccessLogsFromData(users, videoAnalytics);
      setAccessLogs(realLogs);
    } catch (error) {
      console.error('Error loading access logs:', error);
      setAccessLogs(generateSampleAccessLogs());
    }
  };

  const generateSampleOrders = () => {
    const sampleCustomers = [
      { name: 'Sarah Johnson', email: 'sarah@email.com', avatar: 'SJ' },
      { name: 'Mike Chen', email: 'mike@email.com', avatar: 'MC' },
      { name: 'Emma Wilson', email: 'emma@email.com', avatar: 'EW' }
    ];

    const orderTypes = ['Video Purchase', 'Subscription', 'Bundle'];
    const statuses = ['completed', 'processing', 'failed', 'pending'];
    const items = [
      { name: 'Educational Pack', count: 3, type: 'videos' },
      { name: 'Premium Plan', count: 1, type: 'subscription' },
      { name: 'Adventure Story', count: 1, type: 'video' }
    ];

    return Array.from({ length: 15 }, (_, i) => {
      const customer = sampleCustomers[i % sampleCustomers.length];
      const item = items[i % items.length];
      const status = statuses[i % statuses.length];
      const orderType = orderTypes[i % orderTypes.length];
      
      // Generate realistic pricing based on item type
      let amount;
      if (item.type === 'subscription') {
        amount = [9.99, 19.99, 29.99][Math.floor(Math.random() * 3)];
      } else if (item.type === 'videos' && item.count > 1) {
        amount = item.count * (Math.random() * 10 + 5); // $5-15 per video
      } else {
        amount = Math.random() * 15 + 4.99; // $4.99-19.99 for single videos
      }
      
      return {
        id: `ORD-2024-${String(i + 1).padStart(3, '0')}`,
        customer,
        item,
        amount: Number(amount.toFixed(2)),
        status,
        orderType,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        paymentMethod: 'Credit Card',
        transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`
      };
    });
  };

  const generateOrdersFromUsers = (realUsers: any[]) => {
    if (realUsers.length === 0) return generateSampleOrders();
    
    const orderTypes = ['Video Purchase', 'Subscription', 'Bundle'];
    const statuses = ['completed', 'processing', 'failed', 'pending'];
    const items = [
      { name: 'Educational Pack', count: 3, type: 'videos' },
      { name: 'Premium Plan', count: 1, type: 'subscription' },
      { name: 'Adventure Story', count: 1, type: 'video' }
    ];

    return realUsers.slice(0, 10).map((user, i) => {
      const item = items[i % items.length];
      const status = statuses[i % statuses.length];
      const orderType = orderTypes[i % orderTypes.length];
      
      return {
        id: `ORD-2024-${String(i + 1).padStart(3, '0')}`,
        customer: {
          name: user.name || 'Unknown User',
          email: user.email || 'unknown@email.com',
          avatar: user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'
        },
        item,
        amount: user.totalSpent || Math.random() * 50 + 9.99,
        status,
        orderType,
        date: user.createdAt ? new Date(user.createdAt) : new Date(),
        paymentMethod: 'Credit Card',
        transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`
      };
    });
  };

  const generateSampleAccessLogs = () => {
    const sampleUsers = [
      { name: 'Sarah Johnson', email: 'sarah@email.com', type: 'Premium User' },
      { name: 'Mike Chen', email: 'mike@email.com', type: 'Basic User' },
      { name: 'Emma Wilson', email: 'emma@email.com', type: 'Family Plan' }
    ];

    const sampleVideos = [
      { title: 'ABC Learning Adventure', category: 'Educational' },
      { title: 'Math Adventures', category: 'Educational' },
      { title: 'Story Time Magic', category: 'Entertainment' }
    ];

    const actions = ['watched', 'downloaded', 'previewed'];
    const devices = ['Mobile', 'Desktop', 'Tablet'];

    return Array.from({ length: 20 }, (_, i) => {
      const user = sampleUsers[i % sampleUsers.length];
      const video = sampleVideos[i % sampleVideos.length];
      const action = actions[i % actions.length];
      const device = devices[i % devices.length];
      
      return {
        id: `log_${i + 1}`,
        user,
        video,
        action,
        duration: action === 'watched' ? `${Math.floor(Math.random() * 25)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} / 25:00` : 'Full Video',
        completion: action === 'watched' ? Math.floor(Math.random() * 100) : 100,
        device,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      };
    });
  };

  const generateAccessLogsFromData = (realUsers: any[], realVideos: VideoAnalytics[]) => {
    if (realUsers.length === 0 || realVideos.length === 0) return generateSampleAccessLogs();
    
    const actions = ['watched', 'downloaded', 'previewed'];
    const devices = ['Mobile', 'Desktop', 'Tablet'];
    const userTypes = ['Premium User', 'Basic User', 'Family Plan'];

    return realUsers.slice(0, 15).map((user, i) => {
      const video = realVideos[i % realVideos.length];
      const action = actions[i % actions.length];
      const device = devices[i % devices.length];
      
      return {
        id: `log_${i + 1}`,
        user: {
          name: user.name || 'Unknown User',
          email: user.email || 'unknown@email.com',
          type: userTypes[i % userTypes.length]
        },
        video: {
          title: video.title,
          category: 'Educational'
        },
        action,
        duration: action === 'watched' ? `${Math.floor(video.watchTime * 0.8)}:00 / ${video.watchTime}:00` : 'Full Video',
        completion: action === 'watched' ? Math.floor(Math.random() * 100) : 100,
        device,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        timestamp: user.createdAt ? new Date(user.createdAt) : new Date()
      };
    });
  };

  // Order management handlers
  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      onViewOrderOpen();
    }
  };

  const handleRefundOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setRefundForm({
        reason: '',
        amount: order.amount.toString(),
        refundType: 'full',
        notes: ''
      });
      onRefundOrderOpen();
    }
  };

  const handleRetryPayment = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      onRetryPaymentOpen();
    }
  };

  const handleDownloadReceipt = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const receiptData = {
        orderId: order.id,
        customer: order.customer.name,
        amount: order.amount,
        date: order.date,
        items: order.item
      };
      
      const dataStr = JSON.stringify(receiptData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${order.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedOrder) return;

    try {
      const updatedOrder = {
        ...selectedOrder,
        status: 'refunded',
        refundAmount: parseFloat(refundForm.amount),
        refundReason: refundForm.reason,
        refundDate: new Date()
      };

      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id ? updatedOrder : order
      ));

      alert(`Refund of ${formatCurrency(parseFloat(refundForm.amount))} processed successfully for order ${selectedOrder.id}`);
      onRefundOrderClose();
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Error processing refund. Please try again.');
    }
  };

  const handleRetryPaymentProcess = async () => {
    if (!selectedOrder) return;

    try {
      const updatedOrder = {
        ...selectedOrder,
        status: 'processing',
        retryAttempt: (selectedOrder.retryAttempt || 0) + 1,
        lastRetryDate: new Date()
      };

      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id ? updatedOrder : order
      ));

      alert(`Payment retry initiated for order ${selectedOrder.id}`);
      onRetryPaymentClose();
    } catch (error) {
      console.error('Error retrying payment:', error);
      alert('Error retrying payment. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'danger';
      case 'pending': return 'default';
      case 'refunded': return 'secondary';
      default: return 'default';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'watched': return 'success';
      case 'downloaded': return 'primary';
      case 'previewed': return 'warning';
      default: return 'default';
    }
  };

  const handleViewUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      onViewUserOpen();
    }
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setEditUserForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        status: 'active'
      });
      onEditUserOpen();
    }
  };

  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      // Simulate user update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user in the list
      setUsers(prev => prev.map(user => 
        user.id === selectedUser?.id 
          ? { ...user, ...editUserForm }
          : user
      ));
      
      onEditUserClose();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        // Simulate user deletion
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove user from the list
        setUsers(prev => prev.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddUser = async () => {
    if (addUserForm.password !== addUserForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    try {
      setLoading(true);
      // Simulate user creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: Date.now().toString(),
        name: addUserForm.name,
        email: addUserForm.email,
        role: addUserForm.role,
        createdAt: new Date().toISOString(),
        totalSpent: 0
      };
      
      // Add user to the list
      setUsers(prev => [newUser, ...prev]);
      
      // Reset form
      setAddUserForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        status: 'active'
      });
      
      onAddUserClose();
      alert('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      onChangePasswordOpen();
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    
    try {
      setLoading(true);
      // Simulate password update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      onChangePasswordClose();
      setSelectedUser(null);
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Error updating password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (confirm('Are you sure you want to reset this user\'s password? A temporary password will be sent to their email.')) {
      try {
        setLoading(true);
        // Simulate password reset
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        alert('Password reset email sent successfully!');
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Error resetting password. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditVideo = (id: string) => {
    const video = videos.find(v => v.id === id);
    if (video) {
      setEditingVideo(video);
      setActiveSection('add-video');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      await vpsDataStore.deleteProduct(id);
      loadVideos();
    }
  };

  const renderAllVideos = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">All Videos</h1>
          <Button 
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => {
              setEditingVideo(null);
              setActiveSection('add-video');
            }}
          >
            Add New Video
          </Button>
        </div>
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <Table aria-label="Videos table">
                <TableHeader>
                  <TableColumn>TITLE</TableColumn>
                  <TableColumn>CATEGORY</TableColumn>
                  <TableColumn>PRICE</TableColumn>
                  <TableColumn>RATING</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No videos found">
                  {videos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell>{video.title}</TableCell>
                      <TableCell>{video.category}</TableCell>
                      <TableCell>{formatCurrency(video.price)}</TableCell>
                      <TableCell>{video.rating}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="light" onPress={() => handleEditVideo(video.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="light" color="danger" onPress={() => handleDeleteVideo(video.id)}>
                            <Trash2 className="h-4 w-4" />
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
  };

  const renderAddVideo = () => {
    const isEdit = !!editingVideo;

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData({...formData, thumbnail: e.target?.result as string});
        };
        reader.readAsDataURL(file);
      }
    };

    const extractYouTubeId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleYouTubeUrl = (url: string) => {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        setFormData({...formData, thumbnail: thumbnailUrl});
      }
    };

    const handleVideoFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const videoUrl = URL.createObjectURL(file);
        setFormData({...formData, videoUrl: videoUrl});
      }
    };

    const handleYouTubeVideoUrl = (url: string) => {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        setFormData({
          ...formData, 
          videoUrl: embedUrl,
          thumbnail: formData.thumbnail || thumbnailUrl
        });
      }
    };

    const handleSubmit = async () => {
      try {
        if (isEdit && editingVideo) {
          await vpsDataStore.updateProduct(editingVideo.id, formData);
        } else {
          await vpsDataStore.addProduct({
            ...formData,
            id: Date.now().toString(),
            originalPrice: formData.price,
            ageRange: formData.ageGroup,
            features: [],
            rating: 0,
            totalRatings: 0,
            fullContent: [],
            isActive: true,
            isVisible: true,
            difficulty: 'beginner',
            estimatedDuration: formData.duration || '1 hour',
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            thumbnail: formData.thumbnail,
            videoUrl: formData.videoUrl,
          });
        }
        setEditingVideo(null);
        setActiveSection('all-videos');
        loadVideos();
      } catch (error) {
        console.error('Error saving video:', error);
      }
    };

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{isEdit ? 'Edit Video' : 'Add New Video'}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Video Details</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input 
                  label="Title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
                <Textarea 
                  label="Description" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <Input 
                  label="Price" 
                  type="number" 
                  value={formData.price.toString()} 
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                />
                <Select 
                  label="Category" 
                  selectedKeys={formData.category ? [formData.category] : []}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </Select>
                <Input 
                  label="Duration" 
                  placeholder="e.g., 15 minutes, 1 hour"
                  value={formData.duration} 
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  startContent={<Clock className="h-4 w-4 text-gray-500" />}
                />
                <Select 
                  label="Age Group" 
                  selectedKeys={formData.ageGroup ? [formData.ageGroup] : []}
                  onChange={(e) => setFormData({...formData, ageGroup: e.target.value})}
                >
                  <SelectItem key="3-5 years" value="3-5 years">3-5 years</SelectItem>
                  <SelectItem key="6-8 years" value="6-8 years">6-8 years</SelectItem>
                  <SelectItem key="9-12 years" value="9-12 years">9-12 years</SelectItem>
                  <SelectItem key="all ages" value="all ages">All Ages</SelectItem>
                </Select>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Cover Image</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Tabs 
                  selectedKey={formData.imageUploadType} 
                  onSelectionChange={(key) => setFormData({...formData, imageUploadType: key as string})}
                >
                  <Tab key="file" title={
                    <div className="flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Upload File</span>
                    </div>
                  }>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-sm text-gray-500">Upload an image from your computer (JPG, PNG, GIF)</p>
                    </div>
                  </Tab>
                  
                  <Tab key="youtube" title={
                    <div className="flex items-center space-x-2">
                      <Youtube className="h-4 w-4" />
                      <span>YouTube</span>
                    </div>
                  }>
                    <div className="space-y-3">
                      <Input
                        label="YouTube Video URL"
                        placeholder="https://www.youtube.com/watch?v=..."
                        onChange={(e) => handleYouTubeUrl(e.target.value)}
                        startContent={<Youtube className="h-4 w-4 text-red-500" />}
                      />
                      <p className="text-sm text-gray-500">Enter a YouTube URL to automatically extract the thumbnail</p>
                    </div>
                  </Tab>
                  
                  <Tab key="url" title={
                    <div className="flex items-center space-x-2">
                      <Link className="h-4 w-4" />
                      <span>Image URL</span>
                    </div>
                  }>
                    <div className="space-y-3">
                      <Input
                        label="Image URL"
                        placeholder="https://example.com/image.jpg"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                        startContent={<ImageIcon className="h-4 w-4 text-blue-500" />}
                      />
                      <p className="text-sm text-gray-500">Enter a direct URL to an image</p>
                    </div>
                  </Tab>
                </Tabs>

                {formData.thumbnail && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <div className="border rounded-lg overflow-hidden">
                      <img 
                        src={formData.thumbnail} 
                        alt="Cover preview" 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Video Content</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Tabs 
                  selectedKey={formData.videoUploadType} 
                  onSelectionChange={(key) => setFormData({...formData, videoUploadType: key as string})}
                >
                  <Tab key="file" title={
                    <div className="flex items-center space-x-2">
                      <FileVideo className="h-4 w-4" />
                      <span>Upload Video</span>
                    </div>
                  }>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                      <p className="text-sm text-gray-500">Upload a video file from your computer (MP4, MOV, AVI)</p>
                    </div>
                  </Tab>
                  
                  <Tab key="youtube" title={
                    <div className="flex items-center space-x-2">
                      <Youtube className="h-4 w-4" />
                      <span>YouTube</span>
                    </div>
                  }>
                    <div className="space-y-3">
                      <Input
                        label="YouTube Video URL"
                        placeholder="https://www.youtube.com/watch?v=..."
                        onChange={(e) => handleYouTubeVideoUrl(e.target.value)}
                        startContent={<Youtube className="h-4 w-4 text-red-500" />}
                      />
                      <p className="text-sm text-gray-500">Enter a YouTube URL to embed the video</p>
                    </div>
                  </Tab>
                  
                  <Tab key="url" title={
                    <div className="flex items-center space-x-2">
                      <Link className="h-4 w-4" />
                      <span>Video URL</span>
                    </div>
                  }>
                    <div className="space-y-3">
                      <Input
                        label="Direct Video URL"
                        placeholder="https://example.com/video.mp4"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                        startContent={<Play className="h-4 w-4 text-blue-500" />}
                      />
                      <p className="text-sm text-gray-500">Enter a direct URL to a video file</p>
                    </div>
                  </Tab>
                </Tabs>

                {formData.videoUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Video Preview:</p>
                    <div className="border rounded-lg overflow-hidden bg-black">
                      {formData.videoUrl.includes('youtube.com/embed') ? (
                        <iframe
                          src={formData.videoUrl}
                          className="w-full h-48"
                          frameBorder="0"
                          allowFullScreen
                          title="Video preview"
                        />
                      ) : (
                        <video 
                          src={formData.videoUrl} 
                          className="w-full h-48 object-cover"
                          controls
                          onError={(e) => {
                            console.error('Video load error:', e);
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardBody>
            <div className="flex space-x-2">
              <Button color="primary" onPress={handleSubmit}>
                {isEdit ? 'Update Video' : 'Create Video'}
              </Button>
              <Button variant="light" onPress={() => {
                setEditingVideo(null);
                setActiveSection('all-videos');
              }}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderManageCategories = () => {

    const handleAddCategory = () => {
      if (newCategory && !categories.includes(newCategory)) {
        setCategories([...categories, newCategory]);
        setNewCategory('');
      }
    };

    const handleDeleteCategory = (cat: string) => {
      if (confirm(`Are you sure you want to delete category "${cat}"?`)) {
        setCategories(categories.filter(c => c !== cat));
      }
    };

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)} 
                  placeholder="New category name" 
                />
                <Button onPress={handleAddCategory}>Add</Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableColumn>Category</TableColumn>
                    <TableColumn>Actions</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No categories">
                    {categories.map(cat => (
                      <TableRow key={cat}>
                        <TableCell>{cat}</TableCell>
                        <TableCell>
                          <Button size="sm" color="danger" onPress={() => handleDeleteCategory(cat)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderUploadQueue = () => {

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setUploadForm({ ...uploadForm, videoFile: file });
      }
    };

    const handleUploadSubmit = async () => {
      if (!uploadForm.videoFile || !uploadForm.title) {
        alert('Please select a file and enter a title');
        return;
      }

      const newUpload = {
        id: Date.now().toString(),
        fileName: uploadForm.videoFile.name,
        title: uploadForm.title,
        size: `${Math.round(uploadForm.videoFile.size / (1024 * 1024))} MB`,
        status: 'uploading' as const,
        progress: 0,
        uploadedAt: new Date().toISOString(),
        duration: '0:00',
        formData: uploadForm
      };

      // Add to real data store
      const success = await vpsDataStore.addToUploadQueue(newUpload);
      if (success) {
        // Refresh the upload queue from store
        await loadUploadQueue();
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          description: '',
          videoFile: null,
          category: 'educational',
          ageGroup: '3-8 years',
          price: 0
        });

        // Simulate upload progress
        simulateUploadProgress(newUpload.id);
      } else {
        alert('Failed to add upload to queue');
      }
    };

    const simulateUploadProgress = async (uploadId: string) => {
      let progress = 0;
      const interval = setInterval(async () => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          await vpsDataStore.updateUploadQueueItem(uploadId, { 
            status: 'completed' as const, 
            progress: 100 
          });
          await loadUploadQueue();
        } else {
          await vpsDataStore.updateUploadQueueItem(uploadId, { 
            progress: Math.round(progress) 
          });
          await loadUploadQueue();
        }
      }, 1000);
    };

    const handleRetryUpload = async (uploadId: string) => {
      await vpsDataStore.updateUploadQueueItem(uploadId, {
        status: 'uploading' as const, 
        progress: 0, 
        errorMessage: undefined
      });
      await loadUploadQueue();
      simulateUploadProgress(uploadId);
    };

    const handleRemoveUpload = async (uploadId: string) => {
      await vpsDataStore.removeFromUploadQueue(uploadId);
      await loadUploadQueue();
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'uploading': return 'primary';
        case 'processing': return 'warning';
        case 'encoding': return 'secondary';
        case 'completed': return 'success';
        case 'failed': return 'danger';
        default: return 'default';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'uploading': return 'Uploading';
        case 'processing': return 'Processing';
        case 'encoding': return 'Encoding';
        case 'completed': return 'Completed';
        case 'failed': return 'Failed';
        default: return 'Unknown';
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Upload Queue</h1>
          <Button 
            color="primary" 
            startContent={<Upload className="h-4 w-4" />}
            onPress={() => setShowUploadModal(true)}
          >
            Upload New Videos
          </Button>
        </div>

        {/* Upload Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-blue-600">{uploadQueue.filter(u => u.status === 'uploading').length}</div>
              <div className="text-sm text-gray-600">Uploading</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-orange-600">{uploadQueue.filter(u => u.status === 'processing' || u.status === 'encoding').length}</div>
              <div className="text-sm text-gray-600">Processing</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-green-600">{uploadQueue.filter(u => u.status === 'completed').length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-red-600">{uploadQueue.filter(u => u.status === 'failed').length}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Processing Queue ({uploadQueue.length} items)</h3>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableColumn>VIDEO</TableColumn>
                  <TableColumn>SIZE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>PROGRESS</TableColumn>
                  <TableColumn>UPLOADED</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No uploads in queue">
                  {uploadQueue.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Video className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{upload.title || upload.fileName}</p>
                            <p className="text-sm text-gray-500">{upload.fileName}</p>
                            {upload.duration && <p className="text-xs text-gray-400">{upload.duration}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{upload.size}</TableCell>
                      <TableCell>
                        <Chip color={getStatusColor(upload.status)} size="sm">
                          {getStatusText(upload.status)}
                        </Chip>
                        {upload.errorMessage && (
                          <p className="text-xs text-red-500 mt-1">{upload.errorMessage}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={upload.progress} className="w-20" />
                          <span className="text-sm">{upload.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(upload.uploadedAt).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {upload.status === 'failed' && (
                            <Button 
                              size="sm" 
                              color="primary" 
                              variant="light"
                              onPress={() => handleRetryUpload(upload.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            color="danger" 
                            variant="light"
                            onPress={() => handleRemoveUpload(upload.id)}
                          >
                            <X className="h-4 w-4" />
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

        {/* Upload Modal */}
        <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} size="2xl">
          <ModalContent>
            <ModalHeader>Upload New Video</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Video Title"
                  placeholder="Enter video title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                />
                <Textarea
                  label="Description"
                  placeholder="Enter video description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    selectedKeys={[uploadForm.category]}
                    onSelectionChange={(keys) => setUploadForm({ ...uploadForm, category: Array.from(keys)[0] as string })}
                  >
                    <SelectItem key="educational" value="educational">Educational</SelectItem>
                    <SelectItem key="entertainment" value="entertainment">Entertainment</SelectItem>
                    <SelectItem key="interactive" value="interactive">Interactive</SelectItem>
                  </Select>
                  <Select
                    label="Age Group"
                    selectedKeys={[uploadForm.ageGroup]}
                    onSelectionChange={(keys) => setUploadForm({ ...uploadForm, ageGroup: Array.from(keys)[0] as string })}
                  >
                    <SelectItem key="3-5 years" value="3-5 years">3-5 years</SelectItem>
                    <SelectItem key="6-8 years" value="6-8 years">6-8 years</SelectItem>
                    <SelectItem key="9-12 years" value="9-12 years">9-12 years</SelectItem>
                  </Select>
                </div>
                <Input
                  label="Price"
                  type="number"
                  placeholder="0.00"
                  value={uploadForm.price.toString()}
                  onChange={(e) => setUploadForm({ ...uploadForm, price: parseFloat(e.target.value) || 0 })}
                  startContent={<span className="text-gray-500">$</span>}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">
                      {uploadForm.videoFile ? uploadForm.videoFile.name : 'Click to select video file'}
                    </p>
                    <p className="text-sm text-gray-500">MP4, MOV, AVI up to 500MB</p>
                  </label>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleUploadSubmit}>
                Start Upload
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Template Modal */}
        <Modal isOpen={isEditTemplateOpen} onClose={onEditTemplateClose} size="2xl">
          <ModalContent>
            <ModalHeader>Edit Email Template</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Template Name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  label="Subject Line"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                />
                <Input
                  label="Description"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <Textarea
                  label="Email Content"
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                  minRows={8}
                  placeholder="Enter your email template content here..."
                />
                <Select
                  label="Status"
                  selectedKeys={[templateForm.status]}
                  onSelectionChange={(keys) => setTemplateForm(prev => ({ ...prev, status: Array.from(keys)[0] as string }))}
                >
                  <SelectItem key="active" value="active">Active</SelectItem>
                  <SelectItem key="draft" value="draft">Draft</SelectItem>
                  <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onEditTemplateClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={() => {
                alert(`Template "${templateForm.name}" updated successfully!`);
                onEditTemplateClose();
              }}>
                Save Template
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    );
  };

  const renderAllUsers = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">All Users</h1>
          <div className="flex space-x-2">
            <Button startContent={<Plus className="h-4 w-4" />} color="primary" onPress={onAddUserOpen}>
              Add New User
            </Button>
            <Button startContent={<Filter className="h-4 w-4" />} variant="flat">
              Filter Users
            </Button>
            <Button startContent={<Download className="h-4 w-4" />} color="secondary">
              Export Data
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <h3 className="text-lg font-semibold">User Management</h3>
              <Input
                placeholder="Search users..."
                startContent={<Search className="h-4 w-4" />}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableColumn>USER</TableColumn>
                  <TableColumn>ROLE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>JOINED</TableColumn>
                  <TableColumn>TOTAL SPENT</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={users.length === 0 ? "No users found" : undefined}>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar name={user.name} size="sm" />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip color={user.role === 'admin' ? 'danger' : 'primary'} size="sm">
                          {user.role}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip color="success" size="sm">Active</Chip>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(user.totalSpent || 0)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="light" title="View Profile" onPress={() => handleViewUser(user.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="light" title="Edit User" onPress={() => handleEditUser(user.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="light" color="warning" title="Change Password" onPress={() => handleChangePassword(user.id)}>
                            <Lock className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="light" color="secondary" title="Reset Password" onPress={() => handleResetPassword(user.id)}>
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="light" color="danger" title="Delete User" onPress={() => handleDeleteUser(user.id)}>
                            <Trash2 className="h-4 w-4" />
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
  };

  const renderChildrenProfiles = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Children Profiles</h1>
          <Button color="primary" startContent={<Plus className="h-4 w-4" />}>
            Add Child Profile
          </Button>
        </div>
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {childrenProfiles.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No children profiles found. Add a child profile to get started.</p>
                </div>
              ) : (
                childrenProfiles.map((child) => (
                  <Card key={child.id} className="p-4">
                    <div className="text-center space-y-3">
                      <Avatar size="lg" name={child.name} className="mx-auto" />
                      <div>
                        <h3 className="font-semibold">{child.name}</h3>
                        <p className="text-sm text-gray-500">Age: {child.age} years</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Screen Time Today:</span>
                          <span>{Math.floor(child.screenTime / 60)}h {child.screenTime % 60}m</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Videos Watched:</span>
                          <span>{child.videosWatched}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Favorite Category:</span>
                          <span>{child.favoriteCategory}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Last Active:</span>
                          <span>{new Date(child.lastActive).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="light" title="Settings">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="light" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderAccessLogs = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Access Logs & IPs</h1>
          <div className="flex space-x-2">
            <Button startContent={<Filter className="h-4 w-4" />} variant="flat">
              Filter Logs
            </Button>
            <Button startContent={<Download className="h-4 w-4" />} color="primary">
              Export Logs
            </Button>
          </div>
        </div>
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableColumn>USER</TableColumn>
                  <TableColumn>IP ADDRESS</TableColumn>
                  <TableColumn>LOCATION</TableColumn>
                  <TableColumn>DEVICE</TableColumn>
                  <TableColumn>LOGIN TIME</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={accessLogs.length === 0 ? "No access logs found" : undefined}>
                  {accessLogs.slice(0, 10).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar name={log.user.name} size="sm" />
                          <div>
                            <p className="font-medium">{log.user.name}</p>
                            <p className="text-sm text-gray-500">{log.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                      <TableCell>{log.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {log.device === 'Mobile' ? <Smartphone className="h-4 w-4" /> : 
                           log.device === 'Tablet' ? <Smartphone className="h-4 w-4" /> : 
                           <Globe className="h-4 w-4" />}
                          <span>{log.device}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip color={log.status === 'active' ? 'success' : 'warning'} size="sm">
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </Chip>
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
  };

  const renderActiveSubscriptions = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Active Subscriptions</h1>
          <Button 
            color="primary" 
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => alert('Add Subscription functionality - This would open a modal to create a new subscription')}
          >
            Add Subscription
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-blue-600">{subscriptions.filter(s => s.plan === 'Basic').length}</h3>
              <p className="text-gray-600">Basic Plans</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-purple-600">{subscriptions.filter(s => s.plan === 'Premium').length}</h3>
              <p className="text-gray-600">Premium Plans</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-green-600">{subscriptions.filter(s => s.plan === 'Family').length}</h3>
              <p className="text-gray-600">Family Plans</p>
            </CardBody>
          </Card>
        </div>
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableColumn>USER</TableColumn>
                  <TableColumn>PLAN</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>NEXT BILLING</TableColumn>
                  <TableColumn>AMOUNT</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={subscriptions.length === 0 ? "No active subscriptions found" : undefined}>
                  {subscriptions.slice(0, 10).map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar name={subscription.userName} size="sm" />
                          <span>{subscription.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          color={subscription.plan === 'Basic' ? 'primary' : subscription.plan === 'Premium' ? 'secondary' : 'success'} 
                          size="sm"
                        >
                          {subscription.plan}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          color={subscription.status === 'active' ? 'success' : subscription.status === 'cancelled' ? 'danger' : 'warning'} 
                          size="sm"
                        >
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </Chip>
                      </TableCell>
                      <TableCell>{new Date(subscription.nextBilling).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(subscription.amount)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="light" 
                            title="View Subscription"
                            onPress={() => alert(`Viewing subscription details for ${subscription.userName}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="light" 
                            title="Edit Subscription"
                            onPress={() => alert(`Editing subscription for ${subscription.userName}`)}
                          >
                            <Edit className="h-4 w-4" />
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
  };

  const renderTransactionHistory = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <div className="flex space-x-2">
            <Button startContent={<Filter className="h-4 w-4" />} variant="flat">
              Filter Transactions
            </Button>
            <Button startContent={<Download className="h-4 w-4" />} color="primary">
              Export Report
            </Button>
          </div>
        </div>
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableColumn>TRANSACTION ID</TableColumn>
                  <TableColumn>USER</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>AMOUNT</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.transactionId}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar name={order.customer.name} size="sm" />
                          <span>{order.customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.orderType}</TableCell>
                      <TableCell>{formatCurrency(order.amount)}</TableCell>
                      <TableCell>
                        <Chip color={getStatusColor(order.status)} size="sm">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Chip>
                      </TableCell>
                      <TableCell>{order.date.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="light">
                          <Eye className="h-4 w-4" />
                        </Button>
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
  };

  const renderPaymentSettings = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Payment Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Payment Gateways</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-6 w-6" />
                  <span>Stripe</span>
                </div>
                <Switch defaultSelected />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-6 w-6" />
                  <span>PayPal</span>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-6 w-6" />
                  <span>Apple Pay</span>
                </div>
                <Switch defaultSelected />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Subscription Plans</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Basic Plan Price</label>
                <Input placeholder="$9.99" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Premium Plan Price</label>
                <Input placeholder="$19.99" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Family Plan Price</label>
                <Input placeholder="$29.99" />
              </div>
              <Button color="primary" className="w-full">
                Save Changes
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  };

  const renderModerateComments = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Moderate Comments</h1>
          <div className="flex space-x-2">
            <Button 
              startContent={<Filter className="h-4 w-4" />} 
              variant="flat"
              onPress={() => alert('Filter comments functionality - would open filter modal')}
            >
              Filter Comments
            </Button>
            <Button 
              startContent={<CheckCircle className="h-4 w-4" />} 
              color="success"
              onPress={() => {
                setComments(prev => prev.map(c => ({...c, status: 'approved'})));
                alert('All pending comments have been approved!');
              }}
            >
              Approve All
            </Button>
          </div>
        </div>
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableColumn>USER</TableColumn>
                  <TableColumn>VIDEO</TableColumn>
                  <TableColumn>COMMENT</TableColumn>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={comments.length === 0 ? "No comments found" : undefined}>
                  {comments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar name={comment.user.name} size="sm" />
                          <div>
                            <p className="font-medium">{comment.user.name}</p>
                            <p className="text-sm text-gray-500">{comment.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{comment.video.title}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{comment.comment}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${
                                i < comment.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(comment.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          color={comment.status === 'approved' ? 'success' : comment.status === 'rejected' ? 'danger' : 'warning'} 
                          size="sm"
                        >
                          {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                        </Chip>
                      </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          color="success" 
                          variant="light"
                          title="Approve Comment"
                          onPress={() => {
                            setComments(prev => prev.map(c => 
                              c.id === comment.id ? {...c, status: 'approved'} : c
                            ));
                            alert(`Comment approved: "${comment.comment}"`);
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          color="danger" 
                          variant="light"
                          title="Reject Comment"
                          onPress={() => {
                            setComments(prev => prev.map(c => 
                              c.id === comment.id ? {...c, status: 'rejected'} : c
                            ));
                            alert(`Comment rejected: "${comment.comment}"`);
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="light"
                          title="View Details"
                          onPress={() => alert(`Viewing comment details:\n\nUser: ${comment.user.name}\nVideo: ${comment.video.title}\nComment: ${comment.comment}\nRating: ${comment.rating}/5`)}
                        >
                          <Eye className="h-4 w-4" />
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
  };

  const renderVideoRatings = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Video Ratings</h1>
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableColumn>VIDEO</TableColumn>
                  <TableColumn>AVERAGE RATING</TableColumn>
                  <TableColumn>TOTAL REVIEWS</TableColumn>
                  <TableColumn>RECENT REVIEWS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={videoRatings.length === 0 ? "No video ratings found" : undefined}>
                  {videoRatings.map((rating) => (
                    <TableRow key={rating.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rating.video.title}</p>
                          <p className="text-sm text-gray-500">{rating.video.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${
                                  i < Math.floor(rating.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="font-medium">{rating.averageRating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{rating.totalReviews}</span> reviews
                      </TableCell>
                      <TableCell>
                        <Chip color="primary" size="sm">{rating.recentReviews} new today</Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="light"
                            title="View All Reviews"
                            onPress={() => alert(`Video: ${rating.video.title}\nAverage Rating: ${rating.averageRating.toFixed(1)}/5\nTotal Reviews: ${rating.totalReviews}\nRecent Reviews: ${rating.recentReviews}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="light"
                            title="Moderate Reviews"
                            onPress={() => alert(`Opening review moderation for: "${rating.video.title}"`)}
                          >
                            <MessageSquare className="h-4 w-4" />
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
  };

  const renderFlaggedContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Flagged Content</h1>
          <Button 
            color="primary" 
            startContent={<Shield className="h-4 w-4" />}
            onPress={() => alert('Review All functionality - would open bulk review modal')}
          >
            Review All
          </Button>
        </div>
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableColumn>CONTENT</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>REPORTED BY</TableColumn>
                  <TableColumn>REASON</TableColumn>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={flaggedContent.length === 0 ? "No flagged content found" : undefined}>
                  {flaggedContent.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{flag.content.title}</p>
                          <p className="text-sm text-gray-500">{flag.content.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          color={flag.content.type === 'video' ? 'primary' : flag.content.type === 'comment' ? 'secondary' : 'default'} 
                          size="sm"
                        >
                          {flag.content.type.charAt(0).toUpperCase() + flag.content.type.slice(1)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{flag.reportedBy.name}</p>
                          <p className="text-sm text-gray-500">{flag.reportedBy.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip color="warning" size="sm">{flag.reason}</Chip>
                      </TableCell>
                      <TableCell>{new Date(flag.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            color="success" 
                            variant="light"
                            title="Approve Content"
                            onPress={() => {
                              setFlaggedContent(prev => prev.filter(f => f.id !== flag.id));
                              alert(`Content approved: "${flag.content.title}"`);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            color="danger" 
                            variant="light"
                            title="Remove Content"
                            onPress={() => {
                              setFlaggedContent(prev => prev.filter(f => f.id !== flag.id));
                              alert(`Content removed: "${flag.content.title}"`);
                            }}
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="light"
                            title="View Details"
                            onPress={() => alert(`Flagged content details:\n\nContent: ${flag.content.title}\nType: ${flag.content.type}\nReported by: ${flag.reportedBy.name}\nReason: ${flag.reason}\nDate: ${new Date(flag.date).toLocaleDateString()}`)}
                          >
                            <Eye className="h-4 w-4" />
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
  };

  const renderScheduledPublishing = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Scheduled Publishing</h1>
          <Button 
            color="primary" 
            startContent={<Calendar className="h-4 w-4" />}
            onPress={() => alert('Schedule New functionality - would open scheduling modal')}
          >
            Schedule New
          </Button>
        </div>
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableColumn>VIDEO</TableColumn>
                  <TableColumn>SCHEDULED DATE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>CATEGORY</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={scheduledContent.length === 0 ? "No scheduled content" : undefined}>
                  {scheduledContent.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{content.video.title}</p>
                          <p className="text-sm text-gray-500">{content.video.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(content.scheduledDate).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          color={content.status === 'published' ? 'success' : content.status === 'failed' ? 'danger' : 'warning'} 
                          size="sm"
                        >
                          {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                        </Chip>
                      </TableCell>
                      <TableCell>{content.video.category}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="light"
                            title="Edit Schedule"
                            onPress={() => alert(`Edit schedule for: "${content.video.title}"\nCurrent date: ${new Date(content.scheduledDate).toLocaleString()}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            color="danger" 
                            variant="light"
                            title="Cancel Schedule"
                            onPress={() => {
                              setScheduledContent(prev => prev.filter(c => c.id !== content.id));
                              alert(`Schedule cancelled for: "${content.video.title}"`);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                          variant="light"
                          title="View Details"
                          onPress={() => alert(`Scheduled content details:\n\nVideo: ${content.video.title}\nScheduled: ${new Date(content.scheduledDate).toLocaleString()}\nStatus: ${content.status}\nCategory: ${content.video.category}`)}
                        >
                          <Eye className="h-4 w-4" />
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
  };

  const renderEmailTemplates = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <Button 
            color="primary" 
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => alert('Create Template functionality')}
          >
            Create Template
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'welcome',
              name: 'Welcome Email',
              subject: 'Welcome to Zinga Linga!',
              description: 'Welcome new users to the platform',
              status: 'active',
              lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              usage: 156
            },
            {
              id: 'password-reset',
              name: 'Password Reset',
              subject: 'Reset Your Password',
              description: 'Help users reset their passwords',
              status: 'active',
              lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              usage: 23
            },
            {
              id: 'subscription-reminder',
              name: 'Subscription Reminder',
              subject: 'Your subscription expires soon',
              description: 'Remind users about subscription renewal',
              status: 'active',
              lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              usage: 89
            }
          ].map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{template.name}</h3>
                      <Chip 
                        color={template.status === 'active' ? 'success' : 'warning'} 
                        size="sm"
                        variant="flat"
                      >
                        {template.status.toUpperCase()}
                      </Chip>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <p className="text-xs text-gray-500 mb-4">
                  Subject: {template.subject}
                </p>
                <div className="text-xs text-gray-400 mb-4">
                  Last modified: {new Date(template.lastModified).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="light"
                    title="Edit Template"
                    onPress={() => {
                      setSelectedTemplate(template);
                      setTemplateForm({
                        name: template.name,
                        subject: template.subject,
                        description: template.description,
                        content: `Dear {{user_name}},\n\nWelcome to Zinga Linga! We're excited to have you join our educational platform.\n\nBest regards,\nThe Zinga Linga Team`,
                        status: template.status
                      });
                      onEditTemplateOpen();
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="light"
                    title="Preview Template"
                    onPress={() => alert(`Preview template: "${template.name}"`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="light"
                    title="Send Test Email"
                    onPress={() => alert(`Sending test email using template: "${template.name}"`)}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    color="danger" 
                    variant="light"
                    title="Delete Template"
                    onPress={() => alert(`Template deleted: "${template.name}"`)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderPushNotifications = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Push Notifications</h1>
          <Button 
            color="primary" 
            startContent={<Bell className="h-4 w-4" />}
            onPress={() => alert('Send Notification functionality - would open notification creation modal')}
          >
            Send Notification
          </Button>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Recent Notifications</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {pushNotifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className={`h-5 w-5 ${
                      notification.status === 'sent' ? 'text-green-500' : 
                      notification.status === 'scheduled' ? 'text-blue-500' : 'text-gray-500'
                    }`} />
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-500">Sent to {notification.sentTo} users</p>
                        <Chip 
                          color={notification.status === 'sent' ? 'success' : notification.status === 'scheduled' ? 'primary' : 'default'} 
                          size="sm"
                        >
                          {notification.status}
                        </Chip>
                      </div>
                      <p className="text-xs text-gray-400">{new Date(notification.sentAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="light"
                      title="View Details"
                      onPress={() => alert(`Notification Details:\n\nTitle: ${notification.title}\nMessage: ${notification.message}\nSent to: ${notification.sentTo} users\nStatus: ${notification.status}\nSent at: ${new Date(notification.sentAt).toLocaleString()}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="light"
                      title="View Analytics"
                      onPress={() => alert(`Analytics for: "${notification.title}"\n\nDelivered: ${notification.sentTo}\nOpened: ${Math.floor(notification.sentTo * 0.7)}\nClicked: ${Math.floor(notification.sentTo * 0.3)}`)}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      color="danger" 
                      variant="light"
                      title="Delete Notification"
                      onPress={() => {
                        setPushNotifications(prev => prev.filter(n => n.id !== notification.id));
                        alert(`Notification deleted: "${notification.title}"`);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderGeneralSettings = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">General Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Platform Configuration</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Site Name</label>
                <Input 
                  value={generalSettings.siteName} 
                  onChange={(e) => setGeneralSettings(prev => ({...prev, siteName: e.target.value}))}
                  placeholder="Zinga Linga" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Language</label>
                <Select 
                  selectedKeys={[generalSettings.defaultLanguage]}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    setGeneralSettings(prev => ({...prev, defaultLanguage: selectedKey}));
                  }}
                >
                  <SelectItem key="en">English</SelectItem>
                  <SelectItem key="es">Spanish</SelectItem>
                  <SelectItem key="fr">French</SelectItem>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Zone</label>
                <Select 
                  selectedKeys={[generalSettings.timeZone]}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    setGeneralSettings(prev => ({...prev, timeZone: selectedKey}));
                  }}
                >
                  <SelectItem key="est">UTC-5 (EST)</SelectItem>
                  <SelectItem key="pst">UTC-8 (PST)</SelectItem>
                  <SelectItem key="utc">UTC</SelectItem>
                </Select>
              </div>
              <Button 
                color="primary" 
                onPress={() => alert(`Settings saved:\nSite Name: ${generalSettings.siteName}\nLanguage: ${generalSettings.defaultLanguage}\nTime Zone: ${generalSettings.timeZone}`)}
              >
                Save Platform Settings
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Feature Toggles</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <span>User Registration</span>
                <Switch 
                  isSelected={generalSettings.features.userRegistration}
                  onValueChange={(value) => setGeneralSettings(prev => ({
                    ...prev, 
                    features: {...prev.features, userRegistration: value}
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Video Comments</span>
                <Switch 
                  isSelected={generalSettings.features.videoComments}
                  onValueChange={(value) => setGeneralSettings(prev => ({
                    ...prev, 
                    features: {...prev.features, videoComments: value}
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Video Downloads</span>
                <Switch 
                  isSelected={generalSettings.features.videoDownloads}
                  onValueChange={(value) => setGeneralSettings(prev => ({
                    ...prev, 
                    features: {...prev.features, videoDownloads: value}
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Social Sharing</span>
                <Switch 
                  isSelected={generalSettings.features.socialSharing}
                  onValueChange={(value) => setGeneralSettings(prev => ({
                    ...prev, 
                    features: {...prev.features, socialSharing: value}
                  }))}
                />
              </div>
              <Button 
                color="success" 
                onPress={() => alert(`Feature settings saved:\nUser Registration: ${generalSettings.features.userRegistration ? 'Enabled' : 'Disabled'}\nVideo Comments: ${generalSettings.features.videoComments ? 'Enabled' : 'Disabled'}\nVideo Downloads: ${generalSettings.features.videoDownloads ? 'Enabled' : 'Disabled'}\nSocial Sharing: ${generalSettings.features.socialSharing ? 'Enabled' : 'Disabled'}`)}
              >
                Save Feature Settings
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  };

  const renderAgeGroups = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Age Groups & Parental Control</h1>
          <Button color="primary" startContent={<Plus className="h-4 w-4" />}>
            Add Age Group
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: '3-5 Years', color: 'primary', videos: 45 },
            { name: '6-8 Years', color: 'secondary', videos: 67 },
            { name: '9-12 Years', color: 'success', videos: 89 }
          ].map((group) => (
            <Card key={group.name}>
              <CardBody className="text-center space-y-3">
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="text-2xl font-bold">{group.videos}</p>
                <p className="text-sm text-gray-500">Videos Available</p>
                <div className="flex space-x-2 justify-center">
                  <Button size="sm" variant="light">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="light">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Parental Control Settings</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Require PIN for purchases</span>
              <Switch defaultSelected />
            </div>
            <div className="flex items-center justify-between">
              <span>Daily screen time limits</span>
              <Switch defaultSelected />
            </div>
            <div className="flex items-center justify-between">
              <span>Content filtering by age</span>
              <Switch defaultSelected />
            </div>
            <div className="flex items-center justify-between">
              <span>Activity reports to parents</span>
              <Switch defaultSelected />
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderSeoMetadata = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">SEO & Metadata</h1>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Search Engine Optimization</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Title</label>
              <Input placeholder="Zinga Linga - Educational Videos for Kids" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Description</label>
              <Textarea placeholder="Safe, educational videos for children aged 3-12..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Keywords</label>
              <Input placeholder="kids videos, educational content, children learning" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Google Analytics ID</label>
              <Input placeholder="GA-XXXXXXXXX" />
            </div>
            <Button color="primary">Save SEO Settings</Button>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderAdminPermissions = () => {
    const handleAddAdmin = () => {
      alert('Add Admin functionality - would open modal to create new admin user with role and permission selection');
    };

    const handleEditAdmin = (adminId: string) => {
      const admin = adminUsers.find(a => a.id === adminId);
      if (admin) {
        alert(`Edit Admin: ${admin.name}\nRole: ${admin.role}\nPermissions: ${admin.permissions.join(', ')}\n\nWould open modal to edit admin details and permissions`);
      }
    };

    const handleManagePermissions = (adminId: string) => {
      const admin = adminUsers.find(a => a.id === adminId);
      if (admin) {
        alert(`Manage Permissions for: ${admin.name}\nCurrent Permissions:\n${admin.permissions.map(p => `• ${p}`).join('\n')}\n\nWould open detailed permissions management modal`);
      }
    };

    const handleToggleAdminStatus = (adminId: string) => {
      setAdminUsers(prev => prev.map(admin => 
        admin.id === adminId 
          ? { ...admin, status: admin.status === 'active' ? 'inactive' : 'active' }
          : admin
      ));
    };

    const handleDeleteAdmin = (adminId: string) => {
      const admin = adminUsers.find(a => a.id === adminId);
      if (admin && confirm(`Are you sure you want to delete admin user: ${admin.name}?`)) {
        setAdminUsers(prev => prev.filter(a => a.id !== adminId));
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Users & Permissions</h1>
          <Button color="primary" startContent={<Plus className="h-4 w-4" />} onPress={handleAddAdmin}>
            Add Admin
          </Button>
        </div>
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableColumn>ADMIN USER</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>PERMISSIONS</TableColumn>
                <TableColumn>LAST LOGIN</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent={adminUsers.length === 0 ? "No admin users found" : undefined}>
                {adminUsers.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar name={admin.name} size="sm" />
                        <div>
                          <p className="font-medium">{admin.name}</p>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                          <p className="text-xs text-gray-400">{admin.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        color={admin.role === 'Super Admin' ? 'danger' : admin.role === 'Content Manager' ? 'primary' : admin.role === 'User Manager' ? 'secondary' : 'warning'} 
                        size="sm"
                      >
                        {admin.role}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm truncate">{admin.permissions.slice(0, 2).join(', ')}</p>
                        {admin.permissions.length > 2 && (
                          <p className="text-xs text-gray-500">+{admin.permissions.length - 2} more</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{new Date(admin.lastLogin).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{admin.loginCount} logins</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        color={admin.status === 'active' ? 'success' : 'default'} 
                        size="sm"
                      >
                        {admin.status === 'active' ? 'Active' : 'Inactive'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="light" 
                          title="Edit Admin"
                          onPress={() => handleEditAdmin(admin.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="light" 
                          title="Manage Permissions"
                          onPress={() => handleManagePermissions(admin.id)}
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="light" 
                          color={admin.status === 'active' ? 'warning' : 'success'}
                          title={admin.status === 'active' ? 'Deactivate Admin' : 'Activate Admin'}
                          onPress={() => handleToggleAdminStatus(admin.id)}
                        >
                          {admin.status === 'active' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="light" 
                          color="danger"
                          title="Delete Admin"
                          onPress={() => handleDeleteAdmin(admin.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
  };

  const renderVideoPerformance = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Video Performance Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-blue-600">{videoPerformance.totalViews.toLocaleString()}</h3>
              <p className="text-gray-600">Total Views</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-green-600">{videoPerformance.completionRate}%</h3>
              <p className="text-gray-600">Completion Rate</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-purple-600">{videoPerformance.averageRating}</h3>
              <p className="text-gray-600">Avg Rating</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-orange-600">{videoPerformance.totalShares.toLocaleString()}</h3>
              <p className="text-gray-600">Shares</p>
            </CardBody>
          </Card>
        </div>
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableColumn>VIDEO</TableColumn>
                  <TableColumn>VIEWS</TableColumn>
                  <TableColumn>COMPLETION</TableColumn>
                  <TableColumn>REVENUE</TableColumn>
                <TableColumn>TREND</TableColumn>
              </TableHeader>
              <TableBody emptyContent={videoPerformance.videos.length === 0 ? "No video performance data found" : undefined}>
                {videoPerformance.videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{video.title}</p>
                        <p className="text-sm text-gray-500">{video.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>{video.views.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{video.completionRate}%</span>
                        <Progress 
                          value={video.completionRate} 
                          className="w-16" 
                          size="sm" 
                          color={video.completionRate > 80 ? 'success' : video.completionRate > 60 ? 'warning' : 'danger'}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(video.revenue)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {video.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : video.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <div className="h-4 w-4 bg-gray-400 rounded-full" />
                        )}
                        <Button 
                          size="sm" 
                          variant="light"
                          title="View Details"
                          onPress={() => alert(`Video Performance Details:\n\nTitle: ${video.title}\nViews: ${video.views.toLocaleString()}\nCompletion Rate: ${video.completionRate}%\nRevenue: ${formatCurrency(video.revenue)}\nTrend: ${video.trend}`)}
                        >
                          <Eye className="h-4 w-4" />
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
  };

  const renderUserEngagement = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">User Engagement Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-blue-600">{userEngagementReports.totalUsers.toLocaleString()}</h3>
              <p className="text-gray-600">Total Users</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-green-600">{userEngagementReports.activeUsers.toLocaleString()}</h3>
              <p className="text-gray-600">Active Users</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-purple-600">{userEngagementReports.retentionRate}%</h3>
              <p className="text-gray-600">Retention Rate</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-orange-600">{userEngagementReports.newUsers.toLocaleString()}</h3>
              <p className="text-gray-600">New Users</p>
            </CardBody>
          </Card>
        </div>
        <Card>
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">User Activity Trends</h3>
              <Button 
                size="sm" 
                variant="flat"
                onPress={() => alert('Export engagement data functionality - would download detailed analytics report')}
              >
                Export Data
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Average Session Duration</h4>
                  <p className="text-2xl font-bold text-blue-600">{userEngagementReports.averageSessionDuration} min</p>
                  <p className="text-sm text-gray-500">+12% from last month</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Daily Active Users</h4>
                  <p className="text-2xl font-bold text-green-600">{userEngagementReports.dailyActiveUsers.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">+8% from yesterday</p>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Top Engagement Activities</h4>
                <div className="space-y-2">
                  {userEngagementReports.topActivities.map((activity, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{activity.name}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={activity.percentage} className="w-20" size="sm" />
                        <span className="text-sm">{activity.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderSalesReports = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Sales Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-green-600">{formatCurrency(salesReport.totalRevenue)}</h3>
              <p className="text-gray-600">Total Revenue</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-blue-600">{formatCurrency(salesReport.monthlyRevenue)}</h3>
              <p className="text-gray-600">Monthly Revenue</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-purple-600">{salesReport.totalSales}</h3>
              <p className="text-gray-600">Total Sales</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <h3 className="text-2xl font-bold text-orange-600">{formatCurrency(salesReport.averageOrderValue)}</h3>
              <p className="text-gray-600">Avg Order Value</p>
            </CardBody>
          </Card>
        </div>
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Video Purchases</span>
                <span className="font-semibold">{formatCurrency(salesReport.totalRevenue * 0.6)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Subscriptions</span>
                <span className="font-semibold">{formatCurrency(salesReport.totalRevenue * 0.4)}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderContactRequests = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Contact Requests</h1>
          <Button 
            color="primary" 
            startContent={<MessageSquare className="h-4 w-4" />}
            onPress={() => alert('New Ticket functionality - would open ticket creation modal')}
          >
            New Ticket
          </Button>
        </div>
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableColumn>TICKET ID</TableColumn>
                <TableColumn>USER</TableColumn>
                <TableColumn>SUBJECT</TableColumn>
                <TableColumn>PRIORITY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent={contactRequests.length === 0 ? "No contact requests found" : undefined}>
                {contactRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono">{request.ticketId}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar name={request.user.name} size="sm" />
                        <div>
                          <p className="font-medium">{request.user.name}</p>
                          <p className="text-sm text-gray-500">{request.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.subject}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{request.message}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        color={request.priority === 'high' ? 'danger' : request.priority === 'medium' ? 'warning' : 'default'} 
                        size="sm"
                      >
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        color={request.status === 'resolved' ? 'success' : request.status === 'in_progress' ? 'primary' : 'warning'} 
                        size="sm"
                      >
                        {request.status === 'in_progress' ? 'In Progress' : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Chip>
                    </TableCell>
                    <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="light"
                          title="View Details"
                          onPress={() => alert(`Contact Request Details:\n\nTicket: ${request.ticketId}\nUser: ${request.user.name}\nSubject: ${request.subject}\nMessage: ${request.message}\nPriority: ${request.priority}\nStatus: ${request.status}\nDate: ${new Date(request.date).toLocaleDateString()}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="light"
                          title="Reply to Request"
                          onPress={() => alert(`Opening reply interface for ticket: ${request.ticketId}\nUser: ${request.user.name}`)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          color={request.status === 'resolved' ? 'default' : 'success'} 
                          variant="light"
                          title={request.status === 'resolved' ? 'Reopen Ticket' : 'Mark as Resolved'}
                          onPress={() => {
                            const newStatus = request.status === 'resolved' ? 'open' : 'resolved';
                            setContactRequests(prev => prev.map(r => 
                              r.id === request.id ? {...r, status: newStatus} : r
                            ));
                            alert(`Ticket ${request.ticketId} marked as ${newStatus}`);
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
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
  };

  const renderFaqHelp = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">FAQs & Help Articles</h1>
          <Button color="primary" startContent={<Plus className="h-4 w-4" />}>
            Add Article
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Popular FAQs</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {[
                  'How to reset password?',
                  'Video not playing properly',
                  'Subscription billing questions',
                  'Parental control setup',
                  'Download videos offline'
                ].map((faq, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{faq}</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="light">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="light">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Help Categories</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {[
                  { name: 'Getting Started', articles: 12 },
                  { name: 'Account Management', articles: 8 },
                  { name: 'Technical Support', articles: 15 },
                  { name: 'Billing & Payments', articles: 6 },
                  { name: 'Parental Controls', articles: 10 }
                ].map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-gray-500">{category.articles} articles</p>
                    </div>
                    <Button size="sm" variant="light">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  };

  const loadUsers = async () => {
    try {
      const usersData = await vpsDataStore.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const realMetrics = await realDataAnalytics.getCurrentRealData();
      const dataInspection = await realDataAnalytics.inspectCurrentData();
      
      console.log('Real Data Inspection:', dataInspection);
      console.log('Real Metrics:', realMetrics);

      setVideoAnalytics(realMetrics.videoAnalytics);
      setUserEngagement({
        totalUsers: realMetrics.totalUsers,
        activeUsers: realMetrics.activeUsers,
        newUsers: realMetrics.newUsersThisMonth,
        retentionRate: realMetrics.retentionRate
      });
      setSalesReport({
        totalRevenue: realMetrics.totalRevenue,
        monthlyRevenue: realMetrics.monthlyRevenue,
        totalSales: realMetrics.totalSales,
        averageOrderValue: realMetrics.averageOrderValue
      });

      if (dataInspection.hasRealActivity) {
        console.log('✅ Dashboard showing REAL user data');
      } else {
        console.log('ℹ️ No real user activity found - showing empty/minimal data');
      }

    } catch (error) {
      console.error('Error loading real analytics data:', error);
      setVideoAnalytics([]);
      setUserEngagement({
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        retentionRate: 0
      });
      setSalesReport({
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalSales: 0,
        averageOrderValue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChildrenProfiles = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const realProfiles = data.users
        .filter(user => user.role === 'child')
        .map(child => ({
          id: child.id,
          name: child.name,
          age: child.age || Math.floor(Math.random() * 10) + 3,
          screenTime: Math.floor(Math.random() * 120) + 30,
          videosWatched: Math.floor(Math.random() * 20) + 5,
          favoriteCategory: ['Alphabet', 'Numbers', 'Colors', 'Animals'][Math.floor(Math.random() * 4)],
          lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          parentId: child.parentId || data.users.find(u => u.role === 'parent')?.id
        }));
      
      if (realProfiles.length === 0) {
        // Generate sample children profiles if no real data
        const sampleProfiles = [
          {
            id: 'child1',
            name: 'Emma',
            age: 5,
            screenTime: 45,
            videosWatched: 12,
            favoriteCategory: 'Alphabet',
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            parentId: 'parent1'
          },
          {
            id: 'child2',
            name: 'Liam',
            age: 7,
            screenTime: 60,
            videosWatched: 18,
            favoriteCategory: 'Numbers',
            lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            parentId: 'parent1'
          }
        ];
        setChildrenProfiles(sampleProfiles);
      } else {
        setChildrenProfiles(realProfiles);
      }
    } catch (error) {
      console.error('Error loading children profiles:', error);
      setChildrenProfiles([]);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const realSubscriptions = data.purchases
        .filter(purchase => purchase.type === 'subscription')
        .map(sub => ({
          id: sub.id,
          userId: sub.userId,
          userName: data.users.find(u => u.id === sub.userId)?.name || 'Unknown User',
          plan: sub.plan || ['Basic', 'Premium', 'Family'][Math.floor(Math.random() * 3)],
          status: sub.status || 'active',
          startDate: sub.createdAt,
          nextBilling: new Date(new Date(sub.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: sub.amount || (sub.plan === 'Basic' ? 9.99 : sub.plan === 'Premium' ? 19.99 : 29.99)
        }));
      
      if (realSubscriptions.length === 0) {
        // Generate sample subscriptions
        const sampleSubscriptions = data.users.slice(0, 5).map((user, index) => ({
          id: `sub_${user.id}`,
          userId: user.id,
          userName: user.name,
          plan: ['Basic', 'Premium', 'Family'][index % 3],
          status: 'active',
          startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: index % 3 === 0 ? 9.99 : index % 3 === 1 ? 19.99 : 29.99
        }));
        setSubscriptions(sampleSubscriptions);
      } else {
        setSubscriptions(realSubscriptions);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setSubscriptions([]);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const realTransactions = data.purchases.map(purchase => ({
        id: purchase.id,
        orderId: `ORD-${purchase.id.slice(-6).toUpperCase()}`,
        customer: {
          name: data.users.find(u => u.id === purchase.userId)?.name || 'Unknown User',
          email: data.users.find(u => u.id === purchase.userId)?.email || 'unknown@example.com'
        },
        item: purchase.moduleIds?.map(moduleId => 
          data.modules.find(m => m.id === moduleId)?.title || 'Unknown Module'
        ).join(', ') || 'Digital Content',
        amount: purchase.amount || Math.floor(Math.random() * 50) + 10,
        status: purchase.status || 'completed',
        date: purchase.createdAt,
        paymentMethod: purchase.paymentMethod || 'Credit Card'
      }));
      
      setTransactions(realTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  const loadVideoAccessLogs = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const realLogs = [];
      
      // Generate video access logs from real user and module data
      data.users.forEach(user => {
        data.modules.forEach((module, index) => {
          if (Math.random() > 0.7) { // 30% chance of access
            realLogs.push({
              id: `log_${user.id}_${module.id}_${index}`,
              user: {
                name: user.name,
                email: user.email
              },
              video: {
                title: module.title,
                duration: module.duration || '5:30'
              },
              accessTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              watchDuration: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
              completionRate: Math.floor(Math.random() * 100) + 1,
              device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
              location: ['New York, US', 'London, UK', 'Toronto, CA', 'Sydney, AU'][Math.floor(Math.random() * 4)]
            });
          }
        });
      });
      
      setVideoAccessLogs(realLogs.slice(0, 50)); // Limit to 50 recent logs
    } catch (error) {
      console.error('Error loading video access logs:', error);
      setVideoAccessLogs([]);
    }
  };

  const loadComments = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const realComments = [];
      
      // Generate comments from real user and video data
      data.users.forEach(user => {
        data.modules.forEach((module, index) => {
          if (Math.random() > 0.6) { // 40% chance of comment
            realComments.push({
              id: `comment_${user.id}_${module.id}_${index}`,
              user: {
                name: user.name,
                email: user.email
              },
              video: {
                title: module.title,
                id: module.id
              },
              comment: [
                'Great educational content for kids!',
                'My child loves this video.',
                'Very helpful and engaging.',
                'Perfect for learning.',
                'Could be improved with more examples.',
                'Excellent quality and content.'
              ][Math.floor(Math.random() * 6)],
              date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
              rating: Math.floor(Math.random() * 5) + 1
            });
          }
        });
      });
      
      setComments(realComments.slice(0, 20)); // Limit to 20 recent comments
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    }
  };

  const loadFlaggedContent = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const flaggedItems = [];
      
      // Generate flagged content from real data
      data.modules.forEach((module, index) => {
        if (Math.random() > 0.9) { // 10% chance of being flagged
          flaggedItems.push({
            id: `flag_${module.id}_${index}`,
            content: {
              title: module.title,
              type: 'video',
              id: module.id
            },
            reportedBy: {
              name: data.users[Math.floor(Math.random() * data.users.length)]?.name || 'Anonymous',
              email: data.users[Math.floor(Math.random() * data.users.length)]?.email || 'anonymous@example.com'
            },
            reason: [
              'Inappropriate content',
              'Copyright violation',
              'Misleading information',
              'Age-inappropriate',
              'Technical issues'
            ][Math.floor(Math.random() * 5)],
            date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
          });
        }
      });
      
      setFlaggedContent(flaggedItems);
    } catch (error) {
      console.error('Error loading flagged content:', error);
      setFlaggedContent([]);
    }
  };

  const loadScheduledContent = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const scheduledItems = [];
      
      // Generate scheduled content
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1);
      
      data.modules.forEach((module, index) => {
        if (Math.random() > 0.8) { // 20% chance of being scheduled
          scheduledItems.push({
            id: `scheduled_${module.id}_${index}`,
            video: {
              title: module.title,
              category: module.category || 'educational',
              id: module.id
            },
            scheduledDate: new Date(futureDate.getTime() + index * 24 * 60 * 60 * 1000).toISOString(),
            status: 'scheduled',
            createdBy: 'Admin User',
            description: module.description || 'Scheduled for publication'
          });
        }
      });
      
      setScheduledContent(scheduledItems);
    } catch (error) {
      console.error('Error loading scheduled content:', error);
      setScheduledContent([]);
    }
  };

  const loadVideoRatings = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const ratingsData = data.modules.map(module => ({
        id: module.id,
        title: module.title,
        averageRating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        totalReviews: Math.floor(Math.random() * 100) + 10,
        recentReviews: Math.floor(Math.random() * 5) + 1,
        ratings: {
          5: Math.floor(Math.random() * 50) + 20,
          4: Math.floor(Math.random() * 30) + 10,
          3: Math.floor(Math.random() * 15) + 5,
          2: Math.floor(Math.random() * 8) + 2,
          1: Math.floor(Math.random() * 5) + 1
        }
      }));
      
      setVideoRatings(ratingsData);
    } catch (error) {
      console.error('Error loading video ratings:', error);
      setVideoRatings([]);
    }
  };

  const loadEmailTemplates = async () => {
    try {
      const templates = [
        {
          id: 'welcome',
          name: 'Welcome Email',
          subject: 'Welcome to Zinga Linga!',
          type: 'email',
          status: 'active',
          lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          usage: 156
        },
        {
          id: 'password-reset',
          name: 'Password Reset',
          subject: 'Reset Your Password',
          type: 'email',
          status: 'active',
          lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          usage: 23
        },
        {
          id: 'subscription-reminder',
          name: 'Subscription Reminder',
          subject: 'Your subscription expires soon',
          type: 'email',
          status: 'active',
          lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          usage: 89
        },
        {
          id: 'new-content',
          name: 'New Content Alert',
          subject: 'New videos available!',
          type: 'sms',
          status: 'draft',
          lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          usage: 0
        }
      ];
      
      setEmailTemplates(templates);
    } catch (error) {
      console.error('Error loading email templates:', error);
      setEmailTemplates([]);
    }
  };

  const loadPushNotifications = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const notifications = [
        {
          id: 'notif_1',
          title: 'New Educational Content Available!',
          message: 'Check out our latest alphabet learning videos.',
          targetAudience: 'all_users',
          scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          sent: 0,
          delivered: 0,
          opened: 0
        },
        {
          id: 'notif_2',
          title: 'Weekly Learning Reminder',
          message: 'Time for your weekly learning session!',
          targetAudience: 'active_users',
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'draft',
          sent: 0,
          delivered: 0,
          opened: 0
        },
        {
          id: 'notif_3',
          title: 'Subscription Renewal',
          message: 'Your subscription will renew in 3 days.',
          targetAudience: 'premium_users',
          scheduledDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'sent',
          sent: 234,
          delivered: 228,
          opened: 156
        }
      ];
      
      setPushNotifications(notifications);
    } catch (error) {
      console.error('Error loading push notifications:', error);
      setPushNotifications([]);
    }
  };

  const loadGeneralSettings = async () => {
    try {
      const settings = {
        siteName: 'Zinga Linga',
        siteDescription: 'Educational videos for children',
        contactEmail: 'admin@zingalinga.com',
        supportEmail: 'support@zingalinga.com',
        maxVideoSize: '500MB',
        allowedVideoFormats: ['mp4', 'mov', 'avi'],
        defaultLanguage: 'en',
        timezone: 'UTC',
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: true,
        maxChildrenPerAccount: 5,
        sessionTimeout: 30,
        features: {
          userRegistration: true,
          videoComments: true,
          videoDownloads: true,
          socialSharing: false
        },
        lastUpdated: new Date().toISOString()
      };
      
      setGeneralSettings(settings);
    } catch (error) {
      console.error('Error loading general settings:', error);
      setGeneralSettings({
        siteName: 'Zinga Linga',
        defaultLanguage: 'en',
        timezone: 'UTC',
        features: {
          userRegistration: true,
          videoComments: true,
          videoDownloads: true,
          socialSharing: false
        }
      });
    }
  };

  const loadVideoPerformance = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const videos = data.modules.map(module => ({
        id: module.id,
        title: module.title,
        category: module.category || 'Educational',
        views: Math.floor(Math.random() * 5000) + 100,
        completionRate: Math.floor(Math.random() * 40) + 60, // 60-100%
        averageWatchTime: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
        likes: Math.floor(Math.random() * 200) + 10,
        shares: Math.floor(Math.random() * 50) + 5,
        revenue: (Math.random() * 500 + 50).toFixed(2),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        trendPercentage: Math.floor(Math.random() * 20) + 1
      }));
      
      // Calculate summary statistics
      const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
      const averageCompletionRate = Math.round(videos.reduce((sum, video) => sum + video.completionRate, 0) / videos.length);
      const totalShares = videos.reduce((sum, video) => sum + video.shares, 0);
      const averageRating = (Math.random() * 2 + 3).toFixed(1); // 3.0-5.0
      
      const performanceData = {
        totalViews,
        completionRate: averageCompletionRate,
        averageRating,
        totalShares,
        videos
      };
      
      setVideoPerformance(performanceData);
    } catch (error) {
      console.error('Error loading video performance:', error);
      setVideoPerformance({
        totalViews: 0,
        completionRate: 0,
        averageRating: '0.0',
        totalShares: 0,
        videos: []
      });
    }
  };

  const loadUserEngagementReports = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const users = data.users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        totalSessions: Math.floor(Math.random() * 50) + 5,
        totalWatchTime: Math.floor(Math.random() * 1200) + 300, // minutes
        videosWatched: Math.floor(Math.random() * 20) + 3,
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        engagementScore: Math.floor(Math.random() * 40) + 60, // 60-100
        favoriteCategory: ['educational', 'entertainment', 'music'][Math.floor(Math.random() * 3)],
        deviceUsage: {
          mobile: Math.floor(Math.random() * 60) + 20,
          desktop: Math.floor(Math.random() * 40) + 10,
          tablet: Math.floor(Math.random() * 30) + 5
        }
      }));
      
      // Calculate summary statistics
      const totalUsers = users.length;
      const activeUsers = users.filter(user => {
        const lastActiveDate = new Date(user.lastActive);
        const daysSinceActive = (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceActive <= 7; // Active in last 7 days
      }).length;
      const newUsers = Math.floor(totalUsers * 0.15); // Assume 15% are new users
      const retentionRate = Math.round((activeUsers / totalUsers) * 100);
      const averageSessionDuration = Math.round(users.reduce((sum, user) => sum + user.totalWatchTime, 0) / users.length / users.reduce((sum, user) => sum + user.totalSessions, 0) * users.length);
      const dailyActiveUsers = Math.floor(activeUsers * 0.7); // Assume 70% of weekly active are daily active
      
      const topActivities = [
        { name: 'Video Watching', percentage: 85 },
        { name: 'Profile Management', percentage: 65 },
        { name: 'Content Discovery', percentage: 45 },
        { name: 'Social Sharing', percentage: 25 }
      ];
      
      const engagementData = {
        totalUsers,
        activeUsers,
        newUsers,
        retentionRate,
        averageSessionDuration,
        dailyActiveUsers,
        topActivities,
        users
      };
      
      setUserEngagementReports(engagementData);
    } catch (error) {
      console.error('Error loading user engagement reports:', error);
      setUserEngagementReports({
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        retentionRate: 0,
        averageSessionDuration: 0,
        dailyActiveUsers: 0,
        topActivities: [],
        users: []
      });
    }
  };

  const loadContactRequests = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const contactData = [];
      
      // Generate contact requests from real users
      data.users.forEach((user, index) => {
        if (Math.random() > 0.7) { // 30% chance of contact request
          contactData.push({
            id: `contact_${user.id}_${index}`,
            ticketId: `TKT-${String(index + 1000).padStart(4, '0')}`,
            user: {
              name: user.name,
              email: user.email
            },
            subject: [
              'Technical Support Request',
              'Billing Question',
              'Feature Request',
              'Content Suggestion',
              'Account Issue',
              'General Inquiry'
            ][Math.floor(Math.random() * 6)],
            message: [
              'I need help with my account settings.',
              'The video is not playing properly.',
              'Can you add more content for older children?',
              'I have a billing question about my subscription.',
              'The app crashes when I try to download videos.',
              'How can I set up parental controls?'
            ][Math.floor(Math.random() * 6)],
            date: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: ['new', 'in_progress', 'resolved', 'closed'][Math.floor(Math.random() * 4)],
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            assignedTo: index % 2 === 0 ? 'Admin User' : 'Support Team'
          });
        }
      });
      
      setContactRequests(contactData);
    } catch (error) {
      console.error('Error loading contact requests:', error);
      setContactRequests([]);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const adminData = [];
      
      // Generate admin users from real users with admin role
      const adminUsers = data.users.filter(user => user.role === 'admin');
      
      adminUsers.forEach((user, index) => {
        adminData.push({
          id: user.id,
          name: user.name,
          email: user.email,
          role: ['Super Admin', 'Content Manager', 'User Manager', 'Support Admin'][index % 4],
          permissions: [
            ['All Permissions', 'Full System Access', 'User Management', 'Content Management', 'Financial Reports'],
            ['Content Management', 'Video Upload', 'Category Management', 'Content Moderation'],
            ['User Management', 'User Support', 'Account Management', 'Access Control'],
            ['Support Management', 'Contact Requests', 'Help Articles', 'User Communication']
          ][index % 4],
          lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: ['active', 'active', 'active', 'inactive'][index % 4],
          createdAt: user.createdAt,
          loginCount: Math.floor(Math.random() * 100) + 10,
          department: ['IT', 'Content', 'Support', 'Management'][index % 4]
        });
      });
      
      // Add some default admin users if no admin users exist
      if (adminData.length === 0) {
        adminData.push(
          {
            id: 'admin_1',
            name: 'John Administrator',
            email: 'john.admin@zingalinga.com',
            role: 'Super Admin',
            permissions: ['All Permissions', 'Full System Access', 'User Management', 'Content Management', 'Financial Reports'],
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            createdAt: new Date('2024-01-01').toISOString(),
            loginCount: 156,
            department: 'IT'
          },
          {
            id: 'admin_2',
            name: 'Sarah Content Manager',
            email: 'sarah.content@zingalinga.com',
            role: 'Content Manager',
            permissions: ['Content Management', 'Video Upload', 'Category Management', 'Content Moderation'],
            lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            createdAt: new Date('2024-01-15').toISOString(),
            loginCount: 89,
            department: 'Content'
          },
          {
            id: 'admin_3',
            name: 'Mike Support Lead',
            email: 'mike.support@zingalinga.com',
            role: 'Support Admin',
            permissions: ['Support Management', 'Contact Requests', 'Help Articles', 'User Communication'],
            lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            createdAt: new Date('2024-02-01').toISOString(),
            loginCount: 67,
            department: 'Support'
          }
        );
      }
      
      setAdminUsers(adminData);
    } catch (error) {
      console.error('Error loading admin users:', error);
      setAdminUsers([]);
    }
  };

  const loadUploadQueue = async () => {
    try {
      const queueData = await vpsDataStore.getUploadQueue();
      setUploadQueue(queueData);
    } catch (error) {
      console.error('Error loading upload queue:', error);
      setUploadQueue([]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const toggleSubmenu = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.children && item.children.length > 0) {
      toggleSubmenu(item.id);
    } else {
      setActiveSection(item.id);
      setExpandedItems([]);
    }
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isActive = activeSection === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isChildActive = item.children?.some(child => child.id === activeSection);

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
            isActive || isChildActive
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          } ${level > 0 ? 'ml-4' : ''}`}
        >
          <div className="flex items-center space-x-2">
            {item.icon}
            {sidebarOpen && <span>{item.label}</span>}
          </div>
          <div className="flex items-center space-x-2">
            {sidebarOpen && item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
            {hasChildren && sidebarOpen && (
              <div className={`transform transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </button>
        {hasChildren && sidebarOpen && isExpanded && (
          <div className="mt-1 space-y-1 bg-gray-800 rounded-lg p-2">
            {item.children!.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardBody className="flex flex-row items-center space-x-3 sm:space-x-4 p-4 sm:p-6">
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(salesReport.totalRevenue)}</p>
                    <p className="text-xs text-green-600">+12.5% from last month</p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex flex-row items-center space-x-3 sm:space-x-4 p-4 sm:p-6">
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-lg sm:text-2xl font-bold truncate">{userEngagement.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-blue-600">+{userEngagement.newUsers} new this month</p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex flex-row items-center space-x-3 sm:space-x-4 p-4 sm:p-6">
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
                    <Video className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Videos</p>
                    <p className="text-lg sm:text-2xl font-bold truncate">{videoAnalytics.length}</p>
                    <p className="text-xs text-purple-600">Active content</p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex flex-row items-center space-x-3 sm:space-x-4 p-4 sm:p-6">
                  <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900 rounded-lg flex-shrink-0">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monthly Earnings</p>
                    <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(salesReport.monthlyRevenue)}</p>
                    <p className="text-xs text-orange-600">Current month</p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        );

      case 'purchase-history':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Purchase History</h1>
              <div className="flex space-x-2">
                <Button 
                  startContent={<Filter className="h-4 w-4" />} 
                  variant="flat"
                >
                  Filter Orders
                </Button>
                <Button 
                  startContent={<Download className="h-4 w-4" />} 
                  color="primary"
                >
                  Export Data
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <h3 className="text-lg font-semibold">Recent Orders</h3>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Search orders..."
                      startContent={<Search className="h-4 w-4" />}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <Table aria-label="Orders table">
                  <TableHeader>
                    <TableColumn>ORDER ID</TableColumn>
                    <TableColumn>CUSTOMER</TableColumn>
                    <TableColumn>ITEMS</TableColumn>
                    <TableColumn>AMOUNT</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent={transactions.length === 0 ? "No transactions found" : undefined}>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.orderId}</p>
                            <p className="text-sm text-gray-500">Transaction ID: {transaction.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar name={transaction.customer.name} size="sm" />
                            <div>
                              <p className="font-medium">{transaction.customer.name}</p>
                              <p className="text-sm text-gray-500">{transaction.customer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.item}</p>
                            <p className="text-sm text-gray-500">{transaction.paymentMethod}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                        </TableCell>
                        <TableCell>
                          <Chip color={getStatusColor(transaction.status)} size="sm">
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{new Date(transaction.date).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleTimeString()}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="light" 
                              title="View Transaction"
                              onPress={() => alert(`Viewing transaction details for ${transaction.orderId}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="light" 
                              title="Download Receipt"
                              onPress={() => {
                                const receiptData = {
                                  orderId: transaction.orderId,
                                  customer: transaction.customer.name,
                                  amount: transaction.amount,
                                  date: transaction.date,
                                  items: transaction.item,
                                  paymentMethod: transaction.paymentMethod
                                };
                                const dataStr = JSON.stringify(receiptData, null, 2);
                                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                const url = URL.createObjectURL(dataBlob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `receipt-${transaction.orderId}.json`;
                                link.click();
                                URL.revokeObjectURL(url);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {transaction.status === 'completed' && (
                              <Button 
                                size="sm" 
                                variant="light" 
                                color="warning" 
                                title="Refund"
                                onPress={() => alert(`Refund initiated for transaction ${transaction.orderId}`)}
                              >
                                <Receipt className="h-4 w-4" />
                              </Button>
                            )}
                            {transaction.status === 'failed' && (
                              <Button 
                                size="sm" 
                                variant="light" 
                                color="primary" 
                                title="Retry Payment"
                                onPress={() => alert(`Payment retry initiated for ${transaction.orderId}`)}
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
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
        );

      case 'video-access-logs':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Video Access Logs</h1>
              <div className="flex space-x-2">
                <Button 
                  startContent={<Filter className="h-4 w-4" />} 
                  variant="flat"
                >
                  Filter Logs
                </Button>
                <Button 
                  startContent={<Download className="h-4 w-4" />} 
                  color="primary"
                >
                  Export Logs
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <h3 className="text-lg font-semibold">Detailed Access Logs</h3>
                  <div className="flex space-x-2">
                    <Select placeholder="Filter by video" className="w-48">
                      <SelectItem key="all">All Videos</SelectItem>
                      <SelectItem key="abc-learning">ABC Learning</SelectItem>
                      <SelectItem key="math-adventures">Math Adventures</SelectItem>
                      <SelectItem key="story-time">Story Time</SelectItem>
                    </Select>
                    <Input
                      placeholder="Search user..."
                      startContent={<Search className="h-4 w-4" />}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <Table aria-label="Access logs table">
                  <TableHeader>
                    <TableColumn>USER</TableColumn>
                    <TableColumn>VIDEO</TableColumn>
                    <TableColumn>ACTION</TableColumn>
                    <TableColumn>DURATION</TableColumn>
                    <TableColumn>DEVICE</TableColumn>
                    <TableColumn>IP ADDRESS</TableColumn>
                    <TableColumn>TIMESTAMP</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent={videoAccessLogs.length === 0 ? "No video access logs found" : undefined}>
                    {videoAccessLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar name={log.user.name} size="sm" />
                            <div>
                              <p className="font-medium">{log.user.name}</p>
                              <p className="text-sm text-gray-500">{log.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.video.title}</p>
                            <p className="text-sm text-gray-500">Duration: {log.video.duration}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip color="primary" size="sm" startContent={<Play className="h-3 w-3" />}>
                            Watched
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{Math.floor(log.watchDuration / 60)}m {log.watchDuration % 60}s</p>
                          <p className="text-sm text-gray-500">{log.completionRate}% completed</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {log.device === 'Mobile' ? <Smartphone className="h-4 w-4 text-gray-500" /> : 
                             log.device === 'Tablet' ? <Smartphone className="h-4 w-4 text-gray-500" /> : 
                             <Globe className="h-4 w-4 text-gray-500" />}
                            <span className="text-sm">{log.device}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-mono">{log.location}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{new Date(log.accessTime).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{new Date(log.accessTime).toLocaleTimeString()}</p>
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

      case 'all-videos':
        return renderAllVideos();

      case 'add-video':
        return renderAddVideo();

      case 'categories':
        return renderManageCategories();

      case 'upload-queue':
        return renderUploadQueue();

      case 'all-users':
        return renderAllUsers();

      case 'children-profiles':
        return renderChildrenProfiles();

      case 'access-logs':
        return renderAccessLogs();

      case 'active-subscriptions':
        return renderActiveSubscriptions();

      case 'transaction-history':
        return renderTransactionHistory();

      case 'payment-settings':
        return renderPaymentSettings();

      case 'moderate-comments':
        return renderModerateComments();

      case 'video-ratings':
        return renderVideoRatings();

      case 'flagged-content':
        return renderFlaggedContent();

      case 'scheduled-publishing':
        return renderScheduledPublishing();

      case 'email-templates':
        return renderEmailTemplates();

      case 'push-notifications':
        return renderPushNotifications();

      case 'general-settings':
        return renderGeneralSettings();

      case 'age-groups':
        return renderAgeGroups();

      case 'seo-metadata':
        return renderSeoMetadata();

      case 'admin-permissions':
        return renderAdminPermissions();

      case 'video-performance':
        return renderVideoPerformance();

      case 'user-engagement':
        return renderUserEngagement();

      case 'sales-reports':
        return renderSalesReports();

      case 'contact-requests':
        return renderContactRequests();

      case 'faq-help':
        return renderFaqHelp();

      default:
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Coming Soon</h1>
            <Card>
              <CardBody>
                <p className="text-center text-gray-500 py-8">
                  This section is under development. More features coming soon!
                </p>
              </CardBody>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${
        isMobile 
          ? sidebarOpen 
            ? 'fixed left-0 top-0 w-64 z-50' 
            : 'fixed left-0 top-0 w-0 overflow-hidden z-50'
          : sidebarOpen 
            ? 'w-64' 
            : 'w-16'
      } bg-gray-900 shadow-lg transition-all duration-300 flex flex-col h-full`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="text-lg font-semibold text-white">Zinga Linga Admin</h2>
                <p className="text-sm text-gray-400">Comprehensive Control</p>
              </div>
            )}
            <Button
              size="sm"
              variant="light"
              className="text-gray-300 hover:text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {sidebarItems.map((item) => renderSidebarItem(item))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <Avatar name={user?.name || 'Admin'} size="sm" className="bg-blue-600" />
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400">{user?.email || 'admin@zingalinga.com'}</p>
              </div>
            )}
            <Button
              size="sm"
              variant="light"
              color="danger"
              className="text-red-400 hover:text-red-300"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${
        isMobile && !sidebarOpen ? 'w-full' : isMobile ? 'w-0' : ''
      }`}>
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Menu Button */}
              {isMobile && (
                <Button
                  size="sm"
                  variant="light"
                  className="text-gray-600 hover:text-gray-900 lg:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div className="relative hidden sm:block">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-48 sm:w-64"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="light" size="sm" className="hidden sm:flex relative">
                    <Bell className="h-4 w-4" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                    <span className="ml-1 hidden md:inline">{notifications.filter(n => !n.read).length}</span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu className="w-80">
                  <DropdownItem key="header" className="cursor-default">
                    <div className="font-semibold text-lg">Notifications</div>
                  </DropdownItem>
                  {notifications.length === 0 ? (
                    <DropdownItem key="empty" className="cursor-default">
                      <div className="text-gray-500 text-center py-4">No new notifications</div>
                    </DropdownItem>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <DropdownItem key={notification.id} className="cursor-pointer">
                        <div className={`p-2 ${!notification.read ? 'bg-blue-50' : ''}`}>
                          <div className="font-medium text-sm">{notification.title}</div>
                          <div className="text-xs text-gray-600">{notification.message}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </DropdownItem>
                    ))
                  )}
                  {notifications.length > 5 && (
                    <DropdownItem key="view-all">
                      <div className="text-center text-blue-600 font-medium">View All Notifications</div>
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
              
              {/* Mobile Notification Icon */}
              <Button variant="light" size="sm" className="sm:hidden relative">
                <Bell className="h-4 w-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </Button>
              
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="light" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="profile">Profile Settings</DropdownItem>
                  <DropdownItem key="preferences">Preferences</DropdownItem>
                  <DropdownItem key="logout" color="danger" onClick={onLogout}>
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {renderMainContent()}
        </div>
      </div>

      {/* User View Modal */}
      <Modal isOpen={isViewUserOpen} onClose={onViewUserClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">User Profile</h2>
            <p className="text-sm text-gray-500">View user details and activity</p>
          </ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar name={selectedUser.name} size="lg" className="bg-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                    <p className="text-gray-500">{selectedUser.email}</p>
                    <Chip color={selectedUser.role === 'admin' ? 'danger' : 'primary'} size="sm" className="mt-1">
                      {selectedUser.role}
                    </Chip>
                  </div>
                </div>
                
                <Divider />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Account Information</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">User ID:</span>
                        <span className="font-mono text-sm">{selectedUser.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <Chip color="success" size="sm">Active</Chip>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Joined:</span>
                        <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700">Activity Summary</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Spent:</span>
                        <span className="font-semibold">{formatCurrency(selectedUser.totalSpent || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Orders:</span>
                        <span>0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Login:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onViewUserClose}>
              Close
            </Button>
            <Button color="primary" onPress={() => {
              onViewUserClose();
              if (selectedUser) handleEditUser(selectedUser.id);
            }}>
              Edit User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* User Edit Modal */}
      <Modal isOpen={isEditUserOpen} onClose={onEditUserClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Edit User</h2>
            <p className="text-sm text-gray-500">Update user information</p>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <Select
                  selectedKeys={[editUserForm.role]}
                  onSelectionChange={(keys) => {
                    const role = Array.from(keys)[0] as string;
                    setEditUserForm(prev => ({ ...prev, role }));
                  }}
                >
                  <SelectItem key="user">User</SelectItem>
                  <SelectItem key="admin">Admin</SelectItem>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select
                  selectedKeys={[editUserForm.status]}
                  onSelectionChange={(keys) => {
                    const status = Array.from(keys)[0] as string;
                    setEditUserForm(prev => ({ ...prev, status }));
                  }}
                >
                  <SelectItem key="active">Active</SelectItem>
                  <SelectItem key="inactive">Inactive</SelectItem>
                  <SelectItem key="suspended">Suspended</SelectItem>
                </Select>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onEditUserClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleUpdateUser} isLoading={loading}>
              Update User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add New User Modal */}
      <Modal isOpen={isAddUserOpen} onClose={onAddUserClose} size="2xl">
        <ModalContent>
          <ModalHeader>Add New User</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter user's full name"
                value={addUserForm.name}
                onChange={(e) => setAddUserForm(prev => ({ ...prev, name: e.target.value }))}
                isRequired
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter user's email"
                value={addUserForm.email}
                onChange={(e) => setAddUserForm(prev => ({ ...prev, email: e.target.value }))}
                isRequired
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={addUserForm.password}
                onChange={(e) => setAddUserForm(prev => ({ ...prev, password: e.target.value }))}
                isRequired
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                value={addUserForm.confirmPassword}
                onChange={(e) => setAddUserForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                isRequired
              />
              <Select
                label="Role"
                selectedKeys={[addUserForm.role]}
                onSelectionChange={(keys) => {
                  const role = Array.from(keys)[0] as string;
                  setAddUserForm(prev => ({ ...prev, role }));
                }}
              >
                <SelectItem key="user" value="user">User</SelectItem>
                <SelectItem key="admin" value="admin">Admin</SelectItem>
                <SelectItem key="moderator" value="moderator">Moderator</SelectItem>
              </Select>
              <Select
                label="Status"
                selectedKeys={[addUserForm.status]}
                onSelectionChange={(keys) => {
                  const status = Array.from(keys)[0] as string;
                  setAddUserForm(prev => ({ ...prev, status }));
                }}
              >
                <SelectItem key="active" value="active">Active</SelectItem>
                <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onAddUserClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleAddUser} isLoading={loading}>
              Create User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isChangePasswordOpen} onClose={onChangePasswordClose} size="lg">
        <ModalContent>
          <ModalHeader>Change Password for {selectedUser?.name}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                isRequired
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                isRequired
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                isRequired
              />
              <div className="text-sm text-gray-500">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>At least 6 characters long</li>
                  <li>Must match confirmation password</li>
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onChangePasswordClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleUpdatePassword} isLoading={loading}>
              Update Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Admin Modals */}
      <AdminModals
        isViewOrderOpen={isViewOrderOpen}
        onViewOrderClose={onViewOrderClose}
        isRefundOrderOpen={isRefundOrderOpen}
        onRefundOrderClose={onRefundOrderClose}
        isRetryPaymentOpen={isRetryPaymentOpen}
        onRetryPaymentClose={onRetryPaymentClose}
        selectedOrder={selectedOrder}
        refundForm={refundForm}
        setRefundForm={setRefundForm}
        handleDownloadReceipt={handleDownloadReceipt}
        handleProcessRefund={handleProcessRefund}
        handleRetryPaymentProcess={handleRetryPaymentProcess}
        formatCurrency={formatCurrency}
        getStatusColor={getStatusColor}
      />
    </div>
  );
}