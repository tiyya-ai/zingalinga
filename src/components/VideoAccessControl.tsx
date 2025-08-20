'use client';

import React from 'react';
import { Lock, Unlock, ShoppingCart, Star } from 'lucide-react';

interface VideoAccessControlProps {
  video: any;
  currentUser?: any;
  userPackages?: string[];
  onPackageRedirect: () => void;
  onPlay?: () => void;
}

export const VideoAccessControl: React.FC<VideoAccessControlProps> = ({
  video,
  currentUser,
  userPackages = [],
  onPackageRedirect,
  onPlay
}) => {
  const hasAccess = currentUser && video.packageId && userPackages.includes(video.packageId);
  const isLocked = !hasAccess && video.packageId;

  const handleClick = () => {
    if (hasAccess && onPlay) {
      onPlay();
    } else if (isLocked) {
      onPackageRedirect();
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      {/* Video Thumbnail */}
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
        {video.thumbnail ? (
          <img 
            src={video.thumbnail} 
            alt={video.title} 
            className={`w-full h-full object-cover transition-all duration-300 ${
              isLocked ? 'filter blur-sm group-hover:blur-none' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-gray-400 text-4xl">🎬</div>
          </div>
        )}
        
        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/30 transition-all duration-300">
            <div className="text-center text-white">
              <Lock className="w-12 h-12 mx-auto mb-2" />
              <p className="font-mali font-bold text-lg">Locked</p>
              <p className="font-mali text-sm opacity-80">Purchase package to unlock</p>
            </div>
          </div>
        )}
        
        {/* Unlock Indicator */}
        {hasAccess && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
            <Unlock className="w-4 h-4" />
          </div>
        )}
        
        {/* Play Button */}
        {hasAccess && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all duration-300">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-0 h-0 border-l-[12px] border-l-blue-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Video Info */}
      <div className="mt-3">
        <h3 className="font-mali font-bold text-gray-900 mb-1">{video.title}</h3>
        <p className="font-mali text-gray-600 text-sm mb-2 line-clamp-2">{video.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {video.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-mali text-sm text-gray-600">{video.rating}</span>
              </div>
            )}
            {video.duration && (
              <span className="font-mali text-xs text-gray-500">{video.duration}</span>
            )}
          </div>
          
          {isLocked && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onPackageRedirect();
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-mali font-bold hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              <ShoppingCart className="w-3 h-3" />
              Unlock
            </button>
          )}
        </div>
      </div>
    </div>
  );
};