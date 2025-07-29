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
  dateOfBirth?: string;
  bio?: string;
  profileImage?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  character: 'kiki' | 'tano';
  ageRange: string;
  features: string[];
  rating: number;
  totalRatings: number;
  demoVideo: string;
  fullContent: ContentItem[];
  isPurchased?: boolean;
  isActive: boolean;
  isVisible?: boolean; // Controls if module appears in user dashboard/store
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
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
  moduleIds: string[];
  bundleId?: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  completedAt?: string;
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
  type: 'video' | 'audio' | 'image' | 'document';
  url: string;
  size: number;
  uploadedAt: string;
  moduleId?: string;
  isPublic: boolean;
}