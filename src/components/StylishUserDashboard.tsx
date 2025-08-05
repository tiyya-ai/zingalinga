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
  Sparkles,
  Crown,
  Diamond,
  Rocket
} from 'lucide-react';
import { User, Module, Purchase, ContentFile } from '../types';
import { vpsDataStore } from '../utils/vpsDataStore';
import { checkVideoAccess, getUserPurchasedModules, getUserAvailableModules } from '../utils/videoAccess';
import { ImprovedVideoPlayer } from './ImprovedVideoPlayer';

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
  accent: string;
  preview: string;
  gradient: string;
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
    name: 'Cosmic Adventure',
    primary: 'from-purple-600 via-blue-600 to-indigo-600',
    secondary: 'from-pink-500 via-purple-500 to-indigo-500',
    background: 'from-purple-900 via-blue-900 to-indigo-900',
    accent: 'from-cyan-400 to-blue-500',
    preview: 'bg-gradient-to-r from-purple-600 to-blue-600',
    gradient: 'linear-gradient(135deg, #581c87, #1e3a8a, #312e81)'
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    primary: 'from-blue-500 via-teal-500 to-cyan-500',
    secondary: 'from-cyan-400 via-blue-500 to-teal-500',
    background: 'from-blue-900 via-teal-900 to-cyan-900',
    accent: 'from-emerald-400 to-teal-500',
    preview: 'bg-gradient-to-r from-blue-500 to-teal-500',
    gradient: 'linear-gradient(135deg, #1e3a8a, #134e4a, #164e63)'
  },
  {
    id: 'forest',
    name: 'Enchanted Forest',
    primary: 'from-green-500 via-emerald-500 to-teal-500',
    secondary: 'from-lime-400 via-green-500 to-emerald-500',
    background: 'from-green-900 via-emerald-900 to-teal-900',
    accent: 'from-yellow-400 to-green-500',
    preview: 'bg-gradient-to-r from-green-500 to-emerald-500',
    gradient: 'linear-gradient(135deg, #14532d, #064e3b, #134e4a)'
  },
  {
    id: 'sunset',
    name: 'Golden Sunset',
    primary: 'from-orange-500 via-red-500 to-pink-500',
    secondary: 'from-yellow-400 via-orange-500 to-red-500',
    background: 'from-orange-900 via-red-900 to-pink-900',
    accent: 'from-amber-400 to-orange-500',
    preview: 'bg-gradient-to-r from-orange-500 to-red-500',
    gradient: 'linear-gradient(135deg, #7c2d12, #7f1d1d, #831843)'
  },
  {
    id: 'galaxy',
    name: 'Galaxy Explorer',
    primary: 'from-violet-600 via-purple-600 to-fuchsia-600',
    secondary: 'from-indigo-500 via-purple-500 to-pink-500',
    background: 'from-violet-900 via-purple-900 to-fuchsia-900',
    accent: 'from-rose-400 to-purple-500',
    preview: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
    gradient: 'linear-gradient(135deg, #4c1d95, #581c87, #86198f)'
  }
];

const avatars = [
  { emoji: '🦸‍♂️', name: 'Super Hero' },
  { emoji: '🦸‍♀️', name: 'Super Girl' },
  { emoji: '🧙‍♂️', name: 'Wizard' },
  { emoji: '🧙‍♀️', name: 'Witch' },
  { emoji: '🦄', name: 'Unicorn' },
  { emoji: '🐉', name: 'Dragon' },
  { emoji: '🦋', name: 'Butterfly' },
  { emoji: '🌟', name: 'Star' },
  { emoji: '🎭', name: 'Theater' },
  { emoji: '🎨', name: 'Artist' },
  { emoji: '🚀', name: 'Rocket' },
  { emoji: '👑', name: 'Crown' }
];

