'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';

interface ModalVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  title?: string;
  poster?: string;
  relatedVideos?: Array<{
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    videoUrl: string;
  }>;
  onVideoSelect?: (video: any) => void;
}

export const ModalVideoPlayer: React.FC<ModalVideoPlayerProps> = ({
  isOpen,
  onClose,
  src,
  title = "Video Player",
  poster,
  relatedVideos = [],
  onVideoSelect
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRelated, setShowRelated] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const playerRef = useRef<ReactPlayer>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Reset controls timeout
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Handle mouse movement
  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Safe play function
  const safePlay = () => {
    if (playerRef.current && isReady && !hasError) {
      try {
        setIsPlaying(true);
      } catch (error) {
        console.warn('Play interrupted:', error);
        setIsPlaying(false);
      }
    }
  };

  // Safe pause function
  const safePause = () => {
    if (playerRef.current) {
      try {
        setIsPlaying(false);
      } catch (error) {
        console.warn('Pause interrupted:', error);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen || hasError) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) {
            safePause();
          } else {
            safePlay();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (playerRef.current && isReady) {
            try {
              const currentTime = playerRef.current.getCurrentTime();
              playerRef.current.seekTo(Math.max(0, currentTime - 10));
            } catch (error) {
              console.warn('Seek interrupted:', error);
            }
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (playerRef.current && isReady) {
            try {
              const currentTime = playerRef.current.getCurrentTime();
              playerRef.current.seekTo(currentTime + 10);
            } catch (error) {
              console.warn('Seek interrupted:', error);
            }
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          setMuted(!muted);
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          e.preventDefault();
          if (isFullscreen) {
            exitFullscreen();
          } else {
            handleClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isPlaying, muted, isFullscreen, isReady, hasError]);

  // Safe close function
  const handleClose = () => {
    try {
      setIsPlaying(false);
      if (playerRef.current) {
        const internalPlayer = playerRef.current.getInternalPlayer();
        if (internalPlayer && typeof internalPlayer.pause === 'function') {
          internalPlayer.pause();
        }
      }
    } catch (error) {
      console.warn('Error during close:', error);
    } finally {
      onClose();
    }
  };

  // Fullscreen handling
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playerRef.current && isReady && !hasError) {
      try {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = (clickX / rect.width) * duration;
        playerRef.current.seekTo(newTime);
      } catch (error) {
        console.warn('Seek interrupted:', error);
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      // Stop playback on unmount
      try {
        if (playerRef.current) {
          const internalPlayer = playerRef.current.getInternalPlayer();
          if (internalPlayer && typeof internalPlayer.pause === 'function') {
            internalPlayer.pause();
          }
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      setPlayed(0);
      setIsReady(false);
      setHasError(false);
      resetControlsTimeout();
    } else {
      // Stop playback when modal closes
      setIsPlaying(false);
      try {
        if (playerRef.current) {
          const internalPlayer = playerRef.current.getInternalPlayer();
          if (internalPlayer && typeof internalPlayer.pause === 'function') {
            internalPlayer.pause();
          }
        }
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  }, [isOpen, src]);

  if (!isOpen) return null;

  // Validate src
  if (!src || !src.trim() || src === 'null' || src === 'undefined') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-bold mb-2">No Video Source</div>
          <div className="text-gray-300 mb-4">Invalid or missing video URL</div>
          <button
            onClick={handleClose}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={modalRef}
      className={`fixed inset-0 bg-black z-50 flex ${isFullscreen ? '' : 'p-4'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Main Content */}
      <div className={`flex-1 flex ${isFullscreen ? 'flex-col' : 'flex-col lg:flex-row'}`}>
        
        {/* Video Player Section */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="w-full max-w-6xl aspect-video relative">
            
            {/* React Player */}
            <ReactPlayer
              ref={playerRef}
              url={src}
              width="100%"
              height="100%"
              playing={isPlaying}
              volume={volume}
              muted={muted}
              playbackRate={playbackRate}
              onReady={() => {
                setIsReady(true);
                setHasError(false);
              }}
              onStart={() => setIsPlaying(true)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onProgress={({ played }) => setPlayed(played)}
              onDuration={(duration) => setDuration(duration)}
              onEnded={() => setIsPlaying(false)}
              onError={(error) => {
                console.error('Player error:', error);
                setHasError(true);
                setIsPlaying(false);
              }}
              config={{
                youtube: {
                  playerVars: {
                    showinfo: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    iv_load_policy: 3
                  }
                },
                vimeo: {
                  playerOptions: {
                    controls: false
                  }
                },
                file: {
                  attributes: {
                    controlsList: 'nodownload',
                    disablePictureInPicture: true
                  }
                }
              }}
              style={{
                borderRadius: isFullscreen ? '0' : '12px',
                overflow: 'hidden'
              }}
            />

            {/* Loading Overlay */}
            {!isReady && !hasError && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}

            {/* Error Overlay */}
            {hasError && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">⚠️</div>
                  <div className="text-xl font-bold mb-2">Video Error</div>
                  <div className="text-gray-300 mb-4">Unable to load video</div>
                  <button
                    onClick={() => {
                      setHasError(false);
                      setIsReady(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mr-2"
                  >
                    Retry
                  </button>
                  <button
                    onClick={handleClose}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Play Button Overlay */}
            {isReady && !isPlaying && !hasError && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                onClick={safePlay}
              >
                <div className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors shadow-2xl">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            )}

            {/* Custom Controls Overlay */}
            {isReady && !hasError && (
              <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* Progress Bar */}
                <div 
                  className="w-full h-2 bg-white/30 rounded-full cursor-pointer mb-4 group"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="h-full bg-red-600 rounded-full relative transition-all group-hover:h-3"
                    style={{ width: `${played * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    
                    {/* Play/Pause */}
                    <button 
                      onClick={() => isPlaying ? safePause() : safePlay()}
                      className="text-white hover:text-red-400 transition-colors"
                    >
                      {isPlaying ? (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                      ) : (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>

                    {/* Volume */}
                    <div className="flex items-center space-x-2 group">
                      <button 
                        onClick={() => setMuted(!muted)}
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        className="text-white hover:text-red-400 transition-colors"
                      >
                        {muted || volume === 0 ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                          </svg>
                        )}
                      </button>
                      
                      {/* Volume Slider */}
                      {showVolumeSlider && (
                        <div 
                          className="absolute bottom-12 w-1 h-20 bg-white/30 rounded-full"
                          onMouseLeave={() => setShowVolumeSlider(false)}
                        >
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={muted ? 0 : volume}
                            onChange={(e) => {
                              const newVolume = parseFloat(e.target.value);
                              setVolume(newVolume);
                              setMuted(newVolume === 0);
                            }}
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 rotate-[-90deg] w-20 h-1"
                          />
                        </div>
                      )}
                    </div>

                    {/* Time Display */}
                    <div className="text-white text-sm">
                      {formatTime(played * duration)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    
                    {/* Speed Control */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="text-white hover:text-red-400 transition-colors text-sm font-medium px-2 py-1 bg-white/20 rounded"
                      >
                        {playbackRate}x
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute bottom-10 right-0 bg-black/90 rounded-lg p-2 min-w-20">
                          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                            <button
                              key={speed}
                              onClick={() => {
                                setPlaybackRate(speed);
                                setShowSpeedMenu(false);
                              }}
                              className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-white/20 transition-colors ${
                                playbackRate === speed ? 'text-red-400' : 'text-white'
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Related Videos Toggle */}
                    {relatedVideos.length > 0 && !isFullscreen && (
                      <button 
                        onClick={() => setShowRelated(!showRelated)}
                        className={`text-white hover:text-red-400 transition-colors ${showRelated ? 'text-red-400' : ''}`}
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                        </svg>
                      </button>
                    )}

                    {/* Fullscreen */}
                    <button 
                      onClick={toggleFullscreen}
                      className="text-white hover:text-red-400 transition-colors"
                    >
                      {isFullscreen ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                        </svg>
                      )}
                    </button>

                    {/* Close */}
                    <button 
                      onClick={handleClose}
                      className="text-white hover:text-red-400 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Title Overlay */}
            {title && showControls && !hasError && (
              <div className="absolute top-4 left-4 right-4">
                <h2 className="text-white text-xl font-bold bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm">
                  {title}
                </h2>
              </div>
            )}
          </div>
        </div>

        {/* Related Videos Sidebar */}
        {relatedVideos.length > 0 && showRelated && !isFullscreen && (
          <div className="lg:w-96 bg-gray-900 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Related Videos</h3>
              <button 
                onClick={() => setShowRelated(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {relatedVideos.map(video => (
                <div 
                  key={video.id}
                  className="flex space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors"
                  onClick={() => {
                    // Stop current video before switching
                    setIsPlaying(false);
                    onVideoSelect?.(video);
                  }}
                >
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-24 h-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium line-clamp-2 mb-1">
                      {video.title}
                    </h4>
                    <p className="text-gray-400 text-xs">{video.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};