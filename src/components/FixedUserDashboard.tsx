'use client';

import React, { useState, useEffect, useCallback } from 'react';
import UserProfilePage from '../page-components/UserProfilePage';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Avatar,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Chip,
  Divider,
  Badge,
  Tooltip,
  Tabs,
  Tab
} from '@nextui-org/react';
import { CartModal } from './CartModal';
import { useCart, PRODUCTS } from '../hooks/useCart';
import {
  Play,
  Heart,
  Clock,
  Settings,
  HelpCircle,
  LogOut,
  Gift,
  Star,
  Palette,
  Shield,
  Timer,
  BookOpen,
  Gamepad2,
  Target,
  Award,
  TrendingUp,
  Calendar,
  Eye,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  Trophy,
  Flame,
  Users,
  ShoppingCart,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Minus,
  X,
  User as UserIcon
} from 'lucide-react';
import { User, Module, Purchase, ContentFile } from '../types';
import { vpsDataStore } from '../utils/vpsDataStore';
import { checkVideoAccess, getUserPurchasedModules, getUserAvailableModules } from '../utils/videoAccess';
import { AdvancedVideoPlayer } from './AdvancedVideoPlayer';

interface UserDashboardProps {
  user: User;
  modules?: Module[];
  purchases?: Purchase[];
  contentFiles?: ContentFile[];
  onModuleUpdate?: (modules: Module[]) => void;
  onLogout: () => void;
  onPurchase?: (moduleId: string) => void;
}

interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  preview: string;
}



const themes: Theme[] = [
  {
    id: 'cosmic',
    name: 'Cosmic',
    primary: 'from-purple-600 to-blue-600',
    secondary: 'from-pink-500 to-purple-500',
    background: 'from-purple-900 via-blue-900 to-indigo-900',
    preview: 'bg-gradient-to-r from-purple-600 to-blue-600'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    primary: 'from-blue-500 to-teal-500',
    secondary: 'from-cyan-400 to-blue-500',
    background: 'from-blue-900 via-teal-900 to-cyan-900',
    preview: 'bg-gradient-to-r from-blue-500 to-teal-500'
  },
  {
    id: 'forest',
    name: 'Forest',
    primary: 'from-green-500 to-emerald-500',
    secondary: 'from-lime-400 to-green-500',
    background: 'from-green-900 via-emerald-900 to-teal-900',
    preview: 'bg-gradient-to-r from-green-500 to-emerald-500'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    primary: 'from-orange-500 to-red-500',
    secondary: 'from-yellow-400 to-orange-500',
    background: 'from-orange-900 via-red-900 to-pink-900',
    preview: 'bg-gradient-to-r from-orange-500 to-red-500'
  },
  {
    id: 'neon',
    name: 'Neon',
    primary: 'from-pink-500 to-purple-600',
    secondary: 'from-yellow-400 to-pink-500',
    background: 'from-pink-900 via-purple-900 to-black',
    preview: 'bg-gradient-to-r from-pink-500 to-purple-600'
  }
];

const avatars = [
  '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🦄', '🐉', '🦋', '🌟', '🎭', '🎨'
];

