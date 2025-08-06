import React from 'react';
import { Play } from 'lucide-react';

interface VideoThumbnailProps {
  video: {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    views?: number;
    rating?: number;
  };
  onPlay: () => void;
  isPurchased?: boolean;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ 
  video, 
  onPlay, 
  isPurchased = false 
}) => {
  return (
    <div className="relative group cursor-pointer" onClick={onPlay}>
      {/* Thumbnail Image */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900">
        {video.thumbnail ? (
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/320x180/6366f1/ffffff?text=Video';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <span className="text-white text-4xl">🎬</span>
          </div>
        )}
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
          {video.duration}
        </div>
        
        {/* Play Button Overlay - Always visible for purchased videos */}
        {isPurchased && (
          <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-all duration-200 flex items-center justify-center cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200 shadow-2xl border-4 border-white/30">
              <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
            </div>
          </div>
        )}
        
        {/* Hover Play Button for unpurchased videos */}
        {!isPurchased && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200 shadow-lg">
              <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
            </div>
          </div>
        )}
        
        {/* Lock Overlay for Unpurchased */}
        {!isPurchased && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-xl">🔒</span>
              </div>
              <div className="text-xs font-bold">Purchase Required</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Video Info */}
      <div className="mt-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">
          {video.title}
        </h3>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
          <div className="flex items-center space-x-3">
            {video.views && (
              <span>{video.views.toLocaleString()} views</span>
            )}
            {video.rating && (
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">⭐</span>
                <span>{video.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {isPurchased && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              ✓ Owned
            </span>
          )}
        </div>
      </div>
    </div>
  );
};