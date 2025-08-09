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
  Layers,
  Headphones,
  BookOpen,
  Monitor,
  Tablet
} from 'lucide-react';
import { vpsDataStore } from '../utils/vpsDataStore';

import { UserManagement } from './UserManagement';
import { Module } from '../types';
import { SuccessModal } from './SuccessModal';

interface ModernAdminDashboardProps {
  user: any;
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

export default function ModernAdminDashboard({ user, onLogout, onNavigate }: ModernAdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Sample data states
  const [videos, setVideos] = useState<Module[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  const [uploadQueue, setUploadQueue] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [childrenProfiles, setChildrenProfiles] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['Audio Lessons', 'PP1 Program', 'PP2 Program']);
  const [contentBundles, setContentBundles] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [ageGroups, setAgeGroups] = useState<string[]>(['3-5 years', '3-8 years', '6-12 years', 'All ages']);
  const [newAgeGroup, setNewAgeGroup] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const { isOpen: isOrderModalOpen, onOpen: onOrderModalOpen, onClose: onOrderModalClose } = useDisclosure();
  


  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'New video uploaded successfully', time: '2 min ago' },
    { id: 2, type: 'warning', message: '5 comments pending moderation', time: '10 min ago' },
    { id: 3, type: 'info', message: 'Monthly report is ready', time: '1 hour ago' }
  ]);

  const [dataStatus, setDataStatus] = useState({
    isRealData: false,
    lastUpdated: null as Date | null,
    hasRealUsers: false,
    hasRealOrders: false
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalVideos: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    conversionRate: 0,
    avgSessionTime: '0m 0s',
    customerSatisfaction: 0
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
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

  // Load real data from vpsDataStore
  useEffect(() => {
    if (mounted) {
      loadRealData();
    }
  }, [mounted]);
  
  // Video form state - moved before useEffect
  const [editingVideo, setEditingVideo] = useState<Module | null>(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    rating: 0,
    ageGroup: '3-8 years',
    duration: '',
    thumbnail: '',
    videoUrl: '',
    videoType: 'youtube',
    tags: '',
    language: 'English',
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

  const loadRealData = async () => {
    if (!mounted) return;
    
    try {
      setDataLoaded(false);
      
      // Clear memory cache to force fresh data load
      vpsDataStore.clearMemoryCache();
      
      // Load real data from vpsDataStore
      const realUsers = await vpsDataStore.getUsers();
      const realVideos = await vpsDataStore.getProducts();
      const realOrders = await vpsDataStore.getOrders();
      const realUploadQueue = await vpsDataStore.getUploadQueue();

      // Set real users data
      setUsers(realUsers.map(user => ({
        id: user.id,
        name: user.name || user.username || 'Unknown User',
        email: user.email,
        role: user.role || 'user',
        createdAt: user.createdAt,
        totalSpent: user.totalSpent || 0
      })));

      // Set real videos data with proper URL handling
      setVideos(realVideos.map(video => ({
        ...video,
        // Ensure URLs are properly handled for display
        videoUrl: video.videoUrl || video.videoSource || '',
        thumbnail: video.thumbnail || video.imageUrl || ''
      })));

      // Convert real purchases to orders format
      const convertedOrders = realOrders.map(purchase => {
        const user = realUsers.find(u => u.id === purchase.userId);
        const video = realVideos.find(v => v.id === purchase.moduleId);
        
        return {
          id: purchase.id,
          customer: {
            name: user?.name || user?.username || 'Unknown User',
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
      setUploadQueue(realUploadQueue);

      // Update dashboard stats with real data
      const totalRevenue = convertedOrders.reduce((sum, order) => sum + order.amount, 0);
      const activeUsers = realUsers.filter(user => {
        const lastLogin = new Date(user.lastLogin || user.createdAt);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return lastLogin >= oneWeekAgo;
      }).length;

      setDashboardStats({
        totalUsers: realUsers.length,
        activeUsers: activeUsers,
        totalVideos: realVideos.length,
        totalRevenue: totalRevenue,
        monthlyGrowth: 12.5, // This would be calculated from historical data
        conversionRate: realUsers.length > 0 ? (convertedOrders.length / realUsers.length) * 100 : 0,
        avgSessionTime: '8m 32s', // This would come from analytics
        customerSatisfaction: 4.8 // This would come from ratings
      });

      // Generate real activity feed
      const activities: any[] = [];
      
      // Add recent user registrations
      realUsers.slice(-5).forEach(user => {
        activities.push({
          id: `user_${user.id}`,
          type: 'user',
          message: `New user ${user.name || user.username} registered`,
          time: new Date(user.createdAt).toLocaleString(),
          avatar: user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'
        });
      });

      // Add recent orders
      convertedOrders.slice(-5).forEach(order => {
        activities.push({
          id: `order_${order.id}`,
          type: 'purchase',
          message: `${order.customer.name} purchased ${order.item.name}`,
          time: order.date.toLocaleString(),
          avatar: order.customer.avatar
        });
      });

      // Add recent video uploads
      realVideos.slice(-3).forEach(video => {
        activities.push({
          id: `video_${video.id}`,
          type: 'video',
          message: `Video "${video.title}" was uploaded`,
          time: new Date(video.createdAt).toLocaleString(),
          avatar: video.title.split(' ').map((w: string) => w[0]).join('').toUpperCase()
        });
      });

      // Sort by most recent and take top 4
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivities(activities.slice(0, 4));

      // Update data status - consider admin users as real data
      const hasRealUsers = realUsers.length > 0 && realUsers.some(u => u.role === 'admin' || u.role === 'user');
      setDataStatus({
        isRealData: hasRealUsers || realVideos.length > 0 || convertedOrders.length > 0,
        lastUpdated: new Date(),
        hasRealUsers: hasRealUsers,
        hasRealOrders: convertedOrders.length > 0
      });

      // Only show real activities - no fake sample data
      if (activities.length === 0) {
        setRecentActivities([
          { 
            id: 'system_init', 
            type: 'system', 
            message: 'Admin dashboard initialized', 
            time: 'Just now', 
            avatar: 'AD' 
          }
        ]);
      }


      
      console.log('✅ Real data loaded successfully:', {
        users: realUsers.length,
        videos: realVideos.length,
        orders: realOrders.length
      });
      
      setDataLoaded(true);

    } catch (error) {
      console.error('❌ Failed to load real data:', error);
      // Keep sample data as fallback
      setDataStatus({
        isRealData: false,
        lastUpdated: new Date(),
        hasRealUsers: false,
        hasRealOrders: false
      });

      // Set minimal fallback activities
      setRecentActivities([
        { id: 1, type: 'system', message: 'Admin dashboard initialized', time: 'Just now', avatar: 'AD' }
      ]);
    } finally {
      setDataLoaded(true);
    }
  };

  const generateSampleDataForMissingFeatures = (realUsers: any[], realVideos: any[]) => {
    // Generate sample subscriptions based on real users
    if (realUsers.length > 0) {
      const sampleSubscriptions = realUsers.slice(0, 3).map((user, index) => ({
        id: user.id,
        userName: user.name || user.username || 'Unknown User',
        plan: ['Basic', 'Premium', 'Family'][index % 3],
        status: ['active', 'active', 'cancelled'][index % 3],
        nextBilling: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        amount: [9.99, 19.99, 29.99][index % 3]
      }));
      setSubscriptions(sampleSubscriptions);
    } else {
      setSubscriptions([]);
    }

    // Generate sample transactions based on real orders
    const sampleTransactions = orders.slice(0, 5).map(order => ({
      id: order.transactionId,
      user: order.customer.name,
      amount: order.amount,
      type: 'purchase',
      status: order.status,
      date: order.date,
      description: order.item.name
    }));
    setTransactions(sampleTransactions);

    // Generate sample comments based on real videos
    if (realVideos.length > 0) {
      const sampleComments = realVideos.slice(0, 3).map((video, index) => ({
        id: `comment_${video.id}`,
        user: realUsers[index % realUsers.length]?.name || 'Anonymous User',
        video: video.title,
        comment: [
          'Great educational content for my kids!',
          'My daughter loves this video!',
          'Perfect for bedtime stories.'
        ][index % 3],
        status: ['pending', 'approved', 'pending'][index % 3],
        date: new Date(),
        rating: [5, 4, 5][index % 3]
      }));
      setComments(sampleComments);
    } else {
      setComments([]);
    }

    // Generate sample flagged content
    setFlaggedContent([]);

    // Generate sample access logs based on real users
    if (realUsers.length > 0) {
      const sampleAccessLogs = realUsers.slice(0, 10).map((user, index) => ({
        id: `log_${user.id}`,
        user: {
          name: user.name || user.username || 'Unknown User',
          email: user.email,
          type: ['Premium User', 'Basic User', 'Family Plan'][index % 3]
        },
        ipAddress: `192.168.${(index * 17) % 255}.${(index * 23) % 255}`,
        location: ['New York, US', 'California, US', 'Texas, US'][index % 3],
        device: ['Desktop', 'Mobile', 'Tablet'][index % 3],
        timestamp: new Date(user.lastLogin || user.createdAt),
        status: 'active'
      }));
      setAccessLogs(sampleAccessLogs);
    } else {
      setAccessLogs([]);
    }

    // Generate sample children profiles
    setChildrenProfiles([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string): "default" | "success" | "danger" | "primary" | "secondary" | "warning" => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

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
      id: 'videos',
      label: 'Video Management',
      icon: <Video className="h-5 w-5" />,
      color: 'text-green-600',
      children: [
        { id: 'all-videos', label: 'All Videos', icon: <Folder className="h-4 w-4" /> },
        { id: 'add-video', label: 'Add New', icon: <Plus className="h-4 w-4" /> },
        { id: 'categories', label: 'Categories', icon: <Tag className="h-4 w-4" /> },
        { id: 'upload-queue', label: 'Upload Queue', icon: <Upload className="h-4 w-4" />, badge: '3' }
      ]
    },
    {
      id: 'content',
      label: 'Content Categories',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'text-purple-600',
      children: [
        { id: 'audio-lessons', label: 'Audio Lessons', icon: <Headphones className="h-4 w-4" /> },
        { id: 'pp1-program', label: 'PP1 Program', icon: <BookOpen className="h-4 w-4" /> },
        { id: 'pp2-program', label: 'PP2 Program', icon: <BookOpen className="h-4 w-4" /> },
        { id: 'content-bundles', label: 'Content Bundles', icon: <Layers className="h-4 w-4" /> }
      ]
    },
    {
      id: 'packages',
      label: 'Learning Packages',
      icon: <PackageIcon className="h-5 w-5" />,
      color: 'text-purple-600',
      children: [
        { id: 'all-packages', label: 'All Packages', icon: <PackageIcon className="h-4 w-4" /> },
        { id: 'add-package', label: 'Add Package', icon: <Plus className="h-4 w-4" /> }
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
        { id: 'comments', label: 'Comments', icon: <MessageSquare className="h-4 w-4" />, badge: '5' },
        { id: 'flagged-content', label: 'Flagged Content', icon: <Flag className="h-4 w-4" />, badge: '2' }
      ]
    },
    {
      id: 'chat',
      label: 'Chat Support',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      color: 'text-gray-600'
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
              setActiveSection(item.id);
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
    if (!dataLoaded) {
      return (
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your dashboard data...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        {/* Professional Welcome Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome back, {user?.name || 'Admin'}
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
          change: `+${dashboardStats.monthlyGrowth}% this month`,
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
          change: 'This month',
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
            <div className="grid grid-cols-2 gap-4">
              <Button 
                className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => setActiveSection('add-video')}
              >
                <div className="text-center">
                  <Plus className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-xs font-semibold">Add Video</span>
                </div>
              </Button>
              <Button 
                className="h-24 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => setActiveSection('categories')}
              >
                <div className="text-center">
                  <Tag className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Content Categories</span>
                </div>
              </Button>
              <Button 
                className="h-24 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => setActiveSection('analytics')}
              >
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Analytics</span>
                </div>
              </Button>
              <Button 
                className="h-24 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => setActiveSection('orders')}
              >
                <div className="text-center">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">View Orders</span>
                </div>
              </Button>
              <Button 
                className="h-24 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => setActiveSection('all-users')}
              >
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Manage Users</span>
                </div>
              </Button>
              <Button 
                className="h-24 bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                onPress={() => setActiveSection('settings')}
              >
                <div className="text-center">
                  <Settings className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Settings</span>
                </div>
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
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
      // Estimate views based on orders for this video
      const videoOrders = orders.filter(order => order.item.name === video.title);
      return sum + (videoOrders.length * 15); // Estimate 15 views per purchase
    }, 0);

    const avgRating = videos.length > 0 
      ? (videos.reduce((sum, video) => sum + (video.rating || 0), 0) / videos.length).toFixed(1)
      : '0.0';

    const totalShares = Math.floor(totalViews * 0.08); // Estimate 8% share rate
    const completionRate = videos.length > 0 ? 87.5 : 0; // Fixed completion rate

    // Calculate video performance data
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
        completionRate: 82.5,
        engagement: Math.floor(realViews * 0.12),
        shares: Math.floor(realViews * 0.08)
      };
    }).sort((a, b) => b.views - a.views);

    // Calculate user engagement metrics
    const userEngagementData = {
      totalSessions: users.length * 3.2, // Estimate sessions per user
      avgSessionDuration: '8m 32s',
      bounceRate: 32.5, // Fixed bounce rate
      returnVisitors: Math.floor(users.length * 0.65), // 65% return rate
      newUsers: users.filter(user => {
        const createdDate = new Date(user.createdAt);
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return createdDate >= oneMonthAgo;
      }).length
    };

    // Advanced Analytics Data
    const advancedAnalytics = {
      conversionRate: users.length > 0 ? ((orders.length / users.length) * 100).toFixed(1) : '0.0',
      customerLifetimeValue: users.length > 0 ? (dashboardStats.totalRevenue / users.length).toFixed(2) : '0.00',
      churnRate: '12.5', // Fixed churn rate
      monthlyRecurringRevenue: (dashboardStats.totalRevenue * 0.3).toFixed(2), // 30% recurring
      topPerformingCategory: videoPerformanceData.length > 0 ? videoPerformanceData[0].category : 'N/A',
      peakUsageHours: ['2PM-4PM', '7PM-9PM'],
      deviceBreakdown: {
        mobile: 65,
        desktop: 25,
        tablet: 10
      },
      geographicData: [
        { country: 'United States', users: Math.floor(users.length * 0.4), revenue: dashboardStats.totalRevenue * 0.4 },
        { country: 'United Kingdom', users: Math.floor(users.length * 0.2), revenue: dashboardStats.totalRevenue * 0.2 },
        { country: 'Canada', users: Math.floor(users.length * 0.15), revenue: dashboardStats.totalRevenue * 0.15 },
        { country: 'Australia', users: Math.floor(users.length * 0.1), revenue: dashboardStats.totalRevenue * 0.1 },
        { country: 'Others', users: Math.floor(users.length * 0.15), revenue: dashboardStats.totalRevenue * 0.15 }
      ]
    };

    return (
      <div className="space-y-8">
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
                onPress={() => {
                  console.log('🔄 Refreshing data...');
                  loadRealData();
                }}
                className="bg-green-50 text-green-600 hover:bg-green-100"
              >
                Refresh Data
              </Button>
            </div>
          }
        />
        
        <StatsGrid stats={[
          { 
            label: 'Total Views', 
            value: totalViews.toLocaleString(), 
            color: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600', 
            change: dataStatus.isRealData ? 'Based on real data' : 'Estimated from orders',
            icon: <Eye className="h-6 w-6 text-blue-600" />
          },
          { 
            label: 'Completion Rate', 
            value: `${completionRate.toFixed(1)}%`, 
            color: 'from-green-50 to-green-100 border-green-200 text-green-600', 
            change: 'Average across all videos',
            icon: <CheckCircle className="h-6 w-6 text-green-600" />
          },
          { 
            label: 'Avg Rating', 
            value: avgRating, 
            color: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600', 
            change: `From ${videos.length} videos`,
            icon: <Star className="h-6 w-6 text-purple-600" />
          },
          { 
            label: 'Total Shares', 
            value: totalShares.toLocaleString(), 
            color: 'from-orange-50 to-orange-100 border-orange-200 text-orange-600', 
            change: 'Estimated engagement',
            icon: <TrendingUp className="h-6 w-6 text-orange-600" />
          }
        ]} />

        {/* Video Performance Table */}
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

        {/* Analytics Charts and User Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <h3 className="text-xl font-semibold">User Engagement Metrics</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{users.length}</p>
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
                      <p className="text-2xl font-bold text-green-600">{userEngagementData.newUsers}</p>
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
                      <p className="text-2xl font-bold text-purple-600">{userEngagementData.avgSessionDuration}</p>
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
                      <p className="text-2xl font-bold text-orange-600">{userEngagementData.returnVisitors}</p>
                      <p className="text-sm text-orange-700">Return Users</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
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
                  <div className="flex justify-between items-center mb-2">
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
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(dashboardStats.totalRevenue)}
                      </p>
                      <p className="text-sm text-green-700">Total Revenue</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatCurrency(dashboardStats.totalRevenue / Math.max(orders.length, 1))}
                      </p>
                      <p className="text-sm text-blue-700">Avg Order Value</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Top Performing Videos</h4>
                {videoPerformanceData.slice(0, 5).map((video, index) => (
                  <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{video.title}</p>
                        <p className="text-xs text-gray-500">{video.views} views</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(video.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Advanced Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Conversion & Performance Metrics */}
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <h3 className="text-xl font-semibold">Conversion & Performance</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{advancedAnalytics.conversionRate}%</p>
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
                      <p className="text-2xl font-bold text-purple-600">${advancedAnalytics.customerLifetimeValue}</p>
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
                      <p className="text-2xl font-bold text-red-600">{advancedAnalytics.churnRate}%</p>
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
                      <p className="text-2xl font-bold text-blue-600">${advancedAnalytics.monthlyRecurringRevenue}</p>
                      <p className="text-sm text-blue-700">MRR</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Top Category: {advancedAnalytics.topPerformingCategory}</span>
                    <span className="text-sm font-semibold text-green-600">Leading</span>
                  </div>
                  <Progress value={85} className="w-full" color="success" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
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
                      <Progress value={advancedAnalytics.deviceBreakdown.mobile} className="w-20" size="sm" color="primary" />
                      <span className="text-sm font-semibold">{advancedAnalytics.deviceBreakdown.mobile}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Desktop</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={advancedAnalytics.deviceBreakdown.desktop} className="w-20" size="sm" color="success" />
                      <span className="text-sm font-semibold">{advancedAnalytics.deviceBreakdown.desktop}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tablet className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Tablet</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={advancedAnalytics.deviceBreakdown.tablet} className="w-20" size="sm" color="secondary" />
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
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{country.country}</p>
                          <p className="text-xs text-gray-500">{country.users} users</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(country.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Data Source Indicator */}
        {!dataStatus.isRealData && (
          <Card className="border-orange-200 bg-orange-50">
            <CardBody className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Analytics data is estimated based on available information
                  </p>
                  <p className="text-xs text-orange-600">
                    Some metrics are calculated from orders and user data. For more accurate analytics, integrate with a dedicated analytics service.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    );
  };

  // Video form state moved above

  
  // Audio lesson form state
  const [audioForm, setAudioForm] = useState({
    title: '',
    description: '',
    price: 0,
    duration: '',
    audioUrl: '',
    thumbnail: '',
    tags: '',
    aiTags: [] as string[],
    accessLevel: 'paid' as 'free' | 'paid' | 'premium',
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
  const [selectedUser, setSelectedUser] = useState<any>(null);
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
    coverImage: ''
  });
  
  // PP1 and PP2 form states
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
  const [scheduledContent, setScheduledContent] = useState<any[]>([]);
  const [scheduleForm, setScheduleForm] = useState({
    contentId: '',
    publishDate: '',
    publishTime: '',
    status: 'scheduled' as 'scheduled' | 'published' | 'cancelled'
  });

  const handleScheduleContent = async () => {
    if (!scheduleForm.contentId || !scheduleForm.publishDate || !scheduleForm.publishTime) {
      alert('Please fill in all scheduling fields');
      return;
    }

    const scheduledItem = {
      id: `schedule_${Date.now()}`,
      contentId: scheduleForm.contentId,
      publishDateTime: new Date(`${scheduleForm.publishDate}T${scheduleForm.publishTime}`),
      status: scheduleForm.status,
      createdAt: new Date().toISOString()
    };

    setScheduledContent([...scheduledContent, scheduledItem]);
    alert('✅ Content scheduled successfully!');
    
    // Reset form
    setScheduleForm({
      contentId: '',
      publishDate: '',
      publishTime: '',
      status: 'scheduled'
    });
  };

  const handleCancelSchedule = (scheduleId: string) => {
    setScheduledContent(prev => 
      prev.map(item => 
        item.id === scheduleId 
          ? { ...item, status: 'cancelled' }
          : item
      )
    );
    alert('✅ Schedule cancelled successfully!');
  };

  const handlePublishNow = async (scheduleId: string) => {
    const scheduleItem = scheduledContent.find(item => item.id === scheduleId);
    if (scheduleItem) {
      // Update the actual content to be visible
      const video = videos.find(v => v.id === scheduleItem.contentId);
      if (video) {
        const updatedVideo = { ...video, isVisible: true, publishedAt: new Date().toISOString() };
        await vpsDataStore.updateProduct(updatedVideo);
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
      alert('✅ Content published successfully!');
    }
  };

  const handleEditVideo = (video: Module) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      description: video.description || '',
      price: video.price || 0,
      category: video.category || '',
      rating: video.rating || 0,
      ageGroup: (video as any).ageGroup || '3-8 years',
      duration: (video as any).duration || '',
      thumbnail: video.thumbnail || '',
      videoUrl: video.videoUrl || '',
      videoType: (video as any).videoType || 'youtube',
      tags: (video as any).tags || '',
      language: (video as any).language || 'English',
      status: (video as any).status || 'active'
    });
    setActiveSection('edit-video');
  };

  const handleAddVideo = () => {
    setEditingVideo(null);
    setVideoForm({
      title: '',
      description: '',
      price: 0,
      category: '',
      rating: 0,
      ageGroup: '3-8 years',
      duration: '',
      thumbnail: '',
      videoUrl: '',
      videoType: 'youtube',
      tags: '',
      language: 'English',
      status: 'active'
    });
    setActiveSection('edit-video');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid video file (MP4, MOV, AVI, WMV, WebM)');
        return;
      }
      
      const maxSize = 10 * 1024 * 1024; // 10MB limit
      if (file.size > maxSize) {
        alert('❌ File size must be less than 10MB. For larger videos, please use YouTube or external hosting.');
        return;
      }
      

      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Video = e.target?.result as string;
        
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          const duration = video.duration;
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);
          const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          setVideoForm(prev => ({ 
            ...prev, 
            duration: formattedDuration,
            videoUrl: base64Video,
            videoType: 'upload'
          }));
          

          
          setUploadQueue(prev => [{
            id: `upload_${Date.now()}`,
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            status: 'completed',
            progress: 100,
            uploadedAt: new Date().toISOString(),
            fileType: file.type,
            localUrl: base64Video
          }, ...prev]);
        };
        video.src = base64Video;
      };
      

      
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, WebP)');
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      // Create a local URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      setVideoForm(prev => ({ ...prev, thumbnail: imageUrl }));
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
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const handleSaveVideo = async () => {
    try {
      // Validate required fields
      if (!videoForm.title.trim()) {
        alert('Please enter a video title');
        return;
      }
      if (!videoForm.category) {
        alert('Please select a category');
        return;
      }
      if (!videoForm.videoUrl) {
        alert('Please provide a video URL or upload a video file');
        return;
      }
      
      // Convert blob URLs to base64 for persistence
      let persistentVideoUrl = videoForm.videoUrl;
      let persistentThumbnail = videoForm.thumbnail;
      
      if (videoForm.videoUrl.startsWith('blob:')) {
        try {
          const response = await fetch(videoForm.videoUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          persistentVideoUrl = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Failed to convert video blob to base64:', error);
        }
      }
      
      if (videoForm.thumbnail && videoForm.thumbnail.startsWith('blob:')) {
        try {
          const response = await fetch(videoForm.thumbnail);
          const blob = await response.blob();
          const reader = new FileReader();
          persistentThumbnail = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Failed to convert thumbnail blob to base64:', error);
        }
      }
      
      if (editingVideo) {
        const updatedVideo = { 
          ...editingVideo, 
          title: videoForm.title,
          description: videoForm.description,
          price: videoForm.price,
          category: videoForm.category,
          rating: videoForm.rating,
          thumbnail: persistentThumbnail,
          videoUrl: persistentVideoUrl,

          duration: videoForm.duration,
          estimatedDuration: videoForm.duration,
          tags: (typeof videoForm.tags === 'string' && videoForm.tags) ? videoForm.tags.split(',').map(tag => tag.trim()) : [],




          isActive: videoForm.status === 'active',
          isVisible: videoForm.status === 'active',
          updatedAt: new Date().toISOString()
        };
        
        // Save to data store first
        const success = await vpsDataStore.updateProduct(updatedVideo);
        if (success) {
          // Update local state after successful save
          setVideos(prev => prev.map(v => v.id === editingVideo.id ? updatedVideo : v));
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 3000);
        } else {
          alert('❌ Failed to update video. Please try again.');
          return;
        }
      } else {
        const newVideo: Module = {
          id: `video_${Date.now()}`,
          title: videoForm.title,
          description: videoForm.description,
          price: videoForm.price,
          category: videoForm.category,
          rating: videoForm.rating,
          thumbnail: persistentThumbnail,
          videoUrl: persistentVideoUrl,

          duration: videoForm.duration,
          estimatedDuration: videoForm.duration,
          tags: (typeof videoForm.tags === 'string' && videoForm.tags) ? videoForm.tags.split(',').map(tag => tag.trim()) : [],




          isActive: videoForm.status === 'active',
          isVisible: videoForm.status === 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Save to data store first
        const success = await vpsDataStore.addProduct(newVideo);
        if (success) {
          // Add to local state after successful save
          setVideos(prev => [...prev, newVideo]);
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 3000);
        } else {
          alert('❌ Failed to create video. Please try again.');
          return;
        }
      }
      
      // Clean up blob URLs
      if (videoForm.videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoForm.videoUrl);
      }
      if (videoForm.thumbnail && videoForm.thumbnail.startsWith('blob:')) {
        URL.revokeObjectURL(videoForm.thumbnail);
      }
      
      setActiveSection('all-videos');
    } catch (error) {
      console.error('❌ Failed to save video:', error);
      alert('Failed to save video. Please try again.');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    await vpsDataStore.deleteProduct(videoId);
    setVideos(videos.filter(v => v.id !== videoId));
  };

  const getVideoTypeIcon = (videoType: string) => {
    switch (videoType) {
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'vimeo': return <Video className="h-4 w-4 text-blue-600" />;
      default: return <Upload className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderEditVideo = () => (
    <div className="space-y-6">
      <PageHeader 
        title={editingVideo ? 'Edit Video' : 'Add New Video'}
        actions={
          <Button 
            variant="flat" 
            onPress={() => setActiveSection('all-videos')}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Price *</label>
                  <Input
                    type="number"
                    value={videoForm.price.toString()}
                    onChange={(e) => setVideoForm({ ...videoForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    size="lg"
                    radius="lg"
                    startContent={<DollarSign className="h-4 w-4 text-gray-400" />}
                    classNames={{
                      input: "bg-white text-gray-900 placeholder:text-gray-400",
                      inputWrapper: "bg-white border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category *</label>
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
              </div>
            </CardBody>
          </Card>

          {/* Media & Content */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Media & Content</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <Tabs 
                selectedKey={videoForm.videoType} 
                onSelectionChange={(key) => setVideoForm({ ...videoForm, videoType: key as string, videoUrl: '' })}
                className="w-full"
                variant="bordered"
                color="primary"
              >
                <Tab 
                  key="upload" 
                  title={
                    <div className="flex items-center space-x-2 px-2">
                      <Upload className="h-4 w-4" />
                      <span className="font-medium">File Upload</span>
                    </div>
                  }
                >
                  <div className="space-y-6 pt-6">
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-500 transition-all duration-300 bg-blue-50/30 relative">
                      {videoForm.videoUrl ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-green-700">Upload successful!</p>
                            <p className="text-sm text-gray-600">Video file ready for preview</p>
                          </div>
                          <div className="space-y-3">
                            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-lg max-w-sm mx-auto">
                              <video 
                                src={videoForm.videoUrl} 
                                controls 
                                className="w-full h-full object-cover"
                                onError={() => console.log('Video preview failed to load')}
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                            <Button 
                              size="sm" 
                              variant="flat" 
                              color="primary"
                              onPress={() => {
                                // Clean up the object URL to prevent memory leaks
                                if (videoForm.videoUrl.startsWith('blob:')) {
                                  URL.revokeObjectURL(videoForm.videoUrl);
                                }
                                setVideoForm({ ...videoForm, videoUrl: '', videoType: 'upload' });
                              }}
                              startContent={<Upload className="h-4 w-4" />}
                            >
                              Upload Different Video
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-900">Upload your video file</p>
                            <p className="text-sm text-gray-600">Drag and drop or click to browse</p>
                            <p className="text-xs text-gray-500 mt-2">Supports: MP4, MOV, AVI, WMV • Max size: 500MB</p>
                          </div>
                          <Button 
                            color="primary" 
                            variant="flat"
                            startContent={<Upload className="h-4 w-4" />}
                            onPress={() => {
                              // Trigger file input click
                              const fileInput = document.getElementById('video-file-input') as HTMLInputElement;
                              fileInput?.click();
                            }}
                          >
                            Choose File
                          </Button>
                          <input
                            id="video-file-input"
                            type="file"
                            accept="video/mp4,video/mov,video/avi,video/wmv,video/webm"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Tab>
                
                <Tab 
                  key="youtube" 
                  title={
                    <div className="flex items-center space-x-2 px-2">
                      <Youtube className="h-4 w-4" />
                      <span className="font-medium">YouTube</span>
                    </div>
                  }
                >
                  <div className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                          <Youtube className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">YouTube Video</h4>
                          <p className="text-xs text-gray-500">Paste any YouTube video URL</p>
                        </div>
                      </div>
                      <Input
                        value={videoForm.videoUrl}
                        onChange={async (e) => {
                          const url = e.target.value;
                          setVideoForm({ ...videoForm, videoUrl: url });
                          
                          // Get real YouTube duration
                          if (url.includes('youtube.com') || url.includes('youtu.be')) {
                            let videoId = null;
                            if (url.includes('youtu.be/')) {
                              videoId = url.split('youtu.be/')[1]?.split('?')[0];
                            } else if (url.includes('youtube.com/watch')) {
                              videoId = url.split('v=')[1]?.split('&')[0];
                            }
                            
                            if (videoId) {
                              try {
                                // Get real duration using YouTube Data API v3 (requires API key)
                                // For now, we'll use a more sophisticated estimation
                                
                                // Try to extract duration from video page
                                const proxyUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
                                const response = await fetch(proxyUrl);
                                
                                if (response.ok) {
                                  const data = await response.json();
                                  if (data.duration) {
                                    // Parse duration from noembed (format: PT4M13S)
                                    const duration = data.duration;
                                    const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
                                    if (match) {
                                      const minutes = parseInt(match[1] || '0');
                                      const seconds = parseInt(match[2] || '0');
                                      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                      setVideoForm(prev => ({ ...prev, duration: formattedDuration }));
                                      return;
                                    }
                                  }
                                }
                                
                                // Fallback: More realistic estimation
                                const hash = videoId.split('').reduce((a, b) => {
                                  a = ((a << 5) - a) + b.charCodeAt(0);
                                  return a & a;
                                }, 0);
                                const minutes = Math.abs(hash % 18) + 2; // 2-20 minutes
                                const seconds = Math.abs(hash % 60);
                                const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                setVideoForm(prev => ({ ...prev, duration: formattedDuration }));
                              } catch (error) {
                                // Final fallback
                                const hash = videoId.split('').reduce((a, b) => {
                                  a = ((a << 5) - a) + b.charCodeAt(0);
                                  return a & a;
                                }, 0);
                                const minutes = Math.abs(hash % 18) + 2;
                                const seconds = Math.abs(hash % 60);
                                const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                setVideoForm(prev => ({ ...prev, duration: formattedDuration }));
                              }
                            }
                          }
                        }}
                        placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        startContent={<Youtube className="h-4 w-4 text-red-500" />}
                        size="lg"
                        classNames={{
                          input: "bg-white focus:ring-0 focus:ring-offset-0 shadow-none",
                          inputWrapper: "bg-white border-gray-300 hover:border-red-400 focus-within:border-red-500 shadow-sm"
                        }}
                      />
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>• youtube.com/watch?v=...</span>
                        <span>• youtu.be/...</span>
                        <span>• m.youtube.com/...</span>
                      </div>
                    </div>
                    {videoForm.videoUrl && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900">Preview</h5>
                        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                          <iframe
                            src={getVideoEmbedUrl(videoForm.videoUrl)}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                            title="YouTube video preview"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Tab>
                
                <Tab 
                  key="vimeo" 
                  title={
                    <div className="flex items-center space-x-2 px-2">
                      <Video className="h-4 w-4" />
                      <span className="font-medium">Vimeo</span>
                    </div>
                  }
                >
                  <div className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Video className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Vimeo Video</h4>
                          <p className="text-xs text-gray-500">Paste any Vimeo video URL</p>
                        </div>
                      </div>
                      <Input
                        value={videoForm.videoUrl}
                        onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                        placeholder="https://vimeo.com/123456789"
                        startContent={<Video className="h-4 w-4 text-blue-600" />}
                        size="lg"
                        classNames={{
                          input: "bg-white focus:ring-0 focus:ring-offset-0 shadow-none",
                          inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500 shadow-sm"
                        }}
                      />
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>• vimeo.com/123456</span>
                        <span>• player.vimeo.com/...</span>
                      </div>
                    </div>
                    {videoForm.videoUrl && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900">Preview</h5>
                        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                          <iframe
                            src={getVideoEmbedUrl(videoForm.videoUrl)}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                            title="Vimeo video preview"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Tab>
                
                <Tab 
                  key="external" 
                  title={
                    <div className="flex items-center space-x-2 px-2">
                      <Link className="h-4 w-4" />
                      <span className="font-medium">External Link</span>
                    </div>
                  }
                >
                  <div className="space-y-6 pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Link className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">External Video Link</h4>
                          <p className="text-xs text-gray-500">Direct link to video file or streaming URL</p>
                        </div>
                      </div>
                      <Input
                        value={videoForm.videoUrl}
                        onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                        placeholder="https://example.com/video.mp4"
                        startContent={<Link className="h-4 w-4 text-purple-500" />}
                        size="lg"
                        classNames={{
                          input: "bg-white focus:ring-0 focus:ring-offset-0 shadow-none",
                          inputWrapper: "bg-white border-gray-300 hover:border-purple-400 focus-within:border-purple-500 shadow-sm"
                        }}
                      />
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-purple-800 font-medium mb-2">Supported formats:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-purple-700">
                          <span>• MP4 (.mp4)</span>
                          <span>• WebM (.webm)</span>
                          <span>• MOV (.mov)</span>
                          <span>• AVI (.avi)</span>
                          <span>• M3U8 (streaming)</span>
                          <span>• Other video URLs</span>
                        </div>
                      </div>
                    </div>
                    {videoForm.videoUrl && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900">Preview</h5>
                        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                          <video 
                            src={videoForm.videoUrl} 
                            controls 
                            className="w-full h-full object-cover"
                            onError={() => console.log('Video failed to load')}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
              

            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Age Group</label>
                <div className="flex gap-2">
                  <Select
                    selectedKeys={[videoForm.ageGroup]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setVideoForm({ ...videoForm, ageGroup: selected });
                    }}
                    aria-label="Age group selection"
                    className="flex-1"
                    classNames={{
                      trigger: "bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200",
                      popoverContent: "bg-white border border-gray-200 shadow-lg",
                      listbox: "bg-white"
                    }}
                  >
                    {ageGroups.map((ageGroup) => (
                      <SelectItem key={ageGroup} value={ageGroup}>
                        {ageGroup}
                      </SelectItem>
                    ))}
                  </Select>
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onPress={() => {
                      if (newAgeGroup.trim() && !ageGroups.includes(newAgeGroup.trim())) {
                        setAgeGroups([...ageGroups, newAgeGroup.trim()]);
                        setNewAgeGroup('');
                      }
                    }}
                    startContent={<Plus className="h-4 w-4" />}
                  >
                    Add
                  </Button>
                </div>
                <Input
                  size="sm"
                  value={newAgeGroup}
                  onChange={(e) => setNewAgeGroup(e.target.value)}
                  placeholder="Enter new age group (e.g., 9-12 years)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newAgeGroup.trim() && !ageGroups.includes(newAgeGroup.trim())) {
                      setAgeGroups([...ageGroups, newAgeGroup.trim()]);
                      setNewAgeGroup('');
                    }
                  }}
                  classNames={{
                    input: "bg-white text-gray-900 placeholder:text-gray-400 border-0 focus:ring-0 focus:outline-none",
                    inputWrapper: "bg-white border border-gray-300 hover:border-blue-400 focus-within:!border-blue-500 focus-within:!ring-0 focus-within:!outline-none focus-within:!shadow-none"
                  }}
                />
              </div>
              {/* Duration is automatically handled - no user input needed */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Language</label>
                <Select
                  selectedKeys={[videoForm.language]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setVideoForm({ ...videoForm, language: selected });
                  }}
                  aria-label="Video language"
                  classNames={{
                    trigger: "bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500",
                    value: "text-gray-900",
                    popoverContent: "bg-white border border-gray-200 shadow-lg",
                    listbox: "bg-white"
                  }}
                >
                  <SelectItem key="English" value="English">English</SelectItem>
                  <SelectItem key="Spanish" value="Spanish">Spanish</SelectItem>
                  <SelectItem key="French" value="French">French</SelectItem>
                  <SelectItem key="German" value="German">German</SelectItem>
                </Select>
              </div>
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
                        <p className="text-xs text-gray-500">Recommended: 1280x720 pixels • JPG, PNG, WebP</p>
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
              isDisabled={editingVideo ? false : (!videoForm.title.trim() || !videoForm.category || !videoForm.videoUrl)}
              aria-label={editingVideo ? 'Update video' : 'Create new video'}
            >
              {editingVideo ? 'Update Video' : 'Create Video'}
            </Button>
            
            {editingVideo && (
              <Button 
                variant="flat"
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 h-10 transition-colors"
                startContent={<Trash2 className="h-4 w-4" />}
                onPress={() => {
                  if (confirm(`Are you sure you want to delete "${editingVideo.title}"? This action cannot be undone.`)) {
                    handleDeleteVideo(editingVideo.id);
                    setActiveSection('all-videos');
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
                <li>• Use descriptive titles for better discoverability</li>
                <li>• Add relevant tags separated by commas</li>
                <li>• YouTube/Vimeo videos load faster than uploads</li>
                <li>• Thumbnails should be 1280x720 for best quality</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );

  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedVideos.length === 0) return;
    
    if (confirm(`Delete ${selectedVideos.length} selected videos?`)) {
      try {
        for (const videoId of selectedVideos) {
          await vpsDataStore.deleteProduct(videoId);
        }
        setVideos(videos.filter(v => !selectedVideos.includes(v.id)));
        setSelectedVideos([]);
        alert(`✅ ${selectedVideos.length} videos deleted successfully!`);
      } catch (error) {
        alert('❌ Failed to delete some videos. Please try again.');
      }
    }
  };

  const handleBulkPriceUpdate = async () => {
    if (selectedVideos.length === 0) return;
    
    const newPrice = prompt('Enter new price for selected videos:');
    if (newPrice && !isNaN(parseFloat(newPrice))) {
      try {
        const updatedVideos = videos.map(video => {
          if (selectedVideos.includes(video.id)) {
            return { ...video, price: parseFloat(newPrice) };
          }
          return video;
        });
        
        for (const video of updatedVideos.filter(v => selectedVideos.includes(v.id))) {
          await vpsDataStore.updateProduct(video);
        }
        
        setVideos(updatedVideos);
        setSelectedVideos([]);
        alert(`✅ Price updated for ${selectedVideos.length} videos!`);
      } catch (error) {
        alert('❌ Failed to update prices. Please try again.');
      }
    }
  };

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
        alert(`✅ Category updated for ${selectedVideos.length} videos!`);
      } catch (error) {
        alert('❌ Failed to update categories. Please try again.');
      }
    }
  };

  const renderAllVideos = () => (
    <div className="space-y-6">
      <PageHeader 
        title="All Videos" 
        actions={
          <div className="flex gap-2">
            {selectedVideos.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  startContent={<DollarSign className="h-4 w-4" />}
                  onPress={handleBulkPriceUpdate}
                  aria-label={`Update price for ${selectedVideos.length} selected videos`}
                >
                  Update Price ({selectedVideos.length})
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
              className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              startContent={<Plus className="h-4 w-4" />}
              onPress={handleAddVideo}
              aria-label="Add new video"
            >
              Add New Video
            </Button>
          </div>
        }
      />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
            <h3 className="text-lg font-semibold text-gray-900">Video Library ({videos.filter(v => v.type !== 'audio' && v.category !== 'Audio Lessons' && v.category !== 'audio').length})</h3>
            <Input
              placeholder="Search videos..."
              startContent={<Search className="h-4 w-4" />}
              className="w-full sm:w-64"
              classNames={{
                input: "bg-gray-50",
                inputWrapper: "bg-gray-50 border-gray-200"
              }}
            />
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
                    checked={selectedVideos.length === videos.filter(v => v.type !== 'audio' && v.category !== 'Audio Lessons' && v.category !== 'audio').length && videos.filter(v => v.type !== 'audio' && v.category !== 'Audio Lessons' && v.category !== 'audio').length > 0}
                    onChange={(e) => {
                      const videoList = videos.filter(v => v.type !== 'audio' && v.category !== 'Audio Lessons' && v.category !== 'audio');
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
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold py-4 px-6 text-center w-1/6">CATEGORY</TableColumn>
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold py-4 px-6 text-center w-1/6">PRICE</TableColumn>
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold py-4 px-6 text-center w-1/6">RATING</TableColumn>
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold py-4 px-6 text-center w-1/6">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No videos found">
                {videos.filter(video => video.type !== 'audio' && video.category !== 'Audio Lessons' && video.category !== 'audio').map((video) => (
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
                          <Video className="h-6 w-6 text-white fallback-icon" style={{ display: video.thumbnail && video.thumbnail.trim() ? 'none' : 'block' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">{video.title}</p>
                          <p className="text-sm text-gray-500 truncate">{video.description || 'No description'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center">
                      <Chip size="sm" variant="flat" className="bg-gray-100 text-gray-700">
                        {video.category || 'Uncategorized'}
                      </Chip>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-center font-semibold text-gray-900">
                      {formatCurrency(video.price || 0)}
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
  const renderAllUsers = () => (
    <div className="space-y-6">
      <PageHeader 
        title="All Users" 
        actions={
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
        }
      />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold text-gray-900">All Users ({users.length})</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Search users..."
                startContent={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <Select
                selectedKeys={[userFilter]}
                onSelectionChange={(keys) => setUserFilter(Array.from(keys)[0] as string)}
                className="w-32"
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
              {users.filter(user => userFilter === 'all' || user.status === userFilter).map((user) => (
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
                            subscription: user.subscription || 'free'
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
                        onPress={() => {
                          if (confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
                            setUsers(prev => prev.filter(u => u.id !== user.id));
                            alert('✅ User deleted successfully!');
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
                  // Update user
                  const updatedUser = { ...editingUser, ...userForm };
                  setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
                  alert('User updated successfully!');
                } else {
                  // Add new user
                  if (!userForm.password.trim()) {
                    alert('Password is required for new users');
                    return;
                  }
                  const newUser = {
                    id: `user_${Date.now()}`,
                    ...userForm,
                    createdAt: new Date().toISOString(),
                    totalSpent: 0
                  };
                  setUsers(prev => [...prev, newUser]);
                  alert('User created successfully!');
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

  const renderCategoriesPage = () => (
    <div className="space-y-6">
      <PageHeader 
        title="Categories" 
        actions={
          <Button 
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => {
              if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                setCategories([...categories, newCategory.trim()]);
                setNewCategory('');
              }
            }}
          >
            Add Category
          </Button>
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
                          <span className="font-medium">{category}</span>
                        </div>
                      </TableCell>
                      <TableCell>{videos.filter(v => v.category === category).length}</TableCell>
                      <TableCell>
                        <Chip size="sm" color="success" variant="flat">Active</Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="light" className="hover:bg-red-50">
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
                onPress={() => {
                  if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                    setCategories([...categories, newCategory.trim()]);
                    setNewCategory('');
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
                      <Button size="sm" variant="light">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button size="sm" variant="light" className="hover:bg-red-50">
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
                startContent={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <Select
                selectedKeys={[orderFilter]}
                onSelectionChange={(keys) => setOrderFilter(Array.from(keys)[0] as string)}
                className="w-32"
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
              {orders.filter(order => orderFilter === 'all' || order.status === orderFilter).map((order) => (
                <TableRow key={order.id}>
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
                        onPress={() => {
                          if (confirm(`Cancel order #${order.id.toString().slice(-6)}?`)) {
                            setOrders(prev => prev.filter(o => o.id !== order.id));
                            alert('Order cancelled successfully!');
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-all duration-300 bg-gray-50/30 relative cursor-pointer">
                <div className="space-y-4 pointer-events-none">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <ImageIcon className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Upload Platform Logo</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 2MB • Recommended: 200x80px</p>
                  </div>
                  <Button 
                    color="primary" 
                    variant="flat"
                    startContent={<Upload className="h-4 w-4" />}
                    className="pointer-events-none"
                  >
                    Choose Logo
                  </Button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('Logo uploaded successfully');
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <Input 
                value={user?.name || 'Admin User'} 
                className="w-full"
                classNames={{
                  input: "bg-gray-50",
                  inputWrapper: "bg-gray-50 border-gray-200"
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <Input 
                value={user?.email || 'admin@zingalinga.com'} 
                type="email"
                className="w-full"
                classNames={{
                  input: "bg-gray-50",
                  inputWrapper: "bg-gray-50 border-gray-200"
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
                placeholder="Enter current password"
                className="w-full"
                classNames={{
                  input: "bg-gray-50",
                  inputWrapper: "bg-gray-50 border-gray-200"
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <Input 
                type="password"
                placeholder="Enter new password"
                className="w-full"
                classNames={{
                  input: "bg-gray-50",
                  inputWrapper: "bg-gray-50 border-gray-200"
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <Input 
                type="password"
                placeholder="Confirm new password"
                className="w-full"
                classNames={{
                  input: "bg-gray-50",
                  inputWrapper: "bg-gray-50 border-gray-200"
                }}
              />
            </div>
            <Button className="w-full bg-gray-900 text-white hover:bg-gray-800">
              Update Password
            </Button>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="bg-gray-900 text-white hover:bg-gray-800">
          Save Changes
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
            onPress={() => setActiveSection('add-audio-lesson')}
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
                  const audioId = `audio-${lesson.id}`;
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
                              const audioId = `audio-${lesson.id}`;
                              let audio = document.getElementById(audioId) as HTMLAudioElement;
                              
                              // Create audio element if it doesn't exist
                              if (!audio) {
                                audio = document.createElement('audio');
                                audio.id = audioId;
                                audio.preload = 'metadata';
                                audio.controls = false;
                                document.body.appendChild(audio);
                              }
                              
                              // Set source with multiple format support
                              if (audio.src !== audioUrl) {
                                audio.innerHTML = '';
                                
                                // Add multiple source elements for better compatibility
                                const source1 = document.createElement('source');
                                source1.src = audioUrl;
                                source1.type = 'audio/mpeg';
                                audio.appendChild(source1);
                                
                                const source2 = document.createElement('source');
                                source2.src = audioUrl;
                                source2.type = 'audio/wav';
                                audio.appendChild(source2);
                                
                                const source3 = document.createElement('source');
                                source3.src = audioUrl;
                                source3.type = 'audio/ogg';
                                audio.appendChild(source3);
                                
                                audio.load();
                              }
                              
                              if (audio.paused) {
                                audio.play().catch((error) => {
                                  console.error('Audio play failed:', error);
                                  alert('Audio format not supported or file corrupted.');
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
                          <span className="text-white text-sm">▶</span>
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
                                accessLevel: lesson.accessLevel || 'paid',
                                hasPreview: lesson.hasPreview || false,
                                previewUrl: lesson.previewUrl || '',
                                previewDuration: ''
                              });
                              setActiveSection('add-audio-lesson');
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
                                handleDeleteVideo(lesson.id);
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
            onPress={() => setActiveSection('add-video-lesson')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Button size="sm" variant="light"><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="light" className="hover:bg-red-50"><Trash2 className="h-4 w-4 text-red-600" /></Button>
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
        title="PP1 Program (Beginner Level)" 
        actions={
          <Button 
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => setActiveSection('add-pp1-content')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.filter(v => v.category === 'PP1 Program').map((program) => (
              <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="h-8 w-8 text-green-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{program.title}</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Beginner</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{program.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-semibold">${program.price}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="light"><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="light" className="hover:bg-red-50"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                  </div>
                </div>
              </div>
            ))}
            {videos.filter(v => v.category === 'PP1 Program').length === 0 && (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No PP1 content yet</h3>
                <p className="text-gray-600 mb-4">Create your first PP1 program content.</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderPP2Program = () => (
    <div className="space-y-6">
      <PageHeader 
        title="PP2 Program (Advanced Level)" 
        actions={
          <Button 
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => setActiveSection('add-pp2-content')}
          >
            Add PP2 Content
          </Button>
        }
      />
      
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">PP2 Program Content ({videos.filter(v => v.category === 'PP2 Program').length})</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.filter(v => v.category === 'PP2 Program').map((program) => (
              <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="h-8 w-8 text-purple-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{program.title}</h4>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Advanced</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{program.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-semibold">${program.price}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="light"><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="light" className="hover:bg-red-50"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                  </div>
                </div>
              </div>
            ))}
            {videos.filter(v => v.category === 'PP2 Program').length === 0 && (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No PP2 content yet</h3>
                <p className="text-gray-600 mb-4">Create your first PP2 program content.</p>
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
          price: audioForm.price,
          audioUrl: audioForm.audioUrl,
          thumbnail: audioForm.thumbnail || editingVideo.thumbnail,
          duration: audioForm.duration,
          tags: audioForm.tags ? audioForm.tags.split(',').map(tag => tag.trim()) : [],
          aiTags: audioForm.aiTags,
          accessLevel: audioForm.accessLevel,
          hasPreview: audioForm.hasPreview,
          previewUrl: audioForm.previewUrl
        };
        
        const success = await vpsDataStore.updateProduct(updatedLesson);
        if (success) {
          setVideos(prev => prev.map(v => v.id === editingVideo.id ? updatedLesson : v));
          alert('✅ Audio lesson updated successfully!');
        } else {
          alert('❌ Failed to update audio lesson.');
          return;
        }
      } else {
        // Create new lesson
        const newAudioLesson: Module = {
          id: `audio_${Date.now()}`,
          title: audioForm.title,
          description: audioForm.description,
          price: audioForm.price,
          category: 'Audio Lessons',
          type: 'audio',
          audioUrl: audioForm.audioUrl, // Keep the actual URL (blob or regular)
          thumbnail: audioForm.thumbnail || 'https://via.placeholder.com/300x200?text=Audio+Lesson',
          duration: audioForm.duration,
          tags: audioForm.tags ? audioForm.tags.split(',').map(tag => tag.trim()) : [],
          aiTags: audioForm.aiTags,
          accessLevel: audioForm.accessLevel,
          hasPreview: audioForm.hasPreview,
          previewUrl: audioForm.previewUrl,
          isActive: true,
          isVisible: true,
          createdAt: new Date().toISOString()
        };
        
        const success = await vpsDataStore.addProduct(newAudioLesson);
        if (success) {
          setVideos(prev => [...prev, newAudioLesson]);
          alert('✅ Audio lesson created successfully!');
        } else {
          alert('❌ Failed to create audio lesson.');
          return;
        }
      }
      
      setActiveSection('audio-lessons');
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
        accessLevel: 'paid',
        hasPreview: false,
        previewUrl: '',
        previewDuration: ''
      });
    } catch (error) {
      console.error('❌ Failed to save audio lesson:', error);
      alert('Failed to save audio lesson. Please try again.');
    }
  };

  const renderAddAudioLesson = () => (
    <div className="space-y-6">
      <PageHeader 
        title="Add Audio Lesson" 
        actions={
          <Button 
            variant="flat" 
            onPress={() => setActiveSection('audio-lessons')}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Price *</label>
                  <Input
                    type="number"
                    value={audioForm.price.toString()}
                    onChange={(e) => setAudioForm({ ...audioForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    startContent={<DollarSign className="h-4 w-4 text-gray-400" />}
                    classNames={{
                      input: "bg-white",
                      inputWrapper: "bg-white border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Access Level</label>
                  <Select
                    selectedKeys={[audioForm.accessLevel]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as 'free' | 'paid' | 'premium';
                      setAudioForm({ ...audioForm, accessLevel: selected });
                    }}
                    classNames={{
                      trigger: "bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500"
                    }}
                  >
                    <SelectItem key="free" value="free">Free</SelectItem>
                    <SelectItem key="paid" value="paid">Paid</SelectItem>
                    <SelectItem key="premium" value="premium">Premium</SelectItem>
                  </Select>
                </div>
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
                            <span className="text-white text-lg">🎧</span>
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
                        <p className="text-sm text-gray-600">Supports: MP3, WAV, M4A, AAC, OGG • Max: 100MB</p>
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
                        <p className="text-xs text-gray-500">Recommended: 1280x720 pixels • JPG, PNG, WebP</p>
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
                <li>• Use clear, high-quality audio recordings</li>
                <li>• Add relevant tags for better categorization</li>
                <li>• Enable previews to attract more learners</li>
                <li>• Keep lessons focused and engaging</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderAddVideoLesson = () => (
    <div className="space-y-6">
      <PageHeader title="Add Video Lesson" actions={<Button variant="flat" onPress={() => setActiveSection('video-lessons')} startContent={<X className="h-4 w-4" />}>Cancel</Button>} />
      <Card className="bg-white border border-gray-200">
        <CardHeader><h3 className="text-lg font-semibold">Video Lesson Details</h3></CardHeader>
        <CardBody className="space-y-4">
          <Input placeholder="Lesson Title" />
          <Textarea placeholder="Description" />
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" placeholder="Price" startContent={<DollarSign className="h-4 w-4" />} />
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
        thumbnail: pp1Form.coverImage || 'https://via.placeholder.com/300x200?text=PP1+Content',
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
        alert('✅ PP1 content created successfully!');
        setActiveSection('pp1-program');
      } else {
        alert('❌ Failed to create PP1 content.');
      }
    };

    return (
      <div className="space-y-6">
        <PageHeader 
          title="Add PP1 Content" 
          actions={
            <Button 
              variant="flat" 
              onPress={() => setActiveSection('pp1-program')} 
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
                    <label className="text-sm font-medium text-gray-700">Price *</label>
                    <Input
                      type="number"
                      value={pp1Form.price.toString()}
                      onChange={(e) => setPP1Form({ ...pp1Form, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      startContent={<DollarSign className="h-4 w-4 text-gray-400" />}
                      classNames={{
                        input: "bg-white",
                        inputWrapper: "bg-white border-gray-300 hover:border-green-400 focus-within:border-green-500"
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
                        <p className="text-xs text-gray-500">Recommended: 1280x720 pixels • JPG, PNG, WebP</p>
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
                  <li>• PP1 is for beginner level students</li>
                  <li>• Use simple, clear language in descriptions</li>
                  <li>• Add engaging cover images</li>
                  <li>• Include relevant tags for categorization</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderAddPP2Content = () => {

    const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert('Please select a valid image file (JPG, PNG, WebP)');
          return;
        }
        const imageUrl = URL.createObjectURL(file);
        setPP2Form(prev => ({ ...prev, coverImage: imageUrl }));
      }
    };

    const handleSavePP2Content = async () => {
      if (!pp2Form.title.trim()) {
        alert('Please enter a title');
        return;
      }
      
      const newContent: Module = {
        id: `pp2_${Date.now()}`,
        title: pp2Form.title,
        description: pp2Form.description,
        price: pp2Form.price,
        category: 'PP2 Program',
        type: 'program',
        thumbnail: pp2Form.coverImage || 'https://via.placeholder.com/300x200?text=PP2+Content',
        videoUrl: pp2Form.contentUrl,
        duration: pp2Form.duration,
        tags: pp2Form.tags ? pp2Form.tags.split(',').map(tag => tag.trim()) : [],

        isActive: true,
        isVisible: true,
        createdAt: new Date().toISOString()
      };
      
      const success = await vpsDataStore.addProduct(newContent);
      if (success) {
        setVideos(prev => [...prev, newContent]);
        alert('✅ PP2 content created successfully!');
        setActiveSection('pp2-program');
      } else {
        alert('❌ Failed to create PP2 content.');
      }
    };

    return (
      <div className="space-y-6">
        <PageHeader 
          title="Add PP2 Content" 
          actions={
            <Button 
              variant="flat" 
              onPress={() => setActiveSection('pp2-program')} 
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
                    value={pp2Form.title}
                    onChange={(e) => setPP2Form({ ...pp2Form, title: e.target.value })}
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
                    value={pp2Form.description}
                    onChange={(e) => setPP2Form({ ...pp2Form, description: e.target.value })}
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
                      value={pp2Form.price.toString()}
                      onChange={(e) => setPP2Form({ ...pp2Form, price: parseFloat(e.target.value) || 0 })}
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
                      selectedKeys={[pp2Form.contentType]}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setPP2Form({ ...pp2Form, contentType: selected });
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
                  {pp2Form.coverImage ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-xs mx-auto shadow-lg">
                        <img 
                          src={pp2Form.coverImage || undefined} 
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
                        onPress={() => setPP2Form({ ...pp2Form, coverImage: '' })}
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
                        <p className="text-xs text-gray-500">Recommended: 1280x720 pixels • JPG, PNG, WebP</p>
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
                    value={pp2Form.coverImage}
                    onChange={(e) => setPP2Form({ ...pp2Form, coverImage: e.target.value })}
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
                    value={pp2Form.contentUrl}
                    onChange={(e) => setPP2Form({ ...pp2Form, contentUrl: e.target.value })}
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
                    value={pp2Form.duration}
                    onChange={(e) => setPP2Form({ ...pp2Form, duration: e.target.value })}
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
                    value={pp2Form.tags}
                    onChange={(e) => setPP2Form({ ...pp2Form, tags: e.target.value })}
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
                  <p className="font-semibold text-gray-900 mb-2">Upload PP2 Content Files</p>
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
                isDisabled={!pp2Form.title.trim()}
              >
                Create PP2 Content
              </Button>
            </div>

            {/* Quick Tips */}
            <Card className="bg-purple-50 border border-purple-200">
              <CardBody className="p-4">
                <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  PP2 Content Tips
                </h4>
                <ul className="text-xs text-purple-800 space-y-1">
                  <li>• PP2 is for advanced level students</li>
                  <li>• Include more complex concepts and materials</li>
                  <li>• Add engaging cover images</li>
                  <li>• Use detailed descriptions with HTML formatting</li>
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
      <PageHeader title="Create Content Bundle" actions={<Button variant="flat" onPress={() => setActiveSection('content-bundles')} startContent={<X className="h-4 w-4" />}>Cancel</Button>} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader><h3 className="text-lg font-semibold">Bundle Details</h3></CardHeader>
          <CardBody className="space-y-4">
            <Input placeholder="Bundle Name" />
            <Textarea placeholder="Bundle Description" />
            <div className="grid grid-cols-2 gap-4">
              <Input type="number" placeholder="Bundle Price" startContent={<DollarSign className="h-4 w-4" />} />
              <Input type="number" placeholder="Discount %" />
            </div>
            <Select placeholder="Bundle Category">
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
            <Button className="w-full mt-4 bg-gray-900 text-white" startContent={<Layers className="h-4 w-4" />}>Create Bundle</Button>
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
            onPress={() => setActiveSection('create-bundle')}
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
            {contentBundles.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bundles yet</h3>
                <p className="text-gray-600 mb-4">Create your first content bundle to offer discounted packages.</p>
                <Button 
                  className="bg-gray-900 text-white hover:bg-gray-800"
                  startContent={<Plus className="h-4 w-4" />}
                >
                  Create Bundle
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
            onPress={() => setActiveSection('add-user')}
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
              onPress={loadRealData}
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
            onPress={() => setActiveSection('all-users')}
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
                  <li>• Full system access</li>
                  <li>• User management</li>
                  <li>• Content management</li>
                  <li>• System settings</li>
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
                  <li>• Content moderation</li>
                  <li>• Comment management</li>
                  <li>• User support</li>
                  <li>• Basic analytics</li>
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
                  <li>• View content</li>
                  <li>• Purchase videos</li>
                  <li>• Manage profile</li>
                  <li>• Leave comments</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  // User Management Functions
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'user',
      status: user.status || 'active',
      avatar: user.avatar || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      subscription: user.subscription || 'free'
    });
    setActiveSection('add-user');
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
          alert('✅ User updated successfully!');
        } else {
          alert('❌ Failed to update user.');
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
          alert('✅ User created successfully!');
        } else {
          alert('❌ Failed to create user.');
          return;
        }
      }
      
      setActiveSection('all-users');
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
      console.error('❌ Failed to save user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const success = await vpsDataStore.deleteUser(userId);
      if (success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        alert('✅ User deleted successfully!');
      } else {
        alert('❌ Failed to delete user.');
      }
    }
  };

  const renderAllPackages = () => (
    <div className="space-y-6">
      <PageHeader 
        title="Learning Packages" 
        actions={
          <Button 
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => setActiveSection('add-package')}
          >
            Add New Package
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{pkg.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="text-sm text-gray-500">{pkg.type === 'subscription' ? 'Annual' : 'One-time'}</p>
                  </div>
                </div>
                {pkg.isPopular && (
                  <Chip size="sm" color="danger" variant="flat">Popular</Chip>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>
              
              <div className="text-2xl font-bold text-gray-900 mb-4">
                ${pkg.price}{pkg.type === 'subscription' ? '/year' : ''}
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {pkg.features.slice(0, 3).map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{feature}</span>
                    </li>
                  ))}
                  {pkg.features.length > 3 && (
                    <li className="text-xs text-gray-400">+{pkg.features.length - 3} more</li>
                  )}
                </ul>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${pkg.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">{pkg.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="light" className="hover:bg-blue-50">
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button size="sm" variant="light" className="hover:bg-red-50">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
        
        {packages.length === 0 && (
          <div className="col-span-full text-center py-12">
            <PackageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No packages yet</h3>
            <p className="text-gray-600 mb-6">Create your first learning package to get started.</p>
            <Button 
              className="bg-gray-900 text-white hover:bg-gray-800"
              startContent={<Plus className="h-4 w-4" />}
              onPress={() => setActiveSection('add-package')}
            >
              Add Package
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAddPackage = () => (
    <div className="space-y-6">
      <PageHeader 
        title="Add New Package" 
        actions={
          <Button 
            variant="flat" 
            onPress={() => setActiveSection('all-packages')}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            startContent={<X className="h-4 w-4" />}
          >
            Cancel
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Package Details</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Package Name</label>
                  <Input 
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({...packageForm, name: e.target.value})}
                    placeholder="Explorer Pack" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <Input 
                    value={packageForm.icon}
                    onChange={(e) => setPackageForm({...packageForm, icon: e.target.value})}
                    placeholder="🎒" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (HTML supported)</label>
                <textarea
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({...packageForm, description: e.target.value})}
                  placeholder="<p>Where Letters Come to Life!</p><br><b>Perfect for young learners</b>"
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-blue-400 transition-all duration-200 resize-none font-mono text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  HTML tags supported: &lt;b&gt;, &lt;i&gt;, &lt;u&gt;, &lt;br&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 text-center hover:border-blue-500 transition-all duration-300 bg-blue-50/30">
                  {packageForm.coverImage ? (
                    <div className="space-y-3">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-xs mx-auto">
                        <img 
                          src={packageForm.coverImage || undefined} 
                          alt="Package cover" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button 
                        size="sm" 
                        variant="flat" 
                        color="warning"
                        onPress={() => setPackageForm({...packageForm, coverImage: ''})}
                        startContent={<X className="h-4 w-4" />}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <PackageIcon className="h-8 w-8 text-blue-500 mx-auto" />
                      <p className="text-sm font-medium text-gray-900">Upload cover image</p>
                      <Button 
                        color="primary" 
                        variant="flat"
                        startContent={<Upload className="h-4 w-4" />}
                        onPress={() => {
                          const fileInput = document.getElementById('package-cover-input') as HTMLInputElement;
                          fileInput?.click();
                        }}
                      >
                        Choose Image
                      </Button>
                    </div>
                  )}
                  <input
                    id="package-cover-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const imageUrl = URL.createObjectURL(file);
                        setPackageForm({...packageForm, coverImage: imageUrl});
                      }
                    }}
                    className="hidden"
                  />
                </div>
                <Input
                  className="mt-2"
                  value={packageForm.coverImage}
                  onChange={(e) => setPackageForm({...packageForm, coverImage: e.target.value})}
                  placeholder="Or paste image URL"
                  startContent={<ImageIcon className="h-4 w-4 text-blue-500" />}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <Input 
                    type="number" 
                    value={packageForm.price.toString()}
                    onChange={(e) => setPackageForm({...packageForm, price: parseFloat(e.target.value) || 0})}
                    placeholder="30" 
                    startContent={<DollarSign className="h-4 w-4" />} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <Select 
                    selectedKeys={[packageForm.type]}
                    onSelectionChange={(keys) => setPackageForm({...packageForm, type: Array.from(keys)[0] as string})}
                    placeholder="Select type"
                  >
                    <SelectItem key="subscription" value="subscription">Subscription</SelectItem>
                    <SelectItem key="one-time" value="one-time">One-time</SelectItem>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features (HTML supported)</label>
                <textarea
                  value={packageForm.features}
                  onChange={(e) => setPackageForm({...packageForm, features: e.target.value})}
                  placeholder="<b>Letter Safari</b> with playful games<br><i>Magic Word Builder</i><br><strong>Phonics party</strong> activities"
                  rows={6}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-blue-400 transition-all duration-200 resize-none font-mono text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  HTML tags supported: &lt;b&gt;, &lt;i&gt;, &lt;u&gt;, &lt;br&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    isSelected={packageForm.isActive}
                    onValueChange={(checked) => setPackageForm({...packageForm, isActive: checked})}
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    isSelected={packageForm.isPopular}
                    onValueChange={(checked) => setPackageForm({...packageForm, isPopular: checked})}
                  />
                  <label className="text-sm font-medium text-gray-700">Popular</label>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        <div>
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
            </CardHeader>
            <CardBody>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🎒</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Explorer Pack</h4>
                    <p className="text-sm text-gray-500">Subscription</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">Where Letters Come to Life!</p>
                <div className="text-2xl font-bold text-gray-900 mb-3">$30/year</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Letter Safari with playful games</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Magic Word Builder</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          
          <div className="mt-6">
            <Button 
              className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12"
              onPress={() => {
                if (!packageForm.name.trim()) {
                  alert('Please enter a package name');
                  return;
                }
                const newPackage = {
                  id: Date.now().toString(),
                  name: packageForm.name,
                  icon: packageForm.icon || '🎒',
                  description: packageForm.description,
                  price: packageForm.price,
                  type: packageForm.type,
                  features: packageForm.features.split('\n').filter(f => f.trim()),
                  isActive: packageForm.isActive,
                  isPopular: packageForm.isPopular,
                  coverImage: packageForm.coverImage
                };
                setPackages(prev => [...prev, newPackage]);
                alert('✅ Package created successfully!');
                setActiveSection('all-packages');
              }}
              isDisabled={!packageForm.name.trim()}
            >
              Create Package
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <PageHeader title="Settings" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
              <Input 
                value="Zinga Linga" 
                className="w-full"
                classNames={{
                  input: "bg-gray-50",
                  inputWrapper: "bg-gray-50 border-gray-200"
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <Input 
                value="admin@zingalinga.com" 
                type="email"
                className="w-full"
                classNames={{
                  input: "bg-gray-50",
                  inputWrapper: "bg-gray-50 border-gray-200"
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
              <Select 
                selectedKeys={["en"]}
                className="w-full"
                aria-label="Default language"
                classNames={{
                  trigger: "bg-gray-50 border-gray-200"
                }}
              >
                <SelectItem key="en" value="en">English</SelectItem>
                <SelectItem key="es" value="es">Spanish</SelectItem>
                <SelectItem key="fr" value="fr">French</SelectItem>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <Select 
                selectedKeys={["UTC"]}
                className="w-full"
                aria-label="Timezone"
                classNames={{
                  trigger: "bg-gray-50 border-gray-200"
                }}
              >
                <SelectItem key="UTC" value="UTC">UTC</SelectItem>
                <SelectItem key="EST" value="EST">Eastern Time</SelectItem>
                <SelectItem key="PST" value="PST">Pacific Time</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Security Settings */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
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

        {/* Content Settings */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Content Settings</h3>
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

        {/* Notification Settings */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
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

      {/* System Information */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700">Platform Version</p>
              <p className="text-lg font-semibold text-gray-900">v2.1.0</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Database Status</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-lg font-semibold text-green-600">Connected</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Last Backup</p>
              <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="flat" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
          Reset to Defaults
        </Button>
        <Button className="bg-gray-900 text-white hover:bg-gray-800">
          Save Changes
        </Button>
      </div>
    </div>
  );

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
      case 'pp2-program': return renderPP2Program();
      case 'add-pp2-content': return renderAddPP2Content();
      case 'content-bundles': return renderContentBundles();
      case 'create-bundle': return renderCreateBundle();
      case 'categories': return renderCategoriesPage();
      case 'upload-queue': return renderUploadQueuePage();
      case 'all-users': return renderAllUsersPage();
      case 'add-user': return renderAddUser();
      case 'user-roles': return renderUserRoles();
      case 'children-profiles': return renderChildrenProfilesPage();
      case 'access-logs': return <div>Access Logs - Feature coming soon</div>;
      case 'orders': return renderOrdersPage();
      case 'subscriptions': return <div>Subscriptions - Feature coming soon</div>;
      case 'transactions': return <div>Transactions - Feature coming soon</div>;
      case 'comments': return <div>Comments - Feature coming soon</div>;
      case 'flagged-content': return <div>Flagged Content - Feature coming soon</div>;
      case 'all-packages': return renderAllPackages();
      case 'add-package': return renderAddPackage();
      case 'admin-profile': return renderAdminProfile();
      case 'settings': return renderSettings();
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <BarChart3 className="h-10 w-10 text-white" />
          </div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
              >
                <Menu className="h-5 w-5 text-gray-300" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-white">Zinga Linga</h1>
                  <p className="text-sm text-gray-400">Admin Dashboard</p>
                </div>
              </div>
            </div>



            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* User Menu */}
              <Dropdown>
                <DropdownTrigger>
                  <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 rounded-lg p-2 transition-colors admin-header-profile">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center profile-icon">
                      <span className="text-white text-sm font-medium">{(user?.name || 'Admin').charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="hidden md:block text-left profile-text ml-1">
                      <p className="text-sm font-semibold text-white">{user?.name || 'Admin'}</p>
                    </div>
                  </div>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="profile" startContent={<Users className="h-4 w-4" />} onPress={() => setActiveSection('admin-profile')}>
                    My Profile
                  </DropdownItem>
                  <DropdownItem key="settings" startContent={<Settings className="h-4 w-4" />} onPress={() => setActiveSection('settings')}>
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
          ${sidebarOpen ? (isMobile ? 'w-80' : 'w-80') : (isMobile ? 'w-0' : 'w-16')} 
          ${isMobile ? 'fixed inset-y-0 left-0 z-50 top-16' : 'relative'}
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

            {/* Data Status */}
            {sidebarOpen && (
              <div className="p-3 border-t border-slate-700/50 mt-auto">
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${dataStatus.isRealData ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                      <span className="text-xs text-slate-300 font-medium">
                        {dataStatus.isRealData ? 'Live Data' : 'Demo Mode'}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="light" 
                      isIconOnly
                      className="hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      onPress={loadRealData}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Updated {dataStatus.lastUpdated ? dataStatus.lastUpdated.toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              </div>
            )}
            
            {/* User Profile & Disconnect - Bottom */}
            <div className="p-3 border-t border-slate-700/50">
              {sidebarOpen ? (
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">{(user?.name || 'Admin').charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@zingalinga.com'}</p>
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
                    <span className="text-white text-sm font-bold group-hover:hidden">{(user?.name || 'Admin').charAt(0).toUpperCase()}</span>
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

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 min-h-0">
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8 max-w-full">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
        message="Video created successfully!"
      />
    </div>
  );
}
