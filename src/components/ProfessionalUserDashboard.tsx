'use client';

import React, { useState, useEffect } from 'react';
import { User, Module, Purchase, ContentFile } from '../types';
import { checkVideoAccess, getVideoUrl } from '../utils/videoAccess';
import { vpsDataStore } from '../utils/vpsDataStore';
import { getVideoThumbnail } from '../utils/videoUtils';
import { ChatModal } from './ChatModal';
import ClientOnly from './ClientOnly';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  description: string;
  videoUrl: string;
  category: string;
  isPremium: boolean;
  price?: number;
  rating?: number;
  views?: number;
  tags?: string[];
  isYouTube?: boolean;
}

interface StoreItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
  rating?: number;
  reviews?: number;
  discount?: number;
}

interface UserStats {
  watchTime: number;
  videosWatched: number;
  purchasedItems: number;
  favoriteVideos: number;
  achievements: string[];
  level: number;
}

interface ProfessionalUserDashboardProps {
  user?: User;
  modules?: Module[];
  purchases?: Purchase[];
  contentFiles?: ContentFile[];
  onLogout?: () => void;
  onPurchase?: (moduleId: string) => void;
}

export default function ProfessionalUserDashboard({
  user,
  modules = [],
  purchases = [],
  contentFiles = [],
  onLogout,
  onPurchase
}: ProfessionalUserDashboardProps) {
  const [localPurchases, setLocalPurchases] = useState<Purchase[]>(purchases);
  const [liveModules, setLiveModules] = useState<Module[]>(modules);
  const [savedCategories, setSavedCategories] = useState<string[]>([]);
  
  // Update local purchases when prop changes
  useEffect(() => {
    setLocalPurchases(purchases);
  }, [purchases]);

  // Update live modules when prop changes
  useEffect(() => {
    setLiveModules(modules);
  }, [modules]);
  // State Management
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    watchTime: 0,
    videosWatched: 0,
    purchasedItems: 0,
    favoriteVideos: 0,
    achievements: [],
    level: 1
  });
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<any>(null);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  
  // Get related videos (same category)
  const getRelatedVideos = (currentVideo: Video) => {
    return displayVideos
      .filter(video => 
        video.id !== currentVideo.id && 
        video.category === currentVideo.category
      )
      .slice(0, 4);
  };

  // Convert admin modules to store items (all videos as purchasable content)
  const storeItems = liveModules
    .filter(module => module.type === 'video' || !module.type) // All videos
    .map(module => {
      let thumbnail = module.thumbnail || '';
      
      // Handle File objects by converting to blob URLs
      if (module.thumbnail instanceof File) {
        thumbnail = URL.createObjectURL(module.thumbnail);
      }
      
      // Handle YouTube thumbnails
      if (module.videoUrl && typeof module.videoUrl === 'string') {
        let videoId = null;
        if (module.videoUrl.includes('youtube.com/watch')) {
          videoId = module.videoUrl.split('v=')[1]?.split('&')[0];
        } else if (module.videoUrl.includes('youtu.be/')) {
          videoId = module.videoUrl.split('youtu.be/')[1]?.split('?')[0];
        }
        
        if (videoId && !thumbnail) {
          thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
      
      return {
        id: module.id,
        name: module.title || 'Untitled Video',
        price: module.price || 0,
        image: thumbnail || '',
        description: module.description || '',
        category: module.category || 'Videos',
        inStock: true,
        rating: module.rating || 5.0,
        reviews: module.reviews || 0,
        discount: 0
      };
    });

  // Check if item is purchased by current user
  const isItemPurchased = (itemId: string) => {
    return localPurchases.some(purchase => 
      purchase.moduleId === itemId && 
      purchase.userId === user?.id && 
      purchase.status === 'completed'
    );
  };

  const loadLatestModules = async () => {
    try {
      const data = await vpsDataStore.loadData();
      if (data.modules) {
        setLiveModules(data.modules);
        console.log('🔍 Loaded modules:', data.modules.map(m => ({
          id: m.id,
          title: m.title,
          hasVideoUrl: !!m.videoUrl,
          videoUrlType: typeof m.videoUrl,
          hasThumbnail: !!m.thumbnail,
          thumbnailType: typeof m.thumbnail
        })));
      }
    } catch (error) {
      console.warn('Error loading latest modules:', error);
    }
  };

  const loadSavedCategories = async () => {
    try {
      const data = await vpsDataStore.loadData();
      if (data.categories && Array.isArray(data.categories)) {
        setSavedCategories(data.categories);
      }
    } catch (error) {
      console.warn('Error loading saved categories:', error);
    }
  };

  const loadLatestVideos = async () => {
    try {
      const latestVideos = await vpsDataStore.getProducts();
      // This will trigger a re-render with the latest videos
      console.log('Latest videos loaded:', latestVideos.length);
    } catch (error) {
      console.warn('Error loading latest videos:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const data = await vpsDataStore.loadData();
      // Calculate user stats from real data
      const userPurchases = localPurchases.filter(p => p.userId === user?.id && p.status === 'completed');
      const watchedVideos = userPurchases.length;
      const purchasedProducts = userPurchases.length;
      
      setUserStats(prev => ({
        ...prev,
        videosWatched: watchedVideos,
        purchasedItems: purchasedProducts,
        watchTime: Math.round(localPurchases.filter(p => p.userId === user?.id && p.status === 'completed').reduce((total, purchase) => {
          const video = displayVideos.find(v => v.id === purchase.moduleId);
          if (video && video.duration) {
            const parts = video.duration.split(':');
            const minutes = parseInt(parts[0]) || 0;
            const seconds = parseInt(parts[1]) || 0;
            return total + minutes + (seconds / 60);
          }
          return total + 3; // fallback 3 minutes
        }, 0)),
        level: Math.floor((watchedVideos + purchasedProducts) / 5) + 1
      }));
    } catch (error) {
      console.warn('Error loading user stats:', error);
    }
  };

  useEffect(() => {
    loadUserStats();
    loadLatestVideos();
    loadLatestModules();
    loadSavedCategories();
  }, []);

  // Get content icons and colors for new content types
  const getContentIcon = (type: string, category: string) => {
    if (category === 'Audio Lessons') return '🎧';
    if (category === 'Video Lessons') return '🎬';
    if (category === 'PP1 Program') return '📚';
    if (category === 'PP2 Program') return '📖';
    if (type === 'video' || !type) return '🎬';
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

  // Get all content (not just videos) with processed thumbnails
  const allContent = liveModules.filter(module => module.isVisible !== false).map(module => {
    let thumbnail = module.thumbnail || '';
    
    if (module.thumbnail instanceof File) {
      thumbnail = URL.createObjectURL(module.thumbnail);
    }
    
    // Handle YouTube thumbnails for video content
    if ((module.type === 'video' || !module.type) && module.videoUrl && typeof module.videoUrl === 'string') {
      let videoId = null;
      if (module.videoUrl.includes('youtube.com/watch')) {
        videoId = module.videoUrl.split('v=')[1]?.split('&')[0];
      } else if (module.videoUrl.includes('youtu.be/')) {
        videoId = module.videoUrl.split('youtu.be/')[1]?.split('?')[0];
      }
      
      if (videoId && !thumbnail) {
        thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    return {
      ...module,
      thumbnail
    };
  });

  // Convert admin modules to videos with proper URL handling
  const adminVideos: Video[] = liveModules
    .filter(module => module.type === 'video' || !module.type)
    .map(module => {
      // Handle File objects by converting to blob URLs
      let videoUrl = module.videoUrl || '';
      let thumbnail = module.thumbnail || '';
      
      if (module.videoUrl instanceof File) {
        videoUrl = URL.createObjectURL(module.videoUrl);
      }
      
      if (module.thumbnail instanceof File) {
        thumbnail = URL.createObjectURL(module.thumbnail);
      }
      
      // Convert YouTube URLs to embed format
      let isYouTube = false;
      if (typeof videoUrl === 'string') {
        let videoId = null;
        
        // Handle youtube.com/watch?v= format
        if (videoUrl.includes('youtube.com/watch')) {
          videoId = videoUrl.split('v=')[1]?.split('&')[0];
        }
        // Handle youtu.be/ format
        else if (videoUrl.includes('youtu.be/')) {
          videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        }
        // Handle youtube.com/embed/ format (already correct)
        else if (videoUrl.includes('youtube.com/embed/')) {
          isYouTube = true;
        }
        
        if (videoId) {
          videoUrl = `https://www.youtube.com/embed/${videoId}`;
          // Use YouTube thumbnail if no custom thumbnail
          if (!thumbnail) {
            thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }
          isYouTube = true;
        }
      }
      
      return {
        id: module.id,
        title: module.title || 'Untitled Video',
        thumbnail: thumbnail || '',
        duration: module.duration || module.estimatedDuration || module.estimatedTime || '0:00',
        description: module.description || '',
        videoUrl,
        category: module.category || 'General',
        isPremium: module.isPremium || false,
        price: module.price || 0,
        rating: module.rating || 5.0,
        views: module.views || 0,
        tags: module.tags || [],
        isYouTube
      };
    });

  const displayVideos = adminVideos;
  // Combine categories from videos and saved categories
  const videoCategories = displayVideos.map(v => v.category || 'General').filter(Boolean);
  const allCategories = [...new Set([...videoCategories, ...savedCategories])];
  const categories = ['All', ...allCategories];

  const filteredVideos = displayVideos.filter(video => {
    const matchesCategory = selectedCategory === 'All' || (video.category || 'General') === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest': return b.id.localeCompare(a.id);
      case 'oldest': return a.id.localeCompare(b.id);
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'views': return (b.views || 0) - (a.views || 0);
      case 'duration': return a.duration.localeCompare(b.duration);
      default: return 0;
    }
  });

  const playVideo = (video: Video) => {
    // Check if user has purchased this specific video
    const hasPurchased = localPurchases.some(purchase => 
      purchase.moduleId === video.id && 
      purchase.userId === user?.id && 
      purchase.status === 'completed'
    );
    
    if (!hasPurchased) {
      alert(`🔒 You need to purchase "${video.title}" to watch it. Please buy it from the store first!`);
      setActiveTab('store'); // Redirect to store
      return;
    }
    
    console.log('🎬 Playing video:', {
      title: video.title,
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail,
      hasVideoUrl: !!video.videoUrl,
      videoUrlType: typeof video.videoUrl,
      isBlob: video.videoUrl?.startsWith('blob:')
    });
    
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
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(id => id !== itemId));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, itemId) => {
      const item = storeItems.find(item => item.id === itemId);
      const price = item?.price || 0;
      const discount = item?.discount || 0;
      return total + (price * (1 - discount / 100));
    }, 0).toFixed(2);
  };

  const getOriginalPrice = () => {
    return cartItems.reduce((total, itemId) => {
      const item = storeItems.find(item => item.id === itemId);
      return total + (item?.price || 0);
    }, 0).toFixed(2);
  };

  const addToPlaylist = (videoId: string) => {
    if (!playlist.includes(videoId)) {
      setPlaylist([...playlist, videoId]);
    } else {
      setPlaylist(playlist.filter(id => id !== videoId));
    }
  };

  const removeFromPlaylist = (videoId: string) => {
    setPlaylist(playlist.filter(id => id !== videoId));
  };



  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-800 shadow-2xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl sm:text-2xl font-bold text-purple-900">Z</span>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-white hidden sm:block">Zinga Linga</h1>
                <p className="text-purple-200 text-xs sm:text-sm hidden md:block">Educational Entertainment Platform for Kids</p>
              </div>
            </div>
            
            {/* User Info & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setActiveTab('profile')}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                <img 
                  src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'} 
                  alt="Profile" 
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-yellow-400/50" 
                />
              </button>
              
              <button 
                onClick={() => setActiveTab('cart')}
                className="relative bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                <span className="text-white text-lg sm:text-xl">🛒</span>
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
                    {cartItems.length}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => onLogout && onLogout()}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 sm:px-4 rounded-lg transition-all duration-200 font-medium shadow-lg text-sm"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
          {[
            { id: 'dashboard', label: '🏠 Home', count: null },
            { id: 'all-content', label: '📚 Content', count: allContent.length },
            { id: 'audio-lessons', label: '🎧 Audio', count: allContent.filter(c => c.category === 'Audio Lessons').length },
            { id: 'videos', label: '🎬 My Videos', count: displayVideos.filter(video => 
              localPurchases.some(purchase => 
                purchase.moduleId === video.id && 
                purchase.userId === user?.id && 
                purchase.status === 'completed'
              )
            ).length },
            { id: 'store', label: '🛍️ Store', count: storeItems.filter(item => 
              !localPurchases.some(purchase => 
                purchase.moduleId === item.id && 
                purchase.userId === user?.id && 
                purchase.status === 'completed'
              )
            ).length },
            { id: 'profile', label: '👤 Profile', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 text-sm ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 shadow-lg'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeTab === tab.id ? 'bg-purple-900 text-yellow-400' : 'bg-white/20 text-white'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Welcome, {user?.name || 'Explorer'}! 🌟
                  </h2>
                  <p className="text-purple-200">Ready for learning adventures</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{userStats.level}</div>
                  <div className="text-purple-200 text-sm">Level</div>
                </div>
              </div>
            </div>

            {/* My Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* My Videos */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <span className="mr-2">🎬</span>
                    My Videos ({localPurchases.filter(p => p.userId === user?.id).length})
                  </h3>
                  <button 
                    onClick={() => setActiveTab('videos')}
                    className="text-yellow-400 hover:text-yellow-300 text-sm"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {displayVideos.filter(video => 
                    localPurchases.some(purchase => 
                      purchase.moduleId === video.id && 
                      purchase.userId === user?.id && 
                      purchase.status === 'completed'
                    )
                  ).slice(0, 3).map(video => (
                    <div key={video.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" onClick={() => playVideo(video)}>
                      <div className="w-12 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">▶</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{video.title}</div>
                        <div className="text-purple-200 text-xs">{video.duration}</div>
                      </div>
                    </div>
                  ))}
                  {localPurchases.filter(p => p.userId === user?.id).length === 0 && (
                    <div className="text-center py-4 text-purple-200">
                      <div className="text-2xl mb-2">🛒</div>
                      <div className="text-sm">No videos yet</div>
                      <button 
                        onClick={() => setActiveTab('store')}
                        className="text-yellow-400 hover:text-yellow-300 text-xs mt-1"
                      >
                        Browse Store
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  Your Progress
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{userStats.videosWatched}</div>
                    <div className="text-purple-200 text-xs">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{userStats.watchTime}m</div>
                    <div className="text-purple-200 text-xs">Watch Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{userStats.purchasedItems}</div>
                    <div className="text-purple-200 text-xs">Purchases</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{userStats.achievements.length}</div>
                    <div className="text-purple-200 text-xs">Achievements</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setActiveTab('all-content')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-xl transition-all duration-200 text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📚</div>
                <div className="font-bold text-sm">All Content</div>
              </button>
              
              <button 
                onClick={() => setActiveTab('audio-lessons')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-xl transition-all duration-200 text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎧</div>
                <div className="font-bold text-sm">Audio</div>
              </button>
              
              <button 
                onClick={() => setActiveTab('store')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white p-4 rounded-xl transition-all duration-200 text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🛍️</div>
                <div className="font-bold text-sm">Store</div>
              </button>
              
              <button 
                onClick={() => setActiveTab('videos')}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white p-4 rounded-xl transition-all duration-200 text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎬</div>
                <div className="font-bold text-sm">My Videos</div>
              </button>
            </div>
          </div>
        )}

        {/* All Content Tab */}
        {activeTab === 'all-content' && (
          <section className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📚</span>
                All Learning Content
              </h2>
              <p className="text-purple-200">Browse all available content types - Audio, Video, Programs & More</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allContent.map((content) => {
                const isPurchased = localPurchases.some(purchase => 
                  purchase.moduleId === content.id && 
                  purchase.userId === user?.id && 
                  purchase.status === 'completed'
                );
                
                return (
                  <div key={content.id} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:scale-105 hover:border-yellow-400 transition-all duration-300 group">
                    <div className="relative">
                      <div className={`w-full h-48 bg-gradient-to-br ${getContentColor(content.category || '')} relative overflow-hidden`}>
                        {content.thumbnail ? (
                          <img 
                            src={content.thumbnail} 
                            alt={content.title} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}

                        
                        {/* Play icon for videos */}
                        {(content.type === 'video' || !content.type) && isPurchased && (
                          <div 
                            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group-hover:bg-black/30 cursor-pointer"
                            onClick={() => {
                              const video = adminVideos.find(v => v.id === content.id);
                              if (video) playVideo(video);
                            }}
                          >
                            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur-sm group-hover:scale-110 transition-all duration-300">
                              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
                        ${content.price || 0}
                      </div>
                      

                      
                      <div className="absolute bottom-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                        {content.category || 'Content'}
                      </div>
                      
                      {!isPurchased && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <div className="text-center text-white">
                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                              <span className="text-2xl">🔒</span>
                            </div>
                            <div className="text-sm font-bold">Purchase Required</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2">{content.title}</h3>
                      <p className="text-purple-200 text-sm mb-3 line-clamp-2">{content.description || 'No description available'}</p>
                      
                      {content.aiTags && content.aiTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {content.aiTags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white/20 text-white/80 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {content.hasPreview && (
                            <span className="text-blue-400 text-xs">👁️ Preview</span>
                          )}
                          {content.duration && (
                            <span className="text-gray-400 text-xs">⏱️ {content.duration}</span>
                          )}
                        </div>
                        
                        {isPurchased ? (
                          <button 
                            onClick={() => {
                              if (content.type === 'video' || !content.type) {
                                const video = adminVideos.find(v => v.id === content.id);
                                if (video) playVideo(video);
                              } else if (content.category === 'Audio Lessons' && content.audioUrl) {
                                setSelectedAudio(content);
                                setShowAudioModal(true);
                              } else {
                                alert(`✅ You own this ${content.category}! Content access available.`);
                              }
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                          >
                            Access
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              addToCart(content.id);
                              setShowCartPopup(true);
                              setTimeout(() => setShowCartPopup(false), 2000);
                            }}
                            className="bg-yellow-400 hover:bg-yellow-500 text-purple-800 px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                          >
                            Buy Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {allContent.length === 0 && (
              <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-6xl mb-4">📚</div>
                <div className="text-white text-xl mb-2">No content available</div>
                <div className="text-purple-200 text-sm">Admin needs to add content through the admin panel</div>
              </div>
            )}
          </section>
        )}

        {/* Category-specific tabs */}
        {['audio-lessons', 'video-lessons', 'pp1-program', 'pp2-program'].map(tabId => (
          activeTab === tabId && (
            <section key={tabId} className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">{getContentIcon('', tabId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))}</span>
                  {tabId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h2>
                <p className="text-purple-200">Specialized {tabId.split('-').join(' ')} content for your learning journey</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allContent.filter(content => 
                  content.category === tabId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                ).map((content) => {
                  const isPurchased = localPurchases.some(purchase => 
                    purchase.moduleId === content.id && 
                    purchase.userId === user?.id && 
                    purchase.status === 'completed'
                  );
                  
                  return (
                    <div key={content.id} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:scale-105 hover:border-yellow-400 transition-all duration-300 group">
                      <div className="relative">
                        <div className={`w-full h-48 bg-gradient-to-br ${getContentColor(content.category || '')} relative overflow-hidden`}>
                          {content.thumbnail ? (
                            <img 
                              src={content.thumbnail} 
                              alt={content.title} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : null}

                          
                          {/* Play icon for videos */}
                          {(content.type === 'video' || !content.type) && isPurchased && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group-hover:bg-black/30">
                              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur-sm group-hover:scale-110 transition-all duration-300">
                                <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
                          ${content.price || 0}
                        </div>
                        
                        {!isPurchased && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <div className="text-center text-white">
                              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                                <span className="text-2xl">🔒</span>
                              </div>
                              <div className="text-sm font-bold">Purchase Required</div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white mb-2">{content.title}</h3>
                        <p className="text-purple-200 text-sm mb-3 line-clamp-2">{content.description || 'No description available'}</p>
                        
                        {isPurchased ? (
                          <button 
                            onClick={() => {
                              if (content.type === 'video' || !content.type) {
                                const video = adminVideos.find(v => v.id === content.id);
                                if (video) playVideo(video);
                              } else if (content.category === 'Audio Lessons' && content.audioUrl) {
                                setSelectedAudio(content);
                                setShowAudioModal(true);
                              } else {
                                alert(`✅ You own this ${content.category}! Content access available.`);
                              }
                            }}
                            className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                              'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            Access Content
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              addToCart(content.id);
                              setShowCartPopup(true);
                              setTimeout(() => setShowCartPopup(false), 2000);
                            }}
                            className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors bg-gradient-to-r ${getContentColor(content.category || '')} hover:shadow-lg text-white`}
                          >
                            Buy ${content.price || 0}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {allContent.filter(c => c.category === tabId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).length === 0 && (
                <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-6xl mb-4">{getContentIcon('', tabId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))}</div>
                  <div className="text-white text-xl mb-2">No {tabId.split('-').join(' ')} available</div>
                  <div className="text-purple-200 text-sm">Check back later for new content</div>
                </div>
              )}
            </section>
          )
        ))}

        {/* Videos Tab (Legacy) */}
        {activeTab === 'videos' && (
          <section className="space-y-6">
            {/* Enhanced Filters */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-white">Video Library</h2>
                  <span className="bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
                    {filteredVideos.filter(video => 
                      localPurchases.some(purchase => 
                        purchase.moduleId === video.id && 
                        purchase.userId === user?.id && 
                        purchase.status === 'completed'
                      )
                    ).length} my videos
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-yellow-400 text-purple-900' : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      ⊞
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' ? 'bg-yellow-400 text-purple-900' : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      ☰
                    </button>
                  </div>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="rating">Highest Rated</option>
                    <option value="views">Most Viewed</option>
                    <option value="duration">Duration</option>
                  </select>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    🔍 Filters
                  </button>
                </div>
              </div>
              
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Search</label>
                      <input
                        type="text"
                        placeholder="Search videos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none placeholder-white/60"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              selectedCategory === category
                                ? 'bg-yellow-400 text-purple-900'
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Videos Grid - Only show videos this user purchased */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.filter(video => {
                // Only show videos purchased by this specific user
                return localPurchases.some(purchase => 
                  purchase.moduleId === video.id && 
                  purchase.userId === user?.id && 
                  purchase.status === 'completed'
                );
              }).map((video) => {
                // User has access since we already filtered for their purchases
                const isPurchased = true; // Always true since we filtered above
                return (
                  <div key={video.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:scale-105 hover:border-purple-400/50 hover:shadow-2xl transition-all duration-300 group shadow-xl">
                    <div className="relative cursor-pointer" onClick={() => isPurchased && playVideo(video)}>
                      <div className="relative w-full h-48 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-t-2xl overflow-hidden">
                        {video.thumbnail ? (
                          <img 
                            src={video.thumbnail} 
                            alt={video.title} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              console.log('Thumbnail failed to load:', video.thumbnail);
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="absolute inset-0 flex items-center justify-center text-white text-4xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600"
                          style={{ display: video.thumbnail ? 'none' : 'flex' }}
                        >
                          🎬
                        </div>
                        
                        {/* Duration Badge */}
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                          {video.duration || '0:00'}
                        </div>
                      </div>
                      
                      {/* Status Overlay */}
                      {!isPurchased && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <div className="text-center text-white">
                            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg">
                              <span className="text-2xl">🔒</span>
                            </div>
                            <div className="text-sm font-bold mb-1">Purchase Required</div>
                            <div className="text-xs opacity-80">Buy from store to watch</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Play Button for Purchased Videos */}
                      {isPurchased && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group-hover:bg-black/30">
                          <button
                            onClick={() => playVideo(video)}
                            className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-2xl border-4 border-white/30 backdrop-blur-sm"
                          >
                            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </button>
                        </div>
                      )}
                      

                    </div>
                    
                    <div className="p-4">
                      {/* Status and Category Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {isPurchased && (
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-lg">
                            ✓ Owned
                          </span>
                        )}
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-lg">
                          {video.category}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{video.title}</h3>
                      <p className="text-gray-300 text-sm line-clamp-2 mb-3">{video.description}</p>
                      
                      {/* Rating only */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-white/20 text-white px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm flex items-center gap-1">
                          <span>⭐</span>
                          <span>{video.rating?.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {isPurchased ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-green-400 text-xs font-medium">Ready to Watch</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-red-400 text-xs">Purchase Required</span>
                          </div>
                        )}
                        
                        {isPurchased ? (
                          <button 
                            onClick={() => playVideo(video)}
                            className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <span>▶</span>
                            <span>Watch</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => setActiveTab('store')}
                            className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
                          >
                            Buy Now →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Show message if user has no purchased videos */}
            {filteredVideos.filter(video => 
              localPurchases.some(purchase => 
                purchase.moduleId === video.id && 
                purchase.userId === user?.id && 
                purchase.status === 'completed'
              )
            ).length === 0 && (
              <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-6xl mb-4">🛒</div>
                <div className="text-white text-xl mb-2">No purchased videos</div>
                <div className="text-purple-200 text-sm mb-6">You haven't purchased any videos yet</div>
                <button 
                  onClick={() => setActiveTab('store')}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold px-6 py-3 rounded-lg transition-all duration-200"
                >
                  Browse Store
                </button>
              </div>
            )}
          </section>
        )}

        {/* Cart Tab */}
        {activeTab === 'cart' && (
          <section className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🛒</span>
                Shopping Cart
              </h2>
              <p className="text-purple-200">Review your selected items before checkout</p>
            </div>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-6xl mb-4">🛒</div>
                <div className="text-white text-xl mb-2">Your cart is empty</div>
                <div className="text-purple-200 text-sm mb-6">Add some videos to your cart to get started</div>
                <button 
                  onClick={() => setActiveTab('store')}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold px-6 py-3 rounded-lg transition-all duration-200"
                >
                  Browse Store
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {cartItems.map(itemId => {
                    const item = storeItems.find(item => item.id === itemId);
                    if (!item) return null;
                    return (
                      <div key={itemId} className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <div className="text-white text-2xl">
                              🎬
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                            <p className="text-purple-200 text-sm mb-2">{item.description}</p>
                            <div className="text-yellow-400 font-bold text-lg">${item.price.toFixed(2)}</div>
                          </div>
                          <button 
                            onClick={() => removeFromCart(itemId)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 rounded-xl p-6 border border-purple-500/30">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white text-xl font-bold">Total:</span>
                    <span className="text-yellow-400 text-2xl font-bold">${getTotalPrice()}</span>
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setCartItems([])}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                      Clear Cart
                    </button>
                    <button 
                      onClick={() => setShowCheckout(true)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition-all duration-200"
                    >
                      Checkout - ${getTotalPrice()}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Enhanced Store Tab */}
        {activeTab === 'store' && (
          <section className="space-y-6">
            {/* Categories at Top with Glass Effect */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🏷️</span>
                Categories
              </h3>
              <div className="flex flex-wrap gap-3">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border shadow-lg ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 border-yellow-400/50 transform scale-105'
                        : 'bg-white/10 text-white hover:bg-white/20 border-white/20 hover:border-white/40 hover:scale-105'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <span className="text-3xl">🎬</span>
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold text-white mb-1">Video Store</h2>
                      <span className="text-purple-200 text-lg">
                        {storeItems.filter(item => 
                          !localPurchases.some(purchase => 
                            purchase.moduleId === item.id && 
                            purchase.userId === user?.id && 
                            purchase.status === 'completed'
                          )
                        ).length} Videos Available for Purchase
                      </span>
                    </div>
                  </div>
                </div>
              
                {cartItems.length > 0 && (
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-xl rounded-xl p-6 border border-green-400/30 shadow-2xl">
                    <div className="text-white font-bold text-xl mb-3 flex items-center">
                      <span className="mr-2">🛒</span>
                      Cart Total: 
                      <span className="text-yellow-400 ml-2">${getTotalPrice()}</span>
                      {parseFloat(getOriginalPrice()) > parseFloat(getTotalPrice()) && (
                        <span className="text-gray-400 line-through text-sm ml-2">${getOriginalPrice()}</span>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => setShowCheckout(true)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl transition-all duration-200 font-bold shadow-lg hover:scale-105"
                      >
                        💳 Checkout
                      </button>
                      <button 
                        onClick={() => setCartItems([])}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all duration-200 font-bold shadow-lg hover:scale-105"
                      >
                        🗑️ Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {storeItems.filter(item => 
              !localPurchases.some(purchase => 
                purchase.moduleId === item.id && 
                purchase.userId === user?.id && 
                purchase.status === 'completed'
              )
            ).length === 0 ? (
              <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-6xl mb-4">✅</div>
                <div className="text-white text-xl mb-2">All videos purchased!</div>
                <div className="text-purple-200 text-sm">Go to "My Videos" to watch your content</div>
                <button 
                  onClick={() => setActiveTab('videos')}
                  className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-bold"
                >
                  Go to My Videos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {storeItems.filter(item => 
                  !localPurchases.some(purchase => 
                    purchase.moduleId === item.id && 
                    purchase.userId === user?.id && 
                    purchase.status === 'completed'
                  )
                ).map((item) => (
                  <div key={item.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:scale-105 hover:border-purple-400/50 hover:shadow-2xl transition-all duration-300 group shadow-xl">
                    <div className="relative">
                      <div className="relative w-full h-48 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-t-2xl overflow-hidden">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                            onLoad={(e) => {
                              console.log('Store thumbnail loaded successfully:', item.image);
                            }}
                            onError={(e) => {
                              console.log('Store thumbnail failed to load:', item.image);
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="absolute inset-0 flex items-center justify-center text-white text-4xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600"
                          style={{ display: item.image ? 'none' : 'flex' }}
                        >
                          🎬
                        </div>
                      </div>
                      
                      {/* Lock Overlay for unpurchased videos */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="text-center text-white">
                          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg">
                            <span className="text-2xl">🔒</span>
                          </div>
                          <div className="text-sm font-bold mb-1">Purchase Required</div>
                          <div className="text-xs opacity-80">Buy to unlock video</div>
                        </div>
                      </div>

                    

                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                    <p className="text-purple-200 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    {/* Rating */}
                    {item.rating && (
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < Math.floor(item.rating!) ? 'text-yellow-400' : 'text-gray-400'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-purple-200 text-xs">({item.reviews} reviews)</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-yellow-400">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-center">
                        {cartItems.includes(item.id) ? (
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 text-xs flex items-center gap-1 shadow-md hover:scale-105"
                          >
                            <span>🗑️</span>
                            <span>Remove</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              addToCart(item.id);
                              setShowCartPopup(true);
                              setTimeout(() => setShowCartPopup(false), 2000);
                            }}
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 text-xs flex items-center gap-1 shadow-md hover:scale-105"
                          >
                            <span>🛒</span>
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Removed Library Tab */}
        {false && (
          <section className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📚</span>
                My Personal Library
              </h2>
              <p className="text-purple-200">All your purchases and saved content in one place</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🎬</span>
                  Purchased Videos ({purchases.filter(p => p.type === 'video').length})
                </h3>
                <div className="space-y-3">
                  {purchases.filter(p => p.type === 'video').slice(0, 3).map(purchase => {
                    const video = displayVideos.find(v => v.id === purchase.moduleId);
                    return video ? (
                      <div key={purchase.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <img src={video.thumbnail} alt={video.title} className="w-16 h-12 rounded object-cover" />
                        <div className="flex-1">
                          <div className="text-white font-medium">{video.title}</div>
                          <div className="text-purple-200 text-sm">Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}</div>
                        </div>
                        <button 
                          onClick={() => playVideo(video)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Watch
                        </button>
                      </div>
                    ) : null;
                  })}
                  {purchases.filter(p => p.type === 'video').length === 0 && (
                    <div className="text-center py-8 text-purple-200">
                      No videos purchased yet
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🛍️</span>
                  All Purchases ({localPurchases.length})
                </h3>
                <div className="space-y-3">
                  {localPurchases.filter(p => p.type !== 'video').slice(0, 3).map(purchase => (
                    <div key={purchase.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                        🛍️
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">Product #{purchase.moduleId}</div>
                        <div className="text-purple-200 text-sm">Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}</div>
                      </div>
                      <div className="text-yellow-400 font-bold">${purchase.amount}</div>
                    </div>
                  ))}
                  {localPurchases.filter(p => p.type !== 'video').length === 0 && (
                    <div className="text-center py-8 text-purple-200">
                      All purchases are videos
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Playlist Tab */}
        {activeTab === 'playlist' && (
          <section className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📋</span>
                My Playlist ({playlist.length})
              </h2>
              <p className="text-purple-200">Create and manage your personal video playlists</p>
            </div>
            
            {playlist.length === 0 ? (
              <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-6xl mb-4">🎵</div>
                <div className="text-white text-xl mb-2">Your playlist is empty</div>
                <div className="text-purple-200 text-sm mb-6">Add videos to your playlist to watch them later</div>
                <button 
                  onClick={() => setActiveTab('videos')}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold px-6 py-3 rounded-lg transition-all duration-200"
                >
                  Browse Videos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlist.map(videoId => {
                  const video = displayVideos.find(v => v.id === videoId);
                  if (!video) return null;
                  return (
                    <div key={videoId} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:scale-105 hover:border-yellow-400 transition-all duration-300 group">
                      <div className="relative">
                        {video.thumbnail && video.thumbnail !== 'https://via.placeholder.com/400x300?text=Video' ? (
                          <img 
                            src={video.thumbnail} 
                            alt={video.title} 
                            className="w-full h-48 object-cover" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-48 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-4xl"
                          style={{ display: video.thumbnail && video.thumbnail !== 'https://via.placeholder.com/400x300?text=Video' ? 'none' : 'flex' }}
                        >
                          🎬
                        </div>
                        
                        <button
                          onClick={() => playVideo(video)}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors group-hover:bg-black/50"
                        >
                          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{video.title}</h3>
                        <p className="text-purple-200 text-sm line-clamp-2 mb-3">{video.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-purple-200 text-xs">{video.duration}</div>
                          <button 
                            onClick={() => removeFromPlaylist(videoId)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Profile Tab - Personalized Account Panel */}
        {activeTab === 'profile' && (
          <section className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">👤</span>
                Profile
              </h2>
              <p className="text-purple-200">Your personal account dashboard</p>
            </div>
            
            {/* Account Overview */}
            <div className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-6 md:mb-0">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    Welcome, {user?.name || 'User'}! 🌟
                  </h3>
                  <p className="text-purple-200 text-lg">
                    Account ID: {user?.id || 'N/A'}
                  </p>
                  <p className="text-purple-200 text-sm">
                    Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <img 
                    src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full border-4 border-yellow-400" 
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Account Information */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-2">🏠</span>
                  My Account Details
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="text-purple-200 text-sm">Full Name</div>
                    <div className="text-white font-bold text-lg">{user?.name || 'User'}</div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="text-purple-200 text-sm">Email Address</div>
                    <div className="text-white font-bold">{user?.email || 'N/A'}</div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="text-purple-200 text-sm">Account Type</div>
                    <div className="text-white font-bold capitalize">{user?.role || 'User'}</div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="text-purple-200 text-sm">Unique Account ID</div>
                    <div className="text-yellow-400 font-bold font-mono text-sm">{user?.id || 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              {/* Account Statistics */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-2">📊</span>
                  My Account Stats
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-4 rounded-lg border border-green-500/30">
                    <div className="text-green-200 text-sm">Member Since</div>
                    <div className="text-white font-bold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-4 rounded-lg border border-yellow-500/30">
                    <div className="text-yellow-200 text-sm">Total Spent</div>
                    <div className="text-yellow-400 font-bold">${user?.totalSpent?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 rounded-lg border border-blue-500/30">
                    <div className="text-blue-200 text-sm">Videos Owned</div>
                    <div className="text-white font-bold">{localPurchases.filter(p => p.userId === user?.id).length}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-4 rounded-lg border border-purple-500/30">
                    <div className="text-purple-200 text-sm">Account Status</div>
                    <div className="text-green-400 font-bold">✅ Active</div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/30">
                  <h4 className="text-white font-bold mb-2">🎯 Account Summary</h4>
                  <p className="text-indigo-200 text-sm">
                    You have your own personal account with {localPurchases.filter(p => p.userId === user?.id).length} purchased videos. 
                    Your account is secure and all your content is saved.
                  </p>
                </div>
              </div>
            </div>
            
            {/* My Purchases Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2">🛍️</span>
                My Personal Purchases
              </h3>
              
              <div className="space-y-3">
                {localPurchases.filter(p => p.userId === user?.id).length > 0 ? (
                  localPurchases.filter(p => p.userId === user?.id).map(purchase => {
                    const video = displayVideos.find(v => v.id === purchase.moduleId);
                    return (
                      <div key={purchase.id} className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">🎬</span>
                          </div>
                          <div>
                            <div className="text-white font-medium">{video?.title || `Video #${purchase.moduleId}`}</div>
                            <div className="text-purple-200 text-sm">Purchased: {new Date(purchase.purchaseDate).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold">${purchase.amount.toFixed(2)}</div>
                          <div className="text-green-400 text-xs">✅ Owned</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-purple-200">
                    <div className="text-4xl mb-2">🛒</div>
                    <div>No purchases yet</div>
                    <div className="text-sm">Your purchased videos will appear here</div>
                  </div>
                )}
              </div>
            </div>

            
            {/* Account Actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2">⚙️</span>
                Account Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => {
                    // Initialize form with current user data
                    const initialData = {
                      name: user?.name || '',
                      phone: user?.phone || '',
                      address: user?.address || '',
                      avatar: user?.avatar || ''
                    };
                    console.log('📝 Initializing profile form with:', initialData);
                    setProfileData(initialData);
                    setShowEditProfile(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-4 rounded-lg transition-colors text-center"
                >
                  <div className="text-2xl mb-2">✏️</div>
                  <div className="font-medium">Edit Profile</div>
                </button>
                
                <button 
                  onClick={() => setShowChangePassword(true)}
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white p-4 rounded-lg transition-colors text-center"
                >
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="font-medium">Change Password</div>
                </button>
                
                <button 
                  onClick={() => {
                    // Create PDF-like content
                    const invoiceContent = `
=== ZINGA LINGA INVOICES ===
Generated: ${new Date().toLocaleDateString()}

${purchases.map(p => {
  const video = displayVideos.find(v => v.id === p.moduleId);
  return `
--- INVOICE ---
Invoice ID: ${p.id}
Product: ${video?.title || 'Video Content'}
Amount: $${p.amount.toFixed(2)}
Date: ${new Date(p.purchaseDate).toLocaleDateString()}
Status: ${p.status.toUpperCase()}
`;
}).join('\n')}

Total Amount: $${purchases.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}

--- END OF INVOICES ---`;
                    
                    const blob = new Blob([invoiceContent], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'zinga-linga-invoices.pdf';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-lg transition-colors text-center"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium">Download Invoices</div>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <section className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🏆</span>
                My Achievements
              </h2>
              <p className="text-purple-200">Discover all the achievements you've earned in your learning journey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  id: 'first-video', 
                  title: 'First Video', 
                  description: 'Watched your first video', 
                  icon: '🎬', 
                  unlocked: userStats.videosWatched > 0,
                  progress: Math.min(userStats.videosWatched, 1),
                  total: 1
                },
                { 
                  id: 'video-lover', 
                  title: 'Video Lover', 
                  description: 'Watched 10 videos', 
                  icon: '📺', 
                  unlocked: userStats.videosWatched >= 10,
                  progress: Math.min(userStats.videosWatched, 10),
                  total: 10
                },
                { 
                  id: 'first-purchase', 
                  title: 'First Purchase', 
                  description: 'Made your first purchase', 
                  icon: '🛍️', 
                  unlocked: userStats.purchasedItems > 0,
                  progress: Math.min(userStats.purchasedItems, 1),
                  total: 1
                },
                { 
                  id: 'collector', 
                  title: 'Collector', 
                  description: 'Purchased 5 products', 
                  icon: '🎁', 
                  unlocked: userStats.purchasedItems >= 5,
                  progress: Math.min(userStats.purchasedItems, 5),
                  total: 5
                },
                { 
                  id: 'time-master', 
                  title: 'Time Master', 
                  description: 'Watched 100 minutes of content', 
                  icon: '⏰', 
                  unlocked: userStats.watchTime >= 100,
                  progress: Math.min(userStats.watchTime, 100),
                  total: 100
                },
                { 
                  id: 'explorer', 
                  title: 'Explorer', 
                  description: 'Visited all sections of the platform', 
                  icon: '🗺️', 
                  unlocked: true,
                  progress: 1,
                  total: 1
                }
              ].map(achievement => (
                <div key={achievement.id} className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border transition-all duration-200 ${
                  achievement.unlocked 
                    ? 'border-yellow-400 bg-gradient-to-br from-yellow-400/20 to-orange-500/20' 
                    : 'border-white/20'
                }`}>
                  <div className="text-center">
                    <div className={`text-6xl mb-4 ${achievement.unlocked ? 'grayscale-0' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${achievement.unlocked ? 'text-yellow-400' : 'text-white'}`}>
                      {achievement.title}
                    </h3>
                    <p className="text-purple-200 text-sm mb-4">{achievement.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          achievement.unlocked ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-600'
                        }`}
                        style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-purple-200">
                      {achievement.progress} / {achievement.total}
                    </div>
                    
                    {achievement.unlocked && (
                      <div className="mt-3 bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-xs font-bold">
                        ✅ Completed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Cart Popup */}
      {showCartPopup && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-4 rounded-xl shadow-2xl animate-bounce border border-white/20">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">✅</span>
            <div>
              <div className="font-bold text-lg">Added to Cart!</div>
              <div className="text-green-100 text-sm">Item successfully added</div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-800 mt-16 border-t border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-900">Z</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Zinga Linga</h3>
                  <p className="text-purple-200 text-sm">Educational Entertainment Platform for Kids</p>
                </div>
              </div>
              <p className="text-purple-200 text-sm mb-4">
                We believe learning should be fun and exciting. Join our educational adventures with Kiki and Tano.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors">
                  📘
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors">
                  📱
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors">
                  📧
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                {[
                  { label: 'Home', action: () => setActiveTab('dashboard') },
                  { label: 'Videos', action: () => setActiveTab('videos') },
                  { label: 'Store', action: () => setActiveTab('store') },
                  { label: 'My Library', action: () => setActiveTab('library') }
                ].map(link => (
                  <button
                    key={link.label}
                    onClick={link.action}
                    className="block text-purple-200 hover:text-yellow-400 transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Your Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-purple-200">
                  <span>Level:</span>
                  <span className="text-yellow-400 font-bold">{userStats.level}</span>
                </div>
                <div className="flex justify-between text-purple-200">
                  <span>Videos:</span>
                  <span className="text-yellow-400 font-bold">{userStats.videosWatched}</span>
                </div>
                <div className="flex justify-between text-purple-200">
                  <span>Purchases:</span>
                  <span className="text-yellow-400 font-bold">{userStats.purchasedItems}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-purple-500/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-purple-200 text-sm">
              © 2024 Zinga Linga. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button className="text-purple-200 hover:text-yellow-400 transition-colors text-sm">
                Privacy Policy
              </button>
              <button className="text-purple-200 hover:text-yellow-400 transition-colors text-sm">
                Terms of Service
              </button>
              <button className="text-purple-200 hover:text-yellow-400 transition-colors text-sm">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-md w-full border border-purple-500/30 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-purple-500/30">
              <h3 className="text-2xl font-bold text-white">Edit Profile</h3>
              <button
                onClick={() => setShowEditProfile(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <img 
                    src={profileData.avatar || user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full border-4 border-yellow-400 mx-auto mb-2 object-cover" 
                  />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="avatar-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validate file size (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          alert('Image size must be less than 5MB');
                          return;
                        }
                        
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const result = e.target?.result as string;
                          console.log('🖼️ Avatar changed, size:', result.length);
                          setProfileData(prev => ({ ...prev, avatar: result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button 
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="text-yellow-400 text-sm hover:text-yellow-300"
                  >
                    Change Photo
                  </button>
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Name *</label>
                  <input 
                    type="text" 
                    value={profileData.name !== undefined ? profileData.name : (user?.name || '')}
                    onChange={(e) => {
                      console.log('📝 Name changed to:', e.target.value);
                      setProfileData(prev => ({ ...prev, name: e.target.value }));
                    }}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none placeholder-white/60"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Phone</label>
                  <input 
                    type="tel" 
                    value={profileData.phone !== undefined ? profileData.phone : (user?.phone || '')}
                    onChange={(e) => {
                      console.log('📞 Phone changed to:', e.target.value);
                      setProfileData(prev => ({ ...prev, phone: e.target.value }));
                    }}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none placeholder-white/60"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Address</label>
                  <textarea 
                    value={profileData.address !== undefined ? profileData.address : (user?.address || '')}
                    onChange={(e) => {
                      console.log('🏠 Address changed to:', e.target.value);
                      setProfileData(prev => ({ ...prev, address: e.target.value }));
                    }}
                    placeholder="123 Main Street, City, State, ZIP"
                    rows={3}
                    className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none placeholder-white/60 resize-none"
                  />
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button 
                    onClick={async () => {
                      try {
                        console.log('🔧 Profile Update Debug:', {
                          currentUser: user,
                          profileData: profileData,
                          userId: user?.id
                        });

                        // Validate required fields
                        const finalName = profileData.name || user?.name;
                        if (!finalName) {
                          alert('Name is required');
                          return;
                        }

                        // Create updated user object with all fields
                        const updatedUser = {
                          ...user,
                          name: profileData.name || user?.name,
                          phone: profileData.phone !== undefined ? profileData.phone : (user?.phone || ''),
                          address: profileData.address !== undefined ? profileData.address : (user?.address || ''),
                          avatar: profileData.avatar || user?.avatar,
                          // Ensure we keep all existing user properties
                          id: user?.id,
                          email: user?.email,
                          role: user?.role,
                          createdAt: user?.createdAt,
                          totalSpent: user?.totalSpent
                        };
                        
                        console.log('💾 Saving updated user:', updatedUser);

                        // Save to VPS data store
                        const data = await vpsDataStore.loadData();
                        console.log('📂 Current data:', data);
                        
                        // Find and update the user
                        const userIndex = (data.users || []).findIndex(u => u.id === user?.id);
                        if (userIndex === -1) {
                          // User not found, add them
                          data.users = [...(data.users || []), updatedUser];
                        } else {
                          // Update existing user
                          data.users[userIndex] = updatedUser;
                        }
                        
                        console.log('💾 Saving data with updated users:', data.users);
                        await vpsDataStore.saveData(data);
                        
                        // Update localStorage to persist the changes
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                        console.log('💾 Updated localStorage with:', updatedUser);
                        
                        alert(`✅ Profile updated successfully!\n\nName: ${updatedUser.name}\nPhone: ${updatedUser.phone}\nAddress: ${updatedUser.address}`);
                        setShowEditProfile(false);
                        setProfileData({ name: '', phone: '', address: '', avatar: '' });
                        
                        // Force component re-render with updated data
                        setTimeout(() => {
                          window.location.reload();
                        }, 1500);
                      } catch (error) {
                        console.error('❌ Profile update error:', error);
                        alert(`❌ Failed to update profile: ${error.message}`);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 font-bold py-2 rounded-lg"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => {
                      setShowEditProfile(false);
                      setProfileData({ name: '', phone: '', address: '', avatar: '' });
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-md w-full border border-purple-500/30 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-purple-500/30">
              <h3 className="text-2xl font-bold text-white">Change Password</h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter current password"
                    className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">New Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div className="flex space-x-3 mt-6">
                  <button 
                    onClick={() => {
                      alert('Password changed successfully!');
                      setShowChangePassword(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-2 rounded-lg"
                  >
                    Change Password
                  </button>
                  <button 
                    onClick={() => setShowChangePassword(false)}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Invoices Modal */}
      {showAllInvoices && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-purple-500/30 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-purple-500/30">
              <h3 className="text-2xl font-bold text-white">All Invoices</h3>
              <button
                onClick={() => setShowAllInvoices(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {purchases.map(purchase => {
                  const video = displayVideos.find(v => v.id === purchase.moduleId);
                  return (
                    <div key={purchase.id} className="bg-white/10 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-white font-medium">{video?.title || `Purchase #${purchase.id.slice(-6)}`}</div>
                          <div className="text-purple-200 text-sm">{new Date(purchase.purchaseDate).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold">${purchase.amount.toFixed(2)}</div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            purchase.status === 'completed' ? 'bg-green-500 text-white' : 
                            purchase.status === 'pending' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
                          }`}>
                            {purchase.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="text-purple-200 text-xs">Invoice ID: {purchase.id}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-purple-200">
            <div className="flex justify-between items-center p-6 border-b border-purple-200 bg-gradient-to-r from-purple-600 to-blue-600">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <span className="mr-3 text-3xl">🛍️</span>
                Secure Checkout
              </h3>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-white/80 hover:text-white text-2xl font-bold w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-all duration-200"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Cart Items */}
              <div className="mb-8">
                <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3 text-2xl">📋</span>
                  Order Summary
                </h4>
                
                <div className="space-y-3">
                  {cartItems.map(itemId => {
                    const item = storeItems.find(item => item.id === itemId);
                    if (!item) return null;
                    return (
                      <div key={itemId} className="bg-gray-50 p-4 rounded-xl flex items-center space-x-4 border border-gray-100">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-2xl">
                          🎬
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-800 font-semibold">{item.name}</div>
                          <div className="text-gray-500 text-sm">Video Content</div>
                        </div>
                        <div className="text-green-600 font-bold text-lg">${item.price.toFixed(2)}</div>
                        <button 
                          onClick={() => removeFromCart(itemId)}
                          className="text-red-400 hover:text-red-600 text-xl w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl border-2 border-green-300 shadow-lg">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span className="text-gray-800">Total Amount:</span>
                    <span className="text-green-600 text-3xl">${getTotalPrice()}</span>
                  </div>
                </div>
              </div>
              
              {/* Payment Form */}
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3 text-2xl">💳</span>
                  Payment Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      defaultValue={user?.name || ''}
                      className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">CVV</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Billing Address</label>
                  <input 
                    type="text" 
                    placeholder="123 Main Street, City, State, ZIP"
                    defaultValue={user?.address || ''}
                    className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4 mt-8">
                <button 
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 rounded-xl transition-all duration-200 shadow-md"
                >
                  Continue Shopping
                </button>
                <button 
                  onClick={async () => {
                    try {
                      // Create purchase records for each cart item
                      const newPurchases = cartItems.map(itemId => ({
                        id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        userId: user?.id || 'user_1',
                        moduleId: itemId,
                        purchaseDate: new Date().toISOString(),
                        amount: storeItems.find(item => item.id === itemId)?.price || 0,
                        status: 'completed' as const,
                        type: 'video' as const
                      }));
                      
                      // Save to VPS data store
                      const data = await vpsDataStore.loadData();
                      const updatedData = {
                        ...data,
                        purchases: [...(data.purchases || []), ...newPurchases]
                      };
                      await vpsDataStore.saveData(updatedData);
                      
                      // Update local purchases state
                      const updatedPurchases = [...localPurchases, ...newPurchases];
                      setLocalPurchases(updatedPurchases);
                      
                      setCartItems([]);
                      setShowCheckout(false);
                      setShowThankYou(true);
                      
                      // Auto-redirect after 3 seconds
                      setTimeout(() => {
                        setShowThankYou(false);
                        // Check what was purchased and redirect accordingly
                        const hasVideos = newPurchases.some(p => p.type === 'video');
                        const hasAudio = newPurchases.some(p => {
                          const item = storeItems.find(s => s.id === p.moduleId);
                          return item?.category === 'Audio Lessons';
                        });
                        
                        if (hasVideos) {
                          setActiveTab('videos');
                        } else if (hasAudio) {
                          setActiveTab('audio-lessons');
                        } else {
                          setActiveTab('dashboard');
                        }
                      }, 3000);
                    } catch (error) {
                      console.error('Purchase failed:', error);
                      alert('❌ Purchase failed. Please try again.');
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center space-x-3 transform hover:scale-105"
                >
                  <span className="text-xl">💳</span>
                  <span>Complete Purchase - ${getTotalPrice()}</span>
                </button>
              </div>
              
              {/* Security Notice */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center space-x-2 text-green-700 text-sm">
                  <span>🔒</span>
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YouTube-Style Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
            {/* Close Button */}
            <div className="flex justify-end p-2">
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-white text-2xl p-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                ×
              </button>
            </div>
            
            {/* Video Player */}
            <div className="px-4 pb-3">
              <div className="relative bg-black rounded-lg overflow-hidden" style={{aspectRatio: '16/9', maxHeight: '60vh'}}>
                {selectedVideo.isYouTube ? (
                  <iframe
                    src={selectedVideo.videoUrl}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    controls
                    autoPlay
                    className="absolute inset-0 w-full h-full object-contain"
                    src={selectedVideo.videoUrl || undefined}
                    poster={selectedVideo.thumbnail}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
            
            {/* Video Info */}
            <div className="px-4 pb-4 max-h-[25vh] overflow-y-auto">
              {/* Title */}
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">{selectedVideo.title}</h2>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-400">{selectedVideo.views?.toLocaleString() || '1,234'} views</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{selectedVideo.duration}</span>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* Like Button */}
                  <button className="flex items-center space-x-1 sm:space-x-2 text-gray-300 hover:text-white transition-colors px-2 py-1 rounded">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 6v11.5m-3-2.5v-9" />
                    </svg>
                    <span className="text-xs sm:text-sm">Like</span>
                  </button>
                  
                  {/* Playlist Button */}
                  <button 
                    onClick={() => addToPlaylist(selectedVideo.id)}
                    className={`flex items-center space-x-1 sm:space-x-2 transition-colors px-2 py-1 rounded ${
                      playlist.includes(selectedVideo.id)
                        ? 'text-blue-400'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-xs sm:text-sm">
                      {playlist.includes(selectedVideo.id) ? 'Added' : 'Save'}
                    </span>
                  </button>
                </div>
              </div>
              
              {/* Description */}
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-900 font-bold text-xs sm:text-sm">Z</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-medium text-sm sm:text-base">Zinga Linga</div>
                    <div className="text-gray-400 text-xs sm:text-sm">{selectedVideo.category}</div>
                  </div>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{selectedVideo.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl max-w-lg w-full shadow-2xl border-2 border-green-300 text-center p-8">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-lg">
                <span className="text-5xl">🎉</span>
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-3">Purchase Successful!</h3>
              <p className="text-gray-600 text-xl">Your content is now available</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 mb-8 border border-green-300">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <span className="text-3xl">✅</span>
                <span className="text-gray-800 font-bold text-lg">Payment Confirmed</span>
              </div>
              <p className="text-gray-700 text-base mb-4">You can now access your purchased content!</p>
              <div className="flex items-center justify-center space-x-6 text-base text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🎬</span>
                  <span className="font-semibold">{localPurchases.filter(p => p.userId === user?.id).length + cartItems.length} Items</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">💰</span>
                  <span className="font-semibold">${getTotalPrice()}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => {
                  setShowThankYou(false);
                  // Smart redirect based on purchase type
                  const hasVideos = localPurchases.some(p => p.userId === user?.id && p.type === 'video');
                  const hasAudio = storeItems.some(item => 
                    cartItems.includes(item.id) && item.category === 'Audio Lessons'
                  );
                  
                  if (hasVideos || cartItems.length > 0) {
                    setActiveTab('videos');
                  } else if (hasAudio) {
                    setActiveTab('audio-lessons');
                  } else {
                    setActiveTab('dashboard');
                  }
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105 flex items-center justify-center space-x-3"
              >
                <span className="text-xl">🎬</span>
                <span>Access My Content</span>
              </button>
              
              <button 
                onClick={() => {
                  setShowThankYou(false);
                  setActiveTab('dashboard');
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105 flex items-center justify-center space-x-3"
              >
                <span className="text-xl">🏠</span>
                <span>Go to Dashboard</span>
              </button>
              
              <button 
                onClick={() => {
                  setShowThankYou(false);
                  setActiveTab('store');
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-xl transition-all duration-200"
              >
                Continue Shopping
              </button>
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p className="flex items-center justify-center space-x-2">
                <span>🔒</span>
                <span>Your payment is secure and encrypted</span>
              </p>
              <p className="mt-2 text-center">Redirecting to your content in 3 seconds...</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChatModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all duration-300 hover:scale-110"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chat Modal */}
      <ChatModal 
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        user={user}
      />

      {/* Audio Player Modal */}
      {showAudioModal && selectedAudio && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-white font-bold text-lg">🎧 Audio Player</h3>
              <button
                onClick={() => setShowAudioModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎧</span>
                </div>
                <h4 className="text-white font-bold text-xl mb-2">{selectedAudio.title}</h4>
                <p className="text-gray-400 text-sm">{selectedAudio.description}</p>
              </div>
              <audio 
                controls 
                autoPlay
                className="w-full mb-4"
                src={selectedAudio.audioUrl}
              >
                Your browser does not support audio.
              </audio>
              <button
                onClick={() => setShowAudioModal(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-lg"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}


      </div>
    </ClientOnly>
  );
}