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
  Divider,
  Input
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
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { User, Module, Purchase } from '../types';
import { checkVideoAccess, getVideoUrl } from '../utils/videoAccess';
import { purchaseManager } from '../utils/purchaseManager';
import { vpsDataStore } from '../utils/vpsDataStore';

interface EnhancedVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module;
  user: User;
  purchases: Purchase[];
  onPurchase: (moduleId: string) => void;
  onVideoUpdate?: (module: Module) => void;
}

export const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  isOpen,
  onClose,
  module,
  user,
  purchases,
  onPurchase,
  onVideoUpdate
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [hasAccess, setHasAccess] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Check access and set video URL
  useEffect(() => {
    if (module && user) {
      const accessResult = checkVideoAccess(user, module, purchases);
      setHasAccess(accessResult.hasAccess);
      
      const url = getVideoUrl(module, accessResult.hasAccess);
      setVideoUrl(url);
      
      console.log('🎥 Video player setup:', {
        moduleId: module.id,
        hasAccess: accessResult.hasAccess,
        videoUrl: url,
        reason: accessResult.reason
      });
    }
  }, [module, user, purchases]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => {
      setDuration(video.duration);
      setIsLoading(false);
      setError(null);
    };
    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };
    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setError('Failed to load video. The video URL might be invalid or the video is not accessible.');
      setIsLoading(false);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

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
  }, [videoUrl]);

  // Auto-hide controls
  useEffect(() => {
    let hideControlsTimer: NodeJS.Timeout;
    
    if (isPlaying && showControls) {
      hideControlsTimer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (hideControlsTimer) {
        clearTimeout(hideControlsTimer);
      }
    };
  }, [isPlaying, showControls]);

  const togglePlay = () => {
    if (!hasAccess) return;
    
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play().catch(err => {
        console.error('Play failed:', err);
        setError('Failed to play video. Please try again.');
      });
      // Increment view count when video starts playing
      incrementViewCount();
    }
    setIsPlaying(!isPlaying);
  };

  const incrementViewCount = async () => {
    try {
      const data = await vpsDataStore.loadData();
      const moduleIndex = data.modules.findIndex(m => m.id === module.id);
      if (moduleIndex !== -1) {
        data.modules[moduleIndex].views = (data.modules[moduleIndex].views || 0) + 1;
        await vpsDataStore.saveData(data);
      }
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  const handleSeek = (newTime: number) => {
    if (!hasAccess) return;
    
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleSpeedChange = (speed: number) => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.playbackRate = speed;
      setPlaybackRate(speed);
      setShowSpeedMenu(false);
    }
  };

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const newMuted = !isMuted;
      videoElement.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const toggleFullscreen = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (!isFullscreen) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const skipTime = (seconds: number) => {
    if (!hasAccess) return;
    
    const videoElement = videoRef.current;
    if (videoElement) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const retryVideo = () => {
    setError(null);
    setIsLoading(true);
    const video = videoRef.current;
    if (video) {
      video.load();
    }
  };

  const isValidVideoUrl = (url: string): boolean => {
    if (!url) return false;
    
    // Check for common video formats
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    
    // Check for common video hosting platforms
    const videoHosts = ['youtube.com', 'vimeo.com', 'dailymotion.com', 'twitch.tv'];
    const isVideoHost = videoHosts.some(host => url.toLowerCase().includes(host));
    
    // Check for direct video URLs or streaming URLs
    const isDirectVideo = url.startsWith('http') && (hasVideoExtension || url.includes('video') || isVideoHost);
    
    return isDirectVideo;
  };

  const updateVideoUrl = async () => {
    if (!newVideoUrl.trim()) {
      setError('Please enter a valid video URL');
      return;
    }

    if (!isValidVideoUrl(newVideoUrl)) {
      setError('Invalid video URL. Please use a direct video link (.mp4, .webm, etc.) or a supported platform.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Update the module with new video URL
      const updatedModule = {
        ...module,
        videoUrl: newVideoUrl,
        videoSource: newVideoUrl
      };

      setVideoUrl(newVideoUrl);
      setShowUrlInput(false);
      setNewVideoUrl('');

      // Notify parent component of the update
      if (onVideoUpdate) {
        onVideoUpdate(updatedModule);
      }

      console.log('✅ Video URL updated:', newVideoUrl);
    } catch (error) {
      console.error('Error updating video URL:', error);
      setError('Failed to update video URL');
    }
  };

  const handlePurchase = async () => {
    try {
      const success = await purchaseManager.purchaseVideo(user.id, module.id, module.price || 0);
      if (success) {
        // Refresh access after purchase
        const accessResult = checkVideoAccess(user, module, purchases);
        setHasAccess(accessResult.hasAccess);
        
        // Call parent purchase handler
        onPurchase(module.id);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const renderAccessDeniedContent = () => (
    <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-bold">Premium Content</h3>
        <p className="text-gray-300 max-w-md">
          This video requires a purchase to watch. Get instant access and support our creators!
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>{module.rating || 4.5}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{module.estimatedDuration || '5 min'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{module.category}</span>
          </div>
        </div>
        <Button
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold"
          startContent={<ShoppingCart className="w-5 h-5" />}
          onClick={handlePurchase}
        >
          Purchase for ${module.price || 0}
        </Button>
      </div>
    </div>
  );

  const renderVideoPlayer = () => (
    <div 
      className="relative bg-black rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        className="w-full h-64 md:h-96 object-cover"
        poster={module.thumbnail}
        preload="metadata"
        onClick={togglePlay}
        crossOrigin="anonymous"
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      >
        {videoUrl && <source src={videoUrl} type="video/mp4" />}
        Your browser does not support the video tag.
      </video>

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
          <div className="text-white text-center max-w-md p-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                variant="ghost"
                className="text-white"
                startContent={<RefreshCw className="w-4 h-4" />}
                onClick={retryVideo}
              >
                Retry
              </Button>
              {user.role === 'admin' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white"
                  startContent={<ExternalLink className="w-4 h-4" />}
                  onClick={() => setShowUrlInput(true)}
                >
                  Update URL
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Controls */}
      {showControls && hasAccess && !isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <Progress
              value={duration > 0 ? (currentTime / duration) * 100 : 0}
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
            <div className="flex justify-between text-white text-sm mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
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
              
              <div className="relative">
                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-white"
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                >
                  <span className="text-sm font-bold">{playbackRate}x</span>
                </Button>
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-[80px]">
                    {speedOptions.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`block w-full text-left px-3 py-1 text-sm rounded hover:bg-white/20 ${
                          playbackRate === speed ? 'bg-white/30 text-white' : 'text-gray-300'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
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

      {/* Play Button Overlay */}
      {!isPlaying && hasAccess && !isLoading && !error && (
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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="4xl"
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
                <Chip size="sm" variant="flat" className="text-white">
                  {module.category}
                </Chip>
                {hasAccess && (
                  <Chip size="sm" className="bg-green-500 text-white">
                    Owned
                  </Chip>
                )}
              </div>
            </div>
            {!hasAccess && (
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">${module.price || 0}</div>
                <div className="text-sm text-gray-300">One-time purchase</div>
              </div>
            )}
          </div>
        </ModalHeader>
        
        <ModalBody>
          {hasAccess ? renderVideoPlayer() : renderAccessDeniedContent()}
          
          {/* URL Input Modal for Admin */}
          {showUrlInput && user.role === 'admin' && (
            <Card className="bg-white/10 mt-4">
              <CardBody className="p-4">
                <h4 className="text-white font-semibold mb-3">Update Video URL</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter video URL (e.g., https://example.com/video.mp4)"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    color="primary"
                    onClick={updateVideoUrl}
                  >
                    Update
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowUrlInput(false);
                      setNewVideoUrl('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  Supported: Direct video links (.mp4, .webm, .ogg) or streaming URLs
                </p>
              </CardBody>
            </Card>
          )}
          
          <Divider className="bg-white/20 my-4" />
          
          <div className="text-white">
            <h4 className="font-semibold mb-2">About this video</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{module.description}</p>
            {videoUrl && (
              <div className="mt-2 text-xs text-gray-400">
                <span>Video URL: </span>
                <span className="font-mono">{videoUrl.substring(0, 50)}...</span>
              </div>
            )}
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
          {!hasAccess && (
            <Button
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              startContent={<ShoppingCart className="w-4 h-4" />}
              onClick={handlePurchase}
            >
              Purchase - ${module.price || 0}
            </Button>
          )}
          {user.role === 'admin' && (
            <Button
              variant="ghost"
              className="text-white"
              startContent={<ExternalLink className="w-4 h-4" />}
              onClick={() => setShowUrlInput(true)}
            >
              Update URL
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};