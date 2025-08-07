'use client';

import React, { useRef, useEffect } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

const customStyles = `
  .plyr__progress input[type=range] {
    background: transparent !important;
  }
  .plyr__volume input[type=range] {
    background: transparent !important;
  }
  .plyr__progress__buffer {
    background: transparent !important;
  }
  .plyr__progress__played {
    background: #ff6b35 !important;
  }
  .plyr__volume__display {
    background: transparent !important;
  }
`;

interface PlyrVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export const PlyrVideoPlayer: React.FC<PlyrVideoPlayerProps> = ({ src, poster, className }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Inject custom styles
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);

    if (videoRef.current) {
      const player = new Plyr(videoRef.current, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
        settings: ['captions', 'quality', 'speed'],
        speed: { selected: 1, options: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
        hideControls: false,
        clickToPlay: true,
        disableContextMenu: true,
        keyboard: { focused: true, global: false },
      });

      return () => {
        player.destroy();
        document.head.removeChild(styleElement);
      };
    }
  }, [src]);

  return (
    <div className={className}>
      <video 
        ref={videoRef} 
        controls 
        playsInline
        poster={poster}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
    </div>
  );
};