export default function FixedUserDashboard({ 
  user, 
  modules = [], 
  purchases = [], 
  contentFiles = [], 
  onModuleUpdate, 
  onLogout, 
  onPurchase 
}: UserDashboardProps) {
  // Video player state
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // Real data state
  const [realModules, setRealModules] = useState<Module[]>([]);
  const [realPurchases, setRealPurchases] = useState<Purchase[]>([]);

  // Theme and UI state
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(avatars[0]);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'store' | 'cart' | 'profile'>('dashboard');
  
  // Modal states
  const [showThemeModal, setShowThemeModal] = useState(false);

  // E-commerce state
  const { items: cartItems, addItem, getTotalItems } = useCart();
  const [showCartModal, setShowCartModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // User progress state
  const [dailyStreak, setDailyStreak] = useState(12);

  // Load real data on component mount
  useEffect(() => {
    loadRealData();
    loadUserPreferences();
  }, [modules, purchases]);

  // Force re-render when real data changes
  useEffect(() => {
    if (realModules.length > 0) {
      console.log('Real modules loaded:', realModules.length);
    }
  }, [realModules]);

  const loadRealData = async () => {
    try {
      const data = await vpsDataStore.loadData();
      setRealModules(data.modules || modules || []);
      setRealPurchases(data.purchases || purchases || []);
      // Data loaded successfully
    } catch (error) {
      // Using fallback data
      setRealModules(modules || []);
      setRealPurchases(purchases || []);
    }
  };

  const loadUserPreferences = async () => {
    try {
      // First try to load from localStorage for immediate response
      const localTheme = localStorage.getItem(`user-theme-${user.id}`);
      const localAvatar = localStorage.getItem(`user-avatar-${user.id}`);
      
      if (localTheme) {
        const theme = themes.find(t => t.id === localTheme) || themes[0];
        setSelectedTheme(theme);
      }
      if (localAvatar) {
        setSelectedAvatar(localAvatar);
      }
      
      // Then load from VPS data store
      const userData = await vpsDataStore.getUserData(user.id);
      if (userData) {
        if (userData.theme) {
          const theme = themes.find(t => t.id === userData.theme.id) || userData.theme;
          setSelectedTheme(theme);
          localStorage.setItem(`user-theme-${user.id}`, theme.id);
        }
        if (userData.avatar) {
          setSelectedAvatar(userData.avatar);
          localStorage.setItem(`user-avatar-${user.id}`, userData.avatar);
        }
      }
    } catch (error) {
      console.warn('Error loading user preferences:', error);
      // Using default preferences
    }
  };

  // Video player functions
  const handleVideoPlay = useCallback((moduleId: string) => {
    const module = realModules.find(m => m.id === moduleId);
    
    if (module) {
      const accessResult = checkVideoAccess(user, module, realPurchases);
      setSelectedModule(module);
      setShowVideoPlayer(true);
    }
  }, [realModules, user, realPurchases]);

  const handleVideoPurchase = useCallback((moduleId: string) => {
    if (onPurchase) {
      onPurchase(moduleId);
    }
  }, [onPurchase]);

  const handleVideoPlayerClose = useCallback(() => {
    setShowVideoPlayer(false);
    setSelectedModule(null);
  }, []);

  const handleThemeChange = useCallback(async (theme: Theme) => {
    setSelectedTheme(theme);
    // Save to localStorage immediately for instant response
    localStorage.setItem(`user-theme-${user.id}`, theme.id);
    // Also save to VPS data store
    try {
      await vpsDataStore.updateUserPreferences(user.id, { theme });
      // Show success feedback
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('theme-changed', { detail: { theme: theme.name } });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.warn('Failed to save theme to VPS:', error);
    }
  }, [user.id]);

  const handleAvatarChange = useCallback(async (avatar: string) => {
    setSelectedAvatar(avatar);
    // Save to localStorage immediately for instant response
    localStorage.setItem(`user-avatar-${user.id}`, avatar);
    // Also save to VPS data store
    try {
      await vpsDataStore.updateUserPreferences(user.id, { avatar });
    } catch (error) {
      console.warn('Failed to save avatar to VPS:', error);
    }
  }, [user.id]);

  const addToCart = useCallback((module: Module) => {
    try {
      addItem({
        id: module.id,
        name: module.title,
        price: module.price || 0,
        description: module.description,
        type: 'module' as const
      });
      // Show success feedback
      alert(`${module.title} added to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  }, [addItem]);

  // Get user's purchased and available modules using access control
  const purchasedModules = getUserPurchasedModules(user, realModules, realPurchases);
  const availableModules = getUserAvailableModules(user, realModules, realPurchases);

  const filteredModules = realModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const sortedModules = [...filteredModules].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        return b.id.localeCompare(a.id);
      default:
        return (b.rating || 0) - (a.rating || 0);
    }
  });

  const renderVideoCard = (module: Module) => {
    const accessResult = checkVideoAccess(user, module, realPurchases);
    const isPurchased = purchasedModules.some(p => p.id === module.id);
    
    return (
      <Card key={module.id} className={`bg-gray-800/50 hover:bg-gray-700/70 transition-all duration-300 group shadow-lg rounded-2xl ${viewMode === 'list' ? 'flex-row' : ''}`}>
        <CardBody className={`p-4 ${viewMode === 'list' ? 'flex flex-row items-center gap-4' : ''}`}>
          {/* Video Thumbnail with Play Button */}
          <div className={`relative overflow-hidden rounded-lg cursor-pointer ${viewMode === 'list' ? 'w-32 h-20' : 'aspect-video mb-3'}`}>
            {/* Background Image */}
            {module.thumbnail ? (
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${module.thumbnail})` }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-300" />
              </div>
            )}
            
            {/* Dark overlay for better contrast */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            
            {/* Play Button - Always visible with good contrast */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                isIconOnly
                className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-sm border-2 border-white/60 text-white hover:bg-black/90 hover:scale-110 hover:border-white/80 transition-all duration-300 shadow-lg"
                onClick={() => handleVideoPlay(module.id)}
              >
                <Play className="w-8 h-8 ml-1" />
              </Button>
            </div>

            {/* Status Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {!accessResult.hasAccess && (
                <Chip 
                  size="sm" 
                  className="bg-red-500/90 text-white border-red-400/50 backdrop-blur-sm shadow-lg"
                  startContent={<Lock className="w-3 h-3" />}
                >
                  Locked
                </Chip>
              )}

              {isPurchased && (
                <Chip 
                  size="sm" 
                  className="bg-green-500/90 text-white border-green-400/50 backdrop-blur-sm shadow-lg"
                  startContent={<Trophy className="w-3 h-3" />}
                >
                  Owned
                </Chip>
              )}

              {module.price === 0 && (
                <Chip 
                  size="sm" 
                  className="bg-blue-500/90 text-white border-blue-400/50 backdrop-blur-sm shadow-lg"
                >
                  Free
                </Chip>
              )}
            </div>

            {/* Duration */}
            <div className="absolute bottom-2 left-2 text-white text-sm bg-black/70 px-2 py-1 rounded backdrop-blur-sm">
              {module.estimatedDuration || '5 min'}
            </div>
            
            {/* Premium Badge */}
            {module.isPremium && (
              <div className="absolute top-2 right-2">
                <Chip 
                  size="sm" 
                  className="bg-yellow-500/90 text-black border-yellow-400/50 backdrop-blur-sm shadow-lg"
                  startContent={<Star className="w-3 h-3" />}
                >
                  Premium
                </Chip>
              </div>
            )}
          </div>
          
          {/* Video Info */}
          <div className={viewMode === 'list' ? 'flex-1' : ''}>
            <h4 className="font-semibold text-white mb-2">{module.title}</h4>
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{module.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white text-sm">{module.rating || 4.5}</span>
              </div>
              <span className="text-green-400 font-bold">
                {module.price === 0 ? 'Free' : `$${module.price}`}
              </span>
            </div>
            
            <div className="flex gap-2">
              {!isPurchased && (module.price || 0) > 0 && (
                <Button
                  size="sm"
                  className={`bg-gradient-to-r ${selectedTheme.primary} text-white flex-1`}
                  onClick={() => addToCart(module)}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Buy Now
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                className="text-white"
                onClick={() => handleVideoPlay(module.id)}
              >
                {accessResult.hasAccess ? 'Watch' : 'Preview'}
              </Button>
            </div>

            {/* Access Status */}
            <div className="mt-2 text-xs">
              <span className={`${accessResult.hasAccess ? 'text-green-400' : 'text-red-400'}`}>
                {accessResult.reason}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'store':
        return renderStorePage();
      case 'cart':
        return renderCartPage();
      case 'profile':
        return (
          <UserProfilePage
            user={user}
            onBack={() => setCurrentPage('dashboard')}
            onNavigate={(page) => setCurrentPage(page as any)}
            onUserUpdate={(updatedUser) => {
              loadUserPreferences();
            }}
          />
        );
      default:
        return renderDashboardPage();
    }
  };

  const renderStorePage = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-gray-800/50 backdrop-blur-md border-white/20 shadow-lg rounded-2xl">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                classNames={{
                  input: "text-white placeholder:text-gray-400",
                  inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                }}
              />
            </div>
            <Select
              placeholder="Category"
              selectedKeys={selectedCategory ? [selectedCategory] : []}
              onSelectionChange={(keys) => setSelectedCategory(Array.from(keys)[0] as string)}
              className="md:w-48"
              classNames={{
                trigger: "bg-white/10 border-white/20 hover:bg-white/15",
                value: "text-white",
                selectorIcon: "text-gray-400"
              }}
            >
              <SelectItem key="all" value="all" className="text-gray-900">All Categories</SelectItem>
              {realModules
                .map(module => module.category)
                .filter((category, index, self) => category && self.indexOf(category) === index)
                .sort()
                .map(category => (
                  <SelectItem key={category} value={category} className="text-gray-900">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
            </Select>
            <Select
              placeholder="Sort by"
              selectedKeys={sortBy ? [sortBy] : []}
              onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as string)}
              className="md:w-48"
              classNames={{
                trigger: "bg-white/10 border-white/20 hover:bg-white/15",
                value: "text-white",
                selectorIcon: "text-gray-400"
              }}
            >
              <SelectItem key="popular" value="popular" className="text-gray-900">Most Popular</SelectItem>
              <SelectItem key="rating" value="rating" className="text-gray-900">Highest Rated</SelectItem>
              <SelectItem key="price-low" value="price-low" className="text-gray-900">Price: Low to High</SelectItem>
              <SelectItem key="price-high" value="price-high" className="text-gray-900">Price: High to Low</SelectItem>
              <SelectItem key="newest" value="newest" className="text-gray-900">Newest</SelectItem>
            </Select>
            <div className="flex gap-2">
              <Button
                isIconOnly
                variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                isIconOnly
                variant={viewMode === 'list' ? 'solid' : 'ghost'}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* All Videos */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">All Videos ({sortedModules.length})</h3>
        </CardHeader>
        <CardBody>
          {sortedModules.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">No videos available</h4>
              <p className="text-gray-300 text-sm">Videos will appear here when added by admin.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {sortedModules.map(renderVideoCard)}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderCartPage = () => {
    setShowCartModal(true);
    return null;
  };

  const renderDashboardPage = () => (
    <div className="space-y-6">
      {/* User Progress */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Your Progress</h3>
            <Chip className={`bg-gradient-to-r ${selectedTheme.secondary} text-white`}>
              {dailyStreak} day streak! 🔥
            </Chip>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{realModules.length}</div>
              <div className="text-gray-300">Total Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{purchasedModules.length}</div>
              <div className="text-gray-300">Purchased</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{availableModules.length}</div>
              <div className="text-gray-300">Available to Buy</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              className={`bg-gradient-to-r ${selectedTheme.primary} text-white h-20 flex-col gap-2`}
              onClick={() => setCurrentPage('store')}
            >
              <ShoppingCart className="w-6 h-6" />
              <span>Browse Videos</span>
            </Button>
            <Button
              className={`bg-gradient-to-r ${selectedTheme.secondary} text-white h-20 flex-col gap-2`}
              onClick={() => setShowCartModal(true)}
            >
              <ShoppingCart className="w-6 h-6" />
              <span>Cart ({getTotalItems()})</span>
            </Button>
            <Button
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white h-20 flex-col gap-2"
              onClick={() => setShowThemeModal(true)}
            >
              <Palette className="w-6 h-6" />
              <span>Themes</span>
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white h-20 flex-col gap-2"
              onClick={() => setCurrentPage('profile')}
            >
              <UserIcon className="w-6 h-6" />
              <span>Profile</span>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* All Videos */}
      {renderStorePage()}
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${selectedTheme.background} relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Avatar
                  size="md"
                  className={`bg-gradient-to-r ${selectedTheme.primary} text-white text-xl`}
                >
                  {selectedAvatar}
                </Avatar>
                <div>
                  <h1 className="text-white font-bold">Welcome back, {user.name}!</h1>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant={currentPage === 'dashboard' ? 'solid' : 'ghost'}
                    className={currentPage === 'dashboard' ? `bg-gradient-to-r ${selectedTheme.primary} text-white` : 'text-white'}
                    onClick={() => setCurrentPage('dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant={currentPage === 'store' ? 'solid' : 'ghost'}
                    className={currentPage === 'store' ? `bg-gradient-to-r ${selectedTheme.primary} text-white` : 'text-white'}
                    onClick={() => setCurrentPage('store')}
                  >
                    Store
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-white"
                    onClick={() => setShowCartModal(true)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                    {getTotalItems() > 0 && (
                      <Badge content={getTotalItems()} color="danger" size="sm" />
                    )}
                  </Button>
                </div>

                {/* Profile, Settings and Logout */}
                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-white"
                  onClick={() => setCurrentPage('profile')}
                >
                  <UserIcon className="w-5 h-5" />
                </Button>
                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-white"
                  onClick={() => setShowThemeModal(true)}
                >
                  <Settings className="w-5 h-5" />
                </Button>
                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-white"
                  onClick={onLogout}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderCurrentPage()}
        </div>

        {/* Theme Selection Modal */}
        <Modal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} size="2xl">
          <ModalContent className="bg-white/10 backdrop-blur-md border-white/20">
            <ModalHeader className="text-white">
              <div className="flex items-center gap-2">
                <Palette className="w-6 h-6" />
                <span>Customize Your Experience</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <Tabs aria-label="Customization options" className="w-full">
                <Tab key="themes" title="Themes">
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm">Choose a theme to customize your dashboard appearance. Changes are saved automatically.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {themes.map((theme) => (
                      <Card 
                        key={theme.id} 
                        className={`cursor-pointer transition-all duration-300 ${selectedTheme.id === theme.id ? 'ring-2 ring-white shadow-lg scale-105' : ''} bg-white/5 hover:bg-white/10 hover:scale-102`}
                        onClick={() => handleThemeChange(theme)}
                      >
                        <CardBody className="p-4">
                          <div className={`w-full h-20 rounded-lg ${theme.preview} mb-3 shadow-md`} />
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-semibold">{theme.name}</h4>
                            {selectedTheme.id === theme.id && (
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </Tab>
                <Tab key="avatars" title="Avatars">
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm">Select an avatar to represent you in the dashboard.</p>
                  </div>
                  <div className="grid grid-cols-5 gap-4 mt-4">
                    {avatars.map((avatar, index) => (
                      <Button
                        key={index}
                        className={`h-16 text-2xl transition-all duration-300 ${selectedAvatar === avatar ? `bg-gradient-to-r ${selectedTheme.primary} scale-110 shadow-lg` : 'bg-white/5 hover:bg-white/10 hover:scale-105'}`}
                        onClick={() => handleAvatarChange(avatar)}
                      >
                        {avatar}
                      </Button>
                    ))}
                  </div>
                </Tab>
              </Tabs>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => setShowThemeModal(false)}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Fixed Bottom Navigation (Mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20">
          <div className="flex items-center justify-around py-2">
            <Button
              isIconOnly
              variant="ghost"
              className={currentPage === 'dashboard' ? 'text-white' : 'text-gray-400'}
              onClick={() => setCurrentPage('dashboard')}
            >
              <BookOpen className="w-5 h-5" />
            </Button>
            <Button
              isIconOnly
              variant="ghost"
              className={currentPage === 'store' ? 'text-white' : 'text-gray-400'}
              onClick={() => setCurrentPage('store')}
            >
              <ShoppingCart className="w-5 h-5" />
            </Button>
            <Button
              isIconOnly
              variant="ghost"
              className="text-gray-400"
              onClick={() => setShowCartModal(true)}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                    {getTotalItems()}
                  </div>
                )}
              </div>
            </Button>
            <Button
              isIconOnly
              variant="ghost"
              className={currentPage === 'profile' ? 'text-white' : 'text-gray-400'}
              onClick={() => setCurrentPage('profile')}
            >
              <UserIcon className="w-5 h-5" />
            </Button>
            <Button
              isIconOnly
              variant="ghost"
              className="text-gray-400"
              onClick={() => setShowThemeModal(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-20 md:bottom-8 right-4 flex flex-col gap-3">
          <Tooltip content="Help & Support" placement="left">
            <Button
              isIconOnly
              className={`bg-gradient-to-r ${selectedTheme.secondary} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
              size="lg"
              onClick={() => alert('Help & Support: Contact us at support@zingalinga.com or call 1-800-ZINGA')}
            >
              <HelpCircle className="w-6 h-6" />
            </Button>
          </Tooltip>
        </div>

        {/* Advanced Video Player */}
        {showVideoPlayer && selectedModule && (
          <AdvancedVideoPlayer
            isOpen={showVideoPlayer}
            onClose={handleVideoPlayerClose}
            module={selectedModule}
            user={user}
            purchases={realPurchases}
            onPurchase={handleVideoPurchase}
          />
        )}
        
        {/* Cart Modal */}
        <CartModal 
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          onPurchase={(items) => {
            items.forEach(item => handleVideoPurchase(item.id));
            setShowCartModal(false);
          }}
        />
      </div>
    </div>
  );
}