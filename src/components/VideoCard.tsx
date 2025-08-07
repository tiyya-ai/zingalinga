'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Module, Purchase, User } from '../types';

interface VideoCardProps {
  content: Module;
  user?: User;
  purchases?: Purchase[];
  onPlay?: (content: Module) => void;
  onAddToCart?: (contentId: string) => void;
  onRemoveFromCart?: (contentId: string) => void;
  isInCart?: boolean;
  variant?: 'store' | 'library' | 'content' | 'playlist';
  showPrice?: boolean;
  showPlayButton?: boolean;
  showPurchaseStatus?: boolean;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  content,
  user,
  purchases = [],
  onPlay,
  onAddToCart,
  onRemoveFromCart,
  isInCart = false,
  variant = 'content',
  showPrice = true,
  showPlayButton = true,
  showPurchaseStatus = true,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [blobUrl, setBlobUrl] = useState<string>('');

  // Check if content is purchased
  const isPurchased = purchases.some(purchase => 
    purchase.moduleId === content.id && 
    purchase.userId === user?.id && 
    purchase.status === 'completed'
  );

  // Process thumbnail URL
  const processThumbnail = useCallback(() => {
    let processedUrl = '';

    // Handle File objects
    if (content.thumbnail instanceof File) {
      const url = URL.createObjectURL(content.thumbnail);
      setBlobUrl(url);
      processedUrl = url;
    }
    // Handle string URLs
    else if (typeof content.thumbnail === 'string' && content.thumbnail.trim()) {
      processedUrl = content.thumbnail;
    }
    // Extract YouTube thumbnail if no custom thumbnail
    else if (content.videoUrl && typeof content.videoUrl === 'string') {
      const youtubeId = extractYouTubeId(content.videoUrl);
      if (youtubeId) {
        processedUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      }
    }

    setThumbnailUrl(processedUrl);
  }, [content.thumbnail, content.videoUrl]);

  // Extract YouTube video ID from various URL formats
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Get content icon based on type/category
  const getContentIcon = () => {
    if (content.category === 'Audio Lessons') return '🎧';
    if (content.category === 'Video Lessons') return '🎬';
    if (content.category === 'PP1 Program') return '📚';
    if (content.category === 'PP2 Program') return '📖';
    if (content.type === 'video' || !content.type) return '🎬';
    return '📄';
  };

  // Get gradient colors based on category
  const getContentColor = () => {
    switch (content.category) {
      case 'Audio Lessons': return 'from-blue-500 to-blue-600';
      case 'Video Lessons': return 'from-green-500 to-green-600';
      case 'PP1 Program': return 'from-orange-500 to-orange-600';
      case 'PP2 Program': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Handle play action
  const handlePlay = () => {
    if (onPlay && (isPurchased || !showPurchaseStatus)) {
      onPlay(content);
    }
  };

  // Handle cart actions
  const handleCartAction = () => {
    if (isInCart && onRemoveFromCart) {
      onRemoveFromCart(content.id);
    } else if (!isInCart && onAddToCart) {
      onAddToCart(content.id);
    }
  };

  // Process thumbnail on mount and when content changes
  useEffect(() => {
    processThumbnail();
  }, [processThumbnail]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // Determine if content is playable
  const isPlayable = (content.type === 'video' || !content.type) && (isPurchased || !showPurchaseStatus);

  return (
    <div className={`bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:scale-105 hover:border-yellow-400 transition-all duration-300 group ${className}`}>
      {/* Thumbnail Section */}
      <div className="relative">
        <div className={`w-full h-48 bg-gradient-to-br ${getContentColor()} relative overflow-hidden`}>
          {/* Image with loading states */}
          {thumbnailUrl && !imageError && (
            <img 
              src={thumbnailUrl}
              alt={content.title || 'Content thumbnail'}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}

          {/* Fallback icon when image fails or doesn't exist */}
          {(!thumbnailUrl || imageError || !imageLoaded) && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-4xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
              {getContentIcon()}
            </div>
          )}

          {/* Loading indicator */}
          {thumbnailUrl && !imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Play button overlay for playable content */}
          {isPlayable && showPlayButton && (
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group-hover:bg-black/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
              aria-label={`Play ${content.title}`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur-sm group-hover:scale-110 transition-all duration-300">
                <svg 
                  className="w-10 h-10 text-white ml-1" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </button>
          )}

          {/* Price badge */}
          {showPrice && content.price !== undefined && (
            <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
              ${content.price}
            </div>
          )}

          {/* Category badge */}
          <div className="absolute bottom-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
            {content.category || 'Content'}
          </div>

          {/* Purchase required overlay */}
          {showPurchaseStatus && !isPurchased && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg">
                  <span className="text-2xl" aria-hidden="true">🔒</span>
                </div>
                <div className="text-sm font-bold">Purchase Required</div>
                <div className="text-xs opacity-80">Buy to unlock content</div>
              </div>
            </div>
          )}

          {/* Purchased indicator */}
          {showPurchaseStatus && isPurchased && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center">
              <span className="mr-1" aria-hidden="true">✅</span>
              Owned
            </div>
          )}
        </div>
      </div>

      {/* Content Info Section */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
          {content.title || 'Untitled Content'}
        </h3>
        
        <p className="text-purple-200 text-sm mb-3 line-clamp-2">
          {content.description || 'No description available'}
        </p>

        {/* Tags */}
        {content.aiTags && content.aiTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {content.aiTags.slice(0, 2).map(tag => (
              <span 
                key={tag} 
                className="px-2 py-1 bg-white/20 text-white/80 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-xs">
            {content.hasPreview && (
              <span className="text-blue-400 flex items-center">
                <span className="mr-1" aria-hidden="true">👁️</span>
                Preview
              </span>
            )}
            {content.duration && (
              <span className="text-gray-400 flex items-center">
                <span className="mr-1" aria-hidden="true">⏱️</span>
                {content.duration}
              </span>
            )}
            {content.rating && (
              <span className="text-yellow-400 flex items-center">
                <span className="mr-1" aria-hidden="true">⭐</span>
                {content.rating}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          {isPurchased || !showPurchaseStatus ? (
            <button 
              onClick={handlePlay}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
              disabled={!isPlayable}
            >
              {isPlayable ? 'Play' : 'Access'}
            </button>
          ) : (
            <div className="flex-1 flex space-x-2">
              <button 
                onClick={handleCartAction}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  isInCart
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white focus:ring-red-400'
                    : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white focus:ring-blue-400'
                }`}
              >
                {isInCart ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-1" aria-hidden="true">🗑️</span>
                    Remove
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-1" aria-hidden="true">🛒</span>
                    Add to Cart
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;