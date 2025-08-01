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
  AlertCircle
} from 'lucide-react';
import { User, Module, Purchase } from '../types';
import { checkVideoAccess, getVideoUrl } from '../utils/videoAccess';

interface EnhancedVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module;
  user: User | null;
  purchases: Purchase[];
  onPurchase: (moduleId: string) => void;
}

export const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  isOpen,
  onClose,
  module,
  user,
  purchases,
  onPurchase
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

  // Check access when component mounts or dependencies change
  const accessResult = checkVideoAccess(user, module, purchases);
  const videoUrl = getVideoUrl(module, accessResult.hasAccess);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleError = () => {
      setError('Failed to load video');
      setIsLoading(false);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('error', handleError);
    };
  }, [videoUrl]);

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

  // Reset video state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setError(null);
    }
  }, [isOpen]);

  const togglePlay = () => {
    if (!accessResult.hasAccess && !accessResult.isDemo) return;
    
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number) => {
    if (!accessResult.hasAccess && !accessResult.isDemo) return;
    
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
    if (!accessResult.hasAccess && !accessResult.isDemo) return;
    
    const videoElement = videoRef.current;
    if (videoElement) {
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

  const renderAccessDeniedContent = () => (
    <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
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
            <span>{module.estimatedDuration || '30 min'}</span>
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

  const renderDemoContent = () => (
    <div className="relative">
      {renderVideoPlayer()}
      {/* Demo overlay */}
      <div className="absolute top-4 left-4 right-4">
        <Card className="bg-yellow-500/90 backdrop-blur-sm">
          <CardBody className="p-3">
            <div className="flex items-center gap-2 text-black">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Demo Preview</span>
              <span className="text-sm">Purchase to unlock full content</span>
            </div>
          </CardBody>
        </Card>
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
        poster={module.thumbnail || module.imageUrl}
        preload="metadata"
        onClick={togglePlay}
        src={videoUrl}
      >
        <source src={videoUrl} type="video/mp4" />
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
          <div className="text-white text-center">
            <p className="text-red-400">{error}</p>
            <Button
              size="sm"
              variant="ghost"
              className="text-white mt-2"
              onClick={() => {
                setError(null);
                setIsLoading(true);
                videoRef.current?.load();
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Video Controls */}
      {showControls && (accessResult.hasAccess || accessResult.isDemo) && !isLoading && !error && (
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
      {!isPlaying && (accessResult.hasAccess || accessResult.isDemo) && !isLoading && !error && (
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

  const renderContent = () => {
    if (!accessResult.hasAccess && !accessResult.isDemo) {
      return renderAccessDeniedContent();
    } else if (accessResult.isDemo) {
      return renderDemoContent();
    } else {
      return renderVideoPlayer();
    }
  };

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
          {renderContent()}
          
          <Divider className="bg-white/20 my-4" />
          
          <div className="text-white">
            <h4 className="font-semibold mb-2">About this video</h4>
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