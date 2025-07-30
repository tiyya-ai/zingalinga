/**
 * Modern User Dashboard
 * Built with Firebase-first architecture and modern UX patterns
 * Inspired by Netflix, Spotify, and modern learning platforms
 */

import React, { useState, useEffect } from 'react';
import { Module, User, Purchase, ContentFile, Cart as CartType, CartItem } from '../types';
import { neonDataStore } from '../utils/neonDataStore';
import { Cart } from './Cart';
import { Checkout } from './Checkout';
import { 
  BookOpen, 
  LogOut, 
  ShoppingCart, 
  Search, 
  TrendingUp, 
  User as UserIcon, 
  Play, 
  Star,
  RefreshCw,
  Settings,
  Download
} from 'lucide-react';

interface ModernUserDashboardProps {
  user: User;
  modules: Module[];
  purchases: Purchase[];
  contentFiles: ContentFile[];
  onModuleUpdate: (modules: Module[]) => void;
  onLogout: () => void;
  onPurchase: (moduleIds: string[]) => void;
}

interface UserProgress {
  completedModules: string[];
  currentModule?: string;
  totalWatchTime: number;
  achievements: string[];
}

export const ModernUserDashboard: React.FC<ModernUserDashboardProps> = ({ 
  user, 
  modules: initialModules,
  purchases: initialPurchases,
  contentFiles,
  onModuleUpdate,
  onLogout, 
  onPurchase 
}) => {
  // State Management
  const [activeTab, setActiveTab] = useState<'library' | 'browse' | 'progress' | 'profile' | 'cart'>('library');
  const [isLoading, setIsLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedModules: [],
    totalWatchTime: 0,
    achievements: []
  });
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartType>({ items: [], total: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
  }, []);

  // Update when props change
  useEffect(() => {
    setModules(initialModules);
    setPurchases(initialPurchases);
    calculateUserProgress(initialPurchases);
  }, [initialModules, initialPurchases]);

  const initializeDashboard = async () => {
    try {
      setIsLoading(true);
      setSyncStatus('syncing');
      
      // Set current user for enterprise data store
      neonDataStore.setCurrentUser(user);
      console.log('🎓 Modern User Dashboard initialized for:', user.email);
      
      // Load all data
      await loadUserData();
      
      setSyncStatus('connected');
    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
      setSyncStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const data = await neonDataStore.loadData();
      
      // Update state
      setModules(data.modules || []);
      const userPurchases = (data.purchases || []).filter(p => p.userId === user.id);
      setPurchases(userPurchases);
      
      // Calculate user progress
      calculateUserProgress(userPurchases);
      
      console.log('📚 User data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
    }
  };

  const calculateUserProgress = (userPurchases: Purchase[]) => {
    const completedModules = user.purchasedModules || [];
    
    setUserProgress({
      completedModules,
      totalWatchTime: userPurchases.length * 60, // Estimate 60 min per module
      achievements: calculateAchievements(userPurchases.length)
    });
  };

  const calculateAchievements = (purchaseCount: number): string[] => {
    const achievements = [];
    if (purchaseCount >= 1) achievements.push('First Purchase');
    if (purchaseCount >= 5) achievements.push('Learning Enthusiast');
    if (purchaseCount >= 10) achievements.push('Knowledge Seeker');
    if (purchaseCount >= 20) achievements.push('Master Learner');
    return achievements;
  };

  const handlePurchase = async (module: Module) => {
    try {
      setSyncStatus('syncing');
      
      // Use the onPurchase prop to handle the purchase
      onPurchase([module.id]);
      
      setSyncStatus('connected');
      setSelectedModule(null);
      setShowCheckout(false);
      
      // Refresh data after purchase
      setTimeout(() => {
        loadUserData();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      setSyncStatus('offline');
      alert('Purchase failed. Please try again.');
    }
  };

  // Cart functionality
  const addToCart = (module: Module) => {
    const cartItem: CartItem = {
      id: module.id,
      title: module.title,
      price: module.price,
      type: 'module'
    };
    
    const existingItem = cart.items.find(item => item.id === module.id);
    if (existingItem) {
      alert('This module is already in your cart!');
      return;
    }
    
    const newCart = {
      items: [...cart.items, cartItem],
      total: cart.total + module.price
    };
    
    setCart(newCart);
    alert('Module added to cart!');
  };

  const removeFromCart = (itemId: string) => {
    const itemToRemove = cart.items.find(item => item.id === itemId);
    if (!itemToRemove) return;
    
    const newCart = {
      items: cart.items.filter(item => item.id !== itemId),
      total: cart.total - itemToRemove.price
    };
    
    setCart(newCart);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePaymentComplete = () => {
    // Clear cart after successful payment
    setCart({ items: [], total: 0 });
    setIsCheckoutOpen(false);
    
    // Refresh user data
    setTimeout(() => {
      loadUserData();
    }, 1000);
  };

  const handleBackToCart = () => {
    setIsCheckoutOpen(false);
    setIsCartOpen(true);
  };

  const filteredModules = modules.filter(module => 
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ownedModules = modules.filter(module => 
    user.purchasedModules.includes(module.id)
  );

  const availableModules = modules.filter(module => 
    !user.purchasedModules.includes(module.id) && module.isVisible !== false
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 font-mali">Loading Your Dashboard...</h2>
          <p className="text-gray-500 mt-2 font-mali">Preparing your learning experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header - Matching Admin Style */}
      <header className="bg-white/95 backdrop-blur-md shadow-2xl border-b-4 border-gradient-to-r from-indigo-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img 
                  src="/zinga linga logo.png" 
                  alt="Zinga Linga" 
                  className="h-14 w-auto drop-shadow-lg"
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📚</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-mali font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Learning Dashboard
                </h1>
                <p className="font-mali text-gray-600 text-lg">Welcome back, {user.name} - Student Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sync Status */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${
                syncStatus === 'connected' ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 text-green-700' :
                syncStatus === 'syncing' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300 text-yellow-700' :
                'bg-gradient-to-r from-red-100 to-pink-100 border-red-300 text-red-700'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  syncStatus === 'connected' ? 'bg-green-500' :
                  syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
                <span className="font-mali font-bold capitalize">{syncStatus}</span>
              </div>
              
              {/* Progress Ring */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-3 rounded-xl border border-purple-300 shadow-lg">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="3"
                      strokeDasharray={`${(userProgress.completedModules.length / Math.max(modules.length, 1)) * 100}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-purple-600 font-mali">
                      {Math.round((userProgress.completedModules.length / Math.max(modules.length, 1)) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 font-mali">{userProgress.completedModules.length} / {modules.length}</p>
                  <p className="text-gray-500 font-mali">Completed</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-3 rounded-xl border border-blue-300 shadow-lg">
                <span className="text-blue-600 text-lg">👤</span>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 font-mali">{user.name}</p>
                  <p className="text-xs text-gray-500 font-mali">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-700 px-6 py-3 rounded-xl font-mali font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span>🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Navigation Tabs - Matching Admin Style */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 py-3 sm:py-4">
            {[
              { id: 'library', label: 'My Library', icon: '📚', color: 'from-green-500 to-emerald-600' },
              { id: 'browse', label: 'Browse', icon: '🔍', color: 'from-blue-500 to-indigo-600' },
              { id: 'progress', label: 'Progress', icon: '📈', color: 'from-purple-500 to-violet-600' },
              { id: 'cart', label: 'Cart', icon: '🛒', color: 'from-orange-500 to-red-600' },
              { id: 'profile', label: 'Profile', icon: '👤', color: 'from-gray-500 to-slate-600' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-mali font-medium text-sm sm:text-base transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
                {tab.id === 'cart' && cart.items.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cart.items.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'library' && (
          <LibraryTab 
            modules={ownedModules}
            userProgress={userProgress}
            setActiveTab={setActiveTab}
          />
        )}
        
        {activeTab === 'browse' && (
          <BrowseTab 
            modules={availableModules}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelectModule={setSelectedModule}
          />
        )}
        
        {activeTab === 'progress' && (
          <ProgressTab 
            userProgress={userProgress}
            purchases={purchases}
          />
        )}
        
        {activeTab === 'cart' && (
          <CartTab 
            cart={cart}
            onRemoveItem={removeFromCart}
            onCheckout={handleCheckout}
            onContinueShopping={() => setActiveTab('browse')}
          />
        )}
        
        {activeTab === 'profile' && (
          <ProfileTab 
            user={user}
            userProgress={userProgress}
            onRefreshData={loadUserData}
          />
        )}
      </main>

      {/* Module Details Modal */}
      {selectedModule && (
        <ModuleDetailsModal
          module={selectedModule}
          onPurchase={() => handlePurchase(selectedModule)}
          onAddToCart={() => addToCart(selectedModule)}
          onClose={() => setSelectedModule(null)}
        />
      )}

      {/* Cart Modal */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {/* Checkout Modal */}
      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onPaymentComplete={handlePaymentComplete}
        onBackToCart={handleBackToCart}
        user={user}
      />
    </div>
  );
};

// Library Tab Component - Enhanced Admin Style
const LibraryTab: React.FC<{
  modules: Module[];
  userProgress: UserProgress;
  setActiveTab: (tab: 'library' | 'browse' | 'progress' | 'profile') => void;
}> = ({ modules, userProgress, setActiveTab }) => {
  return (
    <div className="space-y-8">
      {/* Continue Learning Section - Enhanced */}
      {userProgress.currentModule && (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl border border-indigo-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-mali font-bold mb-1">Continue Learning</h2>
              <p className="text-indigo-100 font-mali text-lg">Pick up where you left off</p>
            </div>
          </div>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-mali font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Continue Journey
          </button>
        </div>
      )}
      
      {/* My Modules - Enhanced Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-mali font-bold text-gray-800">My Learning Library</h2>
          <div className="flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-xl border border-green-300">
            <BookOpen className="w-5 h-5 text-green-600" />
            <span className="font-mali font-bold text-green-700">{modules.length} Modules</span>
          </div>
        </div>
        
        {modules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {modules.map((module) => (
              <div key={module.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
                {/* Video Thumbnail with Play Button - Library Version */}
                <div className="relative">
                  {module.demoVideo ? (
                    <img 
                      src={module.demoVideo} 
                      alt={module.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <Play className="w-16 h-16 text-white opacity-80" />
                    </div>
                  )}
                  
                  {/* Play Button Overlay for Owned Videos */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-green-500/90 backdrop-blur-sm rounded-full p-4 shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  
                  {/* Owned Badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-mali font-bold shadow-lg">
                    ✓ Owned
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.floor(Math.random() * 80 + 10)}%` }}
                    />
                  </div>
                  
                  {/* Video Duration */}
                  <div className="absolute bottom-3 left-3 bg-black/80 text-white px-2 py-1 rounded-lg text-sm font-mali font-bold">
                    🎬 {Math.floor(Math.random() * 20 + 5)} min
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-mali font-bold text-gray-900 mb-3 text-lg line-clamp-2">{module.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 font-mali leading-relaxed">{module.description}</p>
                  
                  {/* Learning Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mali text-gray-600">Progress</span>
                      <span className="text-sm font-mali font-bold text-green-600">{Math.floor(Math.random() * 80 + 10)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.floor(Math.random() * 80 + 10)}%` }}
                      />
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-mali font-bold shadow-lg transform hover:scale-105 flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    Continue Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-mali font-bold text-gray-800 mb-3">Your Library Awaits</h3>
            <p className="text-gray-600 mb-8 font-mali text-lg max-w-md mx-auto">Start building your learning journey by exploring our amazing collection of educational modules</p>
            <button 
              onClick={() => setActiveTab('browse')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-mali font-bold shadow-lg transform hover:scale-105"
            >
              Explore Modules
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Browse Tab Component - Enhanced with Video Previews
const BrowseTab: React.FC<{
  modules: Module[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelectModule: (module: Module) => void;
}> = ({ modules, searchTerm, onSearchChange, onSelectModule }) => {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  
  return (
    <div className="space-y-8">
      {/* Enhanced Search */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search for learning videos, topics, or skills..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-16 pr-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 text-lg font-mali shadow-inner"
          />
          <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-6 h-6" />
          </div>
        </div>
      </div>
      
      {/* Available Learning Videos */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-mali font-bold text-gray-800">Learning Videos for Children</h2>
          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 rounded-xl border border-purple-300">
            <Play className="w-5 h-5 text-purple-600" />
            <span className="font-mali font-bold text-purple-700">{modules.length} Videos</span>
          </div>
        </div>
        
        {modules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {modules.map((module) => (
              <div 
                key={module.id} 
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => onSelectModule(module)}
                onMouseEnter={() => setHoveredModule(module.id)}
                onMouseLeave={() => setHoveredModule(null)}
              >
                {/* Video Thumbnail with Play Button */}
                <div className="relative group">
                  {module.demoVideo ? (
                    <img 
                      src={module.demoVideo} 
                      alt={module.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                      <Play className="w-16 h-16 text-white opacity-80" />
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-8 h-8 text-indigo-600 ml-1" />
                    </div>
                  </div>
                  
                  {/* Video Duration Badge */}
                  <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded-lg text-sm font-mali font-bold">
                    🎬 {Math.floor(Math.random() * 20 + 5)} min
                  </div>
                  
                  {/* Age Range Badge */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-mali font-bold shadow-lg">
                    👶 {module.ageRange || '3-8 years'}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-mali font-bold text-gray-900 mb-3 text-lg line-clamp-2">{module.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 font-mali leading-relaxed">{module.description}</p>
                  
                  {/* Features */}
                  {module.features && module.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {module.features.slice(0, 2).map((feature, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-mali font-bold">
                          ✨ {feature}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-mali font-bold text-indigo-600">${module.price}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 font-mali">{module.rating || 4.8}</span>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-mali font-bold shadow-lg transform hover:scale-105">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-mali font-bold text-gray-800 mb-3">No Learning Videos Found</h3>
            <p className="text-gray-600 font-mali text-lg">Try adjusting your search terms to find amazing educational content</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Progress Tab Component
const ProgressTab: React.FC<{
  userProgress: UserProgress;
  purchases: Purchase[];
}> = ({ userProgress, purchases }) => {
  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 font-mali">Modules Completed</p>
              <p className="text-3xl font-bold text-purple-600 font-mali">{userProgress.completedModules.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 font-mali">Watch Time</p>
              <p className="text-3xl font-bold text-blue-600 font-mali">{userProgress.totalWatchTime}m</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 font-mali">Achievements</p>
              <p className="text-3xl font-bold text-green-600 font-mali">{userProgress.achievements.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 font-mali">Achievements</h3>
        </div>
        <div className="p-6">
          {userProgress.achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProgress.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-2xl">🏆</span>
                  <span className="font-medium text-gray-900 font-mali">{achievement}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 font-mali">No achievements yet. Keep learning to unlock them!</p>
          )}
        </div>
      </div>
      
      {/* Recent Purchases */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 font-mali">Recent Purchases</h3>
        </div>
        <div className="p-6">
          {purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.slice(0, 5).map((purchase, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 font-mali">{purchase.moduleIds?.join(', ') || 'Module'}</p>
                    <p className="text-sm text-gray-600 font-mali">{new Date(purchase.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-semibold text-green-600 font-mali">${purchase.amount}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 font-mali">No purchases yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab: React.FC<{
  user: User;
  userProgress: UserProgress;
  onRefreshData: () => void;
}> = ({ user, userProgress, onRefreshData }) => {
  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-3xl font-mali">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-mali">{user.name}</h2>
            <p className="text-gray-600 font-mali">{user.email}</p>
            <p className="text-sm text-gray-500 mt-1 font-mali">
              Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Learning Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 font-mali">Learning Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 font-mali">Modules Completed</p>
            <p className="text-2xl font-bold text-purple-600 font-mali">{userProgress.completedModules.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-mali">Total Watch Time</p>
            <p className="text-2xl font-bold text-blue-600 font-mali">{userProgress.totalWatchTime} minutes</p>
          </div>
        </div>
      </div>
      
      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 font-mali">Account Actions</h3>
        <div className="space-y-3">
          <button
            onClick={onRefreshData}
            className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-mali"
          >
            🔄 Refresh Data
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-mali">
            📥 Export Learning Data
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-mali">
            🔒 Privacy Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// Module Details Modal Component
const ModuleDetailsModal: React.FC<{
  module: Module;
  onPurchase: () => void;
  onAddToCart: () => void;
  onClose: () => void;
}> = ({ module, onPurchase, onAddToCart, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          {module.demoVideo && (
            <img 
              src={module.demoVideo} 
              alt={module.title}
              className="w-full h-64 object-cover rounded-t-xl"
            />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-mali">{module.title}</h2>
          <p className="text-gray-600 mb-6 font-mali">{module.description}</p>
          
          {/* Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 font-mali">What you'll learn:</h3>
            <ul className="space-y-2">
              {module.features?.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700 font-mali">{feature}</span>
                </li>
              )) || (
                <>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700 font-mali">Comprehensive video content</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700 font-mali">Lifetime access</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700 font-mali">Mobile and desktop compatible</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700 font-mali">Certificate of completion</span>
                  </li>
                </>
              )}
            </ul>
          </div>
          
          {/* Purchase Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 font-mali">Price</p>
                <p className="text-3xl font-bold text-purple-600 font-mali">${module.price}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onAddToCart}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium font-mali"
              >
                🛒 Add to Cart
              </button>
              <button
                onClick={onPurchase}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium font-mali"
              >
                💳 Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cart Tab Component
const CartTab: React.FC<{
  cart: CartType;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}> = ({ cart, onRemoveItem, onCheckout, onContinueShopping }) => {
  if (cart.items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-6xl">🛒</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 font-mali">Your cart is empty</h2>
        <p className="text-gray-600 mb-8 font-mali">Add some learning modules to get started!</p>
        <button
          onClick={onContinueShopping}
          className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium font-mali"
        >
          Browse Modules
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-mali">Shopping Cart</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600 font-mali">{cart.items.length} item(s)</p>
          <p className="text-2xl font-bold text-purple-600 font-mali">${cart.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 font-mali">{item.title}</h3>
                  <p className="text-sm text-gray-600 font-mali">
                    {item.type === 'bundle' ? 'Bundle Package' : 'Learning Module'}
                  </p>
                  <p className="text-xl font-bold text-purple-600 font-mali mt-2">${item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-2 font-mali"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-mali">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 font-mali">
                <span>Subtotal:</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-mali">
                <span>Tax:</span>
                <span>$0.00</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900 font-mali">
                <span>Total:</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={onCheckout}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium font-mali"
              >
                💳 Proceed to Checkout
              </button>
              <button
                onClick={onContinueShopping}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium font-mali"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernUserDashboard;