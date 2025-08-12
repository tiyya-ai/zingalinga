'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  Chip,
  Card,
  CardBody,
  Divider
} from '@nextui-org/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Lock,
  ShoppingCart,
  Star,
  Clock,
  Eye,
  AlertCircle,
  Trophy
} from 'lucide-react';
import { User, Module, Purchase } from '../types';
import { checkVideoAccess, getVideoUrl } from '../utils/videoAccess';

interface CleanVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module;
  user: User | null;
  purchases: Purchase[];
  onPurchase: (moduleId: string) => void;
  allModules?: Module[];
  onVideoSelect?: (moduleId: string) => void;
}

// Helper function to detect video type
const getVideoType = (url: string) => {
  if (!url) return 'none';
  
  // YouTube detection
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  
  // Vimeo detection
  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  
  // Google Drive detection
  if (url.includes('drive.google.com')) {
    return 'googledrive';
  }
  
  // Direct video file detection
  if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i)) {
    return 'direct';
  }
  
  // Default to iframe for other embedded content
  return 'iframe';
};

// Helper function to get YouTube embed URL
const getYouTubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?enablejsapi=1&rel=0&modestbranding=1`;
  }
  
  return url;
};

// Helper function to get Vimeo embed URL
const getVimeoEmbedUrl = (url: string) => {
  const regExp = /vimeo\.com\/(?:.*\/)?(\d+)/;
  const match = url.match(regExp);
  
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0`;
  }
  
  return url;
};

// Helper function to get Google Drive embed URL
const getGoogleDriveEmbedUrl = (url: string) => {
  const regExp = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(?:\/view|\/edit)?/;
  const match = url.match(regExp);
  
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  
  return url;
};

