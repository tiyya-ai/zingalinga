'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Module, Purchase, ContentFile } from '../types';
import { checkVideoAccess, getVideoUrl } from '../utils/videoAccess';
import { vpsDataStore } from '../utils/vpsDataStore';
import { getVideoThumbnail } from '../utils/videoUtils';
import { ChatModal } from './ChatModal';
import { ClientOnly } from './ClientOnly';
import dynamic from 'next/dynamic';

import { VideoCard } from './VideoCard';




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
  setUser?: (user: User) => void;
}

export default function ProfessionalUserDashboard({
  user,
  modules = [],
  purchases = [],
  contentFiles = [],
  onLogout,
  onPurchase,
  setUser
}: ProfessionalUserDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(true);
  const [localPurchases, setLocalPurchases] = useState<Purchase[]>(purchases);
  const [liveModules, setLiveModules] = useState<Module[]>(modules);
  const [savedCategories, setSavedCategories] = useState<string[]>([]);
  const [savedVideosList, setSavedVideosList] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

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
  const [isMobile, setIsMobile] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    watchTime: 0,
    videosWatched: 0,
    purchasedItems: 0,
    favoriteVideos: 0,
    achievements: [],
    level: 1
  });

  // Convert admin modules to store items (all videos as purchasable content)
  const allModules = liveModules.length > 0 ? liveModules : modules; // Use props if liveModules is empty

  // Initialize user stats after allModules is available
  useEffect(() => {
    if (allModules && allModules.length > 0) {
      const userPurchases = localPurchases.filter(p => p.userId === user?.id);
      const totalWatchTime = userPurchases.reduce((total, purchase) => {
        const video = allModules.find(m => m.id === purchase.moduleId);
        if (video?.duration) {
          const [minutes, seconds] = video.duration.split(':').map(Number);
          return total + (minutes || 0) + ((seconds || 0) / 60);
        }
        return total + 5;
      }, 0);
      
      setUserStats({
        watchTime: totalWatchTime,
        videosWatched: userPurchases.length,
        purchasedItems: userPurchases.length,
        favoriteVideos: 0,
        achievements: [],
        level: Math.min(5, Math.floor(userPurchases.length / 2) + 1)
      });
    }
  }, [allModules, localPurchases, user?.id]);
  const [newVideoCount, setNewVideoCount] = useState(0);
  const [showNewVideoAlert, setShowNewVideoAlert] = useState(false);

  const [selectedAudio, setSelectedAudio] = useState<any>(null);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [playlist, setPlaylist] = useState<string[]>([]);


  useEffect(() => {
    // setMounted(true); // Already true
    
    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Listen for profile updates
    const handleProfileUpdate = (event: CustomEvent) => {
      if (setUser && event.detail) {
        setUser(event.detail);
      }
    };
    
    window.addEventListener('userProfileUpdated', handleProfileUpdate as EventListener);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('userProfileUpdated', handleProfileUpdate as EventListener);
    };
  }, [setUser]);

  // Read URL parameters and set activeTab
  useEffect(() => {
    if (searchParams) {
      const tab = searchParams.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, [searchParams]);

  // Update local purchases and user stats when prop changes
  useEffect(() => {
    setLocalPurchases(purchases);
    
    // Update user stats based on real data
    const userPurchases = purchases.filter(p => p.userId === user?.id);
    const totalWatchTime = userPurchases.reduce((total, purchase) => {
      const video = allModules.find(m => m.id === purchase.moduleId);
      if (video?.duration) {
        const [minutes, seconds] = video.duration.split(':').map(Number);
        return total + (minutes || 0) + ((seconds || 0) / 60);
      }
      return total + 5; // Default 5 minutes if no duration
    }, 0);
    
    const achievements = [];
    if (userPurchases.length >= 1) achievements.push('first-purchase');
    if (userPurchases.length >= 5) achievements.push('video-lover');
    if (userPurchases.length >= 10) achievements.push('collector');
    if (totalWatchTime >= 50) achievements.push('time-master');
    if (userPurchases.length > 0) achievements.push('explorer');
    
    setUserStats({
      watchTime: totalWatchTime,
      videosWatched: userPurchases.length,
      purchasedItems: userPurchases.length,
      favoriteVideos: 0,
      achievements: achievements,
      level: Math.min(5, Math.floor(userPurchases.length / 2) + 1)
    });
  }, [purchases, user?.id, allModules]);

  // Update live modules when prop changes and clear cache
  useEffect(() => {
    vpsDataStore.clearMemoryCache();
    setLiveModules(modules);
  }, [modules]);
  
  // Real-time data loading with multiple triggers
  useEffect(() => {
    const loadData = async () => {
      try {
        // FORCE clear all caches to ensure fresh data
        vpsDataStore.clearMemoryCache();
        localStorage.removeItem('zinga-linga-app-data-cache');
        localStorage.removeItem('zinga-linga-app-data');
        
        // Force fresh data load from API/VPS
        const vpsData = await vpsDataStore.loadData(true);
        
        if (vpsData.modules) {
          setLiveModules(vpsData.modules);
        }
        
        // Load packages from VPS
        const packagesData = await vpsDataStore.getPackages();
        setPackages(packagesData);
        
        // Load saved videos from VPS
        if (user?.id) {
          const userSavedVideos = await vpsDataStore.getSavedVideos(user.id);
          setSavedVideosList(userSavedVideos);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    if (mounted) {
      // Load data immediately on mount
      loadData();
      
      // Real-time updates with multiple triggers
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          vpsDataStore.clearMemoryCache();
          localStorage.removeItem('zinga-linga-app-data-cache');
          loadData();
        }
      };
      const handleFocus = () => {
        vpsDataStore.clearMemoryCache();
        localStorage.removeItem('zinga-linga-app-data-cache');
        loadData();
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      
      // Auto-sync every 30 seconds for updates
      const interval = setInterval(() => {
        loadData();
      }, 30000);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        clearInterval(interval);
      };
    }
  }, [mounted, user?.id]);



  if (!mounted) {
    return null;
  }
  
  // Handle tab navigation with URL parameters
  const handleSetActiveTab = (tab: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    router.push(url.pathname + url.search);
    setActiveTab(tab);
  };
  
  // Convert admin modules to videos with proper URL handling first
  const adminVideos: Video[] = allModules
    .filter(module => module.type === 'video' || !module.type)
    .map(module => {
      // Handle File objects by converting to blob URLs
      let videoUrl = module.videoUrl || '';
      let thumbnail = module.thumbnail || '';
      
      // Handle File objects for video URLs
      if (module.videoUrl && typeof module.videoUrl === 'object' && 'type' in module.videoUrl) {
        videoUrl = URL.createObjectURL(module.videoUrl as File as unknown as File);
      }
      // Handle base64 data URLs (from admin uploads)
      else if (typeof module.videoUrl === 'string' && module.videoUrl.startsWith('data:')) {
        videoUrl = module.videoUrl;
      }
      
      // Handle File objects for thumbnails
      if (module.thumbnail && typeof module.thumbnail === 'object' && 'type' in module.thumbnail) {
        thumbnail = URL.createObjectURL(module.thumbnail as File as unknown as File);
      }
      // Handle base64 data URLs for thumbnails
      else if (typeof module.thumbnail === 'string' && module.thumbnail.startsWith('data:')) {
        thumbnail = module.thumbnail;
      }
      
      // Convert YouTube URLs to embed format
      let isYouTube = false;
      if (typeof videoUrl === 'string' && !videoUrl.startsWith('data:') && !videoUrl.startsWith('blob:')) {
        let videoId = null;
        
        // Handle youtube.com/watch?v= format
        if (videoUrl.includes('youtube.com/watch') && videoUrl.includes('v=')) {
          const urlParams = new URLSearchParams(videoUrl.split('?')[1]);
          videoId = urlParams.get('v');
        }
        // Handle youtu.be/ format
        else if (videoUrl.includes('youtu.be/')) {
          videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
        }
        // Handle youtube.com/embed/ format (already correct)
        else if (videoUrl.includes('youtube.com/embed/')) {
          videoId = videoUrl.split('youtube.com/embed/')[1]?.split('?')[0]?.split('&')[0];
          isYouTube = true;
        }
        
        if (videoId && videoId.trim()) {
          videoUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
          // Use YouTube thumbnail if no custom thumbnail or default logo
          if (!thumbnail || thumbnail === '/zinga-linga-logo.png') {
            thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }
          isYouTube = true;
        }
      }
      
      return {
        id: module.id,
        title: module.title || 'Untitled Video',
        thumbnail: thumbnail,
        duration: module.duration || (module as any).duration || (module as any).estimatedDuration || '',
        description: module.description || '',
        videoUrl: videoUrl,
        category: module.category || 'Videos',
        isPremium: module.isPremium || false,
        price: module.price || 0,
        rating: (module as any).rating,
        views: (module as any).views,
        tags: (module as any).tags,
        isYouTube: isYouTube
      };
    });

  const displayVideos = adminVideos.filter(video => video && video.id);



  const storeItems = allModules
    .filter(module => module && (module.type === 'video' || !module.type))
    .map(module => {
      let thumbnail = '';
      
      // Priority 1: Handle File objects
      if (module.thumbnail && typeof module.thumbnail === 'object' && 'type' in module.thumbnail) {
        thumbnail = URL.createObjectURL(module.thumbnail as File as unknown as File);
      }
      // Priority 2: Handle base64 data URLs
      else if (typeof module.thumbnail === 'string' && module.thumbnail.startsWith('data:')) {
        thumbnail = module.thumbnail;
      }
      // Priority 3: Handle regular URLs
      else if (typeof module.thumbnail === 'string' && module.thumbnail.trim() && !module.thumbnail.includes('undefined')) {
        thumbnail = module.thumbnail;
      }
      // Priority 4: Extract YouTube thumbnail
      else if (module.videoUrl && typeof module.videoUrl === 'string') {
        let videoId = null;
        if (module.videoUrl.includes('youtube.com/watch')) {
          videoId = module.videoUrl.split('v=')[1]?.split('&')[0];
        } else if (module.videoUrl.includes('youtu.be/')) {
          videoId = module.videoUrl.split('youtu.be/')[1]?.split('?')[0];
        }
        if (videoId) {
          thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
      
      const storeItem = {
        id: module.id,
        name: module.title || 'Untitled Video',
        price: module.price || 0,
        image: thumbnail,
        description: module.description || '',
        category: module.category || 'Videos',
        inStock: true,
        rating: (module as any).rating || 5.0,
        reviews: (module as any).reviews || 0,
        discount: 0
      };
      

      return storeItem;
    });

  // Check if item is purchased by current user
  const isItemPurchased = (itemId: string) => {
    if (!user?.id) return false;
    
    // Get unique purchases only
    const uniquePurchases = localPurchases.filter((purchase, index, self) => 
      index === self.findIndex(p => p.moduleId === purchase.moduleId && p.userId === purchase.userId)
    );
    
    // Check if purchased directly
    const hasPurchase = uniquePurchases.some(purchase => 
      purchase.moduleId === itemId && 
      purchase.userId === user.id && 
      purchase.status === 'completed'
    );
    
    // Also check user's purchased modules list
    const inUserList = user.purchasedModules?.includes(itemId) || false;
    
    // Check if item is part of a purchased package
    const isInPurchasedPackage = packages.some(pkg => 
      user.purchasedModules?.includes(pkg.id) && 
      pkg.contentIds?.includes(itemId)
    );
    
    // For packages, check if the package itself is purchased
    const isPackagePurchased = packages.some(pkg => 
      pkg.id === itemId && user.purchasedModules?.includes(pkg.id)
    );
    
    return hasPurchase || inUserList || isInPurchasedPackage || isPackagePurchased;
  };





  // Get content icons and colors for new content types
  const getContentIcon = (type: string, category: string) => {
    if (category === 'Audio Lessons') return '🎧';
    if (category === 'Video Lessons') return '🎬';
    if (category === 'PP1 Program') return '📚';
    if (category === 'PP2 Program') return '📖';
    if (type === 'video' || !type) return '🎬';
    if (type === 'audio') return '🎧';
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

  // Get all content with fixed thumbnail processing
  const allContent = allModules.filter(module => module.isVisible !== false).map(module => {
    let thumbnail = '';
    
    // Priority 1: File objects
    if (module.thumbnail && typeof module.thumbnail === 'object' && 'type' in module.thumbnail) {
      thumbnail = URL.createObjectURL(module.thumbnail as File as unknown as File);
    }
    // Priority 2: Base64 data URLs
    else if (typeof module.thumbnail === 'string' && module.thumbnail.startsWith('data:')) {
      thumbnail = module.thumbnail;
    }
    // Priority 3: Regular URLs
    else if (typeof module.thumbnail === 'string' && module.thumbnail.trim()) {
      thumbnail = module.thumbnail;
    }
    // Priority 4: YouTube fallback
    else if ((module.type === 'video' || !module.type) && module.videoUrl && typeof module.videoUrl === 'string') {
      let videoId = null;
      if (module.videoUrl.includes('youtube.com/watch')) {
        videoId = module.videoUrl.split('v=')[1]?.split('&')[0];
      } else if (module.videoUrl.includes('youtu.be/')) {
        videoId = module.videoUrl.split('youtu.be/')[1]?.split('?')[0];
      }
      if (videoId) {
        thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    

    
    return {
      ...module,
      thumbnail
    };
  });


  // Combine categories from videos and saved categories
  const videoCategories = displayVideos.filter(v => v && v.category).map(v => v.category || 'General').filter(Boolean);
  const allCategories = [...new Set([...videoCategories, ...savedCategories])];
  const categories = ['All', ...allCategories];

  const filteredVideos = displayVideos.filter(video => {
    if (!video || !video.title) return false;
    const matchesCategory = selectedCategory === 'All' || (video.category || 'General') === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (video.description || '').toLowerCase().includes(searchTerm.toLowerCase());
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

  const playVideo = (video: any) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const getRelatedVideos = (currentVideo: Video) => {
    return displayVideos
      .filter(video => 
        video && video.id && video.id !== currentVideo.id && 
        video.category === currentVideo.category
      )
      .slice(0, 6);
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







  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 font-mali">

      {/* Enhanced Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="https://zingalinga.io/zinga%20linga%20logo.png" 
                  alt="Zinga Linga Logo" 
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <span className="text-xl font-bold text-emerald-100" style={{ display: 'none' }}>Z</span>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl font-bold text-white hidden sm:block">Zinga Linga</h1>
                <p className="text-emerald-100 text-xs hidden md:block">Educational Entertainment Platform for Kids</p>
              </div>
            </div>
            
            {/* User Info & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">

              <button
                onClick={() => handleSetActiveTab('profile')}
                className="relative bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-yellow-400/50">
                  {user?.avatar && user.avatar.trim() ? (
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      key={user.avatar}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full bg-gradient-to-r from-brand-green to-brand-blue flex items-center justify-center" style={{ display: user?.avatar && user.avatar.trim() ? 'none' : 'flex' }}>
                    <span className="text-white font-mali font-bold text-xs">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => handleSetActiveTab('cart')}
                className="relative bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-red text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-mali font-bold">
                    {cartItems.length}
                  </span>
                )}
              </button>
              

              <button 
                onClick={() => {
                  if (onLogout) {
                    onLogout();
                  } else {
                    // Fallback logout if onLogout is not provided
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('zinga-linga-session');
                      window.location.href = '/?logout=true';
                    }
                  }
                }}
                className="bg-gradient-to-r from-brand-red to-brand-pink hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 sm:px-4 rounded-lg transition-all duration-200 font-mali font-medium shadow-lg text-sm"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        {/* Quick Actions Bar */}
        <div className="md:hidden mb-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'dashboard', label: '🏠 Home', count: null },
              { id: 'all-content', label: '📚 Content', count: allContent.length },
              { id: 'audio-lessons', label: '🎧 Audio', count: allContent.filter(c => c.category === 'Audio Lessons' || c.type === 'audio').length },
              { id: 'pp1-program', label: '📚 PP1', count: allContent.filter(c => c.category === 'PP1 Program').length },
              { id: 'videos', label: '🎬 Videos', count: allModules.filter(module => module && (module.type === 'video' || !module.type) && module.category !== 'Audio Lessons' && isItemPurchased(module.id)).length },
              { id: 'store', label: '🛍️ Store', count: storeItems.filter(item => !localPurchases.some(purchase => purchase.moduleId === item.id && purchase.userId === user?.id && purchase.status === 'completed')).length },
              { id: 'packages', label: '📦 Packages', count: packages.length },
              { id: 'playlist', label: '📋 Playlist', count: playlist.length },
              { id: 'profile', label: '👤 Profile', count: null }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleSetActiveTab(tab.id)}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex items-center justify-center text-white space-x-3 hover:bg-white/20"
              >
                <span className="text-2xl">{tab.label.split(' ')[0]}</span>
                <span className="font-semibold">{tab.label.split(' ').slice(1).join(' ')}</span>
                {tab.count !== null && (
                  <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block mb-6">
            <div className="flex flex-col md:flex-row md:flex-wrap gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
              {[
                { id: 'dashboard', label: '🏠 Home', count: null },
                { id: 'all-content', label: '📚 Content', count: allContent.length },
                { id: 'audio-lessons', label: '🎧 Audio', count: allContent.filter(c => c.category === 'Audio Lessons' || c.type === 'audio').length },
                { id: 'pp1-program', label: '📚 PP1', count: allContent.filter(c => c.category === 'PP1 Program').length },
                { id: 'videos', label: '🎬 Videos', count: allModules.filter(module => module && (module.type === 'video' || !module.type) && module.category !== 'Audio Lessons' && isItemPurchased(module.id)).length },
                { id: 'store', label: '🛍️ Store', count: storeItems.filter(item => 
                  !localPurchases.some(purchase => 
                    purchase.moduleId === item.id && 
                    purchase.userId === user?.id && 
                    purchase.status === 'completed'
                  )
                ).length },
                { id: 'packages', label: '📦 Packages', count: packages.length },
                { id: 'playlist', label: '📋 Playlist', count: playlist.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleSetActiveTab(tab.id);
                    if (isMobile) setShowFilters(false);
                  }}
                  className={`w-full md:w-auto px-4 py-3 md:py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-between md:justify-center space-x-2 text-sm md:text-xs lg:text-sm ${
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
          </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-emerald-500/30 to-teal-500/30 backdrop-blur-sm rounded-2xl p-6 border border-emerald-400/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Welcome, {user?.name || 'Explorer'}! 🌟
                  </h2>
                  <p className="text-white">Ready for learning adventures</p>
                </div>

              </div>
            </div>

            {/* My Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* My Videos */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-emerald-400 flex items-center">
                    <span className="mr-2">🎬</span>
                    My Videos ({allModules.filter(module => module && (module.type === 'video' || !module.type) && module.category !== 'Audio Lessons' && isItemPurchased(module.id)).length})
                  </h3>
                  <button 
                    onClick={() => handleSetActiveTab('videos')}
                    className="text-brand-red hover:text-brand-pink text-sm font-mali"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {allModules.filter(module => module && (module.type === 'video' || !module.type) && module.category !== 'Audio Lessons' && isItemPurchased(module.id)).slice(0, 3).map(module => {
                    let thumbnail = module.thumbnail || '';
                    if (module.thumbnail && typeof module.thumbnail === 'object' && 'type' in module.thumbnail) {
                      thumbnail = URL.createObjectURL(module.thumbnail as File as unknown as File);
                    } else if (typeof module.thumbnail === 'string' && module.thumbnail.startsWith('data:')) {
                      thumbnail = module.thumbnail;
                    } else if (module.videoUrl && typeof module.videoUrl === 'string' && (!thumbnail || thumbnail === '/zinga-linga-logo.png')) {
                      let videoId = null;
                      if (module.videoUrl.includes('youtube.com/watch')) {
                        videoId = module.videoUrl.split('v=')[1]?.split('&')[0];
                      } else if (module.videoUrl.includes('youtu.be/')) {
                        videoId = module.videoUrl.split('youtu.be/')[1]?.split('?')[0];
                      }
                      if (videoId) {
                        thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                      }
                    }
                    
                    return (
                      <div key={module.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" onClick={() => {
                        const video = {
                          id: module.id,
                          title: module.title || 'Untitled Video',
                          thumbnail: thumbnail || '',
                          duration: module.duration || (module as any).duration || (module as any).estimatedDuration || '',
                          description: module.description || '',
                          videoUrl: module.videoUrl || '',
                          category: module.category || 'Videos',
                          isPremium: module.isPremium || false,
                          price: module.price || 0,
                          rating: (module as any).rating,
                          views: (module as any).views,
                          tags: (module as any).tags,
                          isYouTube: module.videoUrl?.includes('youtube') || module.videoUrl?.includes('youtu.be')
                        };
                        playVideo(video);
                      }}>
                        <div className="w-12 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {thumbnail && thumbnail.trim() ? (
                            <img 
                              src={thumbnail} 
                              alt={module.title} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                if (fallback) fallback.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <span className="text-white text-xs fallback-icon" style={{ display: thumbnail && thumbnail.trim() ? 'none' : 'block' }}>▶</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{module.title || 'Untitled Video'}</div>
                          <div className="text-purple-200 text-xs">{module.duration || ''}</div>
                        </div>
                      </div>
                    );
                  })}
                  {allModules.filter(module => module && (module.type === 'video' || !module.type) && module.category !== 'Audio Lessons' && isItemPurchased(module.id)).length === 0 && (
                    <div className="text-center py-4 text-purple-200">
                      <div className="text-2xl mb-2">🎬</div>
                      <div className="text-sm">No videos yet</div>
                      <button 
                        onClick={() => handleSetActiveTab('store')}
                        className="text-yellow-400 hover:text-yellow-300 text-xs mt-1"
                      >
                        Add Videos
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-2xl">
                <h3 className="text-lg font-bold text-teal-400 mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  Your Progress
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{userStats.videosWatched}</div>
                    <div className="text-purple-200 text-xs">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{Math.round(userStats.watchTime)}m</div>
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
                onClick={() => handleSetActiveTab('all-content')}
                className="bg-gradient-to-r from-brand-green to-brand-blue hover:from-green-600 hover:to-blue-600 text-white p-4 rounded-xl transition-all duration-200 text-center group shadow-lg"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📚</div>
                <div className="font-mali font-bold text-sm">All Content</div>
              </button>
              
              <button 
                onClick={() => handleSetActiveTab('audio-lessons')}
                className="bg-gradient-to-r from-brand-yellow to-brand-red hover:from-yellow-500 hover:to-red-500 text-white p-4 rounded-xl transition-all duration-200 text-center group shadow-lg"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎧</div>
                <div className="font-mali font-bold text-sm">Audio</div>
              </button>
              
              <button 
                onClick={() => handleSetActiveTab('store')}
                className="bg-gradient-to-r from-brand-red to-brand-pink hover:from-red-600 hover:to-pink-600 text-white p-4 rounded-xl transition-all duration-200 text-center group shadow-lg"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🛍️</div>
                <div className="font-mali font-bold text-sm">Store</div>
              </button>
              
              <button 
                onClick={() => handleSetActiveTab('videos')}
                className="bg-gradient-to-r from-brand-blue to-brand-green hover:from-blue-600 hover:to-green-600 text-white p-4 rounded-xl transition-all duration-200 text-center group shadow-lg"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎬</div>
                <div className="font-mali font-bold text-sm">My Videos</div>
              </button>
            </div>
          </div>
        )}

        {/* All Content Tab */}
        {activeTab === 'all-content' && (
          <section className="space-y-6 relative">
            
            <div className="bg-purple-800/60 backdrop-blur-sm rounded-xl p-6 border border-purple-600/50 shadow-lg relative z-10">
              <h2 className="text-2xl font-bold text-emerald-400 mb-4 flex items-center">
                <span className="mr-2">📚</span>
                All Learning Content
              </h2>
              <p className="text-white">Browse all available content types - Audio, Video, Programs & More</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {allContent.map((content) => {
                const isPurchased = isItemPurchased(content.id);
                
                return (
                  <div key={content.id} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:scale-105 hover:border-yellow-400 transition-all duration-300 group">
                    <div className="relative">
                      <div className={`w-full h-48 bg-gradient-to-br ${getContentColor(content.category || '')} relative overflow-hidden`}>
                        {content.thumbnail && content.thumbnail.trim() ? (
                          <img 
                            src={content.thumbnail} 
                            alt={content.title} 
                            className="w-full h-full object-cover" 
                            onLoad={() => {}}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}

                        
                        {/* Play icon for all content types */}
                        {isPurchased && (
                          <div 
                            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group-hover:bg-black/30 cursor-pointer"
                            onClick={() => {
                              if (content && content.id) {
                                if (content.category === 'Audio Lessons' || content.type === 'audio') {
                                  let audioUrl = content.audioUrl || content.videoUrl;
                                  let audioFile = null;
                                  
                                  if (content.audioUrl && typeof content.audioUrl === 'object' && 'type' in content.audioUrl) {
                                    audioUrl = URL.createObjectURL(content.audioUrl as unknown as File);
                                    audioFile = content.audioUrl;
                                  } else if (content.videoUrl && typeof content.videoUrl === 'object' && 'type' in content.videoUrl) {
                                    audioUrl = URL.createObjectURL(content.videoUrl as unknown as File);
                                    audioFile = content.videoUrl;
                                  }
                                  
                                  if (audioUrl) {
                                    setSelectedAudio({
                                      ...content,
                                      audioUrl: audioUrl,
                                      audioFile: audioFile
                                    });
                                    setShowAudioModal(true);
                                  } else {
                                    alert('⚠️ Audio file not available.');
                                  }
                                } else if (content.category === 'PP1 Program') {
                                  if (content.videoUrl) {
                                    const video = {
                                      id: content.id,
                                      title: content.title,
                                      thumbnail: content.thumbnail || '',
                                      duration: content.duration || '5:00',
                                      description: content.description || '',
                                      videoUrl: content.videoUrl || '',
                                      category: content.category || 'PP1 Program',
                                      isPremium: content.isPremium || false,
                                      price: content.price || 0,
                                      rating: (content as any).rating,
                                      views: (content as any).views,
                                      tags: (content as any).tags,
                                      isYouTube: content.videoUrl?.includes('youtube') || content.videoUrl?.includes('youtu.be')
                                    };
                                    playVideo(video);
                                  } else if (content.audioUrl) {
                                    let audioUrl = content.audioUrl;
                                    let audioFile = null;
                                    
                                    if (content.audioUrl && typeof content.audioUrl === 'object' && 'type' in content.audioUrl) {
                                      audioUrl = URL.createObjectURL(content.audioUrl as unknown as File);
                                      audioFile = content.audioUrl;
                                    }
                                    
                                    setSelectedAudio({
                                      ...content,
                                      audioUrl: audioUrl,
                                      audioFile: audioFile
                                    });
                                    setShowAudioModal(true);
                                  } else {
                                    alert(`✅ You own this ${content.category}! Content is now accessible.`);
                                  }
                                } else {
                                  const video = {
                                    id: content.id,
                                    title: content.title,
                                    thumbnail: content.thumbnail || '',
                                    duration: (content as any).duration || content.duration || (content as any).estimatedDuration || '5:00',
                                    description: content.description || '',
                                    videoUrl: content.videoUrl || '',
                                    category: content.category || 'Videos',
                                    isPremium: content.isPremium || false,
                                    price: content.price || 0,
                                    rating: (content as any).rating,
                                    views: (content as any).views,
                                    tags: (content as any).tags,
                                    isYouTube: content.videoUrl?.includes('youtube') || content.videoUrl?.includes('youtu.be')
                                  };
                                  playVideo(video);
                                }
                              }
                            }}
                          >
                            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur-sm group-hover:scale-110 transition-all duration-300">
                              {content.category === 'Audio Lessons' || content.type === 'audio' ? (
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                </svg>
                              ) : content.category === 'PP1 Program' ? (
                                <span className="text-white text-2xl">📚</span>
                              ) : (
                                <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {!isPurchased && (
                        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
                          ${content.price || 0}
                        </div>
                      )}
                      

                      

                      
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
                        </div>
                        
                        {!isPurchased && (
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
              <div className="text-center py-12 bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg">
                <div className="text-6xl mb-4">📚</div>
                <div className="text-brand-yellow text-xl mb-2 font-mali font-bold">No content available</div>
                <div className="text-gray-300 text-sm font-mali">Admin needs to add content through the admin panel</div>
              </div>
            )}
          </section>
        )}

        {/* Category-specific tabs */}
        {['audio-lessons', 'video-lessons', 'pp1-program'].map(tabId => {
          // Map tab IDs to proper category names
          const categoryMap: { [key: string]: string } = {
            'audio-lessons': 'Audio Lessons',
            'video-lessons': 'Video Lessons', 
            'pp1-program': 'PP1 Program',

          };
          
          const categoryName = categoryMap[tabId];
          const filteredContent = allContent.filter(content => content.category === categoryName);
          
          return activeTab === tabId && (
            <section key={tabId} className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">{getContentIcon('', categoryName)}</span>
                  {categoryName}
                </h2>
                <p className="text-purple-200">Specialized {categoryName.toLowerCase()} content for your learning journey</p>
                <div className="mt-2 text-sm text-purple-300">
                  {filteredContent.length} items available
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((content) => {
                  const isPurchased = isItemPurchased(content.id);
                  
                  return (
                    <div key={content.id} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:scale-105 hover:border-yellow-400 transition-all duration-300 group">
                      <div className="relative">
                        <div className={`w-full h-48 bg-gradient-to-br ${getContentColor(content.category || '')} relative overflow-hidden`}>
                          {content.thumbnail && content.thumbnail.trim() ? (
                            <img 
                              src={content.thumbnail} 
                              alt={content.title} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : null}

                          
                          {/* Play icon for videos and audio */}
                          {isPurchased && (
                            <div 
                              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group-hover:bg-black/30 cursor-pointer"
                              onClick={() => {
                                if (content.category === 'Audio Lessons' || content.type === 'audio') {
                                  let audioUrl = content.audioUrl || content.videoUrl;
                                  let audioFile = null;
                                  
                                  // Handle File objects
                                  if (content.audioUrl && typeof content.audioUrl === 'object' && 'type' in content.audioUrl) {
                                    audioUrl = URL.createObjectURL(content.audioUrl as unknown as File);
                                    audioFile = content.audioUrl;
                                  } else if (content.videoUrl && typeof content.videoUrl === 'object' && 'type' in content.videoUrl) {
                                    audioUrl = URL.createObjectURL(content.videoUrl as unknown as File);
                                    audioFile = content.videoUrl;
                                  }
                                  
                                  if (audioUrl) {
                                    setSelectedAudio({
                                      ...content,
                                      audioUrl: audioUrl,
                                      audioFile: audioFile
                                    });
                                    setShowAudioModal(true);
                                  } else {
                                    alert('⚠️ Audio file not available.');
                                  }
                                } else if (content.category === 'PP1 Program') {
                                  // Handle PP1 Program content
                                  if (content.videoUrl) {
                                    const video = {
                                      id: content.id,
                                      title: content.title,
                                      thumbnail: content.thumbnail || '',
                                      duration: content.duration || '5:00',
                                      description: content.description || '',
                                      videoUrl: content.videoUrl || '',
                                      category: content.category || 'PP1 Program',
                                      isPremium: content.isPremium || false,
                                      price: content.price || 0,
                                      rating: (content as any).rating,
                                      views: (content as any).views,
                                      tags: (content as any).tags,
                                      isYouTube: content.videoUrl?.includes('youtube') || content.videoUrl?.includes('youtu.be')
                                    };
                                    playVideo(video);
                                  } else if (content.audioUrl) {
                                    let audioUrl = content.audioUrl;
                                    let audioFile = null;
                                    
                                    if (content.audioUrl && typeof content.audioUrl === 'object' && 'type' in content.audioUrl) {
                                      audioUrl = URL.createObjectURL(content.audioUrl as unknown as File);
                                      audioFile = content.audioUrl;
                                    }
                                    
                                    setSelectedAudio({
                                      ...content,
                                      audioUrl: audioUrl,
                                      audioFile: audioFile
                                    });
                                    setShowAudioModal(true);
                                  } else {
                                    alert(`✅ You own this ${content.category}! Content is now accessible.`);
                                  }
                                } else if (content.type === 'video' || !content.type) {
                                  const video = {
                                    id: content.id,
                                    title: content.title,
                                    thumbnail: content.thumbnail || '',
                                    duration: (content as any).duration || content.duration || (content as any).estimatedDuration || '5:00',
                                    description: content.description || '',
                                    videoUrl: content.videoUrl || '',
                                    category: content.category || 'Videos',
                                    isPremium: content.isPremium || false,
                                    price: content.price || 0,
                                    rating: (content as any).rating,
                                    views: (content as any).views,
                                    tags: (content as any).tags,
                                    isYouTube: content.videoUrl?.includes('youtube') || content.videoUrl?.includes('youtu.be')
                                  };
                                  playVideo(video);
                                }
                              }}
                            >
                              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur-sm group-hover:scale-110 transition-all duration-300">
                                {content.category === 'Audio Lessons' || content.type === 'audio' ? (
                                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                  </svg>
                                ) : (
                                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {!isPurchased && (
                          <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
                            ${content.price || 0}
                          </div>
                        )}
                        
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
                              if (content.category === 'Audio Lessons' || content.type === 'audio') {
                                // Handle audio content
                                let audioUrl = content.audioUrl || content.videoUrl;
                                
                                // Handle File objects by creating blob URL
                                if (content.audioUrl && typeof content.audioUrl === 'object' && 'type' in content.audioUrl) {
                                  audioUrl = URL.createObjectURL(content.audioUrl as unknown as File);
                                } else if (content.videoUrl && typeof content.videoUrl === 'object' && 'type' in content.videoUrl) {
                                  audioUrl = URL.createObjectURL(content.videoUrl as unknown as File);
                                }
                                
                                if (audioUrl) {
                                  setSelectedAudio({
                                    ...content,
                                    audioUrl: audioUrl,
                                    audioFile: content.audioUrl && typeof content.audioUrl === 'object' && 'type' in content.audioUrl ? content.audioUrl : (content.videoUrl && typeof content.videoUrl === 'object' && 'type' in content.videoUrl ? content.videoUrl : null)
                                  });
                                  setShowAudioModal(true);
                                } else {
                                  alert('⚠️ Audio file not available for this content.');
                                }
                              } else if (content.type === 'video' || !content.type) {
                                const video = {
                                  id: content.id,
                                  title: content.title,
                                  thumbnail: content.thumbnail || '',
                                  duration: content.duration || '',
                                  description: content.description || '',
                                  videoUrl: content.videoUrl || '',
                                  category: content.category || 'Videos',
                                  isPremium: content.isPremium || false,
                                  price: content.price || 0,
                                  rating: (content as any).rating,
                                  views: (content as any).views,
                                  tags: (content as any).tags,
                                  isYouTube: content.videoUrl?.includes('youtube') || content.videoUrl?.includes('youtu.be')
                                };
                                playVideo(video);
                              } else if (content.category === 'PP1 Program') {
                                // Handle PP1 Program content
                                if (content.videoUrl) {
                                  const video = {
                                    id: content.id,
                                    title: content.title,
                                    thumbnail: content.thumbnail || '',
                                    duration: content.duration || '5:00',
                                    description: content.description || '',
                                    videoUrl: content.videoUrl || '',
                                    category: content.category || 'PP1 Program',
                                    isPremium: content.isPremium || false,
                                    price: content.price || 0,
                                    rating: (content as any).rating,
                                    views: (content as any).views,
                                    tags: (content as any).tags,
                                    isYouTube: content.videoUrl?.includes('youtube') || content.videoUrl?.includes('youtu.be')
                                  };
                                  playVideo(video);
                                } else if (content.audioUrl) {
                                  let audioUrl = content.audioUrl;
                                  let audioFile = null;
                                  
                                  if (content.audioUrl && typeof content.audioUrl === 'object' && 'type' in content.audioUrl) {
                                    audioUrl = URL.createObjectURL(content.audioUrl as unknown as File);
                                    audioFile = content.audioUrl;
                                  }
                                  
                                  setSelectedAudio({
                                    ...content,
                                    audioUrl: audioUrl,
                                    audioFile: audioFile
                                  });
                                  setShowAudioModal(true);
                                } else {
                                  alert(`✅ You own this ${content.category}! Content is now accessible.`);
                                }
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
              
              {filteredContent.length === 0 && (
                <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-6xl mb-4">{getContentIcon('', categoryName)}</div>
                  <div className="text-white text-xl mb-2">No {categoryName} available</div>
                  <div className="text-purple-200 text-sm mb-4">Check back later for new content</div>
                  {user?.role === 'admin' && (
                    <div className="text-yellow-400 text-sm">
                      💡 Admin tip: Add content with category "{categoryName}" to populate this section
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}

        {/* Videos Tab (Legacy) */}
        {activeTab === 'videos' && (
          <section className="space-y-6">
            {/* Enhanced Filters */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-white">Video Library</h2>
                  <span className="bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
                    {allModules.filter(module => module && (module.type === 'video' || !module.type) && module.category !== 'Audio Lessons' && isItemPurchased(module.id)).length} my videos
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

            {/* Video Cards - Only Show Purchased Videos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allModules.filter(module => module && (module.type === 'video' || !module.type) && module.category !== 'Audio Lessons' && isItemPurchased(module.id)).map(module => {
                const isPurchased = isItemPurchased(module.id);
                let thumbnail = module.thumbnail || '';
                
                // Handle File objects for thumbnails
                if (module.thumbnail && typeof thumbnail === 'object' && 'type' in thumbnail) {
                  thumbnail = URL.createObjectURL(module.thumbnail as unknown as File);
                }
                // Handle base64 data URLs for thumbnails
                else if (typeof module.thumbnail === 'string' && module.thumbnail.startsWith('data:')) {
                  thumbnail = module.thumbnail;
                }
                // Handle YouTube thumbnail extraction
                else if (module.videoUrl && typeof module.videoUrl === 'string' && (!thumbnail || thumbnail === '/zinga-linga-logo.png')) {
                  let videoId = null;
                  if (module.videoUrl.includes('youtube.com/watch')) {
                    videoId = module.videoUrl.split('v=')[1]?.split('&')[0];
                  } else if (module.videoUrl.includes('youtu.be/')) {
                    videoId = module.videoUrl.split('youtu.be/')[1]?.split('?')[0];
                  }
                  if (videoId) {
                    thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                  }
                }
                
                return (
                  <div key={module.id} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:scale-105 hover:border-yellow-400 transition-all duration-300 group">
                    <div className="relative">
                      <div className={`w-full h-48 bg-gradient-to-br from-green-500 to-green-600 relative overflow-hidden`}>
                        {thumbnail && thumbnail.trim() ? (
                          <img 
                            src={thumbnail} 
                            alt={module.title} 
                            className="w-full h-full object-cover" 
                            onLoad={() => {}}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="absolute inset-0 flex items-center justify-center text-white/80 text-6xl bg-gradient-to-br from-green-500 to-green-600"
                          style={{ display: thumbnail && thumbnail.trim() ? 'none' : 'flex' }}
                        >
                          🎬
                        </div>

                        {/* Play icon for purchased videos */}
                        {isPurchased && (
                          <div 
                            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group-hover:bg-black/30 cursor-pointer"
                            onClick={() => {
                              const video = {
                                id: module.id,
                                title: module.title || 'Untitled Video',
                                thumbnail: thumbnail || '',
                                duration: module.duration || '',
                                description: module.description || '',
                                videoUrl: module.videoUrl || '',
                                category: module.category || 'Videos',
                                isPremium: module.isPremium || false,
                                price: module.price || 0,
                                rating: (module as any).rating,
                                views: (module as any).views,
                                tags: (module as any).tags,
                                isYouTube: module.videoUrl?.includes('youtube') || module.videoUrl?.includes('youtu.be')
                              };
                              playVideo(video);
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
                      
                      {!isPurchased && (
                        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
                          ${module.price || 0}
                        </div>
                      )}
                      
                      {module.duration && (
                        <div className="absolute bottom-2 right-2 bg-purple-600/90 text-white px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm">
                          {module.duration}
                        </div>
                      )}
                      

                      
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
                      <h3 className="text-lg font-bold text-white mb-2">{module.title || 'Untitled Video'}</h3>
                      <p className="text-purple-200 text-sm mb-3 line-clamp-2">{module.description || 'No description available'}</p>
                      
                      {module.aiTags && module.aiTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {module.aiTags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white/20 text-white/80 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {module.hasPreview && (
                            <span className="text-blue-400 text-xs">👁️ Preview</span>
                          )}
                        </div>
                        
                        {!isPurchased && (
                          <button 
                            onClick={() => {
                              addToCart(module.id);
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
            
            {/* Show message when no purchased videos */}
            {allModules.filter(module => module && (module.type === 'video' || !module.type) && module.category !== 'Audio Lessons' && isItemPurchased(module.id)).length === 0 && (
              <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-6xl mb-4">🎬</div>
                <div className="text-white text-xl mb-2">No videos available</div>
                <div className="text-purple-200 text-sm mb-6">Videos will appear here when added</div>
                <button 
                  onClick={() => handleSetActiveTab('store')}
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
                  onClick={() => handleSetActiveTab('store')}
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
                  onClick={() => handleSetActiveTab('videos')}
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
                  <div key={item.id} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:scale-105 hover:border-yellow-400 transition-all duration-300 group">
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden">
                        {item.image && item.image.trim() ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                            onLoad={() => {}}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="absolute inset-0 flex items-center justify-center text-white text-4xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600"
                          style={{ display: item.image && item.image.trim() ? 'none' : 'flex' }}
                        >
                          🎬
                        </div>
                        
                        {/* Lock Overlay for unpurchased videos */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <div className="text-center text-white">
                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-3 mx-auto">
                              <span className="text-2xl">🔒</span>
                            </div>
                            <div className="text-sm font-bold">Purchase Required</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
                        ${item.price || 0}
                      </div>
                      
                      <div className="absolute bottom-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                        {item.category || 'Content'}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                      <p className="text-purple-200 text-sm mb-3 line-clamp-2">{item.description || 'No description available'}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {/* Duration removed - no fake times */}
                        </div>
                        
                        {cartItems.includes(item.id) ? (
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                          >
                            Remove
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              addToCart(item.id);
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
                ))}
              </div>
            )}
          </section>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
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
                  Purchased Videos ({localPurchases.filter((p, index, self) => 
                    p.userId === user?.id && 
                    displayVideos.some(v => v.id === p.moduleId) &&
                    index === self.findIndex(purchase => purchase.moduleId === p.moduleId && purchase.userId === p.userId)
                  ).length})
                </h3>
                <div className="space-y-3">
                  {localPurchases
                    .filter((p, index, self) => 
                      p.userId === user?.id && 
                      displayVideos.some(v => v.id === p.moduleId) &&
                      index === self.findIndex(purchase => purchase.moduleId === p.moduleId && purchase.userId === p.userId)
                    )
                    .slice(0, 3)
                    .map((purchase, index) => {
                    const video = displayVideos.find(v => v && v.id === purchase.moduleId);
                    return video ? (
                      <div key={`${purchase.id}-${index}-${purchase.moduleId}`} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" onClick={() => playVideo(video)}>
                        <div className="w-16 h-12 rounded overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                          {video.thumbnail && video.thumbnail.trim() ? (
                            <img 
                              src={video.thumbnail} 
                              alt={video.title} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs" style={{ display: video.thumbnail && video.thumbnail.trim() ? 'none' : 'flex' }}>
                            🎬
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{video.title}</div>
                          <div className="text-purple-200 text-sm">Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}</div>
                        </div>
                        <div className="text-green-400 text-sm font-medium">▶️ Play</div>
                      </div>
                    ) : null;
                  })}
                  {localPurchases.filter((p, index, self) => 
                    p.userId === user?.id && 
                    displayVideos.some(v => v.id === p.moduleId) &&
                    index === self.findIndex(purchase => purchase.moduleId === p.moduleId && purchase.userId === p.userId)
                  ).length === 0 && (
                    <div className="text-center py-8 text-purple-200">
                      <div className="text-4xl mb-2">🎬</div>
                      <div>No videos purchased yet</div>
                      <button 
                        onClick={() => handleSetActiveTab('store')}
                        className="mt-2 text-yellow-400 hover:text-yellow-300 text-sm"
                      >
                        Browse Store →
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🛍️</span>
                  All Purchases ({localPurchases.filter((p, index, self) => 
                    p.userId === user?.id &&
                    index === self.findIndex(purchase => purchase.moduleId === p.moduleId && purchase.userId === p.userId)
                  ).length})
                </h3>
                <div className="space-y-3">
                  {localPurchases
                    .filter((p, index, self) => 
                      p.userId === user?.id &&
                      index === self.findIndex(purchase => purchase.moduleId === p.moduleId && purchase.userId === p.userId)
                    )
                    .slice(0, 3)
                    .map(purchase => {
                      const video = displayVideos.find(v => v && v.id === purchase.moduleId);
                      return (
                        <div key={purchase.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {video ? '🎬' : '🛍️'}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">{video?.title || `Product #${purchase.moduleId}`}</div>
                            <div className="text-purple-200 text-sm">Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}</div>
                          </div>
                          <div className="text-yellow-400 font-bold">${purchase.amount}</div>
                        </div>
                      );
                    })}
                  {localPurchases.filter((p, index, self) => 
                    p.userId === user?.id &&
                    index === self.findIndex(purchase => purchase.moduleId === p.moduleId && purchase.userId === p.userId)
                  ).length === 0 && (
                    <div className="text-center py-8 text-purple-200">
                      <div className="text-4xl mb-2">🛍️</div>
                      <div>No purchases yet</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Saved List Tab */}
        {activeTab === 'saved-list' && (
          <section className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">💾</span>
                My Saved Videos ({savedVideosList.length})
              </h2>
              <p className="text-purple-200">Videos you've saved for later viewing</p>
            </div>
            
            {savedVideosList.length === 0 ? (
              <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-6xl mb-4">💾</div>
                <div className="text-white text-xl mb-2">No saved videos</div>
                <div className="text-purple-200 text-sm mb-6">Save videos to watch them later</div>
                <button 
                  onClick={() => handleSetActiveTab('store')}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold px-6 py-3 rounded-lg transition-all duration-200"
                >
                  Browse Videos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedVideosList.map(video => (
                  <div key={video.id} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:scale-105 hover:border-yellow-400 transition-all duration-300 group">
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
                        {video.thumbnail && video.thumbnail.trim() ? (
                          <img 
                            src={video.thumbnail} 
                            alt={video.title} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white text-4xl">
                            🎬
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
                        ${video.price || 0}
                      </div>
                      
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-purple-600/90 text-white px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm">
                          {video.duration}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{video.title}</h3>
                      <p className="text-purple-200 text-sm mb-3 line-clamp-2">{video.description || 'No description available'}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-purple-200 text-xs">
                          Saved: {new Date(video.savedAt).toLocaleDateString()}
                        </div>
                        <button 
                          onClick={async () => {
                            try {
                              if (user?.id) {
                                const success = await vpsDataStore.removeSavedVideo(user.id, video.id);
                                if (success) {
                                  const updatedList = await vpsDataStore.getSavedVideos(user.id);
                                  setSavedVideosList(updatedList);
                                  console.log('✅ Video removed from saved list');
                                } else {
                                  console.error('❌ Failed to remove video from VPS');
                                }
                              }
                            } catch (error) {
                              console.error('❌ Failed to remove video:', error);
                            }
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  onClick={() => handleSetActiveTab('videos')}
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
                              const sibling = e.currentTarget.nextElementSibling as HTMLElement; if (sibling) sibling.style.display = 'flex';
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
                            onClick={() => setPlaylist(prev => prev.filter(id => id !== videoId))}
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

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <section className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📦</span>
                Learning Packages
              </h2>
              <p className="text-purple-200">Discover bundled content packages with special pricing</p>
            </div>
            
            {packages.length === 0 ? (
              <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="text-6xl mb-4">📦</div>
                <div className="text-white text-xl mb-2">No Packages Available</div>
                <div className="text-purple-200 text-sm">Check back later for new learning packages</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => {
                  const isPurchased = localPurchases.some(purchase => 
                    purchase.moduleId === pkg.id && 
                    purchase.userId === user?.id && 
                    purchase.status === 'completed'
                  );
                  
                  return (
                    <div key={pkg.id} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300 group">
                      {/* Package Image/Video */}
                      <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-600">
                        {pkg.mediaUrl ? (
                          pkg.mediaUrl.startsWith('data:video/') ? (
                            <video 
                              className="w-full h-full object-cover"
                              poster={pkg.thumbnail || ''}
                              muted
                            >
                              <source src={pkg.mediaUrl} type="video/mp4" />
                            </video>
                          ) : (
                            <img 
                              src={pkg.mediaUrl} 
                              alt={pkg.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl">{pkg.icon || '📦'}</span>
                          </div>
                        )}
                        
                        {/* Package Type Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
                            {pkg.type || 'Package'}
                          </span>
                        </div>
                        
                        {/* Popular Badge */}
                        {pkg.isPopular && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded-full font-semibold">
                              ⭐ Popular
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Package Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors">
                            {pkg.name}
                          </h3>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-400">
                              ${pkg.price?.toFixed(2) || '0.00'}
                            </div>
                            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                              <div className="text-sm text-gray-400 line-through">
                                ${pkg.originalPrice.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-purple-200 text-sm mb-4 line-clamp-2">
                          {pkg.description || 'No description available'}
                        </p>
                        
                        {/* Features */}
                        {pkg.features && pkg.features.length > 0 && (
                          <div className="mb-4">
                            <div className="text-white text-sm font-semibold mb-2">Includes:</div>
                            <ul className="text-purple-200 text-xs space-y-1">
                              {pkg.features.slice(0, 3).map((feature: string, index: number) => (
                                <li key={index} className="flex items-center">
                                  <span className="w-1 h-1 bg-purple-400 rounded-full mr-2"></span>
                                  {feature}
                                </li>
                              ))}
                              {pkg.features.length > 3 && (
                                <li className="text-purple-300 text-xs">+{pkg.features.length - 3} more...</li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        {/* Status */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${
                              pkg.isActive ? 'bg-green-400' : 'bg-red-400'
                            }`}></span>
                            <span className="text-xs text-purple-200">
                              {pkg.isActive ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          
                          {isPurchased && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                              ✓ Purchased
                            </span>
                          )}
                        </div>
                        
                        {/* Action Button */}
                        <button
                          onClick={async () => {
                            if (isPurchased) {
                              // Navigate to package content or show access
                              console.log('Access package:', pkg.id);
                              alert(`✅ You own this package! Content is now accessible.`);
                            } else if (pkg.isActive) {
                              try {
                                // Create purchase for package
                                const packagePurchase = {
                                  id: `purchase_${Date.now()}_${pkg.id}_${user?.id || 'user_1'}`,
                                  userId: user?.id || 'user_1',
                                  moduleId: pkg.id,
                                  purchaseDate: new Date().toISOString(),
                                  amount: pkg.price || 0,
                                  status: 'completed' as const,
                                  type: 'package' as const
                                };
                                
                                // Create purchases for all content in package
                                const contentPurchases = (pkg.contentIds || []).map((contentId: string, index: number) => ({
                                  id: `purchase_${Date.now()}_content_${index}_${user?.id || 'user_1'}`,
                                  userId: user?.id || 'user_1',
                                  moduleId: contentId,
                                  purchaseDate: new Date().toISOString(),
                                  amount: 0,
                                  status: 'completed' as const,
                                  type: 'video' as const,
                                  packageId: pkg.id
                                }));
                                
                                // Save all purchases to VPS
                                await vpsDataStore.addPurchase(packagePurchase);
                                for (const contentPurchase of contentPurchases) {
                                  await vpsDataStore.addPurchase(contentPurchase);
                                }
                                
                                // Update user's purchased modules to include package AND all content
                                if (user?.id) {
                                  const allContentIds = pkg.contentIds || [];
                                  const updatedUser = {
                                    ...user,
                                    purchasedModules: [...(user.purchasedModules || []), pkg.id, ...allContentIds],
                                    totalSpent: (user.totalSpent || 0) + (pkg.price || 0)
                                  };
                                  await vpsDataStore.updateUser(user.id, updatedUser);
                                  if (setUser) setUser(updatedUser);
                                }
                                
                                // Update local purchases
                                setLocalPurchases([...localPurchases, packagePurchase, ...contentPurchases]);
                                
                                alert(`🎉 Package "${pkg.name}" purchased! All ${(pkg.contentIds || []).length} content items are now available.`);
                              } catch (error) {
                                console.error('Package purchase failed:', error);
                                alert('❌ Purchase failed. Please try again.');
                              }
                            }
                          }}
                          disabled={!pkg.isActive}
                          className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                            isPurchased
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : pkg.isActive
                              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl'
                              : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isPurchased ? 'Access Package' : pkg.isActive ? `Purchase - $${pkg.price?.toFixed(2) || '0.00'}` : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <section className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📋</span>
                My Orders
              </h2>
              <p className="text-purple-200">View your purchase history and order details</p>
            </div>
            
            <div className="space-y-4">
              {localPurchases.filter(p => p.userId === user?.id).length > 0 ? (
                localPurchases.filter(p => p.userId === user?.id).map(purchase => {
                  const video = displayVideos.find(v => v && v.id === purchase.moduleId);
                  return (
                    <div key={purchase.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <span className="text-white text-2xl">🎥</span>
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">{video?.title || 'Video Content'}</h3>
                            <p className="text-purple-200 text-sm">Order #{purchase.id.slice(-8)}</p>
                            <p className="text-purple-200 text-sm">Purchased: {new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold text-xl">${purchase.amount.toFixed(2)}</div>
                          <div className="text-green-400 text-sm flex items-center">
                            <span className="mr-1">✓</span>
                            Completed
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-6xl mb-4">📋</div>
                  <div className="text-white text-xl mb-2">No orders yet</div>
                  <div className="text-purple-200 text-sm mb-6">Your purchase history will appear here</div>
                  <button 
                    onClick={() => handleSetActiveTab('store')}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold px-6 py-3 rounded-lg transition-all duration-200"
                  >
                    Browse Store
                  </button>
                </div>
              )}
            </div>
          </section>
        )}



        {/* New Modern Profile Tab */}
        {activeTab === 'profile' && (
          <section className="space-y-8">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                <div className="relative">
                  <img 
                    src={user?.avatar && user.avatar.trim() ? user.avatar : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover" 
                    key={`profile-${user?.id}-${user?.avatar || 'default'}-${Date.now()}`}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                </div>
                
                <div className="text-center lg:text-left flex-1">
                  <h1 className="text-4xl font-bold mb-2">{user?.name || 'User'}</h1>
                  <p className="text-white/80 text-lg mb-4">{user?.email}</p>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">🏆 Level {userStats.level}</span>

                    <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">🎬 {localPurchases.filter(p => p.userId === user?.id).length} Videos</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setProfileData({
                      name: user?.name || '',
                      phone: user?.phone || '',
                      address: user?.address || '',
                      avatar: user?.avatar || ''
                    });
                    setShowEditProfile(true);
                  }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <span className="text-2xl">📅</span>
                  </div>
                  <span className="text-blue-100 text-sm font-semibold">JOINED</span>
                </div>
                <div className="text-2xl font-bold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'New'}</div>
                <div className="text-blue-100 text-sm">Joined</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <span className="text-green-100 text-sm font-semibold">VIDEOS</span>
                </div>
                <div className="text-2xl font-bold">{userStats.videosWatched}</div>
                <div className="text-green-100 text-sm">Owned</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <span className="text-2xl">💰</span>
                  </div>
                  <span className="text-purple-100 text-sm font-semibold">SPENT</span>
                </div>
                <div className="text-2xl font-bold">${localPurchases.filter(p => p.userId === user?.id).reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}</div>
                <div className="text-purple-100 text-sm">Total</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <span className="text-orange-100 text-sm font-semibold">STATUS</span>
                </div>
                <div className="text-2xl font-bold">Lv.{userStats.level}</div>
                <div className="text-orange-100 text-sm">Level</div>
              </div>
            </div>
            
            {/* Profile Info & Purchases */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3 text-2xl">👤</span>
                  Profile Info
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-purple-200 text-sm mb-1">Name</div>
                    <div className="text-white font-semibold">{user?.name || 'Not set'}</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-purple-200 text-sm mb-1">Email</div>
                    <div className="text-white font-semibold text-sm">{user?.email || 'Not set'}</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-purple-200 text-sm mb-1">Phone</div>
                    <div className="text-white font-semibold">{user?.phone || 'Not set'}</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-purple-200 text-sm mb-1">Address</div>
                    <div className="text-white font-semibold text-sm">{user?.address || 'Not set'}</div>
                  </div>
                </div>
              </div>
              
              {/* Recent Purchases */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="mr-3 text-2xl">🛒</span>
                    Recent Purchases
                  </h3>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {localPurchases.filter(p => p.userId === user?.id).length > 0 ? (
                      localPurchases.filter(p => p.userId === user?.id).slice(0, 5).map(purchase => {
                        const video = displayVideos.find(v => v && v.id === purchase.moduleId);
                        return (
                          <div key={purchase.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                  {video?.thumbnail && video.thumbnail.trim() ? (
                                    <img 
                                      src={video.thumbnail} 
                                      alt={video.title} 
                                      className="w-full h-full object-cover" 
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center" style={{ display: video?.thumbnail && video.thumbnail.trim() ? 'none' : 'flex' }}>
                                    <span className="text-white text-xl">🎬</span>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-white font-semibold">{video?.title || `Video #${purchase.moduleId}`}</div>
                                  <div className="text-purple-200 text-sm">{new Date(purchase.purchaseDate).toLocaleDateString()}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-green-400 font-bold">${purchase.amount.toFixed(2)}</div>
                                <div className="text-green-300 text-xs">✓ Owned</div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🛒</div>
                        <div className="text-white text-xl mb-2">No purchases yet</div>
                        <div className="text-purple-200 text-sm mb-6">Start exploring our video collection</div>
                        <button 
                          onClick={() => handleSetActiveTab('store')}
                          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
                        >
                          Browse Store
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3 text-2xl">⚡</span>
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => {
                    setProfileData({
                      name: user?.name || '',
                      phone: user?.phone || '',
                      address: user?.address || '',
                      avatar: user?.avatar || ''
                    });
                    setShowEditProfile(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-6 rounded-xl transition-all hover:scale-105 shadow-lg text-center"
                >
                  <div className="text-3xl mb-3">✏️</div>
                  <div className="font-bold text-lg">Edit Profile</div>
                  <div className="text-blue-100 text-sm">Update your info</div>
                </button>
                
                <button 
                  onClick={() => handleSetActiveTab('videos')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-6 rounded-xl transition-all hover:scale-105 shadow-lg text-center"
                >
                  <div className="text-3xl mb-3">🎬</div>
                  <div className="font-bold text-lg">My Videos</div>
                  <div className="text-green-100 text-sm">{localPurchases.filter(p => p.userId === user?.id).length} videos owned</div>
                </button>
                
                <button 
                  onClick={() => setActiveTab('store')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-6 rounded-xl transition-all hover:scale-105 shadow-lg text-center"
                >
                  <div className="text-3xl mb-3">🛍️</div>
                  <div className="font-bold text-lg">Browse Store</div>
                  <div className="text-orange-100 text-sm">Discover new content</div>
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
                  description: 'Purchased your first video', 
                  icon: '🎬', 
                  unlocked: userStats.videosWatched > 0,
                  progress: Math.min(userStats.videosWatched, 1),
                  total: 1
                },
                { 
                  id: 'video-lover', 
                  title: 'Video Lover', 
                  description: 'Own 5 videos', 
                  icon: '📺', 
                  unlocked: userStats.videosWatched >= 5,
                  progress: Math.min(userStats.videosWatched, 5),
                  total: 5
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
                  description: 'Own 10 videos', 
                  icon: '🎁', 
                  unlocked: userStats.purchasedItems >= 10,
                  progress: Math.min(userStats.purchasedItems, 10),
                  total: 10
                },
                { 
                  id: 'time-master', 
                  title: 'Content Master', 
                  description: 'Own 50+ minutes of content', 
                  icon: '⏰', 
                  unlocked: userStats.watchTime >= 50,
                  progress: Math.min(userStats.watchTime, 50),
                  total: 50
                },
                { 
                  id: 'explorer', 
                  title: 'Explorer', 
                  description: 'Explore the platform', 
                  icon: '🗺️', 
                  unlocked: userStats.purchasedItems > 0,
                  progress: userStats.purchasedItems > 0 ? 1 : 0,
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
      <footer className="bg-black/20 backdrop-blur-xl mt-16 border-t border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://zingalinga.io/zinga%20linga%20logo.png" 
                    alt="Zinga Linga Logo" 
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <span className="text-xl font-mali font-bold text-brand-green" style={{ display: 'none' }}>Z</span>
                </div>
                <div>
                  <h3 className="text-white font-mali font-bold text-xl">Zinga Linga</h3>
                  <p className="text-yellow-100 text-sm font-mali">Educational Entertainment Platform for Kids</p>
                </div>
              </div>
              <p className="text-yellow-100 text-sm mb-4 font-mali">
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
              <h4 className="text-white font-mali font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                {[
                  { label: 'Home', action: () => handleSetActiveTab('dashboard') },
                { label: 'Videos', action: () => handleSetActiveTab('videos') },
                { label: 'Store', action: () => handleSetActiveTab('store') },
                { label: 'My Library', action: () => handleSetActiveTab('library') }
                ].map(link => (
                  <button
                    key={link.label}
                    onClick={link.action}
                    className="block text-yellow-100 hover:text-brand-yellow transition-colors text-sm font-mali"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-mali font-bold mb-4">Your Stats</h4>
              <div className="space-y-2 text-sm">

                <div className="flex justify-between text-yellow-100 font-mali">
                  <span>Videos:</span>
                  <span className="text-brand-yellow font-bold">{localPurchases.filter(p => p.userId === user?.id).length}</span>
                </div>
                <div className="flex justify-between text-yellow-100 font-mali">
                  <span>Purchases:</span>
                  <span className="text-brand-yellow font-bold">{localPurchases.filter(p => p.userId === user?.id).length}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-orange-200/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-yellow-100 text-sm font-mali">
              © 2024 Zinga Linga. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button className="text-yellow-100 hover:text-brand-yellow transition-colors text-sm font-mali">
                Privacy Policy
              </button>
              <button className="text-yellow-100 hover:text-brand-yellow transition-colors text-sm font-mali">
                Terms and Conditions
              </button>
              <button className="text-yellow-100 hover:text-brand-yellow transition-colors text-sm font-mali">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Enhanced Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">✏️ Edit Profile</h3>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="text-white/80 hover:text-white text-2xl w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img 
                    src={(profileData.avatar && profileData.avatar.trim()) || (user?.avatar && user.avatar.trim()) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full border-4 border-purple-400 object-cover shadow-lg" 
                    key={`edit-profile-${user?.id}-${profileData.avatar || user?.avatar || 'default'}`}
                  />
                  <button 
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="absolute bottom-0 right-0 bg-purple-500 hover:bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    📷
                  </button>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="avatar-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert('Image size must be less than 2MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setProfileData(prev => ({ ...prev, avatar: e.target?.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <p className="text-gray-500 text-sm mt-2">Click camera to change photo</p>
              </div>
              
              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">👤 Full Name *</label>
                  <input 
                    type="text" 
                    value={profileData.name !== undefined ? profileData.name : (user?.name || '')}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">📞 Phone Number</label>
                  <input 
                    type="tel" 
                    value={profileData.phone !== undefined ? profileData.phone : (user?.phone || '')}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">🏠 Address</label>
                  <textarea 
                    value={profileData.address !== undefined ? profileData.address : (user?.address || '')}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street, City, State, ZIP"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white resize-none"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3 mt-8">
                <button 
                  onClick={async () => {
                    try {
                      const finalName = profileData.name || user?.name;
                      if (!finalName?.trim()) {
                        alert('❌ Name is required!');
                        return;
                      }

                      if (!user?.id) {
                        alert('❌ User ID not found. Please log in again.');
                        return;
                      }

                      const updatedUser = {
                        ...user,
                        name: finalName.trim(),
                        phone: (profileData.phone !== undefined ? profileData.phone : user?.phone || '').trim(),
                        address: (profileData.address !== undefined ? profileData.address : user?.address || '').trim(),
                        avatar: profileData.avatar !== undefined ? profileData.avatar : user?.avatar,
                        updatedAt: new Date().toISOString()
                      } as User;
                      
                      console.log('Updating user profile:', { userId: user.id, updatedUser });
                      
                      // Update user in VPS
                      const saveSuccess = await vpsDataStore.updateUser(user.id, updatedUser);
                      console.log('VPS updateUser result:', saveSuccess);
                      
                      if (!saveSuccess) {
                        console.error('VPS update failed for user:', user.id);
                        alert('❌ Failed to save profile data. Please check console for details.');
                        return;
                      }
                      
                      console.log('✅ Profile updated successfully in VPS');
                      
                      // Update local state
                      if (setUser) {
                        setUser(updatedUser);
                      }
                      
                      // Update session storage
                      if (typeof window !== 'undefined') {
                        try {
                          const currentSession = JSON.parse(localStorage.getItem('zinga-linga-session') || '{}');
                          if (currentSession.user) {
                            currentSession.user = updatedUser;
                            localStorage.setItem('zinga-linga-session', JSON.stringify(currentSession));
                          }
                          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                          
                          // Force re-render by dispatching custom event
                          window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: updatedUser }));
                        } catch (sessionError) {
                          console.error('Failed to update session:', sessionError);
                        }
                      }
                      
                      alert('✅ Profile updated successfully!');
                      setShowEditProfile(false);
                      setProfileData({ name: '', phone: '', address: '', avatar: '' });
                    } catch (error) {
                      console.error('❌ Profile update error:', error);
                      alert('❌ Failed to update profile. Please try again.');
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  💾 Save Changes
                </button>
                <button 
                  onClick={() => {
                    setShowEditProfile(false);
                    setProfileData({ name: '', phone: '', address: '', avatar: '' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
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

      {/* Simple Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛒</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Complete Purchase</h3>
              
              <div className="space-y-3 mb-6">
                {cartItems.map(itemId => {
                  const item = storeItems.find(item => item.id === itemId);
                  if (!item) return null;
                  return (
                    <div key={itemId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-800">{item.name}</span>
                      <span className="font-bold text-green-600">${item.price}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-green-600">${getTotalPrice()}</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const timestamp = Date.now();
                      const newPurchases = [];
                      
                      for (const itemId of cartItems) {
                        // Check if already purchased
                        const alreadyPurchased = localPurchases.some(p => 
                          p.moduleId === itemId && 
                          p.userId === user?.id && 
                          p.status === 'completed'
                        );
                        
                        if (!alreadyPurchased) {
                          const purchase = {
                            id: `purchase_${timestamp}_${itemId}_${user?.id || 'user_1'}`,
                            userId: user?.id || 'user_1',
                            moduleId: itemId,
                            purchaseDate: new Date().toISOString(),
                            amount: storeItems.find(item => item.id === itemId)?.price || 0,
                            status: 'completed' as const,
                            type: 'video' as const
                          };
                          newPurchases.push(purchase);
                        }
                      }
                      
                      if (newPurchases.length > 0) {
                        for (const purchase of newPurchases) {
                          await vpsDataStore.addPurchase(purchase);
                        }
                        setLocalPurchases([...localPurchases, ...newPurchases]);
                      }
                      
                      setCartItems([]);
                      setShowCheckout(false);
                      setShowThankYou(true);
                      
                      setTimeout(() => {
                        setShowThankYou(false);
                        handleSetActiveTab('videos');
                      }, 2000);
                    } catch (error) {
                      alert('Purchase failed. Please try again.');
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all duration-200"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Simple Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl text-center p-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
            <p className="text-gray-600 mb-6">Your purchase was successful</p>
            
            <div className="bg-green-50 p-4 rounded-xl mb-6">
              <p className="text-green-700 font-semibold">Content now available in My Videos</p>
            </div>
            
            <button 
              onClick={() => {
                setShowThankYou(false);
                handleSetActiveTab('videos');
              }}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
              View My Videos
            </button>
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

      {/* Universal Video Modal - Mobile Responsive */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-2">
          <div className="bg-gray-900 rounded-none sm:rounded-2xl w-full h-full sm:max-w-6xl sm:w-full sm:max-h-[95vh] sm:h-auto overflow-hidden shadow-2xl">
            {/* Header - Mobile Responsive */}
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-700">
              <h2 className="text-white font-bold text-lg sm:text-xl truncate pr-4">{selectedVideo.title}</h2>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-white text-2xl w-10 h-10 sm:w-8 sm:h-8 rounded-full hover:bg-gray-700 flex items-center justify-center transition-all flex-shrink-0"
              >
                ×
              </button>
            </div>
            
            {/* Video Player - Mobile Responsive */}
            <div className="p-2 sm:p-4">
              {selectedVideo.videoUrl && selectedVideo.videoUrl.trim() ? (
                (() => {
                  const videoUrl = selectedVideo.videoUrl;
                  
                  // YouTube videos
                  if (videoUrl.includes('youtube.com/embed/') || videoUrl.includes('youtu.be/') || videoUrl.includes('youtube.com/watch')) {
                    let embedUrl = videoUrl;
                    
                    // Convert YouTube URLs to embed format
                    if (videoUrl.includes('youtube.com/watch')) {
                      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
                      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                    } else if (videoUrl.includes('youtu.be/')) {
                      const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                    } else if (!videoUrl.includes('autoplay=1')) {
                      embedUrl = videoUrl + (videoUrl.includes('?') ? '&' : '?') + 'autoplay=1&rel=0';
                    }
                    
                    return (
                      <iframe
                        src={embedUrl}
                        className="w-full aspect-video rounded-none sm:rounded-lg"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={selectedVideo.title}
                      />
                    );
                  }
                  
                  // Google Drive videos
                  if (videoUrl.includes('drive.google.com')) {
                    let embedUrl = videoUrl;
                    
                    // Convert Google Drive URLs to embed format
                    const fileIdMatch = videoUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                    if (fileIdMatch) {
                      const fileId = fileIdMatch[1];
                      embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                    }
                    
                    return (
                      <iframe
                        src={embedUrl}
                        className="w-full aspect-video rounded-none sm:rounded-lg"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={selectedVideo.title}
                      />
                    );
                  }
                  
                  // Vimeo videos
                  if (videoUrl.includes('vimeo.com')) {
                    let embedUrl = videoUrl;
                    if (videoUrl.includes('vimeo.com/') && !videoUrl.includes('player.vimeo.com')) {
                      const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
                      embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
                    }
                    
                    return (
                      <iframe
                        src={embedUrl}
                        className="w-full aspect-video rounded-none sm:rounded-lg"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={selectedVideo.title}
                      />
                    );
                  }
                  
                  // Direct video files (MP4, WebM, etc.) or blob URLs
                  return (
                    <video 
                      controls
                      autoPlay
                      className="w-full aspect-video rounded-none sm:rounded-lg bg-black"
                      poster={selectedVideo.thumbnail}
                      controlsList="nodownload"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <source src={videoUrl} type="video/mp4" />
                      <source src={videoUrl} type="video/webm" />
                      <source src={videoUrl} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                  );
                })()
              ) : (
                <div className="w-full aspect-video bg-gray-800 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">⚠️</div>
                    <div>No video available</div>
                  </div>
                </div>
              )}
              
              {/* Video Info & Actions - Mobile Responsive */}
              <div className="mt-3 sm:mt-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-3">
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm mb-2 line-clamp-3 sm:line-clamp-none">{selectedVideo.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                      {selectedVideo.duration && <span>⏱️ {selectedVideo.duration}</span>}
                      <span>•</span>
                      <span>📂 {selectedVideo.category}</span>
                      {selectedVideo.rating && (
                        <>
                          <span>•</span>
                          <span>⭐ {selectedVideo.rating}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Playlist Button - Mobile Responsive */}
                  <button
                    onClick={() => {
                      if (playlist.includes(selectedVideo.id)) {
                        setPlaylist(prev => prev.filter(id => id !== selectedVideo.id));
                      } else {
                        setPlaylist(prev => [...prev, selectedVideo.id]);
                      }
                    }}
                    className={`flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base w-full sm:w-auto ${
                      playlist.includes(selectedVideo.id)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    <span className="text-xs sm:text-sm">
                      {playlist.includes(selectedVideo.id) ? 'Remove' : 'Add to Playlist'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Player Modal - Mobile Responsive */}
      {showAudioModal && selectedAudio && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gray-900 rounded-xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-700">
              <h3 className="text-white font-bold text-base sm:text-lg">🎧 Audio Player</h3>
              <button
                onClick={() => setShowAudioModal(false)}
                className="text-gray-400 hover:text-white text-2xl w-8 h-8 rounded-full hover:bg-gray-700 flex items-center justify-center transition-all"
              >
                ×
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-3xl">🎧</span>
                </div>
                <h4 className="text-white font-bold text-lg sm:text-xl mb-2">{selectedAudio.title}</h4>
                <p className="text-gray-400 text-sm line-clamp-2">{selectedAudio.description}</p>
              </div>
              {(() => {
                let audioSrc = selectedAudio.audioUrl;
                
                // Create fresh blob URL if we have a File object
                if (selectedAudio.audioFile && typeof selectedAudio.audioFile === 'object' && 'type' in selectedAudio.audioFile) {
                  audioSrc = URL.createObjectURL(selectedAudio.audioFile as unknown as File);
                }
                
                return audioSrc ? (
                  <audio 
                    controls 
                    autoPlay
                    className="w-full mb-4"
                    onError={(e) => {
                      console.error('Audio failed to load:', audioSrc);
                      console.log('Audio file type:', selectedAudio.audioFile?.type);
                      console.log('Audio file size:', selectedAudio.audioFile?.size);
                    }}
                    onLoadStart={() => {
                      console.log('Audio loading started:', audioSrc);
                    }}
                    onCanPlay={() => {
                      console.log('Audio can play:', audioSrc);
                    }}
                  >
                    <source src={audioSrc} type="audio/mpeg" />
                    <source src={audioSrc} type="audio/mp3" />
                    <source src={audioSrc} type="audio/wav" />
                    <source src={audioSrc} type="audio/ogg" />
                    <source src={audioSrc} type="audio/m4a" />
                    <source src={audioSrc} type="audio/aac" />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
                    <div className="text-red-400 text-center">
                      <div className="text-2xl mb-2">⚠️</div>
                      <div className="text-sm">Audio file not available</div>
                    </div>
                  </div>
                );
              })()}
              <button
                onClick={() => {
                  setShowAudioModal(false);
                  setSelectedAudio(null);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-lg"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}




    </div>
  );
}
