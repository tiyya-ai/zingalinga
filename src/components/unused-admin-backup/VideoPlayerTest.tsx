'use client';

import React, { useState } from 'react';
import { PlyrVideoPlayer } from './PlyrVideoPlayer';
import { VideoPlayer } from './VideoPlayer';

export const VideoPlayerTest: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const testVideo = {
    id: 'test-1',
    title: 'Test Video',
    description: 'This is a test video to verify the player works',
    thumbnail: 'https://via.placeholder.com/640x360/000000/FFFFFF?text=Test+Video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '10:34',
    price: 9.99,
    isPremium: true,
    rating: 4.5,
    category: 'Test'
  };

  const testUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    purchasedVideos: ['test-1']
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-white text-2xl mb-8">Video Player Test</h1>
      
      <div className="mb-8">
        <h2 className="text-white text-xl mb-4">Direct PlyrVideoPlayer:</h2>
        <div className="max-w-2xl">
          <PlyrVideoPlayer 
            src={testVideo.videoUrl}
            poster={testVideo.thumbnail}
            className="w-full aspect-video rounded-lg"
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-white text-xl mb-4">Modal Video Player:</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Open Modal Player
        </button>
      </div>

      <VideoPlayer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        video={testVideo}
        user={testUser}
        onPurchase={() => console.log('Purchase clicked')}
        hasAccess={true}
      />
    </div>
  );
};