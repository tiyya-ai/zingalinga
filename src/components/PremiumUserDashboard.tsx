import React, { useState, useEffect } from 'react';
import { User, Module, Purchase, ContentFile } from '../types';
import { vpsDataStore } from '../utils/vpsDataStore';

// Premium Icons
const Icons = {
  Play: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 4h10a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Youtube: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  Image: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Video: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Star: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
};

interface PremiumUserDashboardProps {
  user: User;
  modules: Module[];
  purchases: Purchase[];
  contentFiles: ContentFile[];
  onModuleUpdate: (modules: Module[]) => void;
  onLogout: () => void;
  onPurchase: (moduleId: string) => void;
}

interface VideoUpload {
  id: string;
  title: string;
  description: string;
  videoSource: 'file' | 'youtube' | 'url';
  videoUrl: string;
  coverImage: string;
  coverSource: 'file' | 'url';
  duration: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export const PremiumUserDashboard: React.FC<PremiumUserDashboardProps> = ({
  user,
  modules,
  purchases,
  contentFiles,
  onModuleUpdate,
  onLogout,
  onPurchase
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'favorites'>('library');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userVideos, setUserVideos] = useState<VideoUpload[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    videoSource: 'file' as 'file' | 'youtube' | 'url',
    videoUrl: '',
    videoFile: null as File | null,
    coverSource: 'file' as 'file' | 'url',
    coverUrl: '',
    coverFile: null as File | null,
    category: 'educational',
    tags: ''
  });

  const purchasedModules = modules.filter(module => 
    purchases.some(purchase => purchase.moduleId === module.id)
  );

  const availableModules = modules.filter(module => 
    !purchases.some(purchase => purchase.moduleId === module.id)
  );

  const handleVideoUpload = () => {
    if (!uploadForm.title || (!uploadForm.videoFile && !uploadForm.videoUrl)) {
      alert('Please fill in required fields');
      return;
    }

    const newVideo: VideoUpload = {
      id: `user_video_${Date.now()}`,
      title: uploadForm.title,
      description: uploadForm.description,
      videoSource: uploadForm.videoSource,
      videoUrl: uploadForm.videoSource === 'file' ? 
        URL.createObjectURL(uploadForm.videoFile!) : uploadForm.videoUrl,
      coverImage: uploadForm.coverSource === 'file' && uploadForm.coverFile ? 
        URL.createObjectURL(uploadForm.coverFile) : uploadForm.coverUrl || '/images/default-video-cover.jpg',
      coverSource: uploadForm.coverSource,
      duration: '0:00', // Would be calculated from actual video
      category: uploadForm.category,
      tags: uploadForm.tags.split(',').map(tag => tag.trim()),
      createdAt: new Date().toISOString()
    };

    setUserVideos([...userVideos, newVideo]);
    setShowUploadModal(false);
    setUploadForm({
      title: '',
      description: '',
      videoSource: 'file',
      videoUrl: '',
      videoFile: null,
      coverSource: 'file',
      coverUrl: '',
      coverFile: null,
      category: 'educational',
      tags: ''
    });
  };

