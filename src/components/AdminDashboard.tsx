'use client'

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Package,
  Activity,
  Settings,
  Bell,
  BarChart3,
  FileText,
  Shield,
  LogOut,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Clock,
  Star,
  Crown,
  Zap,
  X,
  BookOpen
} from 'lucide-react';
import { neonDataStore } from '../utils/neonDataStore';
import { User, Module, Purchase } from '../types';

// Using global interfaces from types/index.ts

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

interface DashboardStats {
  totalUsers: number;
  totalModules: number;
  totalRevenue: number;
  activeUsers: number;
  recentPurchases: Purchase[];
  monthlyRevenue: number;
  weeklySignups: number;
  conversionRate: number;
  avgOrderValue: number;
}

// Sample data
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@zingalinga.com',
    role: 'admin',
    purchasedModules: [],
    totalSpent: 0,
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: '2024-01-28T14:30:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'user',
    purchasedModules: ['jungle-basics', 'numbers-adventure'],
    totalSpent: 64.98,
    createdAt: '2024-01-20T09:15:00Z',
    lastLogin: '2024-01-28T11:20:00Z'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'user',
    purchasedModules: ['alphabet-safari'],
    totalSpent: 32.99,
    createdAt: '2024-01-22T16:45:00Z',
    lastLogin: '2024-01-27T19:10:00Z'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'user',
    purchasedModules: ['jungle-basics', 'alphabet-safari', 'numbers-adventure'],
    totalSpent: 97.97,
    createdAt: '2024-01-18T13:30:00Z',
    lastLogin: '2024-01-28T08:45:00Z'
  }
];

const sampleModules: Module[] = [
  // Sample modules removed - using real modules from data store
];

