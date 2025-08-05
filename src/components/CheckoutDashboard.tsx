'use client';

import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  ArrowRight,
  CreditCard,
  Package,
  Home
} from 'lucide-react';
import { User, Module, Purchase, ContentFile } from '../types';
import { vpsDataStore } from '../utils/vpsDataStore';
import { checkVideoAccess, getUserPurchasedModules, getUserAvailableModules } from '../utils/videoAccess';
import { CleanVideoPlayer } from './CleanVideoPlayer';
import { sanitizeInput, sanitizeForLog } from '../utils/securityUtils';
import { applySecurityFixes } from '../utils/comprehensiveSecurityFix';

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

interface CartItem {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  quantity: number;
}

interface UserProgress {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  streak: number;
  purchasedCount: number;
  completionRate: number;
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

export default function CheckoutDashboard({ 
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
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'store' | 'cart' | 'checkout' | 'thankyou' | 'profile'>('dashboard');
  
  // Modal states
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [addedToCartItem, setAddedToCartItem] = useState<Module | null>(null);

  // E-commerce state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [purchasedItems, setPurchasedItems] = useState<CartItem[]>([]);

  // User progress state - will be calculated from real data
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    currentXP: 0,
    nextLevelXP: 100,
    totalXP: 0,
    streak: 1,
    purchasedCount: 0,
    completionRate: 0
  });

  // Calculate user progress based on real data
  const calculateUserProgress = (purchasedModules: Module[], totalModules: Module[]): UserProgress => {
    const purchasedCount = purchasedModules.length;
    const totalCount = totalModules.length;
    
    // XP calculation
    const baseXP = purchasedCount * 50; // 50 XP per purchased video
    const bonusXP = Math.floor(purchasedCount / 5) * 25; // Bonus XP for every 5 purchases
    const totalXP = baseXP + bonusXP;
    
    // Level calculation (every 100 XP = 1 level)
    const level = Math.max(1, Math.floor(totalXP / 100) + 1);
    const currentLevelXP = totalXP % 100;
    const nextLevelRequiredXP = 100;
    
    // Streak calculation (based on recent activity)
    const streak = Math.min(Math.max(1, purchasedCount + 1), 30); // Max 30 day streak
    
    // Completion rate
    const completionRate = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;
    
    return {
      level,
      currentXP: currentLevelXP,
      nextLevelXP: nextLevelRequiredXP,
      totalXP,
      streak,
      purchasedCount,
      completionRate
    };
  };

  // Get user's purchased and available modules using access control
  const purchasedModules = getUserPurchasedModules(user, realModules, realPurchases);
  const availableModules = getUserAvailableModules(user, realModules, realPurchases);

  // Load real data on component mount
  useEffect(() => {
    loadRealData();
    loadUserPreferences();
  }, [modules, purchases]);

  // Update user progress when data changes
  useEffect(() => {
    const progress = calculateUserProgress(purchasedModules, realModules);
    setUserProgress(progress);
  }, [purchasedModules.length, realModules.length]);

  // Update purchased modules when purchases change
  useEffect(() => {
    if (realPurchases.length > 0) {
      // Remove purchased items from cart
      const purchasedModuleIds = realPurchases
        .filter(p => p.userId === sanitizeInput(user.id) && p.status === 'completed')
        .flatMap(p => p.moduleIds || [p.moduleId].filter(Boolean));
      
      setCart(prevCart => prevCart.filter(item => !purchasedModuleIds.includes(item.id)));
    }
  }, [realPurchases, user.id]);

