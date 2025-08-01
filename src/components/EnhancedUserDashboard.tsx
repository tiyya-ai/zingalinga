'use client';

import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  Download,
  Wifi,
  WifiOff,
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  Package,
  Search,
  Filter,
  Grid,
  List,
  DollarSign,
  Trash2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { vpsDataStore } from '../utils/vpsDataStore';
import { User, Module } from '../types';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

interface WatchHistory {
  videoId: string;
  title: string;
  thumbnail: string;
  watchedAt: string;
  progress: number;
  duration: number;
}

interface DailyLimit {
  totalMinutes: number;
  usedMinutes: number;
  resetTime: string;
}

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
  };
  avatar: string;
}

interface CartItem {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  quantity: number;
  category: string;
  duration: string;
}

interface PaymentCard {
  id: string;
  name: string;
  number: string;
  expiry: string;
  cvv: string;
  type: 'visa' | 'mastercard' | 'amex';
}

interface VideoProduct extends Module {
  price: number;
  discount?: number;
  rating: number;
  reviews: number;
  thumbnail: string;
  preview?: string;
  tags: string[];
  ageGroup: string;
  featured?: boolean;
}

const themes: Theme[] = [
  {
    id: 'jungle',
    name: 'Jungle Adventure',
    colors: {
      primary: '#22c55e',
      secondary: '#16a34a',
      background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
      card: '#f0fdf4'
    },
    avatar: '🦁'
  },
  {
    id: 'ocean',
    name: 'Ocean Explorer',
    colors: {
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      card: '#eff6ff'
    },
    avatar: '🐙'
  },
  {
    id: 'space',
    name: 'Space Adventure',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
      card: '#f5f3ff'
    },
    avatar: '🚀'
  },
  {
    id: 'princess',
    name: 'Princess Castle',
    colors: {
      primary: '#ec4899',
      secondary: '#db2777',
      background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
      card: '#fdf2f8'
    },
    avatar: '👸'
  }
];

const avatars = ['🦁', '🐙', '🚀', '👸', '🐻', '🦄', '🐸', '🦋', '🐧', '🦊'];

const demoVideoProducts: VideoProduct[] = [
  {
    id: '1',
    title: 'ABC Adventure Songs',
    description: 'Learn the alphabet with fun songs and animations',
    category: 'Education',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    price: 9.99,
    discount: 20,
    rating: 4.8,
    reviews: 156,
    thumbnail: '/api/placeholder/300/200',
    tags: ['alphabet', 'songs', 'preschool'],
    ageGroup: '3-5 years',
    featured: true
  },
  {
    id: '2',
    title: 'Number Counting Fun',
    description: 'Count from 1 to 100 with colorful animations',
    category: 'Math',
    difficulty: 'beginner',
    estimatedTime: '20 min',
    price: 12.99,
    rating: 4.9,
    reviews: 203,
    thumbnail: '/api/placeholder/300/200',
    tags: ['numbers', 'counting', 'math'],
    ageGroup: '4-6 years',
    featured: true
  },
  {
    id: '3',
    title: 'Animal Kingdom Explorer',
    description: 'Discover amazing animals from around the world',
    category: 'Science',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    price: 14.99,
    rating: 4.7,
    reviews: 89,
    thumbnail: '/api/placeholder/300/200',
    tags: ['animals', 'nature', 'discovery'],
    ageGroup: '5-8 years'
  },
  {
    id: '4',
    title: 'Space Adventure Stories',
    description: 'Journey through space with exciting stories',
    category: 'Stories',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    price: 16.99,
    discount: 15,
    rating: 4.6,
    reviews: 124,
    thumbnail: '/api/placeholder/300/200',
    tags: ['space', 'adventure', 'stories'],
    ageGroup: '6-10 years'
  },
  {
    id: '5',
    title: 'Creative Art Workshop',
    description: 'Learn to draw and paint with step-by-step guides',
    category: 'Art',
    difficulty: 'beginner',
    estimatedTime: '35 min',
    price: 18.99,
    rating: 4.5,
    reviews: 67,
    thumbnail: '/api/placeholder/300/200',
    tags: ['art', 'creativity', 'drawing'],
    ageGroup: '5-12 years'
  },
  {
    id: '6',
    title: 'Music & Rhythm Games',
    description: 'Interactive music games and rhythm activities',
    category: 'Music',
    difficulty: 'beginner',
    estimatedTime: '22 min',
    price: 13.99,
    rating: 4.8,
    reviews: 178,
    thumbnail: '/api/placeholder/300/200',
    tags: ['music', 'rhythm', 'games'],
    ageGroup: '4-8 years'
  }
];

