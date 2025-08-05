'use client';

import React, { useState, useEffect } from 'react';
import { User, Module, Purchase, ContentFile } from '../types';
import { checkVideoAccess, getVideoUrl } from '../utils/videoAccess';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  description: string;
  videoUrl: string;
  category: string;
  isPremium: boolean;
}

interface StoreItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  watchTime: string;
  favoriteVideos: number;
  purchasedItems: number;
}

const videos: Video[] = [
  {
    id: '1',
    title: 'Kiki\'s Jungle Adventure',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    duration: '15:30',
    description: 'Join Kiki on an exciting jungle adventure filled with learning and fun!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    category: 'Adventure',
    isPremium: false
  },
  {
    id: '2',
    title: 'Tano\'s Learning Quest',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    duration: '12:45',
    description: 'Learn with Tano in this educational journey through numbers and letters!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    category: 'Education',
    isPremium: true
  },
  {
    id: '3',
    title: 'African Animals Safari',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    duration: '18:20',
    description: 'Discover amazing African animals in their natural habitat!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    category: 'Nature',
    isPremium: false
  },
  {
    id: '4',
    title: 'Music & Dance Party',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    duration: '10:15',
    description: 'Dance and sing along with Kiki and Tano!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    category: 'Music',
    isPremium: false
  },
  {
    id: '5',
    title: 'Cooking Adventures',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    duration: '14:30',
    description: 'Learn to cook healthy meals with our characters!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    category: 'Life Skills',
    isPremium: true
  },
  {
    id: '6',
    title: 'Space Exploration',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
    duration: '16:45',
    description: 'Blast off to space and explore the universe!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    category: 'Science',
    isPremium: true
  },
  {
    id: '7',
    title: 'Ocean Adventures',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
    duration: '13:20',
    description: 'Dive deep into the ocean with our underwater friends!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    category: 'Nature',
    isPremium: false
  },
  {
    id: '8',
    title: 'Art & Creativity',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    duration: '11:40',
    description: 'Express your creativity with colors and shapes!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    category: 'Art',
    isPremium: true
  },
  {
    id: '9',
    title: 'Sports & Games',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg',
    duration: '9:30',
    description: 'Play fun games and learn about different sports!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    category: 'Sports',
    isPremium: false
  }
];

const storeItems: StoreItem[] = [
  {
    id: '1',
    name: 'Kiki Plush Toy',
    price: 25.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
    description: 'Soft and cuddly Kiki plush toy, perfect for bedtime stories',
    category: 'Toys',
    inStock: true
  },
  {
    id: '2',
    name: 'Tano Action Figure',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&h=200&fit=crop',
    description: 'Poseable Tano action figure with movable joints',
    category: 'Toys',
    inStock: true
  },
  {
    id: '3',
    name: 'Learning Activity Book',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop',
    description: 'Fun activities, puzzles, and coloring pages',
    category: 'Books',
    inStock: true
  },
  {
    id: '4',
    name: 'Zinga Linga T-Shirt',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
    description: 'Comfortable cotton t-shirt with Zinga Linga characters',
    category: 'Clothing',
    inStock: true
  },
  {
    id: '5',
    name: 'Educational Puzzle Set',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=200&h=200&fit=crop',
    description: 'Set of 4 educational puzzles for different age groups',
    category: 'Educational',
    inStock: false
  },
  {
    id: '6',
    name: 'Character Backpack',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
    description: 'Durable backpack featuring Kiki and Tano',
    category: 'Accessories',
    inStock: true
  }
];

const userProfile: UserProfile = {
  name: 'Little Explorer',
  email: 'parent@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  joinDate: 'January 2024',
  watchTime: '45 hours',
  favoriteVideos: 8,
  purchasedItems: 3
};

interface NewUserDashboardProps {
  user?: User;
  modules?: Module[];
  purchases?: Purchase[];
  contentFiles?: ContentFile[];
  onLogout?: () => void;
  onPurchase?: (moduleId: string) => void;
}

