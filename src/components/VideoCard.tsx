import React, { useState } from 'react';

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  description: string;
  price: number;
  category: string;
  isPurchased: boolean;
  onPlay?: () => void;
  onAddToCart?: () => void;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  id,
  title,
  thumbnail,
  duration,
  description,
  price,
  category,
  isPurchased,
  onPlay = () => {},
  onAddToCart = () => {},
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);

  const handlePlaySafe = async () => {
    try {
      await onPlay();
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        // Silent error handling
      }
    }
  };

  const isValidThumbnail = thumbnail && thumbnail.trim() && !thumbnail.includes('undefined');

  return (
    <div className={`group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:scale-105 hover:border-yellow-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl ${className}`} suppressHydrationWarning>
      
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">

        {/* Image or Fallback */}
        {!imgError && isValidThumbnail && thumbnail.trim() ? (
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImgError(true)} 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/80 text-6xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
            🎬
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-white/20 text-white px-2 py-1 rounded-md text-xs font-medium border border-white/30">
          {duration}
        </div>

        {/* Price Badge - Only show if not purchased */}
        {!isPurchased && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {price === 0 ? 'Free' : `$${price.toFixed(2)}`}
          </div>
        )}



        {/* Play Overlay or Lock */}
        {isPurchased ? (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100"
            onClick={handlePlaySafe}
            role="button"
            aria-label={`Play video: ${title}`}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handlePlaySafe()}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur-sm transform hover:scale-110 transition-all duration-300">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center text-white">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-2 mx-auto shadow-lg">
                <span className="text-xl">🔒</span>
              </div>
              <div className="text-xs font-bold">Purchase Required</div>
            </div>
          </div>
        )}

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
          {title}
        </h3>
        <p className="text-purple-200 text-sm mb-4 line-clamp-2 opacity-80">
          {description || 'No description available'}
        </p>

        {/* Actions */}
        {!isPurchased && (
          <div className="flex justify-between items-center">
            <button
              onClick={async () => {
                try {
                  const { vpsDataStore } = await import('../utils/vpsDataStore');
                  const savedList = JSON.parse(localStorage.getItem('savedVideos') || '[]');
                  if (!savedList.find((v: any) => v.id === id)) {
                    const videoData = { id, title, thumbnail, duration, description, price, category, savedAt: new Date().toISOString() };
                    savedList.push(videoData);
                    localStorage.setItem('savedVideos', JSON.stringify(savedList));
                    
                    // Save to VPS
                    const data = await vpsDataStore.loadData();
                    const updatedData = {
                      ...data,
                      savedVideos: [...(data.savedVideos || []), videoData]
                    };
                    await vpsDataStore.saveData(updatedData);
                    
                    console.log('✅ Video saved to list and VPS:', title);
                    alert('Video saved to your list!');
                  } else {
                    alert('Video already in your saved list!');
                  }
                } catch (error) {
                  console.error('❌ Failed to save video:', error);
                  alert('Failed to save video.');
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100"
            >
              💾 Save
            </button>
            <button
              onClick={onAddToCart}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 px-3 py-2 sm:px-4 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100"
            >
              🛒 Buy Now
            </button>
          </div>
        )}
        
        {/* Save button for purchased videos */}
        {isPurchased && (
          <div className="flex justify-center">
            <button
              onClick={async () => {
                try {
                  const { vpsDataStore } = await import('../utils/vpsDataStore');
                  const savedList = JSON.parse(localStorage.getItem('savedVideos') || '[]');
                  if (!savedList.find((v: any) => v.id === id)) {
                    const videoData = { id, title, thumbnail, duration, description, price, category, savedAt: new Date().toISOString() };
                    savedList.push(videoData);
                    localStorage.setItem('savedVideos', JSON.stringify(savedList));
                    
                    // Save to VPS
                    const data = await vpsDataStore.loadData();
                    const updatedData = {
                      ...data,
                      savedVideos: [...(data.savedVideos || []), videoData]
                    };
                    await vpsDataStore.saveData(updatedData);
                    
                    console.log('✅ Video saved to list and VPS:', title);
                    alert('Video saved to your list!');
                  } else {
                    alert('Video already in your saved list!');
                  }
                } catch (error) {
                  console.error('❌ Failed to save video:', error);
                  alert('Failed to save video.');
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100"
            >
              💾 Save to List
            </button>
          </div>
        )}
      </div>

      {/* Owned Badge */}
      {isPurchased && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ✓ Owned
        </div>
      )}
    </div>
  );
};