export default function StylishUserDashboard({ 
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
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'store' | 'cart' | 'profile' | 'achievements'>('dashboard');
  
  // Modal states
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // E-commerce state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // User progress state
  const [userLevel, setUserLevel] = useState(8);
  const [currentXP, setCurrentXP] = useState(1250);
  const [nextLevelXP, setNextLevelXP] = useState(1500);
  const [dailyStreak, setDailyStreak] = useState(15);
  const [achievements, setAchievements] = useState([
    { id: 1, name: 'First Video', description: 'Watched your first video', icon: '🎬', unlocked: true },
    { id: 2, name: 'Learning Streak', description: '7 days in a row', icon: '🔥', unlocked: true },
    { id: 3, name: 'Explorer', description: 'Watched 10 different videos', icon: '🗺️', unlocked: true },
    { id: 4, name: 'Scholar', description: 'Completed 5 educational videos', icon: '🎓', unlocked: false },
    { id: 5, name: 'Collector', description: 'Purchased 5 videos', icon: '💎', unlocked: false }
  ]);

  // Load real data on component mount
  useEffect(() => {
    loadRealData();
    loadUserPreferences();
  }, [modules, purchases]);

  const loadRealData = async () => {
    try {
      const data = await vpsDataStore.loadData();
      setRealModules(data.modules || modules || []);
      setRealPurchases(data.purchases || purchases || []);
    } catch (error) {
      console.error('Error loading real data:', error);
      setRealModules(modules || []);
      setRealPurchases(purchases || []);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const savedTheme = localStorage.getItem(`user-theme-${user.id}`);
      const savedAvatar = localStorage.getItem(`user-avatar-${user.id}`);
      
      if (savedTheme) {
        const theme = themes.find(t => t.id === savedTheme) || themes[0];
        setSelectedTheme(theme);
      }
      if (savedAvatar) {
        const avatar = avatars.find(a => a.emoji === savedAvatar) || avatars[0];
        setSelectedAvatar(avatar);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

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

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    localStorage.setItem(`user-theme-${user.id}`, theme.id);
    vpsDataStore.updateUserPreferences(user.id, { theme });
  };

  const handleAvatarChange = (avatar: typeof avatars[0]) => {
    setSelectedAvatar(avatar);
    localStorage.setItem(`user-avatar-${user.id}`, avatar.emoji);
    vpsDataStore.updateUserPreferences(user.id, { avatar });
  };

  const addToCart = (module: Module) => {
    const existingItem = cart.find(item => item.id === module.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === module.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: module.id,
        title: module.title,
        price: module.price || 0,
        thumbnail: module.thumbnail || '',
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (moduleId: string) => {
    setCart(cart.filter(item => item.id !== moduleId));
  };

  // Get user's purchased and available modules
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
      <Card 
        key={module.id} 
        className={`group relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
          viewMode === 'list' ? 'flex-row' : ''
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px'
        }}
      >
        <CardBody className={`p-0 ${viewMode === 'list' ? 'flex flex-row' : ''}`}>
          {/* Video Thumbnail */}
          <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 h-28' : 'aspect-video'}`}>
            {module.thumbnail ? (
              <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${module.thumbnail})` }}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${selectedTheme.primary} flex items-center justify-center`}>
                <Play className="w-12 h-12 text-white/80" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Button
                isIconOnly
                size="lg"
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/30 hover:scale-110 transition-all duration-300"
                onClick={() => handleVideoPlay(module.id)}
              >
                <Play className="w-8 h-8 ml-1" />
              </Button>
            </div>

            {/* Status Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {!accessResult.hasAccess && (
                <Chip 
                  size="sm" 
                  className="bg-red-500/90 text-white backdrop-blur-md"
                  startContent={<Lock className="w-3 h-3" />}
                >
                  Locked
                </Chip>
              )}

              {isPurchased && (
                <Chip 
                  size="sm" 
                  className="bg-green-500/90 text-white backdrop-blur-md"
                  startContent={<Trophy className="w-3 h-3" />}
                >
                  Owned
                </Chip>
              )}

              {module.price === 0 && (
                <Chip 
                  size="sm" 
                  className="bg-blue-500/90 text-white backdrop-blur-md"
                >
                  Free
                </Chip>
              )}
            </div>

            {/* Duration & Premium Badge */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <Chip size="sm" className="bg-black/70 text-white backdrop-blur-md">
                <Clock className="w-3 h-3 mr-1" />
                {module.estimatedDuration || '5 min'}
              </Chip>
              
              {module.isPremium && (
                <Chip 
                  size="sm" 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black backdrop-blur-md"
                  startContent={<Crown className="w-3 h-3" />}
                >
                  Premium
                </Chip>
              )}
            </div>
          </div>
          
          {/* Video Info */}
          <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-bold text-white text-lg leading-tight">{module.title}</h4>
              <div className="flex items-center gap-1 ml-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white font-semibold">{module.rating || 4.5}</span>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
              {module.description}
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Chip size="sm" variant="flat" className="bg-white/10 text-white">
                  {module.category || 'Educational'}
                </Chip>
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {Math.floor(Math.random() * 1000) + 100} views
                </span>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold bg-gradient-to-r ${selectedTheme.accent} bg-clip-text text-transparent`}>
                  {module.price === 0 ? 'Free' : `$${module.price}`}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isPurchased && (module.price || 0) > 0 && (
                <Button
                  className={`bg-gradient-to-r ${selectedTheme.primary} text-white flex-1 font-semibold hover:shadow-lg transition-all duration-300`}
                  onClick={() => addToCart(module)}
                  startContent={<ShoppingCart className="w-4 h-4" />}
                >
                  Add to Cart
                </Button>
              )}
              
              <Button
                variant="bordered"
                className="text-white border-white/30 hover:bg-white/10 transition-all duration-300"
                onClick={() => handleVideoPlay(module.id)}
                startContent={accessResult.hasAccess ? <Play className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              >
                {accessResult.hasAccess ? 'Watch' : 'Preview'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderDashboardPage = () => (
    <div className="space-y-8">
      {/* Welcome Section with Enhanced Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Welcome Card */}
        <Card className="lg:col-span-2 relative overflow-hidden" style={{
          background: `linear-gradient(135deg, ${selectedTheme.primary.replace('from-', '').replace('via-', '').replace('to-', '').split(' ').join(', ')})`,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <CardBody className="p-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <Avatar
                  size="lg"
                  className="w-20 h-20 text-3xl bg-white/20 backdrop-blur-md border-2 border-white/30"
                >
                  {selectedAvatar.emoji}
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold text-black">
                  {userLevel}
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {user.name}! 🎉
                </h2>
                <p className="text-white/80 text-lg">Ready for another learning adventure?</p>
                <div className="flex items-center gap-4 mt-3">
                  <Chip className="bg-white/20 text-white backdrop-blur-md" startContent={<Flame className="w-4 h-4" />}>
                    {dailyStreak} day streak!
                  </Chip>
                  <Chip className="bg-white/20 text-white backdrop-blur-md" startContent={<Trophy className="w-4 h-4" />}>
                    Level {userLevel}
                  </Chip>
                </div>
              </div>
            </div>
            
            {/* XP Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-white/90">
                <span>Progress to Level {userLevel + 1}</span>
                <span>{currentXP}/{nextLevelXP} XP</span>
              </div>
              <Progress 
                value={(currentXP / nextLevelXP) * 100} 
                className="h-3"
                classNames={{
                  indicator: `bg-gradient-to-r ${selectedTheme.accent}`,
                  track: "bg-white/20"
                }}
              />
            </div>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardBody className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{realModules.length}</div>
              <div className="text-gray-300">Total Videos</div>
              <BookOpen className="w-8 h-8 text-blue-400 mx-auto mt-2" />
            </CardBody>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardBody className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{purchasedModules.length}</div>
              <div className="text-gray-300">Purchased</div>
              <ShoppingCart className="w-8 h-8 text-green-400 mx-auto mt-2" />
            </CardBody>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardBody className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{achievements.filter(a => a.unlocked).length}</div>
              <div className="text-gray-300">Achievements</div>
              <Award className="w-8 h-8 text-yellow-400 mx-auto mt-2" />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            Quick Actions
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              size="lg"
              className={`bg-gradient-to-r ${selectedTheme.primary} text-white h-24 flex-col gap-2 hover:shadow-xl transition-all duration-300`}
              onClick={() => setCurrentPage('store')}
            >
              <ShoppingCart className="w-8 h-8" />
              <span className="font-semibold">Browse Videos</span>
            </Button>
            
            <Button
              size="lg"
              className={`bg-gradient-to-r ${selectedTheme.secondary} text-white h-24 flex-col gap-2 hover:shadow-xl transition-all duration-300 relative`}
              onClick={() => setCurrentPage('cart')}
            >
              <ShoppingCart className="w-8 h-8" />
              <span className="font-semibold">Cart</span>
              {cart.length > 0 && (
                <Badge content={cart.length} color="danger" className="absolute -top-1 -right-1" />
              )}
            </Button>
            
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white h-24 flex-col gap-2 hover:shadow-xl transition-all duration-300"
              onClick={() => setShowThemeModal(true)}
            >
              <Palette className="w-8 h-8" />
              <span className="font-semibold">Themes</span>
            </Button>
            
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white h-24 flex-col gap-2 hover:shadow-xl transition-all duration-300"
              onClick={() => setShowAchievements(true)}
            >
              <Award className="w-8 h-8" />
              <span className="font-semibold">Achievements</span>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Featured Videos */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Featured Videos
            </h3>
            <Button
              variant="ghost"
              className="text-white"
              onClick={() => setCurrentPage('store')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {sortedModules.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2 text-xl">No videos available</h4>
              <p className="text-gray-300">Videos will appear here when added by admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedModules.slice(0, 6).map(renderVideoCard)}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderStorePage = () => (
    <div className="space-y-6">
      {/* Enhanced Search and Filters */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search for amazing videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-5 h-5 text-gray-400" />}
                className="bg-white/5"
                size="lg"
              />
            </div>
            <div className="flex gap-3">
              <Select
                placeholder="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-48"
                size="lg"
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
                className="w-48"
                size="lg"
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
                  size="lg"
                  variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                  className={viewMode === 'grid' ? `bg-gradient-to-r ${selectedTheme.primary} text-white` : 'text-white'}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-5 h-5" />
                </Button>
                <Button
                  isIconOnly
                  size="lg"
                  variant={viewMode === 'list' ? 'solid' : 'ghost'}
                  className={viewMode === 'list' ? `bg-gradient-to-r ${selectedTheme.primary} text-white` : 'text-white'}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Video Grid */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <h3 className="text-2xl font-bold text-white">
            All Videos ({sortedModules.length})
          </h3>
        </CardHeader>
        <CardBody>
          {sortedModules.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h4 className="text-white font-semibold mb-3 text-2xl">No videos found</h4>
              <p className="text-gray-300 text-lg">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
              {sortedModules.map(renderVideoCard)}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderCartPage = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Shopping Cart ({cart.length} items)
          </h3>
        </CardHeader>
        <CardBody>
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h4 className="text-white font-semibold mb-3 text-2xl">Your cart is empty</h4>
              <p className="text-gray-300 mb-6 text-lg">Discover amazing videos to add to your collection!</p>
              <Button
                size="lg"
                className={`bg-gradient-to-r ${selectedTheme.primary} text-white font-semibold px-8`}
                onClick={() => setCurrentPage('store')}
              >
                Browse Videos
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <Card key={item.id} className="bg-white/5 border border-white/10">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-lg mb-1">{item.title}</h4>
                        <p className={`font-bold text-xl bg-gradient-to-r ${selectedTheme.accent} bg-clip-text text-transparent`}>
                          ${item.price}
                        </p>
                      </div>
                      <Button
                        isIconOnly
                        variant="ghost"
                        color="danger"
                        size="lg"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
              
              <Divider className="bg-white/20" />
              
              <div className="flex justify-between items-center p-6 bg-white/5 rounded-2xl">
                <div>
                  <p className="text-gray-300 mb-1">Total Amount</p>
                  <p className="text-white text-3xl font-bold">
                    ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white"
                    onClick={() => setCart([])}
                  >
                    Clear Cart
                  </Button>
                  <Button
                    size="lg"
                    className={`bg-gradient-to-r ${selectedTheme.primary} text-white font-semibold px-8`}
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'store':
        return renderStorePage();
      case 'cart':
        return renderCartPage();
      case 'achievements':
        return (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardHeader>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Your Achievements
                </h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <Card 
                      key={achievement.id} 
                      className={`${achievement.unlocked ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30' : 'bg-white/5 border-white/10'} border`}
                    >
                      <CardBody className="p-6 text-center">
                        <div className="text-4xl mb-3">{achievement.icon}</div>
                        <h4 className="font-bold text-white mb-2">{achievement.name}</h4>
                        <p className="text-gray-300 text-sm">{achievement.description}</p>
                        {achievement.unlocked && (
                          <Chip className="mt-3 bg-green-500/20 text-green-400" size="sm">
                            Unlocked!
                          </Chip>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        );
      default:
        return renderDashboardPage();
    }
  };

  return (
    <div 
      className="user-dashboard-container min-h-screen relative overflow-hidden"
      style={{
        background: selectedTheme.gradient,
        minHeight: '100vh',
        position: 'relative'
      }}
    >
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Enhanced Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar
                    size="lg"
                    className="w-14 h-14 text-2xl bg-white/20 backdrop-blur-md border-2 border-white/30"
                  >
                    {selectedAvatar.emoji}
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                    {userLevel}
                  </div>
                </div>
                <div>
                  <h1 className="text-white font-bold text-xl">Welcome, {user.name}!</h1>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-300">Level {userLevel}</span>
                    <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${selectedTheme.accent} transition-all duration-500`}
                        style={{ width: `${(currentXP / nextLevelXP) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-300">{currentXP}/{nextLevelXP} XP</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Navigation */}
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-2">
                  {[
                    { key: 'dashboard', label: 'Dashboard', icon: BookOpen },
                    { key: 'store', label: 'Store', icon: ShoppingCart },
                    { key: 'cart', label: 'Cart', icon: ShoppingCart, badge: cart.length },
                    { key: 'achievements', label: 'Achievements', icon: Award }
                  ].map(({ key, label, icon: Icon, badge }) => (
                    <Button
                      key={key}
                      variant={currentPage === key ? 'solid' : 'ghost'}
                      className={`${
                        currentPage === key 
                          ? `bg-gradient-to-r ${selectedTheme.primary} text-white` 
                          : 'text-white hover:bg-white/10'
                      } transition-all duration-300`}
                      onClick={() => setCurrentPage(key as any)}
                      startContent={<Icon className="w-4 h-4" />}
                    >
                      {label}
                      {badge && badge > 0 && (
                        <Badge content={badge} color="danger" size="sm" className="ml-1" />
                      )}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Tooltip content="Customize Theme">
                    <Button
                      isIconOnly
                      variant="ghost"
                      className="text-white hover:bg-white/10"
                      onClick={() => setShowThemeModal(true)}
                    >
                      <Settings className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                  
                  <Tooltip content="Logout">
                    <Button
                      isIconOnly
                      variant="ghost"
                      className="text-white hover:bg-white/10"
                      onClick={onLogout}
                    >
                      <LogOut className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderCurrentPage()}
        </div>

        {/* Enhanced Theme Modal */}
        <Modal 
          isOpen={showThemeModal} 
          onClose={() => setShowThemeModal(false)} 
          size="4xl"
          className="bg-transparent"
        >
          <ModalContent className="bg-white/10 backdrop-blur-md border border-white/20">
            <ModalHeader className="text-white border-b border-white/20">
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6" />
                <span className="text-2xl font-bold">Customize Your Experience</span>
              </div>
            </ModalHeader>
            <ModalBody className="p-8">
              <Tabs aria-label="Customization options" className="w-full" size="lg">
                <Tab key="themes" title="Themes">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {themes.map((theme) => (
                      <Card 
                        key={theme.id} 
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                          selectedTheme.id === theme.id ? 'ring-2 ring-white shadow-2xl' : ''
                        } bg-white/5 hover:bg-white/10 border border-white/20`}
                        onClick={() => handleThemeChange(theme)}
                      >
                        <CardBody className="p-6">
                          <div className={`w-full h-24 rounded-xl ${theme.preview} mb-4 shadow-lg`} />
                          <h4 className="text-white font-bold text-lg mb-2">{theme.name}</h4>
                          <div className="flex gap-2">
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.primary}`} />
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.secondary}`} />
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.accent}`} />
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </Tab>
                <Tab key="avatars" title="Avatars">
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mt-6">
                    {avatars.map((avatar, index) => (
                      <Tooltip key={index} content={avatar.name}>
                        <Button
                          className={`h-20 text-3xl transition-all duration-300 hover:scale-110 ${
                            selectedAvatar.emoji === avatar.emoji 
                              ? `bg-gradient-to-r ${selectedTheme.primary} shadow-lg` 
                              : 'bg-white/5 hover:bg-white/10'
                          } border border-white/20`}
                          onClick={() => handleAvatarChange(avatar)}
                        >
                          {avatar.emoji}
                        </Button>
                      </Tooltip>
                    ))}
                  </div>
                </Tab>
              </Tabs>
            </ModalBody>
            <ModalFooter className="border-t border-white/20">
              <Button
                size="lg"
                variant="ghost"
                className="text-white"
                onClick={() => setShowThemeModal(false)}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 z-50">
          <div className="flex items-center justify-around py-3">
            {[
              { key: 'dashboard', icon: BookOpen },
              { key: 'store', icon: ShoppingCart },
              { key: 'cart', icon: ShoppingCart, badge: cart.length },
              { key: 'achievements', icon: Award },
              { key: 'settings', icon: Settings, action: () => setShowThemeModal(true) }
            ].map(({ key, icon: Icon, badge, action }) => (
              <Button
                key={key}
                isIconOnly
                variant="ghost"
                className={`${
                  currentPage === key ? 'text-white' : 'text-gray-400'
                } hover:text-white transition-colors relative`}
                onClick={action || (() => setCurrentPage(key as any))}
              >
                <Icon className="w-6 h-6" />
                {badge && badge > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {badge}
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Floating Help Button */}
        <div className="fixed bottom-24 lg:bottom-8 right-6 z-40">
          <Tooltip content="Help & Support" placement="left">
            <Button
              isIconOnly
              size="lg"
              className={`bg-gradient-to-r ${selectedTheme.secondary} text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 w-14 h-14`}
            >
              <HelpCircle className="w-7 h-7" />
            </Button>
          </Tooltip>
        </div>

        {/* Video Player */}
        {showVideoPlayer && selectedModule && (
          <ImprovedVideoPlayer
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