  const loadRealData = async () => {
    try {
      const data = await vpsDataStore.loadData();
      setRealModules(data.modules || modules || []);
      setRealPurchases(data.purchases || purchases || []);
      console.log('Loaded modules count:', (data.modules || modules || []).length);
      console.log('Loaded purchases count:', (data.purchases || purchases || []).length);
    } catch (error) {
      console.error('Error loading real data:', error);
      setRealModules(modules || []);
      setRealPurchases(purchases || []);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const userData = await vpsDataStore.getUserData(sanitizeInput(user.id));
      if (userData) {
        setSelectedTheme(userData.theme || themes[0]);
        setSelectedAvatar(userData.avatar || avatars[0]);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  // Video player functions
  const handleVideoPlay = (moduleId: string) => {
    console.log('Attempting to play video for module ID');
    const module = realModules.find(m => m.id === moduleId);
    console.log('Module found:', !!module);
    
    if (module) {
      const accessResult = checkVideoAccess(user, module, realPurchases);
      console.log('Access granted:', accessResult.hasAccess);
      
      setSelectedModule(module);
      setShowVideoPlayer(true);
    } else {
      console.error('Module not found for provided ID');
    }
  };

  const handleVideoPurchase = (moduleId: string) => {
    console.log('Purchase requested for module ID');
    if (onPurchase) {
      onPurchase(moduleId);
    }
  };

  const handleVideoPlayerClose = () => {
    setShowVideoPlayer(false);
    setSelectedModule(null);
  };

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    vpsDataStore.updateUserPreferences(sanitizeInput(user.id), { theme });
  };

  const handleAvatarChange = (avatar: string) => {
    setSelectedAvatar(avatar);
    vpsDataStore.updateUserPreferences(sanitizeInput(user.id), { avatar });
  };

  const addToCart = (module: Module) => {
    // Check if user already owns this module
    const isPurchased = purchasedModules.some(p => p.id === module.id);
    
    if (isPurchased) {
      // Show message that they already own it
      return;
    }

    const existingItem = cart.find(item => item.id === module.id);
    if (existingItem) {
      // Item already in cart, just show modal
      setAddedToCartItem(module);
      setShowCartModal(true);
    } else {
      // Add new item to cart
      const newCartItem = {
        id: module.id,
        title: module.title,
        price: module.price || 0,
        thumbnail: module.thumbnail || '',
        quantity: 1
      };
      setCart([...cart, newCartItem]);
      setAddedToCartItem(module);
      setShowCartModal(true);
    }
  };

  const removeFromCart = (moduleId: string) => {
    setCart(cart.filter(item => item.id !== moduleId));
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
  };

  const handlePurchaseComplete = () => {
    // Store purchased items for thank you page
    setPurchasedItems([...cart]);
    
    // Process each purchase
    cart.forEach(item => handleVideoPurchase(item.id));
    
    // Clear cart and go to thank you page
    setCart([]);
    setCurrentPage('thankyou');
  };

  const filteredModules = realModules.filter(module => {
    const sanitizedQuery = sanitizeInput(searchQuery.toLowerCase());
    const sanitizedCategory = sanitizeInput(selectedCategory);
    const matchesSearch = module.title.toLowerCase().includes(sanitizedQuery) ||
                         module.description.toLowerCase().includes(sanitizedQuery);
    const matchesCategory = sanitizedCategory === 'all' || module.category?.toLowerCase() === sanitizedCategory.toLowerCase();
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
    const isInCart = cart.some(item => item.id === module.id);
    
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

              {isInCart && !isPurchased && (
                <Chip 
                  size="sm" 
                  className="bg-blue-500/90 text-white border-blue-400/50 backdrop-blur-sm shadow-lg"
                  startContent={<ShoppingCart className="w-3 h-3" />}
                >
                  In Cart
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
                  className={`${isInCart ? 'bg-gray-600' : `bg-gradient-to-r ${selectedTheme.primary}`} text-white flex-1`}
                  onClick={() => addToCart(module)}
                  disabled={isInCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {isInCart ? 'In Cart' : 'Add to Cart'}
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
      case 'checkout':
        return renderCheckoutPage();
      case 'thankyou':
        return renderThankYouPage();
      case 'profile':
        return (
          <UserProfilePage
            user={user}
            onBack={() => setCurrentPage('dashboard')}
            onNavigate={(page) => setCurrentPage(page as any)}
            onUserUpdate={(updatedUser) => {
              console.log('User updated successfully');
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
              <SelectItem key="language" value="language">Language</SelectItem>
              <SelectItem key="math" value="math">Math</SelectItem>
              <SelectItem key="science" value="science">Science</SelectItem>
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

  const renderCartPage = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h3>
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
                    onClick={handleCheckout}
                    endContent={<ArrowRight className="w-4 h-4" />}
                  >
                    {cart.length === 1 ? 'Checkout' : 'Checkout All'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderCheckoutPage = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">Checkout</h3>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Order Summary</h4>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gray-300 rounded" />
                      <div>
                        <h5 className="text-white font-medium">{item.title}</h5>
                        <p className="text-gray-400 text-sm">Digital Video</p>
                      </div>
                    </div>
                    <span className="text-green-400 font-bold">${item.price}</span>
                  </div>
                ))}
                <Divider className="bg-white/20" />
                <div className="flex justify-between items-center text-lg">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="text-green-400 font-bold">${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Payment Information</h4>
              <div className="space-y-4">
                <Input
                  label="Email"
                  placeholder="your@email.com"
                  value={user.email}
                  disabled
                  className="bg-white/5"
                />
                <Input
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  className="bg-white/5"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry Date"
                    placeholder="MM/YY"
                    className="bg-white/5"
                  />
                  <Input
                    label="CVV"
                    placeholder="123"
                    className="bg-white/5"
                  />
                </div>
                <Input
                  label="Cardholder Name"
                  placeholder="John Doe"
                  className="bg-white/5"
                />
              </div>
            </div>
          </div>

          <Divider className="bg-white/20 my-6" />

          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('cart')}
              startContent={<ArrowRight className="w-4 h-4 rotate-180" />}
            >
              Back to Cart
            </Button>
            <Button
              className={`bg-gradient-to-r ${selectedTheme.primary} text-white`}
              onClick={handlePurchaseComplete}
              endContent={<CreditCard className="w-4 h-4" />}
              size="lg"
            >
              Complete Purchase - ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderThankYouPage = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardBody className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">Thank You for Your Purchase!</h2>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Your payment has been processed successfully. You now have access to your purchased videos.
          </p>

          {/* Purchased Items */}
          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              Your Purchase
            </h3>
            <div className="space-y-3">
              {purchasedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gray-300 rounded" />
                    <div className="text-left">
                      <h5 className="text-white font-medium">{item.title}</h5>
                      <p className="text-green-400 text-sm">✓ Access Granted</p>
                    </div>
                  </div>
                  <span className="text-green-400 font-bold">${item.price}</span>
                </div>
              ))}
              <Divider className="bg-white/20" />
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Total Paid:</span>
                <span className="text-green-400 font-bold text-lg">
                  ${purchasedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className={`bg-gradient-to-r ${selectedTheme.primary} text-white`}
              onClick={() => setCurrentPage('dashboard')}
              startContent={<Home className="w-4 h-4" />}
              size="lg"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('store')}
              className="text-white"
              size="lg"
            >
              Continue Shopping
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderDashboardPage = () => (
    <div className="space-y-6">
      {/* User Progress - Real Data */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Your Progress</h3>
            <Chip className={`bg-gradient-to-r ${selectedTheme.secondary} text-white`}>
              {userProgress.streak} day streak! 🔥
            </Chip>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{realModules.length}</div>
              <div className="text-gray-300">Total Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{userProgress.purchasedCount}</div>
              <div className="text-gray-300">Purchased</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{availableModules.length}</div>
              <div className="text-gray-300">Available to Buy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{userProgress.completionRate}%</div>
              <div className="text-gray-300">Completion Rate</div>
            </div>
          </div>
          
          {/* XP Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Level {userProgress.level}</span>
              <span className="text-gray-300 text-sm">{userProgress.currentXP}/{userProgress.nextLevelXP} XP</span>
            </div>
            <Progress 
              value={(userProgress.currentXP / userProgress.nextLevelXP) * 100}
              className="h-3"
              classNames={{
                indicator: `bg-gradient-to-r ${selectedTheme.primary}`
              }}
            />
            <div className="text-center mt-2">
              <span className="text-gray-400 text-sm">Total XP: {userProgress.totalXP}</span>
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
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-300">Level {userProgress.level}</span>
                    <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${selectedTheme.primary} transition-all duration-500`}
                        style={{ width: `${(userProgress.currentXP / userProgress.nextLevelXP) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-300">{userProgress.currentXP}/{userProgress.nextLevelXP} XP</span>
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

        {/* Add to Cart Success Modal */}
        <Modal isOpen={showCartModal} onClose={() => setShowCartModal(false)} size="md">
          <ModalContent className="bg-white/10 backdrop-blur-md border-white/20">
            <ModalHeader className="text-white">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span>Added to Cart!</span>
              </div>
            </ModalHeader>
            <ModalBody>
              {addedToCartItem && (
                <div className="text-center space-y-4">
                  <div className="w-20 h-14 bg-gray-300 rounded-lg mx-auto" />
                  <div>
                    <h4 className="text-white font-semibold">{addedToCartItem.title}</h4>
                    <p className="text-green-400 font-bold">${addedToCartItem.price}</p>
                  </div>
                  <p className="text-gray-300 text-sm">
                    This video has been added to your cart. You can continue shopping or proceed to checkout.
                  </p>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => setShowCartModal(false)}
                className="text-white"
              >
                Continue Shopping
              </Button>
              <Button
                className={`bg-gradient-to-r ${selectedTheme.primary} text-white`}
                onClick={() => {
                  setShowCartModal(false);
                  setCurrentPage('cart');
                }}
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                View Cart ({cart.length})
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

        {/* Clean Simple Video Player with Related Videos */}
        {showVideoPlayer && selectedModule && (
          <CleanVideoPlayer
            isOpen={showVideoPlayer}
            onClose={handleVideoPlayerClose}
            module={selectedModule}
            user={user}
            purchases={realPurchases}
            onPurchase={handleVideoPurchase}
            allModules={realModules}
            onVideoSelect={handleVideoPlay}
          />
        )}
      </div>
    </div>
  );
}