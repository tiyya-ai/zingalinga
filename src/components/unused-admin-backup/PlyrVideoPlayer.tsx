'use client';

import React, { useRef, useEffect, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

interface PlyrVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export const PlyrVideoPlayer: React.FC<PlyrVideoPlayerProps> = ({ src, poster, className }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Plyr | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && videoRef.current && !playerRef.current) {
      playerRef.current = new Plyr(videoRef.current, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
        settings: ['speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        hideControls: false,
        clickToPlay: true,
        disableContextMenu: true,
        keyboard: { focused: true, global: false },
        tooltips: { controls: true, seek: true },
        captions: { active: false, update: false, language: 'auto' },
      });

      // Add error handling for play interruptions
      const handlePlayError = (event: any) => {
        if (event.detail?.error?.name === 'AbortError') {
          // Silently ignore AbortError
          return;
        }
        console.error('Plyr error:', event.detail?.error);
      };

      playerRef.current.on('error', handlePlayError);
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.destroy();
        } catch (error) {
          // Ignore errors during cleanup
        }
        playerRef.current = null;
      }
    };
  }, [isClient]);

  useEffect(() => {
    if (isClient && playerRef.current && src) {
      try {
        playerRef.current.source = {
          type: 'video',
          sources: [{ src, type: 'video/mp4' }],
          poster
        };
      } catch (error) {
        console.error('Error setting Plyr source:', error);
      }
    }
  }, [isClient, src, poster]);

  if (!isClient) {
    return (
      <div className={`${className || ''} bg-black rounded-lg flex items-center justify-center aspect-video`}>
        <div className="text-white">Loading player...</div>
      </div>
    );
  }

  return (
    <div className={`plyr-container ${className || ''}`}>
      <video 
        ref={videoRef} 
        playsInline
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
      
      <style jsx global>{`
        .plyr {
          border-radius: 12px;
          overflow: hidden;
        }
        .plyr--video {
          background: #000;
        }
        .plyr__controls {
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          border-radius: 0 0 12px 12px;
        }
        .plyr__control--overlaid {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .plyr__control--overlaid:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }
        .plyr__progress input[type=range] {
          color: #3b82f6;
        }
        .plyr__volume input[type=range] {
          color: #3b82f6;
        }
        .plyr__control:hover {
          background: rgba(59, 130, 246, 0.2);
        }
        .plyr__control[aria-pressed=true] {
          background: #3b82f6;
          color: white;
        }
      `}</style>
    </div>
  );
};