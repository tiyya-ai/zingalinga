import { Module } from '../types';

export const modules: Module[] = [
  {
    id: 'abc-adventure-videos',
    title: "ABC Adventure Video Series",
    description: "Fun and engaging alphabet learning videos with colorful animations and catchy songs",
    price: 14.99,
    originalPrice: 19.99,
    character: 'kiki',
    ageRange: '2-5 years',
    features: [
      '26 alphabet learning videos',
      'Interactive sing-along songs',
      'Colorful animations',
      'Downloadable for offline viewing',
      'Progress tracking'
    ],
    rating: 4.8,
    totalRatings: 342,
    demoVideo: '/videos/abc-preview.mp4',
    fullContent: [
      {
        id: 'abc-video-1',
        title: 'Letter A Adventure',
        type: 'video',
        duration: '8:45',
        thumbnail: '/images/abc-adventure-thumb.jpg'
      },
      {
        id: 'abc-video-2',
        title: 'Letter B Bonanza',
        type: 'video',
        duration: '9:12',
        thumbnail: '/images/abc-adventure-thumb.jpg'
      }
    ],
    isActive: true,
    isVisible: true,
    category: 'educational',
    difficulty: 'beginner',
    estimatedDuration: '4 hours total',
    tags: ['alphabet', 'educational', 'songs', 'animation'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'math-magic-videos',
    title: "Math Magic for Kids",
    description: "Make math fun with magical number adventures and problem-solving games",
    price: 16.99,
    originalPrice: 22.99,
    character: 'tano',
    ageRange: '4-8 years',
    features: [
      '20 math concept videos',
      'Interactive problem solving',
      'Visual learning aids',
      'Parent progress reports',
      'Printable worksheets'
    ],
    rating: 4.7,
    totalRatings: 198,
    demoVideo: '/videos/math-magic-preview.mp4',
    fullContent: [
      {
        id: 'math-video-1',
        title: 'Counting Adventures',
        type: 'video',
        duration: '12:30',
        thumbnail: '/images/math-magic-thumb.jpg'
      },
      {
        id: 'math-video-2',
        title: 'Addition Magic',
        type: 'video',
        duration: '14:15',
        thumbnail: '/images/math-magic-thumb.jpg'
      }
    ],
    isActive: true,
    isVisible: true,
    category: 'educational',
    difficulty: 'intermediate',
    estimatedDuration: '5 hours total',
    tags: ['math', 'numbers', 'problem-solving', 'interactive'],
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'story-time-collection',
    title: "Magical Story Time Collection",
    description: "Enchanting animated stories that teach valuable life lessons and spark imagination",
    price: 19.99,
    originalPrice: 29.99,
    character: 'kiki',
    ageRange: '3-8 years',
    features: [
      '15 animated story videos',
      'Moral lessons included',
      'Beautiful illustrations',
      'Bedtime story mode',
      'Multiple language options'
    ],
    rating: 4.9,
    totalRatings: 456,
    demoVideo: '/videos/story-time-preview.mp4',
    fullContent: [
      {
        id: 'story-1',
        title: 'The Brave Little Mouse',
        type: 'video',
        duration: '16:20',
        thumbnail: '/images/story-time-thumb.jpg'
      },
      {
        id: 'story-2',
        title: 'Friendship Forest',
        type: 'video',
        duration: '18:45',
        thumbnail: '/images/story-time-thumb.jpg'
      }
    ],
    isActive: true,
    isVisible: true,
    category: 'entertainment',
    difficulty: 'beginner',
    estimatedDuration: '6 hours total',
    tags: ['stories', 'animation', 'moral-lessons', 'bedtime'],
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z'
  },
  {
    id: 'science-explorers',
    title: "Little Science Explorers",
    description: "Discover the wonders of science through fun experiments and colorful demonstrations",
    price: 21.99,
    originalPrice: 27.99,
    character: 'tano',
    ageRange: '5-10 years',
    features: [
      '12 science experiment videos',
      'Safe home experiments',
      'Scientific explanations',
      'Materials list included',
      'Quiz activities'
    ],
    rating: 4.6,
    totalRatings: 167,
    demoVideo: '/videos/science-preview.mp4',
    fullContent: [
      {
        id: 'science-1',
        title: 'Rainbow in a Glass',
        type: 'video',
        duration: '22:10',
        thumbnail: '/images/science-thumb.jpg'
      },
      {
        id: 'science-2',
        title: 'Magic Volcano',
        type: 'video',
        duration: '19:30',
        thumbnail: '/images/science-thumb.jpg'
      }
    ],
    isActive: true,
    isVisible: true,
    category: 'educational',
    difficulty: 'intermediate',
    estimatedDuration: '4.5 hours total',
    tags: ['science', 'experiments', 'discovery', 'hands-on'],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  }
];

// Bundle offers removed - focusing on individual video products