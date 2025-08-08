'use client';

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider
} from '@nextui-org/react';
import {
  Lock,
  ShoppingCart,
  Star,
  Clock,
  Eye
} from 'lucide-react';
import { User } from '../types';
import { PlyrVideoPlayer } from './PlyrVideoPlayer';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    videoUrl: string;
    duration: string;
    price: number;
    isPremium: boolean;
    rating: number;
    category: string;
  };
  user: User;
  onPurchase: (videoId: string) => void;
  hasAccess: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  isOpen,
  onClose,
  video,
  user,
  onPurchase,
  hasAccess
}) => {

  const renderAccessDeniedContent = () => (
    <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-bold">Premium Content</h3>
        <p className="text-gray-300 max-w-md">
          This video requires a purchase to watch. Get instant access and support our creators!
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>{video.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{video.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{video.category}</span>
          </div>
        </div>
        <Button
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold"
          startContent={<ShoppingCart className="w-5 h-5" />}
          onClick={() => onPurchase(video.id)}
        >
          Purchase for ${video.price}
        </Button>
      </div>
    </div>
  );

  const renderVideoPlayer = () => (
    <PlyrVideoPlayer 
      src={video.videoUrl}
      poster={video.thumbnail}
      className="w-full h-64 md:h-96 rounded-lg overflow-hidden"
    />
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="4xl"
      classNames={{
        base: "bg-white/10 backdrop-blur-md border-white/20",
        header: "border-b border-white/20",
        body: "py-6",
        footer: "border-t border-white/20"
      }}
    >
      <ModalContent>
        <ModalHeader className="text-white">
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-xl font-bold">{video.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                {video.isPremium && (
                  <Chip size="sm" className="bg-yellow-500 text-black">
                    Premium
                  </Chip>
                )}
                <Chip size="sm" variant="flat" className="text-white">
                  {video.category}
                </Chip>
              </div>
            </div>
            {!hasAccess && (
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">${video.price}</div>
                <div className="text-sm text-gray-300">One-time purchase</div>
              </div>
            )}
          </div>
        </ModalHeader>
        
        <ModalBody>
          {hasAccess ? renderVideoPlayer() : renderAccessDeniedContent()}
          
          <Divider className="bg-white/20 my-4" />
          
          <div className="text-white">
            <h4 className="font-semibold mb-2">About this video</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{video.description}</p>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white"
          >
            Close
          </Button>
          {!hasAccess && (
            <Button
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              startContent={<ShoppingCart className="w-4 h-4" />}
              onClick={() => onPurchase(video.id)}
            >
              Add to Cart - ${video.price}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};