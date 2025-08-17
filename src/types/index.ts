export interface User {
  id: string;
  email: string;
  name: string;
  purchasedModules: string[];
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin?: string;
  totalSpent?: number;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: string;
  bio?: string;
  profileImage?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  avatar?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  price?: number;
  originalPrice?: number;
  character?: 'kiki' | 'tano';
  ageRange?: string;
  features?: string[];
  rating?: number;
  totalRatings?: number;
  demoVideo?: string;
  fullContent?: ContentItem[];
  isPurchased?: boolean;
  isActive?: boolean;
  isVisible?: boolean;
  category?: 'Audio Lessons' | 'Video Lessons' | 'PP1 Program' | 'PP2 Program' | string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration?: string;
  duration?: string;
  tags?: string[];
  aiTags?: string[];
  createdAt?: string;
  updatedAt?: string;
  type?: 'video' | 'audio' | 'program' | 'game' | 'product';
  thumbnail?: string;
  videoUrl?: string;
  audioUrl?: string;
  programFiles?: ProgramFile[];
  gameUrl?: string;
  isPremium?: boolean;
  hasPreview?: boolean;
  previewUrl?: string;
  accessLevel?: 'free' | 'paid' | 'premium';
}

export interface ProgramFile {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'multimedia';
  url: string;
  size: number;
  order: number;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'game';
  duration: string;
  thumbnail: string;
  isDemo?: boolean;
  videoUrl?: string;
  audioUrl?: string;
  gameUrl?: string;
}

export interface BundleOffer {
  id: string;
  title: string;
  description: string;
  modules: string[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  type: 'module' | 'bundle';
  moduleIds?: string[];
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface Purchase {
  id: string;
  userId: string;
  moduleId: string;
  moduleIds?: string[];
  bundleId?: string;
  amount: number;
  paymentMethod?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchaseDate: string;
  createdAt?: string;
  completedAt?: string;
  type?: 'video' | 'product' | 'bundle';
}

export interface Analytics {
  totalUsers: number;
  totalRevenue: number;
  totalPurchases: number;
  activeModules: number;
  revenueByMonth: { month: string; revenue: number }[];
  popularModules: { moduleId: string; title: string; purchases: number }[];
  userGrowth: { month: string; users: number }[];
}

export interface ContentFile {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'document' | 'pdf';
  url: string;
  size: number;
  uploadedAt: string;
  moduleId?: string;
  isPublic: boolean;
}

export interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  progress: number;
  completedLessons: string[];
  timeSpent: number;
  lastAccessed: string;
  quizScores?: { [lessonId: string]: number };
}

export interface ContentBundle {
  id: string;
  name: string;
  description: string;
  moduleIds: string[];
  price: number;
  originalPrice: number;
  discount: number;
  isActive: boolean;
  category: 'mixed' | 'audio-only' | 'video-only' | 'program-only';
  createdAt: string;
}