  const toggleFavorite = (moduleId: string) => {
    setFavorites(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = extractYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Icons.Video />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Video Library</h1>
                <p className="text-gray-600">Welcome back, {user.name}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <Icons.Plus />
                <span>Upload Video</span>
              </button>
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icons.Logout />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm">
          {[
            { id: 'library', label: 'My Library', icon: Icons.Video },
            { id: 'upload', label: 'My Uploads', icon: Icons.Upload },
            { id: 'favorites', label: 'Favorites', icon: Icons.Heart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === 'library' && (
          <div className="space-y-8">
            {/* Purchased Videos */}
            {purchasedModules.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Purchased Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {purchasedModules.map((module) => (
                    <div key={module.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                      <div className="relative">
                        <img
                          src={module.demoVideo || '/images/default-video-cover.jpg'}
                          alt={module.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <button className="bg-white bg-opacity-90 text-purple-600 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-opacity-100">
                            <Icons.Play />
                          </button>
                        </div>
                        <button
                          onClick={() => toggleFavorite(module.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                            favorites.includes(module.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100'
                          }`}
                        >
                          <Icons.Heart />
                        </button>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{module.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{module.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Icons.Star key={i} />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">({module.totalRatings})</span>
                          </div>
                          <span className="text-sm text-purple-600 font-medium">{module.estimatedDuration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Videos */}
            {availableModules.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Discover New Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {availableModules.map((module) => (
                    <div key={module.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                      <div className="relative">
                        <img
                          src={module.demoVideo || '/images/default-video-cover.jpg'}
                          alt={module.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <button 
                            onClick={() => onPurchase(module.id)}
                            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:from-purple-600 hover:to-blue-600"
                          >
                            Buy ${module.price}
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{module.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{module.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Icons.Star key={i} />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">({module.totalRatings})</span>
                          </div>
                          <span className="text-xl font-bold text-purple-600">${module.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Uploaded Videos</h2>
            {userVideos.length === 0 ? (
              <div className="text-center py-12">
                <Icons.Upload />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No videos uploaded yet</h3>
                <p className="text-gray-600 mb-6">Start by uploading your first video!</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                >
                  Upload Video
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userVideos.map((video) => (
                  <div key={video.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="relative">
                      <img
                        src={video.coverImage}
                        alt={video.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <button className="bg-white bg-opacity-90 text-purple-600 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-opacity-100">
                          <Icons.Play />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{video.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-600 font-medium">{video.category}</span>
                        <span className="text-sm text-gray-600">{video.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Favorite Videos</h2>
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Icons.Heart />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-600">Add videos to your favorites by clicking the heart icon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {modules.filter(module => favorites.includes(module.id)).map((module) => (
                  <div key={module.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="relative">
                      <img
                        src={module.demoVideo || '/images/default-video-cover.jpg'}
                        alt={module.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <button className="bg-white bg-opacity-90 text-purple-600 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-opacity-100">
                          <Icons.Play />
                        </button>
                      </div>
                      <button
                        onClick={() => toggleFavorite(module.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white transition-all duration-200"
                      >
                        <Icons.Heart />
                      </button>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{module.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{module.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Icons.Star key={i} />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">({module.totalRatings})</span>
                        </div>
                        <span className="text-sm text-purple-600 font-medium">{module.estimatedDuration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Upload New Video</h2>
              <p className="text-gray-600">Add a video from your computer, YouTube, or URL</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video Title *</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter video title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe your video"
                  />
                </div>
              </div>

              {/* Video Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Video Source *</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { id: 'file', label: 'Upload File', icon: Icons.Upload },
                    { id: 'youtube', label: 'YouTube', icon: Icons.Youtube },
                    { id: 'url', label: 'Video URL', icon: Icons.Video }
                  ].map((source) => (
                    <button
                      key={source.id}
                      onClick={() => setUploadForm({...uploadForm, videoSource: source.id as any})}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center space-y-2 transition-all duration-200 ${
                        uploadForm.videoSource === source.id
                          ? 'border-purple-500 bg-purple-50 text-purple-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <source.icon />
                      <span className="text-sm font-medium">{source.label}</span>
                    </button>
                  ))}
                </div>

                {uploadForm.videoSource === 'file' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                    <Icons.Upload />
                    <p className="text-gray-600 mb-2">Drop your video file here or click to browse</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setUploadForm({...uploadForm, videoFile: e.target.files?.[0] || null})}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors"
                    >
                      Choose File
                    </label>
                    {uploadForm.videoFile && (
                      <p className="text-sm text-green-600 mt-2">Selected: {uploadForm.videoFile.name}</p>
                    )}
                  </div>
                )}

                {(uploadForm.videoSource === 'youtube' || uploadForm.videoSource === 'url') && (
                  <input
                    type="url"
                    value={uploadForm.videoUrl}
                    onChange={(e) => setUploadForm({...uploadForm, videoUrl: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={uploadForm.videoSource === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://example.com/video.mp4'}
                  />
                )}
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Cover Image</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { id: 'file', label: 'Upload Image', icon: Icons.Image },
                    { id: 'url', label: 'Image URL', icon: Icons.Video }
                  ].map((source) => (
                    <button
                      key={source.id}
                      onClick={() => setUploadForm({...uploadForm, coverSource: source.id as any})}
                      className={`p-3 border-2 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 ${
                        uploadForm.coverSource === source.id
                          ? 'border-purple-500 bg-purple-50 text-purple-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <source.icon />
                      <span className="text-sm font-medium">{source.label}</span>
                    </button>
                  ))}
                </div>

                {uploadForm.coverSource === 'file' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadForm({...uploadForm, coverFile: e.target.files?.[0] || null})}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors"
                    >
                      Choose Image
                    </label>
                    {uploadForm.coverFile && (
                      <p className="text-sm text-green-600 mt-2">Selected: {uploadForm.coverFile.name}</p>
                    )}
                  </div>
                )}

                {uploadForm.coverSource === 'url' && (
                  <input
                    type="url"
                    value={uploadForm.coverUrl}
                    onChange={(e) => setUploadForm({...uploadForm, coverUrl: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                )}

                {/* Auto-generate thumbnail for YouTube */}
                {uploadForm.videoSource === 'youtube' && uploadForm.videoUrl && (
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        const thumbnail = getYouTubeThumbnail(uploadForm.videoUrl);
                        if (thumbnail) {
                          setUploadForm({...uploadForm, coverUrl: thumbnail, coverSource: 'url'});
                        }
                      }}
                      className="text-purple-600 text-sm hover:text-purple-700 transition-colors"
                    >
                      Auto-generate thumbnail from YouTube
                    </button>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="educational">Educational</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="music">Music</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVideoUpload}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
              >
                Upload Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};