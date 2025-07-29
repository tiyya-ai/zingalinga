import { Module, BundleOffer } from '../types';

export const modules: Module[] = [
  {
    id: 'premium-video-package-1',
    title: "Premium Learning Video - Package 1",
    description: "Exclusive educational video content for early learners",
    price: 9.99,
    character: 'kiki',
    ageRange: '1-5 years',
    features: [
      'High-quality educational video',
      'Interactive learning experience',
      'Child-friendly content',
      'Unlimited access after purchase'
    ],
    rating: 4.9,
    totalRatings: 156,
    demoVideo: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg',
    fullContent: [
      {
        id: 'premium-video-1',
        title: 'Educational Learning Video',
        type: 'video',
        duration: '15:30',
        thumbnail: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg'
      }
    ],
    isActive: true,
    isVisible: true,
    category: 'learning',
    difficulty: 'beginner',
    estimatedDuration: '15 minutes',
    tags: ['video', 'educational', 'kiki', 'early-learning'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'premium-video-package-2',
    title: "Premium Learning Video - Package 2",
    description: "Advanced educational video content for growing minds",
    price: 12.99,
    character: 'tano',
    ageRange: '3-7 years',
    features: [
      'Advanced learning concepts',
      'Engaging visual content',
      'Professional production quality',
      'Lifetime access guarantee'
    ],
    rating: 4.8,
    totalRatings: 89,
    demoVideo: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg',
    fullContent: [
      {
        id: 'premium-video-2',
        title: 'Advanced Learning Video',
        type: 'video',
        duration: '18:45',
        thumbnail: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg'
      }
    ],
    isActive: true,
    isVisible: true,
    category: 'learning',
    difficulty: 'intermediate',
    estimatedDuration: '18 minutes',
    tags: ['video', 'advanced', 'tano', 'preschool'],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

export const bundleOffers: BundleOffer[] = [
  {
    id: 'complete-video-bundle',
    title: 'Complete Video Learning Bundle',
    description: 'Get both Premium Learning Videos together at a special price!',
    modules: ['premium-video-package-1', 'premium-video-package-2'],
    originalPrice: 22.98,
    bundlePrice: 18.99,
    savings: 3.99,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];