const demoPaymentCards: PaymentCard[] = [
  {
    id: '1',
    name: 'Demo Visa Card',
    number: '4111 1111 1111 1111',
    expiry: '12/25',
    cvv: '123',
    type: 'visa'
  },
  {
    id: '2',
    name: 'Demo Mastercard',
    number: '5555 5555 5555 4444',
    expiry: '10/26',
    cvv: '456',
    type: 'mastercard'
  },
  {
    id: '3',
    name: 'Demo Amex Card',
    number: '3782 822463 10005',
    expiry: '08/27',
    cvv: '7890',
    type: 'amex'
  }
];

export default function EnhancedUserDashboard({ user, onLogout }: UserDashboardProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [selectedAvatar, setSelectedAvatar] = useState('🦁');
  const [dailyLimit, setDailyLimit] = useState<DailyLimit>({
    totalMinutes: 60,
    usedMinutes: 25,
    resetTime: '20:00'
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showSurpriseModal, setShowSurpriseModal] = useState(false);
  const [pin, setPin] = useState('');
  const [isParentMode, setIsParentMode] = useState(false);
  const [surpriseVideo, setSurpriseVideo] = useState<Module | null>(null);
  const [isGiftBoxOpen, setIsGiftBoxOpen] = useState(false);
  const [dailyPicks, setDailyPicks] = useState<Module[]>([]);
  const [learningPath, setLearningPath] = useState<Module[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [parentalSettings, setParentalSettings] = useState({
    autoPlay: false,
    volume: 80,
    subtitles: true,
    downloadAllowed: false,
    offlineMode: false
  });
  
  // E-commerce state
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'store' | 'cart' | 'checkout'>('dashboard');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [videoProducts, setVideoProducts] = useState<VideoProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'rating' | 'newest' | 'popular'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPaymentCard, setSelectedPaymentCard] = useState<PaymentCard | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [purchasedVideos, setPurchasedVideos] = useState<string[]>([]);

  useEffect(() => {
    loadData();
    generateDailyPicks();
    generateLearningPath();
    loadAchievements();
  }, []);

  const loadData = async () => {
    try {
      const data = await vpsDataStore.loadData();
      setModules(data.modules || []);
      
      // Convert modules to video products format for the store
      const products: VideoProduct[] = (data.modules || []).map(module => ({
        ...module,
        price: module.price || 9.99,
        discount: module.originalPrice ? Math.round(((module.originalPrice - module.price) / module.originalPrice) * 100) : undefined,
        rating: module.rating || 4.5,
        reviews: module.totalRatings || Math.floor(Math.random() * 200) + 50,
        thumbnail: module.thumbnail || '/api/placeholder/300/200',
        tags: module.tags || [module.category || 'educational'],
        ageGroup: module.ageRange || '5-8 years',
        featured: module.rating > 4.7 || false
      }));
      setVideoProducts(products);
      
      // Load user preferences
      const userPrefs = localStorage.getItem(`user-prefs-${user.id}`);
      if (userPrefs) {
        const prefs = JSON.parse(userPrefs);
        setCurrentTheme(themes.find(t => t.id === prefs.theme) || themes[0]);
        setSelectedAvatar(prefs.avatar || '🦁');
        setFavorites(prefs.favorites || []);
      }
      
      // Load watch history
      const history = localStorage.getItem(`watch-history-${user.id}`);
      if (history) {
        setWatchHistory(JSON.parse(history));
      }
      
      // Load purchased videos
      const purchased = localStorage.getItem(`purchased-videos-${user.id}`);
      if (purchased) {
        setPurchasedVideos(JSON.parse(purchased));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generateDailyPicks = () => {
    const shuffled = [...modules].sort(() => 0.5 - Math.random());
    setDailyPicks(shuffled.slice(0, 3));
  };

  const generateLearningPath = () => {
    const beginner = modules.filter(m => m.difficulty === 'beginner');
    const intermediate = modules.filter(m => m.difficulty === 'intermediate');
    const advanced = modules.filter(m => m.difficulty === 'advanced');
    setLearningPath([...beginner.slice(0, 2), ...intermediate.slice(0, 2), ...advanced.slice(0, 1)]);
  };

  const loadAchievements = () => {
    const userAchievements = [
      { id: 1, title: 'First Video!', description: 'Watched your first video', icon: '🎬', unlocked: true },
      { id: 2, title: 'Learning Streak', description: '3 days in a row!', icon: '🔥', unlocked: true },
      { id: 3, title: 'Alphabet Master', description: 'Completed all alphabet videos', icon: '📚', unlocked: false },
      { id: 4, title: 'Explorer', description: 'Watched 10 different videos', icon: '🗺️', unlocked: true },
      { id: 5, title: 'Night Owl', description: 'Watched videos in the evening', icon: '🦉', unlocked: false }
    ];
    setAchievements(userAchievements);
  };

  const handleSurpriseMe = () => {
    setShowSurpriseModal(true);
    setIsGiftBoxOpen(false);
    
    // Animate gift box opening
    setTimeout(() => {
      setIsGiftBoxOpen(true);
      const randomVideo = modules[Math.floor(Math.random() * modules.length)];
      setSurpriseVideo(randomVideo);
    }, 1000);
  };

  const handlePinSubmit = () => {
    if (pin === '1234') { // Demo PIN
      setIsParentMode(true);
      setShowPinModal(false);
      setPin('');
    } else {
      alert('Incorrect PIN');
      setPin('');
    }
  };

  const saveUserPreferences = () => {
    const prefs = {
      theme: currentTheme.id,
      avatar: selectedAvatar,
      favorites
    };
    localStorage.setItem(`user-prefs-${user.id}`, JSON.stringify(prefs));
  };

  const addToFavorites = (moduleId: string) => {
    const newFavorites = [...favorites, moduleId];
    setFavorites(newFavorites);
    saveUserPreferences();
  };

  const removeFromFavorites = (moduleId: string) => {
    const newFavorites = favorites.filter(id => id !== moduleId);
    setFavorites(newFavorites);
    saveUserPreferences();
  };

  // Cart management functions
  const addToCart = (product: VideoProduct) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const cartItem: CartItem = {
        id: product.id,
        title: product.title,
        price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
        thumbnail: product.thumbnail,
        quantity: 1,
        category: product.category,
        duration: product.estimatedTime
      };
      setCart([...cart, cartItem]);
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

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const processOrder = () => {
    if (selectedPaymentCard && cart.length > 0) {
      // Simulate order processing
      const newPurchasedVideos = [...purchasedVideos, ...cart.map(item => item.id)];
      setPurchasedVideos(newPurchasedVideos);
      localStorage.setItem(`purchased-videos-${user.id}`, JSON.stringify(newPurchasedVideos));
      setCart([]);
      setOrderComplete(true);
      setShowCheckoutModal(false);
      setTimeout(() => {
        setOrderComplete(false);
        setCurrentPage('dashboard');
      }, 3000);
    }
  };

  const filteredProducts = videoProducts
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'price':
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          comparison = priceA - priceB;
          break;
        case 'rating':
          comparison = b.rating - a.rating; // Higher rating first
          break;
        case 'newest':
          comparison = new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
          break;
        case 'popular':
          comparison = (b.reviews || 0) - (a.reviews || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const categories = ['all', ...Array.from(new Set(videoProducts.map(p => p.category)))];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const continueWatching = watchHistory.filter(h => h.progress < 90);
  const recentlyWatched = watchHistory.slice(0, 5);
  const favoriteModules = modules.filter(m => favorites.includes(m.id));

  // Render different pages based on currentPage state
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'store':
        return renderStorePage();
      case 'cart':
        return renderCartPage();
      case 'checkout':
        return renderCheckoutPage();
      default:
        return renderDashboardPage();
    }
  };

  const renderStorePage = () => (
    <div className="space-y-6">
      {/* Store Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
            🎬 Video Store
          </h2>
          <p className="text-gray-600">Discover amazing educational videos for kids</p>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="w-4 h-4" />}
            className="md:w-64"
          />
          <Select
            placeholder="Category"
            selectedKeys={[selectedCategory]}
            onSelectionChange={(keys) => setSelectedCategory(Array.from(keys)[0] as string)}
            className="md:w-40"
          >
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </Select>
          <Select
            placeholder="Sort by"
            selectedKeys={[sortBy]}
            onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as any)}
            className="md:w-32"
          >
            <SelectItem key="title" value="title">Title</SelectItem>
            <SelectItem key="price" value="price">Price</SelectItem>
            <SelectItem key="rating" value="rating">Rating</SelectItem>
            <SelectItem key="newest" value="newest">Newest</SelectItem>
            <SelectItem key="popular" value="popular">Popular</SelectItem>
          </Select>
          <Button
            isIconOnly
            variant="light"
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
          <div className="flex gap-1">
            <Button
              isIconOnly
              variant={viewMode === 'grid' ? 'solid' : 'light'}
              onPress={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              isIconOnly
              variant={viewMode === 'list' ? 'solid' : 'light'}
              onPress={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Videos */}
      {searchQuery === '' && selectedCategory === 'all' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">⭐ Featured Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {videoProducts.filter(p => p.featured).map((product) => (
              <Card key={product.id} className="hover:scale-105 transition-transform">
                <CardBody className="p-0">
                  <div className="relative">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-40 object-cover"
                    />
                    {product.discount && (
                      <Chip
                        color="danger"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        -{product.discount}%
                      </Chip>
                    )}
                    <Badge content={product.ageGroup} color="primary" className="absolute top-2 left-2" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-lg mb-2">{product.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{product.rating}</span>
                        <span className="text-xs text-gray-500">({product.reviews})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{product.estimatedTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {product.discount ? (
                          <>
                            <span className="text-lg font-bold" style={{ color: currentTheme.colors.primary }}>
                              ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ${product.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold" style={{ color: currentTheme.colors.primary }}>
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Button
                        color="primary"
                        size="sm"
                        onPress={() => addToCart(product)}
                        disabled={purchasedVideos.includes(product.id)}
                      >
                        {purchasedVideos.includes(product.id) ? (
                          <>Owned <CheckCircle className="w-4 h-4 ml-1" /></>
                        ) : (
                          <>Add to Cart <Plus className="w-4 h-4 ml-1" /></>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Videos */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          📚 All Videos ({filteredProducts.length})
        </h3>
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product) => (
            <Card key={product.id} className={`hover:scale-105 transition-transform ${
              viewMode === 'list' ? 'flex-row' : ''
            }`}>
              <CardBody className={`p-0 ${viewMode === 'list' ? 'flex-row' : ''}`}>
                <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    className={`object-cover ${
                      viewMode === 'list' ? 'w-full h-32' : 'w-full h-40'
                    }`}
                  />
                  {product.discount && (
                    <Chip
                      color="danger"
                      size="sm"
                      className="absolute top-2 right-2"
                    >
                      -{product.discount}%
                    </Chip>
                  )}
                  <Badge content={product.ageGroup} color="primary" className="absolute top-2 left-2" />
                </div>
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">{product.title}</h4>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => 
                        favorites.includes(product.id) 
                          ? removeFromFavorites(product.id)
                          : addToFavorites(product.id)
                      }
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          favorites.includes(product.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </Button>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.map((tag) => (
                      <Chip key={tag} size="sm" variant="flat">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{product.rating}</span>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{product.estimatedTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {product.discount ? (
                        <>
                          <span className="text-lg font-bold" style={{ color: currentTheme.colors.primary }}>
                            ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold" style={{ color: currentTheme.colors.primary }}>
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() => addToCart(product)}
                      disabled={purchasedVideos.includes(product.id)}
                    >
                      {purchasedVideos.includes(product.id) ? (
                        <>Owned <CheckCircle className="w-4 h-4 ml-1" /></>
                      ) : (
                        <>Add to Cart <Plus className="w-4 h-4 ml-1" /></>
                      )}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCartPage = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
            🛒 Shopping Cart
          </h2>
          <p className="text-gray-600">
            {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'} • Total: ${getCartTotal().toFixed(2)}
          </p>
        </div>
        {cart.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="light"
              color="danger"
              onPress={() => setCart([])}
              startContent={<Trash2 className="w-4 h-4" />}
            >
              Clear Cart
            </Button>
            <Button
              color="primary"
              onPress={() => setCurrentPage('checkout')}
              startContent={<CreditCard className="w-4 h-4" />}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>

      {cart.length === 0 ? (
        <Card className="p-8 text-center">
          <CardBody>
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">Add some amazing videos to get started!</p>
            <Button
              color="primary"
              onPress={() => setCurrentPage('store')}
            >
              Browse Videos
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardBody>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <Badge content={item.category} color="primary" size="sm" className="absolute -top-1 -right-1" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{item.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Chip size="sm" variant="flat">{item.category}</Chip>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{item.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xl font-bold" style={{ color: currentTheme.colors.primary }}>
                          ${item.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Subtotal: ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
            
            {/* Recommendations */}
            {cart.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <h3 className="font-semibold">💡 You might also like</h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videoProducts
                      .filter(p => !cart.some(c => c.id === p.id) && !purchasedVideos.includes(p.id))
                      .slice(0, 2)
                      .map((product) => (
                        <div key={product.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <Image
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{product.title}</h4>
                            <p className="text-xs text-gray-600">{product.category}</p>
                            <p className="font-semibold" style={{ color: currentTheme.colors.primary }}>
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            color="primary"
                            variant="light"
                            onPress={() => addToCart(product)}
                          >
                            Add
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Summary
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Divider />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span className="text-green-600">-$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>$0.00</span>
                  </div>
                </div>
                <Divider />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span style={{ color: currentTheme.colors.primary }}>
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <Button
                  color="primary"
                  className="w-full"
                  size="lg"
                  onPress={() => setCurrentPage('checkout')}
                  startContent={<CreditCard className="w-4 h-4" />}
                >
                  Secure Checkout
                </Button>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <Lock className="w-3 h-3" />
                  <span>Secure payment with 256-bit SSL encryption</span>
                </div>
              </CardBody>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-sm">Quick Actions</h3>
              </CardHeader>
              <CardBody className="space-y-2">
                <Button
                  variant="light"
                  className="w-full justify-start"
                  startContent={<Heart className="w-4 h-4" />}
                  size="sm"
                >
                  Save for Later
                </Button>
                <Button
                  variant="light"
                  className="w-full justify-start"
                  startContent={<Gift className="w-4 h-4" />}
                  size="sm"
                >
                  Send as Gift
                </Button>
                <Button
                  variant="light"
                  className="w-full justify-start"
                  startContent={<Download className="w-4 h-4" />}
                  size="sm"
                >
                  Download Receipt
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  const renderCheckoutPage = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => setCurrentPage('cart')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
          💳 Checkout
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method */}
        <div>
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Payment Method</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Select a demo payment card (no real charges will be made)
              </p>
              {demoPaymentCards.map((card) => (
                <Card 
                  key={card.id}
                  isPressable
                  onPress={() => setSelectedPaymentCard(card)}
                  className={`border-2 ${
                    selectedPaymentCard?.id === card.id 
                      ? 'border-blue-500' 
                      : 'border-gray-200'
                  }`}
                >
                  <CardBody>
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-8 rounded flex items-center justify-center text-white font-bold ${
                        card.type === 'visa' ? 'bg-blue-600' :
                        card.type === 'mastercard' ? 'bg-red-600' :
                        'bg-green-600'
                      }`}>
                        {card.type.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{card.name}</p>
                        <p className="text-sm text-gray-600">{card.number}</p>
                        <p className="text-xs text-gray-500">Expires: {card.expiry}</p>
                      </div>
                      {selectedPaymentCard?.id === card.id && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Order Summary</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <Divider />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span style={{ color: currentTheme.colors.primary }}>
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>
              <Button
                color="primary"
                className="w-full"
                size="lg"
                onPress={processOrder}
                disabled={!selectedPaymentCard}
                startContent={<CreditCard className="w-4 h-4" />}
              >
                Complete Order
              </Button>
              <p className="text-xs text-gray-500 text-center">
                This is a demo. No real payment will be processed.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderDashboardPage = () => (
    <div className="space-y-6">
      {/* Daily Progress */}
      <Card className="mb-6" style={{ backgroundColor: currentTheme.colors.card }}>
        <CardBody>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Today's Progress</h3>
            <span className="text-sm text-gray-600">
              {dailyLimit.usedMinutes} / {dailyLimit.totalMinutes} minutes
            </span>
          </div>
          <Progress 
            value={(dailyLimit.usedMinutes / dailyLimit.totalMinutes) * 100}
            color="success"
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Great job learning today!</span>
            <span>Resets at {dailyLimit.resetTime}</span>
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Surprise Me */}
        <Card 
          isPressable
          onPress={handleSurpriseMe}
          className="hover:scale-105 transition-transform"
          style={{ backgroundColor: currentTheme.colors.card }}
        >
          <CardBody className="text-center p-4">
            <div className="text-3xl mb-2">🎁</div>
            <p className="font-semibold" style={{ color: currentTheme.colors.primary }}>
              Surprise Me!
            </p>
            <p className="text-xs text-gray-600">Random fun video</p>
          </CardBody>
        </Card>

        {/* Video Store */}
        <Card 
          isPressable
          onPress={() => setCurrentPage('store')}
          className="hover:scale-105 transition-transform"
          style={{ backgroundColor: currentTheme.colors.card }}
        >
          <CardBody className="text-center p-4">
            <div className="text-3xl mb-2">🛒</div>
            <p className="font-semibold" style={{ color: currentTheme.colors.primary }}>
              Video Store
            </p>
            <p className="text-xs text-gray-600">{videoProducts.length} videos available</p>
          </CardBody>
        </Card>

        {/* Favorites */}
        <Card 
          isPressable
          className="hover:scale-105 transition-transform"
          style={{ backgroundColor: currentTheme.colors.card }}
        >
          <CardBody className="text-center p-4">
            <div className="text-3xl mb-2">❤️</div>
            <p className="font-semibold" style={{ color: currentTheme.colors.primary }}>
              Favorites
            </p>
            <p className="text-xs text-gray-600">{favorites.length} videos</p>
          </CardBody>
        </Card>

        {/* My Library */}
        <Card 
          isPressable
          className="hover:scale-105 transition-transform"
          style={{ backgroundColor: currentTheme.colors.card }}
        >
          <CardBody className="text-center p-4">
            <div className="text-3xl mb-2">📚</div>
            <p className="font-semibold" style={{ color: currentTheme.colors.primary }}>
              My Library
            </p>
            <p className="text-xs text-gray-600">{purchasedVideos.length} owned</p>
          </CardBody>
        </Card>
      </div>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <Card className="mb-6" style={{ backgroundColor: currentTheme.colors.card }}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Play className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
              <h3 className="font-semibold">Continue Watching</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {continueWatching.map((video) => (
                <Card key={video.videoId} isPressable>
                  <CardBody className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">{video.title}</h4>
                      <Progress value={video.progress} color="primary" size="sm" />
                      <p className="text-xs text-gray-600">{video.progress}% complete</p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Achievements */}
      <Card className="mb-6" style={{ backgroundColor: currentTheme.colors.card }}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
            <h3 className="font-semibold">Recent Achievements</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.slice(0, 4).map((achievement) => (
              <div 
                key={achievement.id} 
                className={`text-center p-3 rounded-lg border-2 ${
                  achievement.unlocked 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <h4 className="font-semibold text-xs">{achievement.title}</h4>
                <p className="text-xs text-gray-600">{achievement.description}</p>
                {achievement.unlocked && (
                  <CheckCircle className="w-4 h-4 text-green-500 mx-auto mt-1" />
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <div 
      className="min-h-screen p-4"
      style={{ background: currentTheme.colors.background }}
    >
      {/* Header */}
      <div 
        className="flex justify-between items-center mb-6 p-4 rounded-lg shadow-sm"
        style={{ 
          backgroundColor: currentTheme.colors.card,
          border: `2px solid ${currentTheme.colors.primary}20`
        }}
      >
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{selectedAvatar}</div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
              Hi, {user.name}! 👋
            </h1>
            <p className="text-gray-600">
              {currentPage === 'dashboard' && 'Ready for some fun learning?'}
              {currentPage === 'store' && 'Discover amazing educational videos!'}
              {currentPage === 'cart' && 'Review your selected videos'}
              {currentPage === 'checkout' && 'Complete your purchase'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Navigation */}
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant={currentPage === 'dashboard' ? 'solid' : 'light'}
              onPress={() => setCurrentPage('dashboard')}
            >
              Dashboard
            </Button>
            <Button
              size="sm"
              variant={currentPage === 'store' ? 'solid' : 'light'}
              onPress={() => setCurrentPage('store')}
            >
              Store
            </Button>
            <Button
              size="sm"
              variant={currentPage === 'cart' ? 'solid' : 'light'}
              onPress={() => setCurrentPage('cart')}
              startContent={<ShoppingCart className="w-4 h-4" />}
            >
              Cart
              {getCartItemCount() > 0 && (
                <Badge content={getCartItemCount()} color="danger" size="sm" />
              )}
            </Button>
          </div>
          
          {/* Timer Display */}
          <Card className="p-2" style={{ backgroundColor: currentTheme.colors.card }}>
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
              <span className="text-sm font-medium">
                {formatTime(dailyLimit.totalMinutes - dailyLimit.usedMinutes)} left today
              </span>
            </div>
          </Card>
          
          {/* Settings */}
          <Button
            isIconOnly
            variant="light"
            onPress={() => setShowThemeModal(true)}
          >
            <Palette className="w-5 h-5" />
          </Button>
          
          {/* Parent Mode */}
          <Button
            isIconOnly
            variant="light"
            onPress={() => setShowPinModal(true)}
          >
            <Shield className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Order Complete Notification */}
      {orderComplete && (
        <Card className="mb-6 border-2 border-green-200 bg-green-50">
          <CardBody className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-700 mb-2">Order Complete! 🎉</h3>
            <p className="text-green-600">Your videos have been added to your library. Enjoy learning!</p>
          </CardBody>
        </Card>
      )}

      {/* Main Content */}
      {renderCurrentPage()}

      {/* Parent Mode Panel */}
      {isParentMode && (
        <Card className="mb-6 border-2 border-orange-200" style={{ backgroundColor: '#fff7ed' }}>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-orange-700">Parent Dashboard</h3>
              </div>
              <Button 
                size="sm" 
                variant="light" 
                onPress={() => setIsParentMode(false)}
              >
                <Lock className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Usage Stats */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Today's Usage</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Watch Time:</span>
                    <span>{formatTime(dailyLimit.usedMinutes)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Videos Watched:</span>
                    <span>3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Learning Score:</span>
                    <span className="text-green-600">85%</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Controls */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Quick Controls</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-play</span>
                    <Button 
                      size="sm" 
                      variant={parentalSettings.autoPlay ? 'solid' : 'bordered'}
                      onPress={() => setParentalSettings(prev => ({ ...prev, autoPlay: !prev.autoPlay }))}
                    >
                      {parentalSettings.autoPlay ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Downloads</span>
                    <Button 
                      size="sm" 
                      variant={parentalSettings.downloadAllowed ? 'solid' : 'bordered'}
                      onPress={() => setParentalSettings(prev => ({ ...prev, downloadAllowed: !prev.downloadAllowed }))}
                    >
                      {parentalSettings.downloadAllowed ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Time Management */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Time Management</h4>
                <div className="space-y-2">
                  <Input
                    size="sm"
                    label="Daily Limit (minutes)"
                    value={dailyLimit.totalMinutes.toString()}
                    onChange={(e) => setDailyLimit(prev => ({ ...prev, totalMinutes: parseInt(e.target.value) || 60 }))}
                  />
                  <Input
                    size="sm"
                    label="Reset Time"
                    value={dailyLimit.resetTime}
                    onChange={(e) => setDailyLimit(prev => ({ ...prev, resetTime: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Surprise Me Modal */}
      <Modal isOpen={showSurpriseModal} onClose={() => setShowSurpriseModal(false)} size="lg">
        <ModalContent>
          <ModalHeader>🎁 Surprise Time!</ModalHeader>
          <ModalBody>
            <div className="text-center py-8">
              {!isGiftBoxOpen ? (
                <div className="animate-bounce">
                  <div className="text-8xl mb-4">🎁</div>
                  <p className="text-lg">Opening your surprise...</p>
                </div>
              ) : (
                <div className="animate-pulse">
                  <div className="text-6xl mb-4">✨</div>
                  {surpriseVideo && (
                    <div>
                      <h3 className="text-xl font-bold mb-2">{surpriseVideo.title}</h3>
                      <p className="text-gray-600 mb-4">{surpriseVideo.description}</p>
                      <Button 
                        color="primary" 
                        size="lg"
                        startContent={<Play className="w-5 h-5" />}
                      >
                        Watch Now!
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)}>
        <ModalContent>
          <ModalHeader>🌈 Choose Your Theme & Avatar</ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <h4 className="font-semibold mb-3">Themes</h4>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map((theme) => (
                    <Card 
                      key={theme.id}
                      isPressable
                      onPress={() => setCurrentTheme(theme)}
                      className={`border-2 ${
                        currentTheme.id === theme.id 
                          ? 'border-blue-500' 
                          : 'border-gray-200'
                      }`}
                    >
                      <CardBody className="p-3">
                        <div 
                          className="w-full h-12 rounded mb-2"
                          style={{ background: theme.colors.background }}
                        />
                        <p className="text-sm font-medium">{theme.name}</p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Avatar Selection */}
              <div>
                <h4 className="font-semibold mb-3">Choose Your Avatar</h4>
                <div className="grid grid-cols-5 gap-2">
                  {avatars.map((avatar) => (
                    <Button
                      key={avatar}
                      variant={selectedAvatar === avatar ? 'solid' : 'bordered'}
                      onPress={() => setSelectedAvatar(avatar)}
                      className="text-2xl h-12"
                    >
                      {avatar}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="primary" 
              onPress={() => {
                saveUserPreferences();
                setShowThemeModal(false);
              }}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* PIN Modal */}
      <Modal isOpen={showPinModal} onClose={() => setShowPinModal(false)}>
        <ModalContent>
          <ModalHeader>👪 Grown-ups Only</ModalHeader>
          <ModalBody>
            <div className="text-center">
              <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <p className="mb-4">Enter the parent PIN to access settings</p>
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePinSubmit()}
              />
              <p className="text-xs text-gray-500 mt-2">Demo PIN: 1234</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowPinModal(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handlePinSubmit}>
              Enter
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Button isIconOnly variant="light">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button isIconOnly variant="light">
            <Settings className="w-5 h-5" />
          </Button>
          <Button isIconOnly variant="light" onPress={onLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}