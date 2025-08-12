'use client';

import React from 'react';
import { VideoCard } from '../../components/VideoCard';
import { Module, User, Purchase } from '../../types';

export default function TestVideoCardPage() {
  // Sample data for testing
  const sampleModule: Module = {
    id: 'test-video-1',
    title: 'Test Video Card',
    description: 'Testing the new VideoCard component',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    price: 9.99,
    category: 'Educational',
    type: 'video',
    duration: '5:30',
    rating: 4.8,
    isVisible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const sampleUser: User = {
    id: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    purchasedModules: [],
    totalSpent: 0,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  const handlePlay = (content: Module) => {
    // Play video logic
  };

  const handleAddToCart = (contentId: string) => {
    // Add to cart logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">VideoCard Component Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <VideoCard
            id={sampleModule.id}
            title={sampleModule.title}
            thumbnail={sampleModule.thumbnail || ''}
            duration={sampleModule.duration || '0:00'}
            description={sampleModule.description || ''}
            price={sampleModule.price || 0}
            category={sampleModule.category || 'General'}
            isPurchased={false}
            onPlay={() => handlePlay(sampleModule)}
            onAddToCart={() => handleAddToCart(sampleModule.id)}
          />
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}