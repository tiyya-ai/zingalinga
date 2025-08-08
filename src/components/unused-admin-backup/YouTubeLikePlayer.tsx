'use client';

import React, { useState, useEffect } from 'react';

interface YouTubeLikePlayerProps {
  src: string;
  poster?: string;
  title?: string;
  isYouTube?: boolean;
  onClose?: () => void;
  relatedVideos?: Array<{
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
  }>;
  onVideoSelect?: (videoId: string) => void;
}

export const YouTubeLikePlayer: React.FC<YouTubeLikePlayerProps> = ({
  src,
  poster,
  title = "Video Player",
  isYouTube = false,
  onClose,
  relatedVideos = [],
  onVideoSelect
}) => {


  if (!src || !src.trim() || src === 'null' || src === 'undefined') {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-2">⚠️</div>
          <div>No video source</div>
          {onClose && (
            <button onClick={onClose} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black">
      {/* YouTube Video */}
      {isYouTube ? (
        src && src.trim() ? (
          <iframe
            src={`${src}${src.includes('?') ? '&' : '?'}autoplay=1`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div>Invalid YouTube URL</div>
          </div>
        )
      ) : (
        /* Regular Video */
        src && src.trim() ? (
          <video
            src={src}
            poster={poster}
            controls
            className="w-full h-full"
            preload="metadata"
            autoPlay
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div>No video source</div>
          </div>
        )
      )}

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
        >
          ✕
        </button>
      )}

      {/* Title */}
      {title && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm max-w-md truncate">
          {title}
        </div>
      )}
    </div>
  );
};