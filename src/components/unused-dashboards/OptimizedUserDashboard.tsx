'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Tab,
  Skeleton
} from '@nextui-org/react';
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
  User as UserIcon,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { User, Module, Purchase, ContentFile } from '../types';
import { useModules, usePurchases, useSettings } from '../hooks/useOptimizedData';
import { checkVideoAccess, getUserPurchasedModules, getUserAvailableModules } from '../utils/videoAccess';
import { AdvancedVideoPlayer } from './AdvancedVideoPlayer';
import PerformanceMonitor from './PerformanceMonitor';
import { sanitizeInput, sanitizeForLog } from '../utils/securityUtils';

interface UserDashboardProps {
  user: User;
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

interface CartItem {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  quantity: number;
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
  }
];

const avatars = [
  '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🦄', '🐉', '🦋', '🌟', '🎭', '🎨'
];

export default function OptimizedUserDashboard({ 
  user, 
  onLogout, 
  onPurchase 
}: UserDashboardProps) {
  // Optimized data loading with caching and error handling
  const { 
    data: modules, 
    loading: modulesLoading, 
    error: modulesError, 
    refresh: refreshModules,
    lastUpdated: modulesLastUpdated 
  } = useModules({ autoRefresh: true, refreshInterval: 60000 });

  const { 
    data: purchases, 
    loading: purchasesLoading, 
    error: purchasesError,
    refresh: refreshPurchases 
  } = usePurchases({ autoRefresh: true, refreshInterval: 30000 });

  const { 
    data: settings, 
    loading: settingsLoading 
  } = useSettings();

  // Video player state
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // Theme and UI state
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(avatars[0]);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'store' | 'cart' | 'profile'>('dashboard');
  
  // Modal states
  const [showThemeModal, setShowThemeModal] = useState(false);

  // E-commerce state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // User progress state
  const [userLevel, setUserLevel] = useState(5);
  const [currentXP, setCurrentXP] = useState(750);
  const [nextLevelXP, setNextLevelXP] = useState(1000);
  const [dailyStreak, setDailyStreak] = useState(12);

  // Load user preferences
  useEffect(() => {
    loadUserPreferences();
  }, [user.id]);

  const loadUserPreferences = async () => {
    try {
      // This would normally come from optimized data store
      const userData = user as any;
      if (userData) {
        setSelectedTheme(userData.theme || themes[0]);
        setSelectedAvatar(userData.avatar || avatars[0]);
      }
    } catch (error) {
      console.error('Error loading user preferences:', sanitizeForLog(error));
    }
  };

  // Video player functions
  const handleVideoPlay = useCallback((moduleId: string) => {
    if (!modules) return;
    
    const sanitizedId = sanitizeInput(moduleId);
    const module = modules.find(m => m.id === sanitizedId);
    if (module) {
      const accessResult = checkVideoAccess(user, module, purchases || []);
      setSelectedModule(module);
      setShowVideoPlayer(true);
    }
  }, [modules, user, purchases]);

  const handleVideoPurchase = useCallback((moduleId: string) => {
    const sanitizedId = sanitizeInput(moduleId);
    if (onPurchase && sanitizedId) {
      onPurchase(sanitizedId);
      // Refresh purchases after purchase
      setTimeout(() => refreshPurchases(), 1000);
    }
  }, [onPurchase, refreshPurchases]);

  const handleVideoPlayerClose = () => {
    setShowVideoPlayer(false);
    setSelectedModule(null);
  };

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    // Save to optimized data store
  };

  const handleAvatarChange = (avatar: string) => {
    setSelectedAvatar(avatar);
    // Save to optimized data store
  };

  const addToCart = useCallback((module: Module) => {
    const sanitizedId = sanitizeInput(module.id);
    const sanitizedTitle = sanitizeInput(module.title);
    
    const existingItem = cart.find(item => item.id === sanitizedId);
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.id === sanitizedId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart(prev => [...prev, {
        id: sanitizedId,
        title: sanitizedTitle,
        price: module.price || 0,
        thumbnail: module.thumbnail || '',
        quantity: 1
      }]);
    }
  }, [cart]);

  const removeFromCart = useCallback((moduleId: string) => {
    const sanitizedId = sanitizeInput(moduleId);
    setCart(prev => prev.filter(item => item.id !== sanitizedId));
  }, []);

  // Handle refresh all data
  const handleRefreshAll = async () => {
    await Promise.all([
      refreshModules(),
      refreshPurchases()
    ]);
  };

  // Get user's purchased and available modules using access control (memoized)
  const purchasedModules = useMemo(() => 
    modules && purchases ? getUserPurchasedModules(user, modules, purchases) : []
  , [modules, purchases, user]);
  
  const availableModules = useMemo(() => 
    modules && purchases ? getUserAvailableModules(user, modules, purchases) : []
  , [modules, purchases, user]);

  const filteredModules = useMemo(() => {
    if (!modules) return [];
    return modules.filter(module => {
      const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           module.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || module.category?.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [modules, searchQuery, selectedCategory]);

  const sortedModules = useMemo(() => {
    return [...filteredModules].sort((a, b) => {
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
  }, [filteredModules, sortBy]);

  // Loading skeleton component
  const LoadingSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="bg-white/5">
          <CardBody className="p-4">
            <Skeleton className="rounded-lg mb-3">
              <div className={viewMode === 'list' ? 'w-32 h-20' : 'aspect-video'} />
            </Skeleton>
            <Skeleton className="w-3/4 rounded-lg mb-2">
              <div className="h-4" />
            </Skeleton>
            <Skeleton className="w-full rounded-lg mb-3">
              <div className="h-3" />
            </Skeleton>
            <div className="flex gap-2">
              <Skeleton className="w-20 rounded-lg">
                <div className="h-8" />
              </Skeleton>
              <Skeleton className="w-16 rounded-lg">
                <div className="h-8" />
              </Skeleton>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <Card className="bg-red-500/10 border-red-500/20">
      <CardBody className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h4 className="text-white font-semibold mb-2">Error Loading Data</h4>
        <p className="text-red-300 text-sm mb-4">{error}</p>
        <Button
          color="danger"
          variant="flat"
          startContent={<RefreshCw className="w-4 h-4" />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      </CardBody>
    </Card>
  );

  const renderVideoCard = (module: Module) => {
    const accessResult = checkVideoAccess(user, module, purchases || []);
    const isPurchased = purchasedModules.some(p => p.id === module.id);
    
    return (
      <Card key={module.id} className={`bg-white/5 hover:bg-white/10 transition-all duration-300 group ${viewMode === 'list' ? 'flex-row' : ''}`}>
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
            
            {/* Play Button */}
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
                  Add to Cart
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

  const renderStorePage = () => (
    <div className="space-y-6">
      {/* Data Status Bar */}
      {(modulesLoading || purchasesLoading) && (
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardBody className="py-3">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
              <span className="text-sm text-blue-300">Loading latest data...</span>
              {modulesLastUpdated && (
                <span className="text-xs text-blue-400">
                  Last updated: {modulesLastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Error Display */}
      {(modulesError || purchasesError) && (
        <ErrorDisplay 
          error={modulesError || purchasesError || 'Unknown error'} 
          onRetry={handleRefreshAll}
        />
      )}

      {/* Search and Filters */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4" />}
                className="bg-white/5"
              />
            </div>
            <Select
              placeholder="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="md:w-48"
            >
              <SelectItem key="all" value="all">All Categories</SelectItem>
              {modules && modules
                .map(module => module.category)
                .filter((category, index, self) => category && self.indexOf(category) === index)
                .sort()
                .map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
            </Select>
            <Select
              placeholder="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="md:w-48"
            >
              <SelectItem key="popular" value="popular">Most Popular</SelectItem>
              <SelectItem key="rating" value="rating">Highest Rated</SelectItem>
              <SelectItem key="price-low" value="price-low">Price: Low to High</SelectItem>
              <SelectItem key="price-high" value="price-high">Price: High to Low</SelectItem>
              <SelectItem key="newest" value="newest">Newest</SelectItem>
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
              <Button
                isIconOnly
                variant="ghost"
                onClick={handleRefreshAll}
                isLoading={modulesLoading || purchasesLoading}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* All Videos */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <h3 className="text-xl font-bold text-white">
              All Videos ({sortedModules.length})
            </h3>
            {modulesLastUpdated && (
              <span className="text-xs text-gray-400">
                Updated: {modulesLastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {modulesLoading ? (
            <LoadingSkeleton />
          ) : sortedModules.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">No videos available</h4>
              <p className="text-gray-300 text-sm">Videos will appear here when added by admin.</p>
              <Button
                className="mt-4"
                variant="flat"
                startContent={<RefreshCw className="w-4 h-4" />}
                onClick={refreshModules}
              >
                Refresh
              </Button>
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

  const renderCartPage = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">Shopping Cart ({cart.length} items)</h3>
        </CardHeader>
        <CardBody>
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Your cart is empty</p>
              <Button
                className={`bg-gradient-to-r ${selectedTheme.primary} text-white`}
                onClick={() => setCurrentPage('store')}
              >
                Browse Videos
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="bg-white/5">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-14 bg-gray-300 rounded-lg" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <p className="text-green-400 font-bold">${item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          isIconOnly
                          variant="ghost"
                          color="danger"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
              <Divider className="bg-white/20" />
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white text-lg font-bold">
                    Total: ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setCart([])}
                  >
                    Clear Cart
                  </Button>
                  <Button
                    className={`bg-gradient-to-r ${selectedTheme.primary} text-white`}
                    onClick={() => {
                      cart.forEach(item => handleVideoPurchase(item.id));
                      setCart([]);
                    }}
                  >
                    Purchase All
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

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
              <div className="text-2xl font-bold text-white mb-2">
                {modulesLoading ? <Skeleton className="w-8 h-8 mx-auto" /> : (modules?.length || 0)}
              </div>
              <div className="text-gray-300">Total Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {purchasesLoading ? <Skeleton className="w-8 h-8 mx-auto" /> : purchasedModules.length}
              </div>
              <div className="text-gray-300">Purchased</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {modulesLoading ? <Skeleton className="w-8 h-8 mx-auto" /> : availableModules.length}
              </div>
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
              onClick={() => setCurrentPage('cart')}
            >
              <ShoppingCart className="w-6 h-6" />
              <span>Cart ({cart.length})</span>
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
              console.log('User updated successfully');
              loadUserPreferences();
            }}
          />
        );
      default:
        return renderDashboardPage();
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${selectedTheme.background} relative overflow-hidden`}>
      {/* Performance Monitor */}
      <PerformanceMonitor />

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
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-300">Level {userLevel}</span>
                    <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${selectedTheme.primary} transition-all duration-500`}
                        style={{ width: `${(currentXP / nextLevelXP) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-300">{currentXP}/{nextLevelXP} XP</span>
                  </div>
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
                    variant={currentPage === 'cart' ? 'solid' : 'ghost'}
                    className={currentPage === 'cart' ? `bg-gradient-to-r ${selectedTheme.primary} text-white` : 'text-white'}
                    onClick={() => setCurrentPage('cart')}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                    {cart.length > 0 && (
                      <Badge content={cart.length} color="danger" size="sm" />
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
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {themes.map((theme) => (
                      <Card 
                        key={theme.id} 
                        className={`cursor-pointer transition-all duration-300 ${selectedTheme.id === theme.id ? 'ring-2 ring-white' : ''} bg-white/5 hover:bg-white/10`}
                        onClick={() => handleThemeChange(theme)}
                      >
                        <CardBody className="p-4">
                          <div className={`w-full h-20 rounded-lg ${theme.preview} mb-3`} />
                          <h4 className="text-white font-semibold">{theme.name}</h4>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </Tab>
                <Tab key="avatars" title="Avatars">
                  <div className="grid grid-cols-5 gap-4 mt-4">
                    {avatars.map((avatar, index) => (
                      <Button
                        key={index}
                        className={`h-16 text-2xl ${selectedAvatar === avatar ? `bg-gradient-to-r ${selectedTheme.primary}` : 'bg-white/5 hover:bg-white/10'}`}
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
              className={currentPage === 'cart' ? 'text-white' : 'text-gray-400'}
              onClick={() => setCurrentPage('cart')}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                    {cart.length}
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
            purchases={purchases || []}
            onPurchase={handleVideoPurchase}
          />
        )}
      </div>
    </div>
  );
}