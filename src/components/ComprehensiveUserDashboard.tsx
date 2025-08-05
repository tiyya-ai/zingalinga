'use client';

import React, { useState, useEffect } from 'react';
import { User, Module, Purchase } from '../types';

interface ComprehensiveUserDashboardProps {
  user?: User;
  modules?: Module[];
  purchases?: Purchase[];
  onLogout?: () => void;
  onPurchase?: (moduleId: string) => void;
}

export default function ComprehensiveUserDashboard({
  user,
  modules = [],
  purchases = [],
  onLogout,
  onPurchase
}: ComprehensiveUserDashboardProps) {
  const [activeTab, setActiveTab] = useState('all-content');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [liveModules, setLiveModules] = useState<Module[]>(modules);

  useEffect(() => {
    loadLatestModules();
  }, []);

  const loadLatestModules = async () => {
    try {
      const { vpsDataStore } = await import('../utils/vpsDataStore');
      const data = await vpsDataStore.loadData();
      if (data.modules) {
        setLiveModules(data.modules);
      }
    } catch (error) {
      console.warn('Error loading modules:', error);
    }
  };

  const categories = ['All', 'Audio Lessons', 'Video Lessons', 'PP1 Program', 'PP2 Program'];
  const allContent = liveModules.filter(module => module.isVisible !== false);

  const filteredContent = allContent.filter(content => {
    const matchesCategory = selectedCategory === 'All' || content.category === selectedCategory;
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">Z</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Zinga Linga Learning</h1>
                <p className="text-gray-600">Comprehensive Educational Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{(user?.name || 'User').charAt(0)}</span>
                </div>
                <span className="font-medium text-gray-700">{user?.name || 'User'}</span>
              </div>
              <button 
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Content</p>
                <p className="text-3xl font-bold text-gray-900">{allContent.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Audio Lessons</p>
                <p className="text-3xl font-bold text-blue-600">{allContent.filter(c => c.category === 'Audio Lessons').length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎧</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Video Lessons</p>
                <p className="text-3xl font-bold text-green-600">{allContent.filter(c => c.category === 'Video Lessons').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📹</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Programs</p>
                <p className="text-3xl font-bold text-purple-600">{allContent.filter(c => c.category?.includes('PP')).length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search all content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Categories Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'all-content', label: 'All Content', icon: '📚' },
            { id: 'audio-lessons', label: 'Audio Lessons', icon: '🎧' },
            { id: 'video-lessons', label: 'Video Lessons', icon: '📹' },
            { id: 'pp1-program', label: 'PP1 Program', icon: '📖' },
            { id: 'pp2-program', label: 'PP2 Program', icon: '📘' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredContent.length > 0 ? (
            filteredContent.map((content) => (
              <div key={content.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="relative">
                  <div className={`w-full h-48 bg-gradient-to-br ${getContentColor(content.category || '')} flex items-center justify-center`}>
                    <div className="text-6xl">{getContentIcon(content.type || '', content.category || '')}</div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-sm font-semibold">
                      ${content.price || 0}
                    </span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 rounded-full text-sm font-semibold text-white ${
                      content.accessLevel === 'free' ? 'bg-green-500' :
                      content.accessLevel === 'premium' ? 'bg-purple-500' :
                      'bg-blue-500'
                    }`}>
                      {content.accessLevel === 'free' ? 'FREE' : 
                       content.accessLevel === 'premium' ? 'PREMIUM' : 'PAID'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      content.category === 'Audio Lessons' ? 'bg-blue-100 text-blue-800' :
                      content.category === 'Video Lessons' ? 'bg-green-100 text-green-800' :
                      content.category === 'PP1 Program' ? 'bg-orange-100 text-orange-800' :
                      content.category === 'PP2 Program' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {content.category || 'Content'}
                    </span>
                    {content.duration && (
                      <span className="text-xs text-gray-500">⏱️ {content.duration}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{content.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{content.description || 'No description available'}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {content.aiTags && content.aiTags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {content.hasPreview && (
                      <span className="text-xs text-blue-600 font-medium">👁️ Preview Available</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {content.hasPreview && (
                      <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-all duration-300 font-semibold text-sm">
                        Preview
                      </button>
                    )}
                    <button
                      onClick={() => onPurchase && onPurchase(content.id)}
                      className={`flex-1 px-4 py-2 rounded-full font-semibold transition-all duration-300 text-sm ${
                        content.accessLevel === 'free' 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : `bg-gradient-to-r ${getContentColor(content.category || '')} hover:shadow-lg text-white`
                      }`}
                    >
                      {content.accessLevel === 'free' ? 'Access Free' : `Buy $${content.price || 0}`}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No content found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Content Summary */}
        {filteredContent.length > 0 && (
          <div className="mt-12 bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Content Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredContent.filter(c => c.accessLevel === 'free').length}</div>
                <div className="text-sm text-gray-600">Free Content</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{filteredContent.filter(c => c.accessLevel === 'paid').length}</div>
                <div className="text-sm text-gray-600">Paid Content</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{filteredContent.filter(c => c.accessLevel === 'premium').length}</div>
                <div className="text-sm text-gray-600">Premium Content</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{filteredContent.filter(c => c.hasPreview).length}</div>
                <div className="text-sm text-gray-600">With Preview</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}