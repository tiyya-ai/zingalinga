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
  Image,
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
  User as UserIcon
} from 'lucide-react';
import { User, Module, Purchase, ContentFile } from '../types';
import { vpsDataStore } from '../utils/vpsDataStore';
import { checkVideoAccess, getUserPurchasedModules, getUserAvailableModules } from '../utils/videoAccess';
import { EnhancedVideoPlayer } from './EnhancedVideoPlayer';

interface UserDashboardProps {
  user: User;
  modules?: Module[];
  purchases?: Purchase[];
  contentFiles?: ContentFile[];
  onModuleUpdate?: (modules: Module[]) => void;
  onLogout: () => void;
  onPurchase?: (moduleId: string) => void;
}

interface WatchHistory {
  id: string;
  title: string;
  thumbnail: string;
  progress: number;
  duration: string;
  lastWatched: string;
}

interface DailyLimit {
  totalMinutes: number;
  usedMinutes: number;
  resetTime: string;
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

interface PaymentCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

interface VideoProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  duration: string;
  rating: number;
  category: string;
  ageGroup: string;
  isPremium: boolean;
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

const demoVideoProducts: VideoProduct[] = [
  {
    id: '1',
    title: 'Arabic Alphabet Adventure',
    description: 'Learn Arabic letters through fun animations',
    price: 0, // Free demo
    thumbnail: '/api/placeholder/300/200',
    duration: '25 min',
    rating: 4.8,
    category: 'Language',
    ageGroup: '3-6',
    isPremium: false
  },
  {
    id: '2',
    title: 'Math Magic Kingdom',
    description: 'Discover numbers and basic math concepts',
    price: 12.99,
    thumbnail: '/api/placeholder/300/200',
    duration: '30 min',
    rating: 4.9,
    category: 'Math',
    ageGroup: '4-7',
    isPremium: true
  },
  {
    id: '3',
    title: 'Science Explorers',
    description: 'Fun experiments and discoveries',
    price: 14.99,
    thumbnail: '/api/placeholder/300/200',
    duration: '35 min',
    rating: 4.7,
    category: 'Science',
    ageGroup: '5-8',
    isPremium: true
  }
];

// Demo modules with video URLs for testing
const demoModules: Module[] = [
  {
    id: '1',
    title: 'Arabic Alphabet Adventure',
    description: 'Learn Arabic letters through fun animations',
    price: 0,
    thumbnail: '/api/placeholder/300/200',
    estimatedDuration: '25 min',
    rating: 4.8,
    category: 'Language',
    ageRange: '3-6',
    isPremium: false,
    isDemo: true,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    demoVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: '2',
    title: 'Math Magic Kingdom',
    description: 'Discover numbers and basic math concepts',
    price: 12.99,
    thumbnail: '/api/placeholder/300/200',
    estimatedDuration: '30 min',
    rating: 4.9,
    category: 'Math',
    ageRange: '4-7',
    isPremium: true,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    demoVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: '3',
    title: 'Science Explorers',
    description: 'Fun experiments and discoveries',
    price: 14.99,
    thumbnail: '/api/placeholder/300/200',
    estimatedDuration: '35 min',
    rating: 4.7,
    category: 'Science',
    ageRange: '5-8',
    isPremium: true,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    demoVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  }
];

const demoPaymentCards: PaymentCard[] = [
  {
    id: '1',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2025
  }
];

export default function ModernUserDashboard({ 
  user, 
  modules = [], 
  purchases = [], 
  contentFiles = [], 
  onModuleUpdate, 
  onLogout, 
  onPurchase 
}: UserDashboardProps) {
  // State for dashboard modules
  const [activeModules, setActiveModules] = useState<string[]>(['dashboard']);
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(avatars[0]);
  const [dailyLimits, setDailyLimits] = useState<DailyLimit>({
    totalMinutes: 120,
    usedMinutes: 45,
    resetTime: '20:00'
  });
  const [parentalControls, setParentalControls] = useState({
    enabled: true,
    pin: '1234',
    restrictedCategories: ['mature']
  });

  // E-commerce state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [videoProducts, setVideoProducts] = useState<VideoProduct[]>([]);
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>(demoPaymentCards);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'store' | 'cart' | 'checkout' | 'profile'>('dashboard');

  // Modal states
  const [showSurpriseModal, setShowSurpriseModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showOrderComplete, setShowOrderComplete] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');

  // Video player state
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // Real data state
  const [realModules, setRealModules] = useState<Module[]>([]);
  const [realPurchases, setRealPurchases] = useState<Purchase[]>([]);

  // User progress state
  const [userLevel, setUserLevel] = useState(5);
  const [currentXP, setCurrentXP] = useState(750);
  const [nextLevelXP, setNextLevelXP] = useState(1000);
  const [dailyStreak, setDailyStreak] = useState(12);
  const [achievements, setAchievements] = useState([
    { id: '1', name: 'First Steps', description: 'Complete your first lesson', unlocked: true, progress: 100 },
    { id: '2', name: 'Week Warrior', description: 'Learn for 7 days straight', unlocked: true, progress: 100 },
    { id: '3', name: 'Math Master', description: 'Complete 10 math lessons', unlocked: false, progress: 60 },
    { id: '4', name: 'Language Lover', description: 'Learn 50 new words', unlocked: false, progress: 80 }
  ]);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
    loadVideoProducts();
    loadRealData();
    generateDailyPicks();
    generateLearningPath();
  }, [modules, purchases]);

  const loadUserData = async () => {
    try {
      const userData = await vpsDataStore.getUserData(user.id);
      if (userData) {
        setWatchHistory(userData.watchHistory || []);
        setFavorites(userData.favorites || []);
        setSelectedTheme(userData.theme || themes[0]);
        setSelectedAvatar(userData.avatar || avatars[0]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadVideoProducts = async () => {
    try {
      const products = await vpsDataStore.getProducts();
      // Convert modules to video products format
      const convertedProducts = products.map(module => ({
        id: module.id || Date.now().toString(),
        title: module.title || 'Untitled Video',
        description: module.description || 'No description available',
        price: module.price || 0,
        thumbnail: module.thumbnail || module.imageUrl || '/placeholder-video.jpg',
        category: module.category || 'educational',
        duration: module.estimatedDuration || '5 min',
        rating: module.rating || 4.5,
        ageRange: module.ageRange || '3-8 years',
        videoUrl: module.videoUrl || module.videoSource || '',
        featured: module.featured || false
      }));
      setVideoProducts(convertedProducts.length > 0 ? convertedProducts : demoVideoProducts);
    } catch (error) {
      console.error('Error loading video products:', error);
      // Fallback to demo data if real data fails to load
      setVideoProducts(demoVideoProducts);
     }
   };

  const generateDailyPicks = () => {
    // Generate personalized daily picks based on user preferences
  };

  const generateLearningPath = () => {
    // Generate adaptive learning path
  };

  const loadRealData = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const loadedModules = data.modules || modules || [];
      // If no modules are loaded, use demo modules
      setRealModules(loadedModules.length > 0 ? loadedModules : demoModules);
      setRealPurchases(data.purchases || purchases || []);
    } catch (error) {
      console.error('Error loading real data:', error);
      // Fallback to demo modules if loading fails
      setRealModules(modules.length > 0 ? modules : demoModules);
      setRealPurchases(purchases || []);
    }
  };

  // Video player functions
  const handleVideoPlay = (moduleId: string) => {
    const module = realModules.find(m => m.id === moduleId);
    if (module) {
      setSelectedModule(module);
      setShowVideoPlayer(true);
    }
  };

  const handleVideoPurchase = (moduleId: string) => {
    if (onPurchase) {
      onPurchase(moduleId);
    }
  };

  const handleVideoPlayerClose = () => {
    setShowVideoPlayer(false);
    setSelectedModule(null);
  };

  // Get user's purchased and available modules using access control
  const purchasedModules = getUserPurchasedModules(user, realModules, realPurchases);
  const availableModules = getUserAvailableModules(user, realModules, realPurchases);

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    // Save to user preferences
    vpsDataStore.updateUserPreferences(user.id, { theme });
  };

  const handleAvatarChange = (avatar: string) => {
    setSelectedAvatar(avatar);
    vpsDataStore.updateUserPreferences(user.id, { avatar });
  };

  const toggleFavorite = (videoId: string) => {
    const newFavorites = favorites.includes(videoId)
      ? favorites.filter(id => id !== videoId)
      : [...favorites, videoId];
    setFavorites(newFavorites);
    vpsDataStore.updateUserPreferences(user.id, { favorites: newFavorites });
  };

  const addToCart = (product: VideoProduct) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const processOrder = () => {
    // Process the order
    setCart([]);
    setShowOrderComplete(true);
    setCurrentPage('dashboard');
  };

  const filteredProducts = videoProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id.localeCompare(a.id);
      default:
        return b.rating - a.rating;
    }
  });

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'store':
        return renderStorePage();
      case 'cart':
        return renderCartPage();
      case 'checkout':
        return renderCheckoutPage();
      case 'profile':
        return (
          <UserProfilePage
            user={user}
            onBack={() => setCurrentPage('dashboard')}
            onNavigate={(page) => setCurrentPage(page as any)}
            onUserUpdate={(updatedUser) => {
              // Handle user update if needed
              console.log('User updated:', updatedUser);
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

      {/* Featured Products */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">Featured Videos</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedProducts.slice(0, 3).map((product) => (
              <Card key={product.id} className="bg-white/5 hover:bg-white/10 transition-all duration-300 group">
                <CardBody className="p-4">
                  <div className="aspect-video bg-gray-300 rounded-lg mb-3 relative overflow-hidden cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        isIconOnly
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedTheme.primary} text-white`}
                        onClick={() => handleVideoPlay(product.id)}
                      >
                        <Play className="w-6 h-6" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 text-white text-sm">
                      {product.duration}
                    </div>
                    {product.isPremium && (
                      <div className="absolute top-2 right-2">
                        <Chip size="sm" className="bg-yellow-500 text-black">
                          Premium
                        </Chip>
                      </div>
                    )}
                  </div>
                  <h4 className="font-semibold text-white mb-2">{product.title}</h4>
                  <p className="text-gray-300 text-sm mb-3">{product.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm">{product.rating}</span>
                    </div>
                    <span className="text-green-400 font-bold">${product.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className={`bg-gradient-to-r ${selectedTheme.primary} text-white flex-1`}
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      isIconOnly
                      variant="ghost"
                      onClick={() => toggleFavorite(product.id)}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* All Products */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">All Videos ({sortedProducts.length})</h3>
        </CardHeader>
        <CardBody>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {sortedProducts.map((product) => (
              <Card key={product.id} className={`bg-white/5 hover:bg-white/10 transition-all duration-300 group ${viewMode === 'list' ? 'flex-row' : ''}`}>
                <CardBody className={`p-4 ${viewMode === 'list' ? 'flex flex-row items-center gap-4' : ''}`}>
                  <div className={`bg-gray-300 rounded-lg relative overflow-hidden cursor-pointer ${viewMode === 'list' ? 'w-32 h-20' : 'aspect-video mb-3'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        isIconOnly
                        className={`w-10 h-10 rounded-full bg-gradient-to-r ${selectedTheme.primary} text-white`}
                        onClick={() => handleVideoPlay(product.id)}
                      >
                        <Play className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="absolute bottom-1 left-1 text-white text-xs">
                      {product.duration}
                    </div>
                    {product.isPremium && (
                      <div className="absolute top-1 right-1">
                        <Chip size="sm" className="bg-yellow-500 text-black text-xs">
                          Premium
                        </Chip>
                      </div>
                    )}
                  </div>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h4 className="font-semibold text-white mb-2">{product.title}</h4>
                    <p className="text-gray-300 text-sm mb-3">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white text-sm">{product.rating}</span>
                      </div>
                      <span className="text-green-400 font-bold">${product.price}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className={`bg-gradient-to-r ${selectedTheme.primary} text-white flex-1`}
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        isIconOnly
                        variant="ghost"
                        onClick={() => toggleFavorite(product.id)}
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
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
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-white w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          isIconOnly
                          variant="ghost"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
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
                    Total: ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
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
                    onClick={() => setCurrentPage('checkout')}
                  >
                    Proceed to Checkout
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
          <h3 className="text-xl font-bold text-white">Checkout</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Order Summary */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Order Summary</h4>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-white">
                  <span>{item.title} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Divider className="bg-white/20" />
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total</span>
                <span>${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Payment Method</h4>
            <div className="space-y-2">
              {paymentCards.map((card) => (
                <Card key={card.id} className="bg-white/5 cursor-pointer hover:bg-white/10">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        {card.brand.toUpperCase()}
                      </div>
                      <span className="text-white">•••• •••• •••• {card.last4}</span>
                      <span className="text-gray-400 ml-auto">{card.expiryMonth}/{card.expiryYear}</span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('cart')}
            >
              Back to Cart
            </Button>
            <Button
              className={`bg-gradient-to-r ${selectedTheme.primary} text-white flex-1`}
              onClick={processOrder}
            >
              Complete Order
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderDashboardPage = () => (
    <div className="space-y-6">
      {/* Daily Progress */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Today's Progress</h3>
            <Chip className={`bg-gradient-to-r ${selectedTheme.secondary} text-white`}>
              {dailyStreak} day streak! 🔥
            </Chip>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{dailyLimits.usedMinutes}</div>
              <div className="text-gray-300">Minutes Learned</div>
              <Progress 
                value={(dailyLimits.usedMinutes / dailyLimits.totalMinutes) * 100} 
                className="mt-2"
                classNames={{
                  indicator: `bg-gradient-to-r ${selectedTheme.primary}`
                }}
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{currentXP}</div>
              <div className="text-gray-300">XP Points</div>
              <Progress 
                value={(currentXP / nextLevelXP) * 100} 
                className="mt-2"
                classNames={{
                  indicator: `bg-gradient-to-r ${selectedTheme.secondary}`
                }}
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{userLevel}</div>
              <div className="text-gray-300">Current Level</div>
              <div className="mt-2 text-yellow-400 text-sm">
                {nextLevelXP - currentXP} XP to next level
              </div>
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
              onClick={() => setShowSurpriseModal(true)}
            >
              <Gift className="w-6 h-6" />
              <span>Surprise Me!</span>
            </Button>
            <Button
              className={`bg-gradient-to-r ${selectedTheme.secondary} text-white h-20 flex-col gap-2`}
              onClick={() => setCurrentPage('store')}
            >
              <ShoppingCart className="w-6 h-6" />
              <span>Video Store</span>
            </Button>
            <Button
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white h-20 flex-col gap-2"
            >
              <Heart className="w-6 h-6" />
              <span>Favorites</span>
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white h-20 flex-col gap-2"
            >
              <BookOpen className="w-6 h-6" />
              <span>My Library</span>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Continue Watching */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">Continue Watching</h3>
        </CardHeader>
        <CardBody>
          {watchHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchHistory.filter(video => video.progress < 90).map((video) => (
                <Card key={video.id} className="bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                  <CardBody className="p-4">
                    <div className="aspect-video bg-gray-300 rounded-lg mb-3 relative overflow-hidden">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        fallbackSrc="/placeholder-video.jpg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          isIconOnly
                          className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedTheme.primary} text-white`}
                          onClick={() => handleVideoPlay(video.id)}
                        >
                          <Play className="w-6 h-6" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 left-2 text-white text-sm">
                        {video.duration}
                      </div>
                    </div>
                    <h4 className="font-semibold text-white mb-2">{video.title}</h4>
                    <Progress 
                      value={video.progress} 
                      className="mb-2"
                      classNames={{
                        indicator: `bg-gradient-to-r ${selectedTheme.primary}`
                      }}
                    />
                    <p className="text-gray-300 text-sm">{video.progress}% complete</p>
                    <p className="text-gray-400 text-xs">Last watched: {new Date(video.lastWatched).toLocaleDateString()}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <Play className="w-8 h-8 text-white/60" />
              </div>
              <h4 className="text-white font-semibold mb-2">No videos in progress</h4>
              <p className="text-gray-300 text-sm">Start watching videos to see your progress here!</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Recent Achievements */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">Recent Achievements</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`${achievement.unlocked ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30' : 'bg-white/5'} transition-all duration-300`}>
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.unlocked ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gray-600'}`}>
                      {achievement.unlocked ? (
                        <Trophy className="w-6 h-6 text-white" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${achievement.unlocked ? 'text-yellow-400' : 'text-white'}`}>
                        {achievement.name}
                      </h4>
                      <p className="text-gray-300 text-sm mb-2">{achievement.description}</p>
                      <Progress 
                        value={achievement.progress} 
                        className="h-2"
                        classNames={{
                          indicator: achievement.unlocked ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : `bg-gradient-to-r ${selectedTheme.primary}`
                        }}
                      />
                    </div>
                    {achievement.unlocked && (
                      <div className="animate-pulse">
                        <Zap className="w-5 h-5 text-yellow-400" />
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>
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

                {/* Timer Display */}
                <div className="flex items-center gap-2 text-white">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm">
                    {Math.floor((dailyLimits.totalMinutes - dailyLimits.usedMinutes) / 60)}h {(dailyLimits.totalMinutes - dailyLimits.usedMinutes) % 60}m left
                  </span>
                </div>

                {/* Profile, Settings and Parent Mode */}
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
                  onClick={() => setShowPinModal(true)}
                >
                  <Shield className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Complete Notification */}
        {showOrderComplete && (
          <div className="bg-green-500 text-white p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5" />
              <span>Order completed successfully! Your videos are now available in your library.</span>
              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                onClick={() => setShowOrderComplete(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderCurrentPage()}
        </div>

        {/* Parent Dashboard Panel */}
        {showParentDashboard && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Parent Dashboard</h2>
                <Button
                  isIconOnly
                  variant="ghost"
                  onClick={() => setShowParentDashboard(false)}
                >
                  <X className="w-5 h-5 text-white" />
                </Button>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Usage Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Usage Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white/5">
                      <CardBody className="text-center p-4">
                        <div className="text-2xl font-bold text-white mb-2">{dailyLimits.usedMinutes}</div>
                        <div className="text-gray-300">Minutes Today</div>
                      </CardBody>
                    </Card>
                    <Card className="bg-white/5">
                      <CardBody className="text-center p-4">
                        <div className="text-2xl font-bold text-white mb-2">{dailyStreak}</div>
                        <div className="text-gray-300">Day Streak</div>
                      </CardBody>
                    </Card>
                    <Card className="bg-white/5">
                      <CardBody className="text-center p-4">
                        <div className="text-2xl font-bold text-white mb-2">{achievements.filter(a => a.unlocked).length}</div>
                        <div className="text-gray-300">Achievements</div>
                      </CardBody>
                    </Card>
                  </div>
                </div>

                {/* Quick Controls */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Controls</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button className="bg-green-500 text-white">
                      <Unlock className="w-4 h-4 mr-2" />
                      Extend Time
                    </Button>
                    <Button className="bg-red-500 text-white">
                      <Lock className="w-4 h-4 mr-2" />
                      Pause Session
                    </Button>
                    <Button className="bg-blue-500 text-white">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Audio On
                    </Button>
                    <Button className="bg-orange-500 text-white">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Progress
                    </Button>
                  </div>
                </div>

                {/* Time Management */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Time Management</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white mb-2 block">Daily Time Limit (minutes)</label>
                      <Input
                        type="number"
                        value={dailyLimits.totalMinutes.toString()}
                        onChange={(e) => setDailyLimits(prev => ({ ...prev, totalMinutes: parseInt(e.target.value) || 0 }))}
                        className="bg-white/5"
                      />
                    </div>
                    <div>
                      <label className="text-white mb-2 block">Reset Time</label>
                      <Input
                        type="time"
                        value={dailyLimits.resetTime}
                        onChange={(e) => setDailyLimits(prev => ({ ...prev, resetTime: e.target.value }))}
                        className="bg-white/5"
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Surprise Me Modal */}
        <Modal isOpen={showSurpriseModal} onClose={() => setShowSurpriseModal(false)} size="lg">
          <ModalContent className="bg-white/10 backdrop-blur-md border-white/20">
            <ModalHeader className="text-white">
              <div className="flex items-center gap-2">
                <Gift className="w-6 h-6 animate-bounce" />
                <span>Daily Surprise!</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="text-center py-8">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${selectedTheme.primary} flex items-center justify-center animate-pulse`}>
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Congratulations!</h3>
                <p className="text-gray-300 mb-4">You've earned 50 bonus XP points for your dedication!</p>
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">+50 XP</span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                className={`bg-gradient-to-r ${selectedTheme.primary} text-white w-full`}
                onClick={() => {
                  setCurrentXP(prev => prev + 50);
                  setShowSurpriseModal(false);
                }}
              >
                Claim Reward
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

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

        {/* PIN Modal */}
        <Modal isOpen={showPinModal} onClose={() => setShowPinModal(false)}>
          <ModalContent className="bg-white/10 backdrop-blur-md border-white/20">
            <ModalHeader className="text-white">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                <span>Enter Parent PIN</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <Input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                maxLength={4}
                className="bg-white/5"
              />
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPinModal(false);
                  setEnteredPin('');
                }}
              >
                Cancel
              </Button>
              <Button
                className={`bg-gradient-to-r ${selectedTheme.primary} text-white`}
                onClick={() => {
                  if (enteredPin === parentalControls.pin) {
                    setShowParentDashboard(true);
                    setShowPinModal(false);
                    setEnteredPin('');
                  }
                }}
                isDisabled={enteredPin.length !== 4}
              >
                Access
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
          <Tooltip content="Logout" placement="left">
            <Button
              isIconOnly
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
              onClick={onLogout}
            >
              <LogOut className="w-6 h-6" />
            </Button>
          </Tooltip>
        </div>

        {/* Enhanced Video Player */}
        {showVideoPlayer && selectedModule && (
          <EnhancedVideoPlayer
            isOpen={showVideoPlayer}
            onClose={handleVideoPlayerClose}
            module={selectedModule}
            user={user}
            purchases={realPurchases}
            onPurchase={handleVideoPurchase}
          />
        )}
      </div>
    </div>
  );
}