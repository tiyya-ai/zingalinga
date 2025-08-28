import React, { useEffect } from 'react';

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

interface VideoModalWithSidebarProps {
  selectedVideo: Video;
  onClose: () => void;
  packages: any[];
  allModules: any[];
  isItemPurchased: (id: string) => boolean;
  setSelectedVideo: (video: Video) => void;
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
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-2"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gray-900 rounded-none sm:rounded-2xl w-full h-full sm:max-w-7xl sm:w-full sm:max-h-[95vh] sm:h-auto overflow-hidden shadow-2xl flex">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex justify-end items-center p-3 sm:p-4 border-b border-gray-700">
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
          
          {/* Video Player */}
          <div className="p-2 sm:p-4 flex-1">
            {selectedVideo.videoUrl && selectedVideo.videoUrl.trim() ? (
              (() => {
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
              })()
            ) : (
              <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4">🎬</div>
                  <div className="text-xl">Video not available</div>
                  <div className="text-sm mt-2">URL: {selectedVideo.videoUrl ? 'Present but invalid' : 'Missing'}</div>
                </div>
              </div>
            )}
            
            {/* Video Info */}
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-white text-xl font-bold mb-2">{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p className="text-gray-300 text-sm mb-4">{selectedVideo.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                {selectedVideo.duration && selectedVideo.duration !== '5:00' && <span>⏱️ {selectedVideo.duration}</span>}
                {selectedVideo.duration && selectedVideo.duration !== '5:00' && <span>•</span>}
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
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-bold text-sm flex items-center">
                <span className="mr-2">🎬</span>
                More Videos
              </h3>
              <p className="text-gray-400 text-xs mt-1">{relatedVideos.length} videos available</p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
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
                        category: video.category || 'Videos',
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
                            <span className="text-gray-400 text-xs">🎬</span>
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
                          {video.duration && video.duration !== '5:00' && (
                            <span className="text-gray-400 text-xs">{video.duration}</span>
                          )}
                          {video.category && (
                            <span className="text-gray-500 text-xs">• {video.category}</span>
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