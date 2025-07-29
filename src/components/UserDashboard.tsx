'use client'

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Lock, 
  Star, 
  ShoppingCart, 
  Video, 
  Music, 
  Gamepad2, 
  Clock,
  LogOut,
  User as UserIcon,
  BookOpen,
  Gift,
  Crown,
  Sparkles,
  X,
  Download,
  Heart
} from 'lucide-react';
import { Kiki, Tano } from './Characters';
import { cloudDataStore } from '../utils/cloudDataStore';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  purchasedModules: string[];
  totalSpent?: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  price: number;
  ageRange: string;
  features: string[];
  fullContent: ContentItem[];
}

interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'game';
  duration: string;
  isDemo: boolean;
}

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  onPurchase?: (moduleIds: string[]) => void;
}

// Default content structure for modules
const getDefaultContent = (moduleId: string): ContentItem[] => {
  const baseContent = [
    { id: `${moduleId}-demo`, title: 'Demo Content', type: 'video' as const, duration: '5:30', isDemo: true },
    { id: `${moduleId}-lesson1`, title: 'Lesson 1', type: 'video' as const, duration: '8:15', isDemo: false },
    { id: `${moduleId}-audio`, title: 'Audio Content', type: 'audio' as const, duration: '12:00', isDemo: false },
    { id: `${moduleId}-game`, title: 'Interactive Game', type: 'game' as const, duration: '10:00', isDemo: false }
  ];
  return baseContent;
};

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout, onPurchase }) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [playingContent, setPlayingContent] = useState<ContentItem | null>(null);
  const [activeTab, setActiveTab] = useState<'my-content' | 'store'>('my-content');
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load modules from cloudDataStore
  useEffect(() => {
    const loadModules = async () => {
      try {
        setIsLoading(true);
        const data = await cloudDataStore.loadData();
        const cloudModules = data.modules.map(module => ({
          ...module,
          fullContent: getDefaultContent(module.id)
        }));
        setModules(cloudModules);
      } catch (error) {
        console.error('Error loading modules:', error);
        // Fallback to default modules if cloud data fails
        setModules([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadModules();

    // Set up real-time sync interval
    const syncInterval = setInterval(loadModules, 5000); // Sync every 5 seconds

    return () => clearInterval(syncInterval);
  }, []);

  const purchasedModules = modules.filter(module => 
    user.purchasedModules.includes(module.id)
  );

  const availableModules = modules.filter(module => 
    !user.purchasedModules.includes(module.id)
  );

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'game': return <Gamepad2 className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const isContentAccessible = (content: ContentItem, moduleId: string) => {
    return user.purchasedModules.includes(moduleId) || content.isDemo;
  };

  const handlePurchase = (moduleId: string) => {
    if (onPurchase) {
      onPurchase([moduleId]);
    }
  };

  const ContentPlayer = ({ content }: { content: ContentItem }) => {
    const moduleId = modules.find(module => 
      module.fullContent.some(c => c.id === content.id)
    )?.id || '';
    const isPurchased = user.purchasedModules.includes(moduleId);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-mali font-bold text-gray-800">{content.title}</h3>
            <button 
              onClick={() => setPlayingContent(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="aspect-video bg-gradient-to-br from-brand-blue to-brand-pink rounded-2xl flex items-center justify-center mb-6">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                {getContentIcon(content.type)}
              </div>
              <p className="font-mali text-lg mb-2">
                {content.isDemo ? 'Demo Content' : 'Full Content'} - {content.duration}
              </p>
              <p className="font-mali text-sm opacity-80">
                {content.type === 'video' && 'Educational video content'}
                {content.type === 'audio' && 'Musical learning adventure'}
                {content.type === 'game' && 'Interactive learning game'}
              </p>
            </div>
          </div>
          
          {content.isDemo && (
            <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-2xl p-4 text-center">
              <p className="font-mali text-brand-yellow font-bold">
                🎉 This is a free demo! Purchase the full module to unlock all content.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const LockedContentItem = ({ content, moduleId }: { content: ContentItem; moduleId: string }) => (
    <div className="flex items-center justify-between p-3 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 opacity-75">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-500">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <p className="font-mali font-bold text-gray-600 text-sm">{content.title}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{content.duration}</span>
            <span className="bg-gray-400 text-white px-2 py-0.5 rounded-full">LOCKED</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Crown className="w-4 h-4 text-brand-yellow" />
        <span className="text-xs font-mali text-gray-600">Premium</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b-4 border-gradient-to-r from-brand-blue to-brand-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img 
                  src="/zinga linga logo.png" 
                  alt="Zinga Linga" 
                  className="h-16 w-auto drop-shadow-lg"
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-yellow rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-mali font-bold bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
                  Welcome back, {user.name}! 🌟
                </h1>
                <p className="font-mali text-gray-600 text-lg">Ready for amazing jungle adventures?</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gradient-to-r from-brand-green/20 to-brand-blue/20 px-6 py-3 rounded-full border border-brand-green/30">
                <Crown className="w-5 h-5 text-brand-yellow" />
                <span className="font-mali text-brand-green font-bold text-lg">
                  {user.purchasedModules.length} Module{user.purchasedModules.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="font-mali font-medium text-red-600">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Loading State */}
      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mb-4"></div>
            <p className="font-mali text-lg text-gray-600">Loading your jungle adventures...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Enhanced Navigation Tabs */}
           <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
             <div className="flex gap-6 mb-10 justify-center">
            <button
              onClick={() => setActiveTab('my-content')}
              className={`group px-8 py-4 rounded-2xl font-mali font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                activeTab === 'my-content'
                  ? 'bg-gradient-to-r from-brand-green to-emerald-500 text-white shadow-2xl'
                  : 'bg-white/80 backdrop-blur-sm text-brand-green hover:bg-brand-green/10 border-2 border-brand-green/20'
              }`}
            >
              <BookOpen className="w-6 h-6 inline mr-3 group-hover:animate-bounce" />
              My Learning Journey
            </button>
            <button
              onClick={() => setActiveTab('store')}
              className={`group px-8 py-4 rounded-2xl font-mali font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                activeTab === 'store'
                  ? 'bg-gradient-to-r from-brand-blue to-blue-500 text-white shadow-2xl'
                  : 'bg-white/80 backdrop-blur-sm text-brand-blue hover:bg-brand-blue/10 border-2 border-brand-blue/20'
              }`}
            >
              <ShoppingCart className="w-6 h-6 inline mr-3 group-hover:animate-bounce" />
              Discover Modules
            </button>
          </div>

        {/* My Content Tab */}
        {activeTab === 'my-content' && (
          <div>
            {purchasedModules.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-8">
                  <Kiki />
                </div>
                <h3 className="text-2xl font-mali font-bold text-gray-800 mb-4">
                  No modules yet!
                </h3>
                <p className="font-mali text-gray-600 mb-8">
                  Start your jungle adventure by purchasing your first learning module.
                </p>
                <button
                  onClick={() => setActiveTab('store')}
                  className="bg-brand-green text-white px-8 py-3 rounded-full font-mali font-bold hover:bg-brand-green/90 transition-colors"
                >
                  Browse Modules
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedModules.map((module) => (
                  <div key={module.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="bg-gradient-to-r from-brand-green to-brand-blue p-6 text-white">
                      <h3 className="text-xl font-mali font-bold mb-2">{module.title}</h3>
                      <p className="font-mali opacity-90">{module.description}</p>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-3">
                        {module.fullContent.map((content) => (
                          <div key={content.id}>
                            {isContentAccessible(content, module.id) ? (
                              <button
                                onClick={() => setPlayingContent(content)}
                                className="w-full flex items-center justify-between p-3 bg-brand-green/10 hover:bg-brand-green/20 rounded-xl transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-brand-green text-white rounded-full flex items-center justify-center">
                                    {getContentIcon(content.type)}
                                  </div>
                                  <div className="text-left">
                                    <p className="font-mali font-bold text-gray-800 text-sm">{content.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      <Clock className="w-3 h-3" />
                                      <span>{content.duration}</span>
                                      {content.isDemo && (
                                        <span className="bg-brand-yellow text-white px-2 py-0.5 rounded-full">DEMO</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Play className="w-5 h-5 text-brand-green" />
                              </button>
                            ) : (
                              <LockedContentItem content={content} moduleId={module.id} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-mali font-bold text-gray-800 mb-4">
                Discover New Adventures
              </h2>
              <p className="font-mali text-gray-600">
                Expand your learning journey with these amazing modules
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableModules.map((module) => (
                <div key={module.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="bg-gradient-to-r from-brand-blue to-brand-pink p-6 text-white">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-mali font-bold mb-2">{module.title}</h3>
                        <p className="font-mali opacity-90">{module.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-mali font-bold">${module.price}</div>
                        <div className="text-sm opacity-80">{module.ageRange}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="font-mali font-bold text-gray-800 mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {module.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <Star className="w-3 h-3 text-brand-yellow" />
                            <span className="font-mali">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-mali font-bold text-gray-800 mb-2">Preview Content:</h4>
                      <div className="space-y-2">
                        {module.fullContent.filter(c => c.isDemo).map((content) => (
                          <button
                            key={content.id}
                            onClick={() => setPlayingContent(content)}
                            className="w-full flex items-center gap-3 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <div className="w-6 h-6 bg-brand-yellow text-white rounded-full flex items-center justify-center">
                              {getContentIcon(content.type)}
                            </div>
                            <div className="text-left flex-1">
                              <p className="font-mali font-bold text-gray-800 text-sm">{content.title}</p>
                              <p className="text-xs text-gray-600">{content.duration} • Free Preview</p>
                            </div>
                            <Play className="w-4 h-4 text-brand-yellow" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchase(module.id)}
                      className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-white py-3 rounded-xl font-mali font-bold hover:shadow-lg transition-all"
                    >
                      <Gift className="w-5 h-5 inline mr-2" />
                      Purchase Module
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          </div>
        </>
      )}

      {/* Content Player Modal */}
      {playingContent && <ContentPlayer content={playingContent} />}

      {/* Floating Characters */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="flex gap-4">
          <div className="transform hover:scale-110 transition-transform">
            <Tano />
          </div>
        </div>
      </div>
    </div>
  );
};