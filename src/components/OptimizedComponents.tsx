import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardBody, Button, Avatar } from '@nextui-org/react';
import { Play, Star, Lock } from 'lucide-react';
import { Module, User } from '../types';
import { sanitizeInput } from '../utils/securityUtils';

// Optimized video card component with memoization
export const VideoCard = memo(({ 
  module, 
  onPlay, 
  onPurchase, 
  hasAccess 
}: {
  module: Module;
  onPlay: (id: string) => void;
  onPurchase: (id: string) => void;
  hasAccess: boolean;
}) => {
  const handlePlay = useCallback(() => {
    onPlay(sanitizeInput(module.id));
  }, [module.id, onPlay]);

  const handlePurchase = useCallback(() => {
    onPurchase(sanitizeInput(module.id));
  }, [module.id, onPurchase]);

  const thumbnail = useMemo(() => 
    module.thumbnail || '/placeholder-video.jpg'
  , [module.thumbnail]);

  return (
    <Card className="bg-white/5 hover:bg-white/10 transition-all duration-300">
      <CardBody className="p-4">
        <div className="relative aspect-video mb-3 rounded-lg overflow-hidden">
          <img 
            src={thumbnail}
            alt={module.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Button
              isIconOnly
              className="w-12 h-12 rounded-full bg-black/70 text-white"
              onClick={handlePlay}
            >
              <Play className="w-6 h-6" />
            </Button>
          </div>
          {!hasAccess && (
            <div className="absolute top-2 left-2">
              <Lock className="w-4 h-4 text-red-400" />
            </div>
          )}
        </div>
        
        <h4 className="font-semibold text-white mb-2 truncate">{module.title}</h4>
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{module.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white text-sm">{module.rating || 4.5}</span>
          </div>
          <span className="text-green-400 font-bold">
            {module.price === 0 ? 'Free' : `$${module.price}`}
          </span>
        </div>
        
        <div className="flex gap-2">
          {!hasAccess && (module.price || 0) > 0 && (
            <Button
              size="sm"
              color="primary"
              className="flex-1"
              onClick={handlePurchase}
            >
              Purchase
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-white"
            onClick={handlePlay}
          >
            {hasAccess ? 'Watch' : 'Preview'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
});

VideoCard.displayName = 'VideoCard';

// Optimized user avatar component
export const UserAvatar = memo(({ 
  user, 
  size = 'md' 
}: { 
  user: User; 
  size?: 'sm' | 'md' | 'lg' 
}) => {
  const initials = useMemo(() => 
    user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  , [user.name]);

  return (
    <Avatar
      size={size}
      name={initials}
      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
    />
  );
});

UserAvatar.displayName = 'UserAvatar';

// Optimized loading skeleton
export const LoadingSkeleton = memo(({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} className="bg-white/5">
        <CardBody className="p-4">
          <div className="aspect-video bg-gray-600 rounded-lg mb-3 animate-pulse" />
          <div className="h-4 bg-gray-600 rounded mb-2 animate-pulse" />
          <div className="h-3 bg-gray-600 rounded mb-3 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-600 rounded flex-1 animate-pulse" />
            <div className="h-8 bg-gray-600 rounded w-16 animate-pulse" />
          </div>
        </CardBody>
      </Card>
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';