export const CleanVideoPlayer: React.FC<CleanVideoPlayerProps> = ({
  isOpen,
  onClose,
  module,
  user,
  purchases,
  onPurchase,
  allModules = [],
  onVideoSelect
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessResult, setAccessResult] = useState({ hasAccess: false, isDemo: false, requiresPurchase: true, reason: 'Loading...' });

  // Check access when component mounts or dependencies change
  useEffect(() => {
    const checkAccess = async () => {
      const result = await checkVideoAccess(user, module, purchases);
      setAccessResult({
        hasAccess: result.hasAccess,
        isDemo: result.isDemo || false,
        requiresPurchase: result.requiresPurchase || false,
        reason: result.reason || 'Unknown'
      });
    };
    checkAccess();
  }, [user, module, purchases]);

  const videoUrl = getVideoUrl(module, accessResult.hasAccess);
  const videoType = getVideoType(videoUrl);

  // Get related videos from the same category
  const getRelatedVideos = () => {
    if (!allModules.length || !module.category) return [];
    
    return allModules
      .filter(m => 
        m.id !== module.id && // Exclude current video
        m.category?.toLowerCase() === module.category?.toLowerCase() // Same category
      )
      .slice(0, 6); // Limit to 6 related videos
  };

  const relatedVideos = getRelatedVideos();

  // Get the appropriate embed URL based on video type
  const getEmbedUrl = () => {
    switch (videoType) {
      case 'youtube':
        return getYouTubeEmbedUrl(videoUrl);
      case 'vimeo':
        return getVimeoEmbedUrl(videoUrl);
      case 'googledrive':
        return getGoogleDriveEmbedUrl(videoUrl);
      case 'iframe':
        return videoUrl;
      default:
        return videoUrl;
    }
  };

  useEffect(() => {
    if (videoType === 'direct' && videoRef.current) {
      const video = videoRef.current;

      const updateTime = () => setCurrentTime(video.currentTime);
      const updateDuration = () => {
        setDuration(video.duration);
        setIsLoading(false);
      };
      const handleLoadStart = () => setIsLoading(true);
      const handleError = (e: any) => {
        console.error('Video error:', e);
        setError('Failed to load video. Please check the video URL.');
        setIsLoading(false);
      };
      const handleCanPlay = () => setIsLoading(false);

      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('loadedmetadata', updateDuration);
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('error', handleError);
      video.addEventListener('canplay', handleCanPlay);

      return () => {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', updateDuration);
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('error', handleError);
        video.removeEventListener('canplay', handleCanPlay);
      };
    } else if (videoType !== 'none') {
      setIsLoading(false);
      setError(null);
    }
  }, [videoUrl, videoType]);

  useEffect(() => {
    let hideControlsTimer: NodeJS.Timeout;
    
    if (isPlaying && showControls && videoType === 'direct') {
      hideControlsTimer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (hideControlsTimer) {
        clearTimeout(hideControlsTimer);
      }
    };
  }, [isPlaying, showControls, videoType]);

  // Reset video state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setError(null);
      setIsLoading(true);
    }
  }, [isOpen]);

  // Disable developer tools and keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isOpen]);

  const togglePlay = () => {
    if (!accessResult.hasAccess && !accessResult.isDemo) return;
    
    if (videoType === 'direct' && videoRef.current) {
      const videoElement = videoRef.current;
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (newTime: number) => {
    if (!accessResult.hasAccess && !accessResult.isDemo) return;
    
    if (videoType === 'direct' && videoRef.current) {
      const videoElement = videoRef.current;
      videoElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoType === 'direct' && videoRef.current) {
      const videoElement = videoRef.current;
      videoElement.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoType === 'direct' && videoRef.current) {
      const videoElement = videoRef.current;
      const newMuted = !isMuted;
      videoElement.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const toggleFullscreen = () => {
    const element = videoRef.current || iframeRef.current;
    if (!element) return;

    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const skipTime = (seconds: number) => {
    if (!accessResult.hasAccess && !accessResult.isDemo) return;
    
    if (videoType === 'direct' && videoRef.current) {
      const videoElement = videoRef.current;
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleRelatedVideoClick = (relatedModule: Module) => {
    if (onVideoSelect) {
      onVideoSelect(relatedModule.id);
    }
  };

  const renderAccessDeniedContent = () => (
    <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-lg">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-bold">Premium Content</h3>
        <p className="text-gray-300 max-w-md">
          {accessResult.reason === 'User not logged in' 
            ? 'Please log in to access this content.'
            : 'This video requires a purchase to watch. Get instant access and support our creators!'
          }
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>{module.rating || 4.5}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{module.duration || module.estimatedDuration || '30 min'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{module.category || 'Educational'}</span>
          </div>
        </div>
        {accessResult.requiresPurchase && user && (
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold"
            startContent={<ShoppingCart className="w-5 h-5" />}
            onClick={() => onPurchase(module.id)}
          >
            Purchase for ${module.price}
          </Button>
        )}
      </div>
    </div>
  );

  const renderVideoPlayer = () => {
    if (!videoUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-800 text-white rounded-lg">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Video Available</h3>
          <p className="text-gray-300">This video doesn't have a valid URL.</p>
        </div>
      );
    }

    return (
      <div 
        className="relative bg-black rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Video Content */}
        {videoType === 'direct' ? (
          <div 
            className="relative w-full h-64 md:h-96"
            onContextMenu={(e) => e.preventDefault()}
            onSelectStart={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster={module.thumbnail}
              preload="metadata"
              onClick={togglePlay}
              src={videoUrl}
              crossOrigin="anonymous"
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Overlay to prevent right-click */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 1 }}
            />
          </div>
        ) : (
          <div 
            className="relative w-full h-64 md:h-96"
            onContextMenu={(e) => e.preventDefault()}
            onSelectStart={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <iframe
              ref={iframeRef}
              src={getEmbedUrl()}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={module.title}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError('Failed to load embedded video');
                setIsLoading(false);
              }}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400 mb-2">{error}</p>
              <Button
                size="sm"
                variant="ghost"
                className="text-white"
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Video Controls (only for direct videos) */}
        {showControls && videoType === 'direct' && (accessResult.hasAccess || accessResult.isDemo) && !isLoading && !error && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <Progress
                value={(currentTime / duration) * 100}
                className="cursor-pointer"
                classNames={{
                  indicator: "bg-gradient-to-r from-purple-500 to-blue-500"
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = (clickX / rect.width) * duration;
                  handleSeek(newTime);
                }}
              />

            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-white"
                  onClick={() => skipTime(-10)}
                >
                  <SkipBack className="w-5 h-5" />
                </Button>
                
                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-white"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
                
                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-white"
                  onClick={() => skipTime(10)}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-white"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                
                <div className="w-20">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-white"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Play Button Overlay (only for direct videos) */}
        {!isPlaying && videoType === 'direct' && (accessResult.hasAccess || accessResult.isDemo) && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              isIconOnly
              className="w-16 h-16 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30"
              onClick={togglePlay}
            >
              <Play className="w-8 h-8" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderRelatedVideos = () => {
    if (relatedVideos.length === 0) {
      return (
        <div className="text-center py-8">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">No related videos found</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {relatedVideos.map((relatedModule) => {
          // Use simple check for related videos to avoid async issues
          const isPurchased = user?.purchasedModules?.includes(relatedModule.id) || 
                            purchases.some(p => p.userId === user?.id && 
                              (p.moduleId === relatedModule.id || p.moduleIds?.includes(relatedModule.id)) && 
                              p.status === 'completed');
          const hasAccess = isPurchased || (relatedModule.price === 0);

          return (
            <div 
              key={relatedModule.id} 
              className="flex gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
              onClick={() => handleRelatedVideoClick(relatedModule)}
            >
              {/* Thumbnail */}
              <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
                {relatedModule.thumbnail ? (
                  <img 
                    src={relatedModule.thumbnail} 
                    alt={relatedModule.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                


                {/* Status indicator */}
                {isPurchased && (
                  <div className="absolute top-1 left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                
                {!hasAccess && !isPurchased && (
                  <div className="absolute top-1 left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-medium line-clamp-2 mb-1">
                  {relatedModule.title}
                </h4>
                <p className="text-gray-400 text-xs mb-2">
                  {relatedModule.category || 'Educational'}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span>{relatedModule.rating || 4.5}</span>
                  </div>
                  <span>•</span>
                  <span className="text-green-400 font-medium">
                    {relatedModule.price === 0 ? 'Free' : `$${relatedModule.price}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    if (!accessResult.hasAccess && !accessResult.isDemo) {
      return renderAccessDeniedContent();
    } else {
      return renderVideoPlayer();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="5xl"
      classNames={{
        base: "bg-white/10 backdrop-blur-md border-white/20",
        header: "border-b border-white/20",
        body: "py-6",
        footer: "border-t border-white/20"
      }}
    >
      <ModalContent>
        <ModalHeader className="text-white">
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-xl font-bold">{module.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                {module.isPremium && (
                  <Chip size="sm" className="bg-yellow-500 text-black">
                    Premium
                  </Chip>
                )}
                {accessResult.isDemo && (
                  <Chip size="sm" className="bg-blue-500 text-white">
                    Demo
                  </Chip>
                )}
                <Chip size="sm" variant="flat" className="text-white">
                  {module.category || 'Educational'}
                </Chip>
              </div>
            </div>
            {!accessResult.hasAccess && accessResult.requiresPurchase && (
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">${module.price}</div>
                <div className="text-sm text-gray-300">One-time purchase</div>
              </div>
            )}
          </div>
        </ModalHeader>
        
        <ModalBody>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Video Player */}
            <div className="lg:col-span-2">
              {renderContent()}
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-white">About this video</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{module.description}</p>
                
                {/* Access Status */}
                <div className="mt-4 p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    {accessResult.hasAccess ? (
                      <>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 text-sm">Full Access</span>
                      </>
                    ) : accessResult.isDemo ? (
                      <>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-yellow-400 text-sm">Demo Access</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-red-400 text-sm">Purchase Required</span>
                      </>
                    )}
                    <span className="text-gray-400 text-sm">• {accessResult.reason}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Videos Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Related Videos
                  {relatedVideos.length > 0 && (
                    <span className="text-gray-400 text-sm">({relatedVideos.length})</span>
                  )}
                </h4>
                {renderRelatedVideos()}
              </div>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white"
          >
            Close
          </Button>
          {!accessResult.hasAccess && accessResult.requiresPurchase && user && (
            <Button
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              startContent={<ShoppingCart className="w-4 h-4" />}
              onClick={() => onPurchase(module.id)}
            >
              Add to Cart - ${module.price}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};