// Sample purchases removed - using real purchases from data store
const samplePurchases: Purchase[] = [];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'modules' | 'orders' | 'analytics' | 'settings'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isUserViewModalOpen, setIsUserViewModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalModules: 0,
    totalRevenue: 0,
    activeUsers: 0,
    recentPurchases: [],
    monthlyRevenue: 0,
    weeklySignups: 0,
    conversionRate: 0,
    avgOrderValue: 0
  });

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time sync interval
    const syncInterval = setInterval(loadDashboardData, 5000); // Sync every 5 seconds

    return () => clearInterval(syncInterval);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // Load data from neonDataStore
    const data = await neonDataStore.loadData();
      
      // Update all state with real data
      setModules(data.modules || []);
      setUsers(data.users || []);
      setOrders(data.purchases || []);
      
      // Generate notifications from recent activities
      const recentNotifications = [
        ...data.purchases.slice(0, 3).map(p => ({
          id: `purchase-${p.id}`,
          type: 'purchase',
          message: `New purchase: ${p.amount}`,
          time: p.createdAt,
          read: false
        })),
        ...data.users.slice(-2).map(u => ({
          id: `user-${u.id}`,
          type: 'user',
          message: `New user registered: ${u.name}`,
          time: u.createdAt,
          read: false
        }))
      ];
      setNotifications(recentNotifications);
      
      // Calculate stats from cloud data
      const totalRevenue = data.purchases.reduce((sum, p) => sum + p.amount, 0);
      const monthlyRevenue = data.purchases
        .filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth())
        .reduce((sum, p) => sum + p.amount, 0);
      
      const weeklySignups = data.users
        .filter(u => u.createdAt && new Date(u.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
        .length;
      
      const avgOrderValue = data.purchases.length > 0 ? totalRevenue / data.purchases.length : 0;
      const conversionRate = data.users.length > 0 ? (data.purchases.length / data.users.length) * 100 : 0;
      
      setStats({
        totalUsers: data.users.length,
        totalModules: data.modules.length,
        totalRevenue,
        activeUsers: data.users.filter(u => u.lastLogin && 
          new Date(u.lastLogin).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        ).length,
        recentPurchases: data.purchases.slice(0, 5),
        monthlyRevenue,
        weeklySignups,
        conversionRate,
        avgOrderValue
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // Fallback to sample data
      const totalRevenue = samplePurchases.reduce((sum, p) => sum + p.amount, 0);
      const monthlyRevenue = samplePurchases
        .filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth())
        .reduce((sum, p) => sum + p.amount, 0);
      
      const weeklySignups = sampleUsers
        .filter(u => u.createdAt && new Date(u.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
        .length;
      
      const avgOrderValue = samplePurchases.length > 0 ? totalRevenue / samplePurchases.length : 0;
      const conversionRate = sampleUsers.length > 0 ? (samplePurchases.length / sampleUsers.length) * 100 : 0;
      
      setStats({
        totalUsers: sampleUsers.length,
        totalModules: sampleModules.length,
        totalRevenue,
        activeUsers: sampleUsers.filter(u => u.lastLogin && 
          new Date(u.lastLogin).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        ).length,
        recentPurchases: samplePurchases.slice(0, 5),
        monthlyRevenue,
        weeklySignups,
        conversionRate,
        avgOrderValue
      });
    }
    
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setIsEditModalOpen(true);
  };

  const handleCreateModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: '',
      description: '',
      price: 0,
      character: 'kiki',
      ageRange: '',
      features: [],
      rating: 0,
      totalRatings: 0,
      demoVideo: '',
      fullContent: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingModule(newModule);
    setIsEditModalOpen(true);
  };

  const handleSaveModule = async (updatedModule: Module) => {
    try {
      const data = await neonDataStore.loadData();
       let updatedModules;
       
       if (data.modules.find(m => m.id === updatedModule.id)) {
         // Update existing module
         updatedModules = data.modules.map(m => m.id === updatedModule.id ? updatedModule : m);
       } else {
         // Add new module
         updatedModules = [...data.modules, updatedModule];
       }
       
       // Save to neonDataStore
       await neonDataStore.saveData({
         ...data,
         modules: updatedModules
       });
      
      // Update local state
      setModules(updatedModules);
      setIsEditModalOpen(false);
      setEditingModule(null);
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Failed to save module. Please try again.');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm('Are you sure you want to delete this module?')) {
      try {
        const data = await neonDataStore.loadData();
        const updatedModules = data.modules.filter(m => m.id !== moduleId);
        
        // Save to neonDataStore
         await neonDataStore.saveData({
           ...data,
           modules: updatedModules
         });
        
        // Update local state
        setModules(updatedModules);
      } catch (error) {
        console.error('Error deleting module:', error);
        alert('Failed to delete module. Please try again.');
      }
    }
  };

  // User Management Functions
  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setIsUserViewModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserEditModalOpen(true);
  };

  const handleSaveUser = async (updatedUser: User) => {
    try {
      const data = await neonDataStore.loadData();
      const updatedUsers = data.users.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      );
      
      await neonDataStore.saveData({
        ...data,
        users: updatedUsers
      });
      
      setUsers(updatedUsers);
      setIsUserEditModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const data = await neonDataStore.loadData();
        const updatedUsers = data.users.filter(u => u.id !== userId);
        
        await neonDataStore.saveData({
          ...data,
          users: updatedUsers
        });
        
        setUsers(updatedUsers);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleAddUser = () => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: '',
      name: '',
      role: 'user',
      purchasedModules: [],
      createdAt: new Date().toISOString(),
      totalSpent: 0
    };
    setEditingUser(newUser);
    setIsAddUserModalOpen(true);
  };

  const handleSaveNewUser = async (newUser: User) => {
    try {
      const data = await neonDataStore.loadData();
      const updatedUsers = [...data.users, newUser];
      
      await neonDataStore.saveData({
        ...data,
        users: updatedUsers
      });
      
      setUsers(updatedUsers);
      setIsAddUserModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  // Order Management Functions
  const handleViewOrder = (order: Purchase) => {
    const user = users.find(u => u.id === order.userId);
    alert(`Order Details:\nID: ${order.id}\nUser: ${user?.name || 'Unknown'}\nAmount: $${order.amount}\nDate: ${new Date(order.createdAt).toLocaleDateString()}\nStatus: ${order.status}`);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const data = await neonDataStore.loadData();
      const updatedOrders = data.purchases.map(p => 
        p.id === orderId ? { ...p, status: newStatus as 'pending' | 'completed' | 'failed' | 'refunded' } : p
      );
      
      await neonDataStore.saveData({
        ...data,
        purchases: updatedOrders
      });
      
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    change?: string;
  }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <span className="text-sm font-mali text-green-600 bg-green-100 px-2 py-1 rounded-full">
            {change}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-mali font-bold text-gray-800 mb-1">{value}</h3>
      <p className="font-mali text-gray-600 text-sm">{title}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Admin Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-2xl border-b-4 border-gradient-to-r from-indigo-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img 
                  src="/zinga linga logo.png" 
                  alt="Zinga Linga Admin" 
                  className="h-14 w-auto drop-shadow-lg"
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-mali font-bold text-brand-green">
                  Admin Control Center
                </h1>
                <p className="font-mali text-gray-600 text-lg">Welcome back, {user.name} - System Administrator</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg"
                >
                  <Bell className="w-6 h-6" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{notifications.filter(n => !n.read).length}</span>
                    </div>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-mali font-bold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(notification.time).toLocaleString()}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <button 
                        onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-amber-100 px-4 py-3 rounded-xl border border-yellow-300 shadow-lg">
                <Crown className="w-5 h-5 text-yellow-600" />
                <span className="font-mali font-bold text-yellow-700">Super Admin</span>
              </div>
              
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-700 px-6 py-3 rounded-xl font-mali font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Simple Responsive Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 py-3 sm:py-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-indigo-600' },
              { id: 'users', label: 'Users', icon: Users, color: 'from-green-500 to-emerald-600' },
              { id: 'modules', label: 'Modules', icon: Package, color: 'from-purple-500 to-violet-600' },
              { id: 'orders', label: 'Orders', icon: ShoppingBag, color: 'from-orange-500 to-red-600' },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-pink-500 to-rose-600' },
              { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-600' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-mali font-medium text-sm sm:text-base transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                color="bg-brand-blue"
                change="+12%"
              />
              <StatCard
                title="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                icon={DollarSign}
                color="bg-brand-green"
                change="+8%"
              />
              <StatCard
                title="Active Users"
                value={stats.activeUsers}
                icon={Activity}
                color="bg-brand-yellow"
                change="+15%"
              />
              <StatCard
                title="Conversion Rate"
                value={`${stats.conversionRate.toFixed(1)}%`}
                icon={TrendingUp}
                color="bg-brand-pink"
                change="+3%"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Purchases */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-mali font-bold text-gray-800">Recent Purchases</h3>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-brand-blue hover:text-brand-blue/80 font-mali text-sm"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {stats.recentPurchases.map((purchase) => {
                    const purchaseUser = sampleUsers.find(u => u.id === purchase.userId);
                    return (
                      <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-mali font-bold text-gray-800">{purchaseUser?.name}</p>
                          <p className="font-mali text-sm text-gray-600">
                            {purchase.moduleIds.length} module{purchase.moduleIds.length > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mali font-bold text-gray-800">{formatCurrency(purchase.amount)}</p>
                          <p className="font-mali text-xs text-gray-500">{formatDate(purchase.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Modules */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-mali font-bold text-gray-800">Top Modules</h3>
                  <button 
                    onClick={() => setActiveTab('modules')}
                    className="text-brand-blue hover:text-brand-blue/80 font-mali text-sm"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {sampleModules.map((module, index) => (
                    <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-green text-white rounded-full flex items-center justify-center font-mali font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-mali font-bold text-gray-800">{module.title}</p>
                          <p className="font-mali text-sm text-gray-600">{module.totalRatings} ratings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mali font-bold text-gray-800">{formatCurrency(module.price)}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="font-mali text-xs text-gray-500">4.8</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-mali font-bold text-gray-800">User Management</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  />
                </div>
                <button 
                  onClick={handleAddUser}
                  className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg font-mali font-medium hover:bg-brand-blue/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-mali font-bold text-gray-800">User</th>
                      <th className="px-6 py-4 text-left font-mali font-bold text-gray-800">Role</th>
                      <th className="px-6 py-4 text-left font-mali font-bold text-gray-800">Modules</th>
                      <th className="px-6 py-4 text-left font-mali font-bold text-gray-800">Total Spent</th>
                      <th className="px-6 py-4 text-left font-mali font-bold text-gray-800">Last Login</th>
                      <th className="px-6 py-4 text-left font-mali font-bold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users
                      .filter(user => 
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((userData) => (
                        <tr key={userData.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-mali font-bold text-gray-800">{userData.name}</p>
                              <p className="font-mali text-sm text-gray-600">{userData.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mali font-medium ${
                              userData.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {userData.role === 'admin' && <Crown className="w-3 h-3" />}
                              {userData.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mali text-gray-800">{userData.purchasedModules.length}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mali font-bold text-gray-800">
                              {formatCurrency(userData.totalSpent || 0)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mali text-sm text-gray-600">
                              {userData.lastLogin ? formatDate(userData.lastLogin) : 'Never'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleViewUser(userData)}
                                className="p-1 text-gray-600 hover:text-brand-blue transition-colors"
                                title="View User"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditUser(userData)}
                                className="p-1 text-gray-600 hover:text-brand-green transition-colors"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(userData.id)}
                                className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-mali font-bold text-gray-800">Module Management</h2>
              <button 
                onClick={handleCreateModule}
                className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-lg font-mali font-medium hover:bg-brand-green/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Module
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <div key={module.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="bg-gradient-to-r from-brand-blue to-brand-green p-6 text-white">
                    <h3 className="text-xl font-mali font-bold mb-2">{module.title}</h3>
                    <p className="font-mali opacity-90">{module.description}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-mali font-bold text-gray-800">
                        {formatCurrency(module.price)}
                      </span>
                      <span className="bg-brand-yellow/20 text-brand-yellow px-3 py-1 rounded-full font-mali text-sm font-bold">
                        {module.totalRatings} ratings
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="font-mali text-sm text-gray-600 mb-2">Age Range: {module.ageRange}</p>
                      <div className="flex flex-wrap gap-1">
                        {module.features.map((feature, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mali">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditModule(module)}
                        className="flex-1 bg-brand-blue/10 text-brand-blue py-2 rounded-lg font-mali font-medium hover:bg-brand-blue/20 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteModule(module.id)}
                        className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-mali font-medium hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-mali font-bold text-gray-800">Order Management</h2>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-mali font-medium hover:bg-gray-200 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg font-mali font-medium hover:bg-brand-blue/90 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-mali font-bold text-gray-800">Order ID</th>
                      <th className="px-6 py-4 text-left font-mali font-bold text-gray-800">Customer</th>
                      <th className="px-6 py-4 text-left font-mali font-bold text-gray-800">Modules</th>
                      <th className="px-6 py-4 text-left font-mali font-bold text-gray-800">Amount</th>
                      <th className="px-6 py-4 text-left font-mali font-bold text-gray-800">Date</th>
                      <th className="px-6 py-4 text-left font-mali font-bold text-gray-800">Status</th>
                      <th className="px-6 py-4 text-left font-mali font-bold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((purchase) => {
                      const purchaseUser = users.find(u => u.id === purchase.userId);
                      return (
                        <tr key={purchase.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="font-mali font-mono text-sm text-gray-800">{purchase.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-mali font-bold text-gray-800">{purchaseUser?.name || 'Unknown User'}</p>
                              <p className="font-mali text-sm text-gray-600">{purchaseUser?.email || 'No email'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mali text-gray-800">{purchase.moduleIds?.length || 0} module{(purchase.moduleIds?.length || 0) > 1 ? 's' : ''}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mali font-bold text-gray-800">{formatCurrency(purchase.amount)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mali text-sm text-gray-600">{formatDate(purchase.createdAt)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={purchase.status}
                              onChange={(e) => handleUpdateOrderStatus(purchase.id, e.target.value)}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-mali font-medium border-0 ${
                                purchase.status === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : purchase.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleViewOrder(purchase)}
                                className="p-1 text-gray-600 hover:text-brand-blue transition-colors"
                                title="View Order Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                className="p-1 text-gray-600 hover:text-brand-green transition-colors"
                                title="Download Invoice"
                                onClick={() => alert('Invoice download feature coming soon!')}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-mali font-bold text-gray-800">Analytics & Reports</h2>
              <div className="flex gap-3">
                <button 
                  onClick={loadDashboardData}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-mali font-medium hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg font-mali font-medium hover:bg-brand-blue/90 transition-colors">
                  <FileText className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Monthly Revenue"
                value={formatCurrency(stats.monthlyRevenue)}
                icon={DollarSign}
                color="bg-brand-green"
                change="+12%"
              />
              <StatCard
                title="Weekly Signups"
                value={stats.weeklySignups}
                icon={Users}
                color="bg-brand-blue"
                change="+8%"
              />
              <StatCard
                title="Avg Order Value"
                value={formatCurrency(stats.avgOrderValue)}
                icon={TrendingUp}
                color="bg-brand-yellow"
                change="+5%"
              />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-mali font-bold text-gray-800 mb-6">Revenue Analytics</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="font-mali text-gray-600">Revenue chart would be displayed here</p>
                  <p className="font-mali text-sm text-gray-500">Integration with charting library needed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-mali font-bold text-gray-800">System Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-mali font-bold text-gray-800 mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-mali font-medium text-gray-700 mb-2">Site Name</label>
                    <input 
                      type="text" 
                      defaultValue="Zinga Linga Trae"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block font-mali font-medium text-gray-700 mb-2">Admin Email</label>
                    <input 
                      type="email" 
                      defaultValue="admin@zingalinga.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block font-mali font-medium text-gray-700 mb-2">Currency</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-mali font-bold text-gray-800 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mali font-medium text-gray-700">Two-Factor Authentication</p>
                      <p className="font-mali text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <button className="bg-brand-green text-white px-4 py-2 rounded-lg font-mali font-medium hover:bg-brand-green/90 transition-colors">
                      Enable
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mali font-medium text-gray-700">Session Timeout</p>
                      <p className="font-mali text-sm text-gray-500">Auto logout after inactivity</p>
                    </div>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent">
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="bg-brand-blue text-white px-6 py-3 rounded-lg font-mali font-bold hover:bg-brand-blue/90 transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Module Edit Modal */}
      {isEditModalOpen && editingModule && (
        <ModuleEditModal
          module={editingModule}
          onSave={handleSaveModule}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingModule(null);
          }}
        />
      )}

      {/* User Edit Modal */}
      {isUserEditModalOpen && editingUser && (
        <UserEditModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => {
            setIsUserEditModalOpen(false);
            setEditingUser(null);
          }}
        />
      )}

      {/* User View Modal */}
      {isUserViewModalOpen && viewingUser && (
        <UserViewModal
          user={viewingUser}
          onClose={() => {
            setIsUserViewModalOpen(false);
            setViewingUser(null);
          }}
        />
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && editingUser && (
        <UserEditModal
          user={editingUser}
          onSave={handleSaveNewUser}
          onClose={() => {
            setIsAddUserModalOpen(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

// User View Modal Component
interface UserViewModalProps {
  user: User;
  onClose: () => void;
}

const UserViewModal: React.FC<UserViewModalProps> = ({ user, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-mali font-bold text-gray-800">
              User Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-mali font-bold text-gray-800">{user.name}</h3>
              <p className="text-gray-600 font-mali">{user.email}</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-mali font-medium mt-2 ${
                user.role === 'admin' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role === 'admin' && <Crown className="w-4 h-4" />}
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-brand-blue" />
                <span className="font-mali font-bold text-gray-700">Modules Purchased</span>
              </div>
              <p className="text-2xl font-mali font-bold text-gray-800">{user.purchasedModules?.length || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-brand-green" />
                <span className="font-mali font-bold text-gray-700">Total Spent</span>
              </div>
              <p className="text-2xl font-mali font-bold text-gray-800">{formatCurrency(user.totalSpent || 0)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-brand-purple" />
                <span className="font-mali font-bold text-gray-700">Member Since</span>
              </div>
              <p className="text-sm font-mali text-gray-600">
                {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-mali font-bold text-gray-800">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-mali font-bold text-gray-700 mb-1">
                  User ID
                </label>
                <p className="text-gray-600 font-mali bg-gray-50 px-3 py-2 rounded-lg">{user.id}</p>
              </div>
              <div>
                <label className="block text-sm font-mali font-bold text-gray-700 mb-1">
                  Last Login
                </label>
                <p className="text-gray-600 font-mali bg-gray-50 px-3 py-2 rounded-lg">
                  {user.lastLogin ? formatDate(user.lastLogin) : 'Never logged in'}
                </p>
              </div>
            </div>
          </div>

          {/* Purchased Modules */}
          {user.purchasedModules && user.purchasedModules.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-mali font-bold text-gray-800">Purchased Modules</h4>
              <div className="space-y-2">
                {user.purchasedModules.map((moduleId, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-brand-blue" />
                    <span className="font-mali text-gray-800">{moduleId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-mali font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Edit Modal Component
interface UserEditModalProps {
  user: User;
  onSave: (user: User) => void;
  onClose: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState<User>(user);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    
    // Password validation for new users or when password is provided
    if (!user.id && !password.trim()) {
      newErrors.password = 'Password is required for new users';
    } else if (password.trim() && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const userToSave = { ...formData };
      if (password.trim()) {
        (userToSave as any).password = password;
      }
      onSave(userToSave);
    }
  };

  const roleOptions = ['user', 'admin', 'moderator', 'premium'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-mali font-bold text-gray-800">
              {user.id ? 'Edit User' : 'Add User'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Avatar */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {formData.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-mali font-bold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-mali font-bold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-mali font-bold text-gray-700 mb-2">
              User Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
              className={`w-full px-4 py-3 border rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {roleOptions.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

         {/* Password Field */}
          <div>
            <label className="block text-sm font-mali font-bold text-gray-700 mb-2">
              Password {user.id ? '(Leave blank to keep current)' : '*'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent pr-12 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={user.id ? 'Enter new password (optional)' : 'Enter password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* User Statistics - Only show for existing users */}
          {user.id && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-mali font-bold text-gray-800 mb-3">User Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-blue">{formData.purchasedModules?.length || 0}</div>
                  <div className="text-sm text-gray-600">Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${formData.totalSpent || 0}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{new Date(formData.createdAt || Date.now()).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-600">Join Date</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{new Date(formData.lastLogin || Date.now()).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-600">Last Login</div>
                </div>
              </div>
            </div>
          )}

          {/* Purchased Modules */}
          {formData.purchasedModules && formData.purchasedModules.length > 0 && (
            <div>
              <label className="block text-sm font-mali font-bold text-gray-700 mb-2">
                Purchased Modules
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.purchasedModules.map((moduleId, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-mali"
                  >
                    Module {moduleId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-mali font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-mali font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Module Edit Modal Component
interface ModuleEditModalProps {
  module: Module;
  onSave: (module: Module) => void;
  onClose: () => void;
}

const ModuleEditModal: React.FC<ModuleEditModalProps> = ({ module, onSave, onClose }) => {
  const [formData, setFormData] = useState<Module>(module);
  const [newFeature, setNewFeature] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.ageRange.trim()) newErrors.ageRange = 'Age range is required';
    if (formData.features.length === 0) newErrors.features = 'At least one feature is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-mali font-bold text-gray-800">
              {module.id.startsWith('module-') && module.title === '' ? 'Create New Module' : 'Edit Module'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-mali font-bold text-gray-700 mb-2">
                Module Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter module title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1 font-mali">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-mali font-bold text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className={`w-full px-4 py-3 border rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1 font-mali">{errors.price}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-mali font-bold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter module description"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1 font-mali">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-mali font-bold text-gray-700 mb-2">
              Age Range *
            </label>
            <input
              type="text"
              value={formData.ageRange}
              onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent ${
                errors.ageRange ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 3-5 years"
            />
            {errors.ageRange && <p className="text-red-500 text-sm mt-1 font-mali">{errors.ageRange}</p>}
          </div>

          {/* Features Section */}
          <div>
            <label className="block text-sm font-mali font-bold text-gray-700 mb-2">
              Features *
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mali focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  placeholder="Add a feature"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="bg-brand-blue text-white px-4 py-2 rounded-lg font-mali font-medium hover:bg-brand-blue/90 transition-colors"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full text-sm font-mali"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-brand-blue/60 hover:text-brand-blue transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {errors.features && <p className="text-red-500 text-sm mt-1 font-mali">{errors.features}</p>}
            </div>
          </div>

          {/* Sales count removed - not part of Module interface */}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-mali font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-brand-blue text-white rounded-lg font-mali font-medium hover:bg-brand-blue/90 transition-colors"
            >
              {module.id.startsWith('module-') && module.title === '' ? 'Create Module' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};