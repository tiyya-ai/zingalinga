import React, { useEffect } from 'react';

interface Content {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  description: string;
  videoUrl?: string;
  audioUrl?: string;
  category: string;
  type?: string;
  isPremium: boolean;
  price?: number;
  rating?: number;
  views?: number;
  tags?: string[];
  isYouTube?: boolean;
}

interface VideoModalWithSidebarProps {
  selectedVideo: Content;
  onClose: () => void;
  packages: any[];
  allModules: any[];
  isItemPurchased: (id: string) => boolean;
  setSelectedVideo: (content: Content) => void;
}

export const VideoModalWithSidebar: React.FC<VideoModalWithSidebarProps> = ({
  selectedVideo,
  onClose,
  packages,
  allModules,
  isItemPurchased,
  setSelectedVideo
}) => {
  // Get related videos from same package first, then same category
  const getRelatedVideos = () => {
    // Find which package contains the current video
    const currentPackage = packages.find(pkg => 
      pkg.contentIds?.includes(selectedVideo.id)
    );
    
    let relatedVideos = [];
    
    // First priority: Videos from the same package
    if (currentPackage) {
      const packageVideos = allModules.filter(video => 
        video.id !== selectedVideo.id && 
        currentPackage.contentIds?.includes(video.id)
      );
      relatedVideos.push(...packageVideos);
    }
    
    // Second priority: Videos from the same category (not already included)
    const categoryVideos = allModules.filter(video => 
      video.id !== selectedVideo.id && 
      video.category === selectedVideo.category &&
      !relatedVideos.some(rv => rv.id === video.id)
    );
    relatedVideos.push(...categoryVideos);
    
    // Third priority: Other videos (not already included)
    const otherVideos = allModules.filter(video => 
      video.id !== selectedVideo.id &&
      !relatedVideos.some(rv => rv.id === video.id)
    );
    relatedVideos.push(...otherVideos);
    
    return relatedVideos.slice(0, 20); // Limit to 20 videos
  };
  
  const relatedVideos = getRelatedVideos();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gray-900 rounded-none sm:rounded-2xl w-full h-full sm:max-w-6xl lg:max-w-7xl sm:w-full sm:max-h-[95vh] sm:h-auto overflow-hidden shadow-2xl flex flex-col lg:flex-row">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex justify-end items-center p-3 sm:p-4 border-b border-gray-700 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-400 hover:text-white text-2xl w-10 h-10 sm:w-8 sm:h-8 rounded-full hover:bg-gray-700 flex items-center justify-center transition-all flex-shrink-0 z-10"
            >
              ×
            </button>
          </div>
          
          {/* Content Player */}
          <div className="p-2 sm:p-4 flex-1 overflow-y-auto">
            {(() => {
              // Check if this content requires upgrade payment
              const isPurchased = isItemPurchased(selectedVideo.id);
              const hasPrice = selectedVideo.price && selectedVideo.price > 0;
              const isInPackage = packages.some(pkg => pkg.contentIds?.includes(selectedVideo.id));
              const packageOwned = packages.some(pkg => pkg.contentIds?.includes(selectedVideo.id) && isItemPurchased(pkg.id));
              const needsUpgrade = hasPrice && isInPackage && packageOwned && !isPurchased;
              
              // If content needs upgrade and not purchased, show upgrade screen
              if (needsUpgrade) {
                return (
                  <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">⬆️</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Upgrade Required</h3>
                      <p className="text-gray-300 mb-6">This premium content requires an upgrade to access.</p>
                      <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 mb-6">
                        <div className="text-orange-400 font-bold text-xl">${selectedVideo.price}</div>
                        <div className="text-orange-300 text-sm">One-time upgrade fee</div>
                      </div>
                      <button 
                        onClick={() => {
                          // Add to cart or show purchase modal
                          alert(`Upgrade for $${selectedVideo.price} to access this content`);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                      >
                        Upgrade Now - ${selectedVideo.price}
                      </button>
                    </div>
                  </div>
                );
              }
              
              // If not purchased at all, show lock screen
              if (!isPurchased && !packageOwned) {
                return (
                  <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🔒</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Purchase Required</h3>
                      <p className="text-gray-300 mb-6">You need to purchase this content to watch it.</p>
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                        <div className="text-red-400 font-bold text-xl">${selectedVideo.price || 0}</div>
                        <div className="text-red-300 text-sm">Purchase price</div>
                      </div>
                      <button 
                        onClick={() => {
                          alert(`Purchase for $${selectedVideo.price || 0} to access this content`);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                      >
                        Purchase Now - ${selectedVideo.price || 0}
                      </button>
                    </div>
                  </div>
                );
              }
              
              // If we showed upgrade/purchase screen, don't show anything else
              return 'BLOCKED';
            })()}
            
            {/* Only show content if not blocked */}
            {(() => {
              const isPurchased = isItemPurchased(selectedVideo.id);
              const hasPrice = selectedVideo.price && selectedVideo.price > 0;
              const isInPackage = packages.some(pkg => pkg.contentIds?.includes(selectedVideo.id));
              const packageOwned = packages.some(pkg => pkg.contentIds?.includes(selectedVideo.id) && isItemPurchased(pkg.id));
              const needsUpgrade = hasPrice && isInPackage && packageOwned && !isPurchased;
              const canAccess = isPurchased || (packageOwned && !hasPrice);
              
              // If blocked, don't render anything
              if (needsUpgrade || (!isPurchased && !packageOwned)) {
                return null;
              }
              
              // Audio Content
              if (canAccess && (selectedVideo.category === 'Audio Lessons' || selectedVideo.type === 'audio') && (selectedVideo.audioUrl || selectedVideo.videoUrl)) {
                return (
              <div className="w-full aspect-video bg-gray-800 rounded-lg flex flex-col justify-center p-8">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🎧</span>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">{selectedVideo.title}</h3>
                  <p className="text-gray-400 text-sm">Audio Lesson</p>
                </div>
                
                {(() => {
                  let audioSrc = selectedVideo.audioUrl || selectedVideo.videoUrl;
                  
                  // Handle File objects
                  if (typeof audioSrc === 'object' && 'type' in audioSrc) {
                    audioSrc = URL.createObjectURL(audioSrc as unknown as File);
                  }
                  
                  return (
                    <audio 
                      controls 
                      autoPlay
                      className="w-full"
                      style={{ height: '54px' }}
                    >
                      <source src={audioSrc} type="audio/mpeg" />
                      <source src={audioSrc} type="audio/mp3" />
                      <source src={audioSrc} type="audio/wav" />
                      <source src={audioSrc} type="audio/ogg" />
                      Your browser does not support the audio element.
                    </audio>
                  );
                })()}
              </div>
                );
              }
              
              // Video Content
              if (canAccess && selectedVideo.videoUrl && selectedVideo.videoUrl.trim()) {
                return (() => {
                let videoUrl = selectedVideo.videoUrl;
                
                // Handle File objects by creating blob URLs
                if (typeof videoUrl === 'object' && 'type' in videoUrl) {
                  videoUrl = URL.createObjectURL(videoUrl as unknown as File);
                  console.log('Created blob URL for video:', videoUrl);
                }
                
                // Vimeo videos FIRST (before other checks)
                if (videoUrl.includes('vimeo.com')) {
                  let embedUrl = videoUrl;
                  const vimeoIdMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
                  if (vimeoIdMatch) {
                    const videoId = vimeoIdMatch[1];
                    embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;
                  }
                  
                  console.log('🎬 Loading Vimeo video:', embedUrl);
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
                
                // YouTube videos
                if (videoUrl.includes('youtube.com/embed/') || videoUrl.includes('youtu.be/') || videoUrl.includes('youtube.com/watch')) {
                  let embedUrl = videoUrl;
                  
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
                
                // Vimeo videos (including private)
                if (videoUrl.includes('vimeo.com') || videoUrl.includes('player.vimeo.com')) {
                  let embedUrl = videoUrl;
                  
                  const vimeoIdMatch = videoUrl.match(/vimeo\.com\/(\d+)/) || videoUrl.match(/player\.vimeo\.com\/video\/(\d+)/);
                  if (vimeoIdMatch) {
                    const videoId = vimeoIdMatch[1];
                    embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;
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
                
                // Direct video files (including blob URLs and data URLs)
                return (
                  <video 
                    controls
                    autoPlay
                    className="w-full aspect-video rounded-none sm:rounded-lg bg-black"
                    poster={selectedVideo.thumbnail}
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    onError={(e) => {
                      console.error('Video failed to load:', videoUrl);
                      console.log('Video URL type:', typeof videoUrl);
                      console.log('Video URL length:', videoUrl.length);
                    }}
                    onLoadStart={() => {
                      console.log('Video loading started:', videoUrl.substring(0, 100) + '...');
                    }}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    <source src={videoUrl} type="video/webm" />
                    <source src={videoUrl} type="video/ogg" />
                    <source src={videoUrl} type="video/avi" />
                    <source src={videoUrl} type="video/mov" />
                    Your browser does not support the video tag.
                  </video>
                );
              })();
              }
              
              // Fallback for accessible content without valid URLs
              return (
                <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">
                      {selectedVideo.category === 'Audio Lessons' || selectedVideo.type === 'audio' ? '🎧' : 
                       selectedVideo.category === 'PP1 Program' ? '📚' : '🎬'}
                    </div>
                    <div className="text-xl">
                      {selectedVideo.category === 'Audio Lessons' || selectedVideo.type === 'audio' ? 'Audio not available' :
                       selectedVideo.category === 'PP1 Program' ? 'Content available' : 'Video not available'}
                    </div>
                    <div className="text-sm mt-2">
                      {selectedVideo.category === 'PP1 Program' ? 'Educational content ready to access' :
                       `URL: ${(selectedVideo.videoUrl || selectedVideo.audioUrl) ? 'Present but invalid' : 'Missing'}`}
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {/* Video Info */}
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-white text-xl font-bold mb-2">{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p className="text-gray-300 text-sm mb-4">{selectedVideo.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                <span>📦 {(() => {
                  const currentPackage = packages.find(pkg => pkg.contentIds?.includes(selectedVideo.id));
                  return currentPackage ? currentPackage.name : selectedVideo.category;
                })()}</span>
                {selectedVideo.rating && (
                  <>
                    <span>•</span>
                    <span>⭐ {selectedVideo.rating}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Videos Sidebar */}
        {relatedVideos.length > 0 && (
          <div className="w-full lg:w-80 bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-700 flex flex-col max-h-64 lg:max-h-none">
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
              <h3 className="text-white font-bold text-sm flex items-center">
                <span className="mr-2">📚</span>
                More Content
              </h3>
              <p className="text-gray-400 text-xs mt-1">{relatedVideos.length} items available</p>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-0">
              {relatedVideos.map((video, index) => {
                if (!video) return null;
                const isCurrentVideo = video.id === selectedVideo.id;
                
                const isPurchased = isItemPurchased(video.id);
                const isLocked = video.isPremium && !isPurchased;
                
                return (
                  <div
                    key={video.id}
                    onClick={() => {
                      const newVideo = {
                        id: video.id,
                        title: video.title,
                        thumbnail: video.thumbnail || '',
                        duration: video.duration || '',
                        description: video.description || '',
                        videoUrl: video.videoUrl || '',
                        audioUrl: video.audioUrl || '',
                        category: video.category || 'Videos',
                        type: video.type,
                        isPremium: video.isPremium || false,
                        price: video.price || 0,
                        isYouTube: video.videoUrl?.includes('youtube'),
                        isVimeo: video.videoUrl?.includes('vimeo')
                      };
                      setSelectedVideo(newVideo);
                    }}
                    className={`p-3 border-b border-gray-700/50 cursor-pointer transition-colors hover:bg-gray-700/50 ${
                      isLocked ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 relative">
                        {video.thumbnail ? (
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-16 h-12 object-cover rounded bg-gray-700"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">
                              {video.category === 'Audio Lessons' || video.type === 'audio' ? '🎧' :
                               video.category === 'PP1 Program' ? '📚' : '🎬'}
                            </span>
                          </div>
                        )}
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                            <span className="text-yellow-400 text-xs">🔒</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-2 text-white">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {video.category && (
                            <span className="text-gray-500 text-xs">{video.category}</span>
                          )}
                        </div>
                        {isLocked && (
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-400 text-xs">Premium • ${video.price || 0}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};