export default function NewUserDashboard({
  user,
  modules = [],
  purchases = [],
  contentFiles = [],
  onLogout,
  onPurchase
}: NewUserDashboardProps) {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all-content');
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [liveModules, setLiveModules] = useState<Module[]>(modules);

  React.useEffect(() => {
    setMounted(true);
    loadLatestModules();
  }, []);

  React.useEffect(() => {
    setLiveModules(modules);
  }, [modules]);

  const loadLatestModules = async () => {
    try {
      const { vpsDataStore } = await import('../utils/vpsDataStore');
      const data = await vpsDataStore.loadData();
      if (data.modules) {
        setLiveModules(data.modules);
      }
    } catch (error) {
      console.warn('Error loading latest modules:', error);
    }
  };

  // Use ONLY real admin data - no fallback to sample videos
  const adminVideos = liveModules
    .filter(module => module.type === 'video' || !module.type) // Include modules without type specified
    .map(module => ({
      id: module.id,
      title: module.title,
      thumbnail: module.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image',
      duration: module.duration || '10:00',
      description: module.description || 'No description available',
      videoUrl: module.videoUrl || '',
      category: module.category,
      isPremium: module.isPremium || false
    }));

  // ONLY use real admin videos - no sample fallback
  const displayVideos = adminVideos;

  const categories = ['All Content', 'Audio Lessons', 'Video Lessons', 'PP1 Program', 'PP2 Program', 'Bundles'];
  const allContent = liveModules.filter(module => module.isVisible !== false);
  
  const getContentIcon = (type: string, category: string) => {
    if (category === 'Audio Lessons') return '🎧';
    if (category === 'Video Lessons') return '📹';
    if (category === 'PP1 Program') return '📚';
    if (category === 'PP2 Program') return '📖';
    return '📄';
  };

  const getContentColor = (category: string) => {
    switch (category) {
      case 'Audio Lessons': return 'from-blue-500 to-blue-600';
      case 'Video Lessons': return 'from-green-500 to-green-600';
      case 'PP1 Program': return 'from-orange-500 to-orange-600';
      case 'PP2 Program': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const filteredContent = allContent.filter(content => {
    const matchesCategory = selectedCategory === 'All Content' || content.category === selectedCategory;
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredVideos = displayVideos.filter(video => {
    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const playVideo = (video: Video) => {
    if (video.isPremium && !checkVideoAccess(user, video, purchases || []).hasAccess) {
      alert('This is a premium video. Please purchase to watch!');
      return;
    }
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const addToCart = (itemId: string) => {
    if (!cartItems.includes(itemId)) {
      setCartItems([...cartItems, itemId]);
      setShowCartPopup(true);
      setTimeout(() => setShowCartPopup(false), 2000);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(id => id !== itemId));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, itemId) => {
      const item = storeItems.find(item => item.id === itemId);
      return total + (item?.price || 0);
    }, 0).toFixed(2);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Z</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Zinga Linga</h1>
                <p className="text-white/80 text-sm">Educational Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                <img src={user?.avatar || userProfile.avatar} alt="Profile" className="w-6 h-6 rounded-full border-2 border-white/50" />
                <span className="font-medium">{user?.name || userProfile.name}</span>
              </button>
              {cartItems.length > 0 && (
                <button 
                  onClick={() => setActiveTab('store')}
                  className="relative bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  🛒 Cart
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                </button>
              )}
              <button 
                onClick={() => onLogout && onLogout()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Page */}
        {showProfile && (
          <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-green-900 p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-white">My Profile</h1>
                  <button
                    onClick={() => setShowProfile(false)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
                
                {/* Profile Header */}
                <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-8 mb-6">
                  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                    <div className="relative">
                      <img src={user?.avatar || userProfile.avatar} alt="Profile" className="w-32 h-32 rounded-full border-4 border-yellow-400" />
                      <button className="absolute bottom-0 right-0 bg-yellow-400 text-purple-800 p-2 rounded-full hover:bg-yellow-500">
                        📷
                      </button>
                    </div>
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl font-bold text-white mb-2">{user?.name || userProfile.name}</h2>
                      <p className="text-gray-300 mb-2">{user?.email || userProfile.email}</p>
                      <p className="text-gray-400 text-sm">Member since {userProfile.joinDate}</p>
                      <div className="flex space-x-4 mt-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          user?.role === 'premium' ? 'bg-yellow-400 text-purple-800' : 'bg-green-500 text-white'
                        }`}>
                          {user?.role === 'premium' ? 'Premium Member' : 'Free Member'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{displayVideos.length}</div>
                    <div className="text-gray-300 text-sm">Available Videos</div>
                  </div>
                  <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{purchases.length}</div>
                    <div className="text-gray-300 text-sm">Purchases</div>
                  </div>
                  <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{userProfile.watchTime}</div>
                    <div className="text-gray-300 text-sm">Watch Time</div>
                  </div>
                  <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{cartItems.length}</div>
                    <div className="text-gray-300 text-sm">Cart Items</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {displayVideos.slice(0, 3).map(video => (
                      <div key={video.id} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg">
                        <img src={video.thumbnail} alt={video.title} className="w-16 h-12 rounded object-cover" />
                        <div className="flex-1">
                          <div className="text-white font-medium">{video.title}</div>
                          <div className="text-gray-400 text-sm">Watched 2 hours ago</div>
                        </div>
                        <div className="text-yellow-400 text-sm">{video.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Settings */}
                <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Account Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-left">
                      <div className="font-semibold">Change Password</div>
                      <div className="text-sm text-blue-200">Update your account password</div>
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-left">
                      <div className="font-semibold">Upgrade to Premium</div>
                      <div className="text-sm text-green-200">Access all premium content</div>
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-left">
                      <div className="font-semibold">Parental Controls</div>
                      <div className="text-sm text-purple-200">Manage viewing restrictions</div>
                    </button>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg text-left">
                      <div className="font-semibold">Download Settings</div>
                      <div className="text-sm text-orange-200">Manage offline content</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Status Indicator */}
        <div className="mb-4 p-3 rounded-lg border">
          {adminVideos.length > 0 ? (
            <div className="bg-green-100 border-green-300 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-800 text-sm font-medium">
                  ✅ Using REAL admin data ({adminVideos.length} videos from database)
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-orange-100 border-orange-300 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-orange-800 text-sm font-medium">
                  ⚠️ No admin videos found in database. Please add videos through admin panel.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'videos'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            🎬 Videos ({displayVideos.length})
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'store'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            🛍️ Store ({storeItems.length})
          </button>
        </div>

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Featured Videos</h2>
              <div className="text-white/80">{filteredVideos.length} videos</div>
            </div>
            
            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-yellow-400 text-purple-800'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="max-w-md">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => {
                const hasAccess = !video.isPremium || checkVideoAccess(user, video, purchases || []).hasAccess;
                return (
                  <div key={video.id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden hover:scale-105 hover:border-yellow-400 transition-all duration-300">
                    <div className="relative">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          video.isPremium ? 'bg-yellow-400 text-purple-800' : 'bg-green-500 text-white'
                        }`}>
                          {video.isPremium ? 'PREMIUM' : 'FREE'}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                        {video.category}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
                        {video.duration}
                      </div>
                      {!hasAccess && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-4xl mb-2">🔒</div>
                            <div className="text-sm">Premium Required</div>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => playVideo(video)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors group"
                      >
                        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-8 h-8 text-purple-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                    </div>
                    <div className="p-4 bg-gray-800">
                      <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
                      <p className="text-gray-300 text-sm line-clamp-2">{video.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            hasAccess ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-gray-400 text-xs">
                            {hasAccess ? 'Available' : 'Locked'}
                          </span>
                        </div>
                        <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
                          {hasAccess ? 'Watch Now →' : 'Upgrade →'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                {adminVideos.length === 0 ? (
                  <div>
                    <div className="text-white text-2xl mb-4">📹</div>
                    <div className="text-white text-lg mb-2">No videos available</div>
                    <div className="text-white/70 text-sm">Admin needs to add videos through the admin panel</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-400 text-lg mb-2">No videos match your search</div>
                    <div className="text-gray-500 text-sm">Try adjusting your search or filter criteria</div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Zinga Linga Store</h2>
              {cartItems.length > 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                  <div className="text-white font-semibold">Cart Total: ${getTotalPrice()}</div>
                  <button className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Checkout
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storeItems.map((item) => (
                <div key={item.id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden hover:scale-105 hover:border-purple-400 transition-all duration-300">
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.inStock ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-2">{item.name}</h3>
                    <p className="text-gray-300 text-sm mb-3">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-yellow-400">${item.price}</span>
                      {cartItems.includes(item.id) ? (
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      ) : (
                        <button 
                          onClick={() => addToCart(item.id)}
                          disabled={!item.inStock}
                          className={`font-semibold px-4 py-2 rounded-lg transition-colors ${
                            item.inStock
                              ? 'bg-yellow-400 hover:bg-yellow-500 text-purple-800'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Cart Popup */}
      {showCartPopup && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-semibold">Added to Cart!</div>
              <div className="text-sm text-green-100">Item successfully added</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Z</span>
              </div>
              <div>
                <h3 className="text-white font-bold">Zinga Linga</h3>
                <p className="text-white/80 text-sm">Educational Fun for Kids</p>
              </div>
            </div>
            <div className="flex space-x-6">
              <button
                onClick={() => setShowProfile(true)}
                className="text-white hover:text-yellow-300 transition-colors font-medium"
              >
                👤 Profile
              </button>
              <button
                onClick={() => setActiveTab('store')}
                className="text-white hover:text-yellow-300 transition-colors font-medium"
              >
                🛍️ Store
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className="text-white hover:text-yellow-300 transition-colors font-medium"
              >
                🎬 Videos
              </button>
            </div>
            <div className="text-white/60 text-sm">
              © 2024 Zinga Linga. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Dark Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-gray-700">
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedVideo.title}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-gray-400 text-sm">{selectedVideo.duration}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    selectedVideo.isPremium ? 'bg-yellow-400 text-purple-800' : 'bg-green-500 text-white'
                  }`}>
                    {selectedVideo.isPremium ? 'PREMIUM' : 'FREE'}
                  </span>
                  <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                    {selectedVideo.category}
                  </span>
                </div>
              </div>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-white text-3xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 bg-black">
              <video
                controls
                autoPlay
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-auto max-h-[70vh] rounded-lg"
                src={selectedVideo.videoUrl || null}
                poster={selectedVideo.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <p className="text-gray-300">{selectedVideo.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-4">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                      ❤️ Like
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      📚 Add to Playlist
                    </button>
                  </div>
                  <div className="text-gray-400 text-sm">
                    Views: {Math.floor(Math.random() * 5000) + 100} • Duration: {selectedVideo.duration}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}artItems.includes(itemId)) {
      setCartItems([...cartItems, itemId]);
      setShowCartPopup(true);
      setTimeout(() => setShowCartPopup(false), 2000);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(id => id !== itemId));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, itemId) => {
      const item = storeItems.find(item => item.id === itemId);
      return total + (item?.price || 0);
    }, 0).toFixed(2);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Z</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Zinga Linga</h1>
                <p className="text-white/80 text-sm">Educational Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                <img src={user?.avatar || userProfile.avatar} alt="Profile" className="w-6 h-6 rounded-full border-2 border-white/50" />
                <span className="font-medium">{user?.name || userProfile.name}</span>
              </button>
              {cartItems.length > 0 && (
                <button 
                  onClick={() => setActiveTab('store')}
                  className="relative bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  🛒 Cart
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                </button>
              )}
              <button 
                onClick={() => onLogout && onLogout()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Page */}
        {showProfile && (
          <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-green-900 p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-white">My Profile</h1>
                  <button
                    onClick={() => setShowProfile(false)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
                
                {/* Profile Header */}
                <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-8 mb-6">
                  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                    <div className="relative">
                      <img src={user?.avatar || userProfile.avatar} alt="Profile" className="w-32 h-32 rounded-full border-4 border-yellow-400" />
                      <button className="absolute bottom-0 right-0 bg-yellow-400 text-purple-800 p-2 rounded-full hover:bg-yellow-500">
                        📷
                      </button>
                    </div>
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl font-bold text-white mb-2">{user?.name || userProfile.name}</h2>
                      <p className="text-gray-300 mb-2">{user?.email || userProfile.email}</p>
                      <p className="text-gray-400 text-sm">Member since {userProfile.joinDate}</p>
                      <div className="flex space-x-4 mt-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          user?.role === 'premium' ? 'bg-yellow-400 text-purple-800' : 'bg-green-500 text-white'
                        }`}>
                          {user?.role === 'premium' ? 'Premium Member' : 'Free Member'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{displayVideos.length}</div>
                    <div className="text-gray-300 text-sm">Available Videos</div>
                  </div>
                  <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{purchases.length}</div>
                    <div className="text-gray-300 text-sm">Purchases</div>
                  </div>
                  <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{userProfile.watchTime}</div>
                    <div className="text-gray-300 text-sm">Watch Time</div>
                  </div>
                  <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{cartItems.length}</div>
                    <div className="text-gray-300 text-sm">Cart Items</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {displayVideos.slice(0, 3).map(video => (
                      <div key={video.id} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg">
                        <img src={video.thumbnail} alt={video.title} className="w-16 h-12 rounded object-cover" />
                        <div className="flex-1">
                          <div className="text-white font-medium">{video.title}</div>
                          <div className="text-gray-400 text-sm">Watched 2 hours ago</div>
                        </div>
                        <div className="text-yellow-400 text-sm">{video.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Settings */}
                <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Account Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-left">
                      <div className="font-semibold">Change Password</div>
                      <div className="text-sm text-blue-200">Update your account password</div>
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-left">
                      <div className="font-semibold">Upgrade to Premium</div>
                      <div className="text-sm text-green-200">Access all premium content</div>
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-left">
                      <div className="font-semibold">Parental Controls</div>
                      <div className="text-sm text-purple-200">Manage viewing restrictions</div>
                    </button>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg text-left">
                      <div className="font-semibold">Download Settings</div>
                      <div className="text-sm text-orange-200">Manage offline content</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Status Indicator */}
        <div className="mb-4 p-3 rounded-lg border">
          {adminVideos.length > 0 ? (
            <div className="bg-green-100 border-green-300 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-800 text-sm font-medium">
                  ✅ Using REAL admin data ({adminVideos.length} videos from database)
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-orange-100 border-orange-300 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-orange-800 text-sm font-medium">
                  ⚠️ No admin videos found in database. Please add videos through admin panel.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'videos'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            🎬 Videos ({displayVideos.length})
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'store'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            🛍️ Store ({storeItems.length})
          </button>
        </div>

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Featured Videos</h2>
              <div className="text-white/80">{filteredVideos.length} videos</div>
            </div>
            
            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-yellow-400 text-purple-800'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="max-w-md">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => {
                const hasAccess = !video.isPremium || checkVideoAccess(user, video, purchases || []).hasAccess;
                return (
                  <div key={video.id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden hover:scale-105 hover:border-yellow-400 transition-all duration-300">
                    <div className="relative">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          video.isPremium ? 'bg-yellow-400 text-purple-800' : 'bg-green-500 text-white'
                        }`}>
                          {video.isPremium ? 'PREMIUM' : 'FREE'}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                        {video.category}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
                        {video.duration}
                      </div>
                      {!hasAccess && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-4xl mb-2">🔒</div>
                            <div className="text-sm">Premium Required</div>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => playVideo(video)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors group"
                      >
                        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-8 h-8 text-purple-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                    </div>
                    <div className="p-4 bg-gray-800">
                      <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
                      <p className="text-gray-300 text-sm line-clamp-2">{video.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            hasAccess ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-gray-400 text-xs">
                            {hasAccess ? 'Available' : 'Locked'}
                          </span>
                        </div>
                        <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
                          {hasAccess ? 'Watch Now →' : 'Upgrade →'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                {adminVideos.length === 0 ? (
                  <div>
                    <div className="text-white text-2xl mb-4">📹</div>
                    <div className="text-white text-lg mb-2">No videos available</div>
                    <div className="text-white/70 text-sm">Admin needs to add videos through the admin panel</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-400 text-lg mb-2">No videos match your search</div>
                    <div className="text-gray-500 text-sm">Try adjusting your search or filter criteria</div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Zinga Linga Store</h2>
              {cartItems.length > 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                  <div className="text-white font-semibold">Cart Total: ${getTotalPrice()}</div>
                  <button className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Checkout
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storeItems.map((item) => (
                <div key={item.id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden hover:scale-105 hover:border-purple-400 transition-all duration-300">
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.inStock ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-2">{item.name}</h3>
                    <p className="text-gray-300 text-sm mb-3">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-yellow-400">${item.price}</span>
                      {cartItems.includes(item.id) ? (
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      ) : (
                        <button 
                          onClick={() => addToCart(item.id)}
                          disabled={!item.inStock}
                          className={`font-semibold px-4 py-2 rounded-lg transition-colors ${
                            item.inStock
                              ? 'bg-yellow-400 hover:bg-yellow-500 text-purple-800'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Cart Popup */}
      {showCartPopup && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-semibold">Added to Cart!</div>
              <div className="text-sm text-green-100">Item successfully added</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Z</span>
              </div>
              <div>
                <h3 className="text-white font-bold">Zinga Linga</h3>
                <p className="text-white/80 text-sm">Educational Fun for Kids</p>
              </div>
            </div>
            <div className="flex space-x-6">
              <button
                onClick={() => setShowProfile(true)}
                className="text-white hover:text-yellow-300 transition-colors font-medium"
              >
                👤 Profile
              </button>
              <button
                onClick={() => setActiveTab('store')}
                className="text-white hover:text-yellow-300 transition-colors font-medium"
              >
                🛍️ Store
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className="text-white hover:text-yellow-300 transition-colors font-medium"
              >
                🎬 Videos
              </button>
            </div>
            <div className="text-white/60 text-sm">
              © 2024 Zinga Linga. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Dark Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-gray-700">
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedVideo.title}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-gray-400 text-sm">{selectedVideo.duration}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    selectedVideo.isPremium ? 'bg-yellow-400 text-purple-800' : 'bg-green-500 text-white'
                  }`}>
                    {selectedVideo.isPremium ? 'PREMIUM' : 'FREE'}
                  </span>
                  <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                    {selectedVideo.category}
                  </span>
                </div>
              </div>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-white text-3xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 bg-black">
              <video
                controls
                autoPlay
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-auto max-h-[70vh] rounded-lg"
                src={selectedVideo.videoUrl || null}
                poster={selectedVideo.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <p className="text-gray-300">{selectedVideo.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-4">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                      ❤️ Like
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      📚 Add to Playlist
                    </button>
                  </div>
                  <div className="text-gray-400 text-sm">
                    Views: {Math.floor(Math.random() * 5000) + 100} • Duration: {selectedVideo.duration}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}