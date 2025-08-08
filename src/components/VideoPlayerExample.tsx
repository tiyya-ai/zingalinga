'use client';

import React from 'react';
import { PlyrVideoPlayer } from './PlyrVideoPlayer';

interface VideoPlayerExampleProps {
  videoUrl: string;
  posterUrl?: string;
}

export const VideoPlayerExample: React.FC<VideoPlayerExampleProps> = ({ 
  videoUrl, 
  posterUrl 
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <PlyrVideoPlayer 
        src={videoUrl}
        poster={posterUrl}
        className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl"
      />
    </div>
  );
};