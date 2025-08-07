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
  Star,
  Palette,
  BookOpen,
  Award,
  ShoppingCart,

  X,
  User as UserIcon,
  Trophy,
  Flame,
  Lock,
  Eye,
  Home
} from 'lucide-react';
import { User, Module, Purchase, ContentFile } from '../types';
import { vpsDataStore } from '../utils/vpsDataStore';
import { checkVideoAccess, getUserPurchasedModules, getUserAvailableModules } from '../utils/videoAccess';
import { ImprovedVideoPlayer } from './ImprovedVideoPlayer';
import BetterUserProfile from '../page-components/BetterUserProfile';

interface UserDashboardProps {
  user: User;
  modules?: Module[];
  purchases?: Purchase[];
  contentFiles?: ContentFile[];
  onModuleUpdate?: (modules: Module[]) => void;
  onLogout: () => void;
  onPurchase?: (moduleId: string) => void;
}

interface CartItem {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  quantity: number;
}

export default function ImprovedUserDashboard({ 
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

  // UI state
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'store' | 'cart' | 'profile'>('dashboard');
  const [isHydrated, setIsHydrated] = useState(false);

  // E-commerce state
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Featured videos filter state removed



  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load real data on component mount
  useEffect(() => {
    if (isHydrated) {
      loadRealData();
      loadUserPreferences();
    }
  }, [isHydrated, modules, purchases]);



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
    // Reserved for future user preferences
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



  const renderVideoCard = (module: Module) => {
    const accessResult = checkVideoAccess(user, module, realPurchases);
    const isPurchased = purchasedModules.some(p => p.id === module.id);
    
    return (
      <Card 
        key={module.id} 
        className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group shadow-lg rounded-2xl overflow-hidden cursor-pointer"
        onClick={() => handleVideoPlay(module.id)}
      >
        <CardBody className="p-0">
          {/* Video Thumbnail */}
          <div className="relative aspect-video overflow-hidden cursor-pointer">
            {module.thumbnail ? (
              <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${module.thumbnail})` }}
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 flex items-center justify-center">
                <Play className="w-16 h-16 text-white/90" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Simple Play Button */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg">
                <Play className="w-8 h-8 ml-1" />
              </div>
            </div>

            {/* Simple Status Badge */}
            <div className="absolute top-3 left-3">
              {!accessResult.hasAccess && (
                <div className="text-2xl">🔒</div>
              )}
              {module.price === 0 && (
                <div className="text-2xl">🎁</div>
              )}
            </div>

            {/* Duration & Rating */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <Chip size="sm" className="bg-black/70 text-white backdrop-blur-md">
                <Clock className="w-3 h-3 mr-1" />
                {module.estimatedDuration || '5 min'}
              </Chip>
              <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-white text-xs font-medium">{module.rating || 4.5}</span>
              </div>
            </div>
          </div>
          
          {/* Video Info */}
          <div className="p-5">
            <div className="text-center mb-3">
              <h4 className="font-bold text-white text-lg mb-2">{module.title}</h4>
              <div className="text-lg font-bold text-green-400">
                {module.price === 0 ? '🎁 Free' : `$${module.price}`}
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">{module.description}</p>
            
            {!isPurchased && (module.price || 0) > 0 && (
              <div className="text-center mt-3">
                <Button
                  size="sm"
                  className="bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors rounded-full px-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(module);
                  }}
                >
                  🛍️ Add to Cart
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderDashboardPage = () => (
    <div className="space-y-6">


      {/* Welcome Hero Section */}
      <Card className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 border-none overflow-hidden relative">
        <CardBody className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}! 🌍</h2>
              <p className="text-white/90 text-lg mb-4">Continue your amazing learning adventure with Kiki and Tano</p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                  variant="bordered"
                  onClick={() => setCurrentPage('store')}
                >
                  Explore Videos
                </Button>
                <Button
                  size="lg"
                  className="bg-white text-orange-600 font-semibold hover:bg-white/90"
                  onClick={() => setCurrentPage('cart')}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart ({cart.length})
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-6xl">🦁</div>
            </div>
          </div>
          {/* Floating elements */}
          <div className="absolute top-4 right-20 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🌿</div>
          <div className="absolute bottom-4 right-32 text-xl animate-bounce" style={{ animationDelay: '1s' }}>🦋</div>
        </CardBody>
      </Card>

      {/* Continue Learning */}
      {purchasedModules.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader>
            <h3 className="text-xl font-bold text-white">Continue Learning</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedModules.slice(0, 3).map(renderVideoCard)}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Learning Categories */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">Explore by Category</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Language', 'Math', 'Science', 'Art'].map((category, index) => {
              const categoryVideos = realModules.filter(m => m.category?.toLowerCase() === category.toLowerCase()).length;
              const gradients = [
                'from-orange-600 to-red-600',
                'from-yellow-500 to-orange-500', 
                'from-green-600 to-emerald-600',
                'from-red-500 to-pink-500'
              ];
              return (
                <Button
                  key={category}
                  size="lg"
                  className={`bg-gradient-to-r ${gradients[index]} text-white h-24 flex-col gap-2`}
                  onClick={() => {
                    setCurrentPage('store');
                  }}
                >
                  <div className="text-2xl font-bold">{categoryVideos}</div>
                  <span className="text-sm">{category}</span>
                </Button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Featured Videos */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-xl font-bold text-white">Featured Videos</h3>
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
          {realModules.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">No videos available</h4>
              <p className="text-gray-300 text-sm">Check back later for new content.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {realModules.slice(0, 8).map(renderVideoCard)}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderStorePage = () => (
    <div className="space-y-6">


      {/* All Videos */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">All Videos ({realModules.length})</h3>
        </CardHeader>
        <CardBody>
          {realModules.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">No videos available</h4>
              <p className="text-gray-300 text-sm">Check back later for new content.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {realModules.map(renderVideoCard)}
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
          <h3 className="text-xl font-bold text-white">Shopping Cart ({cart.length} items)</h3>
        </CardHeader>
        <CardBody>
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Your cart is empty</p>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
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
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
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

  const renderProfilePage = () => {
    if (!isHydrated) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      );
    }
    
    return (
      <BetterUserProfile
        user={user}
        onBack={() => setCurrentPage('dashboard')}
        onUserUpdate={(updatedUser) => {
          console.log('User updated:', updatedUser);
        }}
      />
    );
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'store':
        return renderStorePage();
      case 'cart':
        return renderCartPage();
      case 'profile':
        return renderProfilePage();
      default:
        return renderDashboardPage();
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-md border-b border-orange-300/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    ZL
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-xl">Zinga Linga</h1>
                    <p className="text-orange-200 text-xs">Learning Platform</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-1">
                  <Button
                    variant={currentPage === 'dashboard' ? 'solid' : 'ghost'}
                    className={currentPage === 'dashboard' ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white' : 'text-white hover:bg-white/10'}
                    onClick={() => setCurrentPage('dashboard')}
                    startContent={<Home className="w-4 h-4" />}
                    size="sm"
                  >
                    Home
                  </Button>
                  <Button
                    variant={currentPage === 'store' ? 'solid' : 'ghost'}
                    className={currentPage === 'store' ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white' : 'text-white hover:bg-white/10'}
                    onClick={() => setCurrentPage('store')}
                    startContent={<Play className="w-4 h-4" />}
                    size="sm"
                  >
                    Videos
                  </Button>
                  <Button
                    variant={currentPage === 'cart' ? 'solid' : 'ghost'}
                    className={currentPage === 'cart' ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white' : 'text-white hover:bg-white/10'}
                    onClick={() => setCurrentPage('cart')}
                    startContent={<ShoppingCart className="w-4 h-4" />}
                    size="sm"
                  >
                    Cart
                    {cart.length > 0 && (
                      <Chip size="sm" className="bg-red-500 text-white ml-1">{cart.length}</Chip>
                    )}
                  </Button>
                  <Button
                    variant={currentPage === 'profile' ? 'solid' : 'ghost'}
                    className={currentPage === 'profile' ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white' : 'text-white hover:bg-white/10'}
                    onClick={() => setCurrentPage('profile')}
                    startContent={<UserIcon className="w-4 h-4" />}
                    size="sm"
                  >
                    Profile
                  </Button>
                </div>

                <Divider orientation="vertical" className="h-6 bg-white/20 hidden md:block" />

                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={onLogout}
                  size="sm"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderCurrentPage()}
        </div>



        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-md border-t border-orange-300/20">
          <div className="flex items-center justify-around py-3">
            <Button
              variant="ghost"
              className={`flex-col gap-1 h-auto py-2 ${currentPage === 'dashboard' ? 'text-orange-300' : 'text-gray-400'}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex-col gap-1 h-auto py-2 ${currentPage === 'store' ? 'text-orange-300' : 'text-gray-400'}`}
              onClick={() => setCurrentPage('store')}
            >
              <Play className="w-5 h-5" />
              <span className="text-xs">Videos</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex-col gap-1 h-auto py-2 ${currentPage === 'cart' ? 'text-orange-300' : 'text-gray-400'}`}
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
              <span className="text-xs">Cart</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex-col gap-1 h-auto py-2 ${currentPage === 'profile' ? 'text-orange-300' : 'text-gray-400'}`}
              onClick={() => setCurrentPage('profile')}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </div>

        {/* Floating Help Button */}
        <div className="fixed bottom-20 md:bottom-8 right-4 flex flex-col gap-3">
          <Tooltip content="Help & Support" placement="left">
            <Button
              isIconOnly
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <HelpCircle className="w-6 h-6" />
            </Button>
          </Tooltip>
        </div>

        {/* Video Player */}
        {showVideoPlayer && selectedModule && (
          <ImprovedVideoPlayer
            isOpen={true}
            onClose={handleVideoPlayerClose}
            module={selectedModule}
            user={user}
            purchases={realPurchases}
            onPurchase={handleVideoPurchase}
            allModules={realModules}
            onVideoSelect={handleVideoPlay}
          />
        )}
        


        {/* Dashboard Footer */}
        <footer className="bg-gradient-to-r from-orange-600/10 to-red-600/10 backdrop-blur-sm border-t border-orange-300/10 mt-16 mb-20 md:mb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-medium">{purchasedModules.length} Videos Owned</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-400" />
                  <button 
                    className="text-white font-medium hover:text-orange-300 transition-colors"
                    onClick={() => setCurrentPage('store')}
                  >
                    Browse Store
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-purple-400" />
                  <button 
                    className="text-white font-medium hover:text-orange-300 transition-colors"
                    onClick={() => setCurrentPage('profile')}
                  >
                    My Profile
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-lg">🦁</div>
                <p className="text-gray-300 text-sm">
                  Keep learning with Kiki & Tano! 🌍
                </p>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold"
                  onClick={() => setCurrentPage('store')}
                >
                  Explore More
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}