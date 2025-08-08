import React, { useState } from 'react';

interface YouTubeVideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    description: string;
    price: number;
    category: string;
    views?: number;
  };
  isPurchased: boolean;
  onPlay: () => void;
  onPurchase: () => void;
}

export const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({
  video,
  isPurchased,
  onPlay,
  onPurchase
}) => {
  const [imageError, setImageError] = useState(false);
  
  const hasValidThumbnail = video.thumbnail && 
    video.thumbnail.trim() && 
    !video.thumbnail.includes('undefined') &&
    !imageError;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
      {/* Thumbnail Container */}
      <div className="relative aspect-video bg-gray-200 overflow-hidden">
        {hasValidThumbnail ? (
          <img 
            src={video.thumbnail} 
            alt={video.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <div className="text-4xl text-gray-600">🎬</div>
          </div>
        )}
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
          {video.duration}
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          ${video.price}
        </div>
        
        {/* Play Button Overlay */}
        {isPurchased ? (
          <div 
            className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={onPlay}
          >
            <div className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mb-1 mx-auto">
                <span className="text-lg">🔒</span>
              </div>
              <div className="text-xs font-medium">Purchase Required</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Video Info */}
      <div className="p-3">
        {/* Channel Avatar & Title */}
        <div className="flex space-x-3">
          <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">
              {video.title}
            </h3>
            
            <div className="text-xs text-gray-600 mb-1">
              Zinga Linga
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>{video.views?.toLocaleString() || '0'} views</span>
              <span>•</span>
              <span>{video.category}</span>
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="mt-3">
          {isPurchased ? (
            <button 
              onClick={onPlay}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              ▶ Watch Now
            </button>
          ) : (
            <button 
              onClick={onPurchase}
              className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Buy ${video.price}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};