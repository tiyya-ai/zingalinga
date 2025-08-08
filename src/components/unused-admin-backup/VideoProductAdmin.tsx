import React, { useState, useEffect } from 'react';
import { User, Module } from '../types';
import { vpsDataStore } from '../utils/vpsDataStore';
import { imageUtils } from '../utils/imageUtils';

interface Purchase {
  id: string;
  userId: string;
  moduleIds: string[];
  amount: number;
  createdAt: string;
}

// Premium Icons (using Lucide React icons style)
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
    </svg>
  ),
  Video: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Analytics: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Image: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Youtube: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
};

interface VideoProductAdminProps {
  user: User;
  onLogout: () => void;
}

interface VideoProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'educational' | 'entertainment' | 'music' | 'stories';
  ageGroup: '2-4' | '5-7' | '8-10' | '11-13';
  duration: string;
  thumbnail: string;
  videoUrl: string;
  previewUrl?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  salesCount: number;
  rating: number;
  totalRatings: number;
}

interface SalesStats {
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  averageOrderValue: number;
  topSellingProduct: string;
  monthlyGrowth: number;
}

export const VideoProductAdmin: React.FC<VideoProductAdminProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'analytics' | 'customers'>('dashboard');
  const [products, setProducts] = useState<VideoProduct[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<SalesStats>({
    totalRevenue: 0,
    totalSales: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    topSellingProduct: '',
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VideoProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: 'educational' as const,
    ageGroup: '2-4' as const,
    duration: '',
    thumbnail: '',
    videoUrl: '',
    previewUrl: '',
    tags: [] as string[],
    isActive: true,
    videoSource: 'file' as 'file' | 'youtube' | 'url',
    videoFile: null as File | null,
    coverSource: 'file' as 'file' | 'url',
    coverFile: null as File | null,
    features: '',
    tagsString: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await vpsDataStore.loadData();
      
      // Convert modules to video products format
      const videoProducts: VideoProduct[] = (data.modules || []).map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        price: module.price,
        originalPrice: module.originalPrice,
        category: 'educational',
        ageGroup: '5-7',
        duration: module.estimatedDuration || '30 min',
        thumbnail: '/zinga-linga-logo.png',
        videoUrl: '/videos/' + module.id + '.mp4',
        previewUrl: '/previews/' + module.id + '.mp4',
        tags: module.tags || [],
        isActive: module.isActive,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
        salesCount: 0,
        rating: module.rating || 0,
        totalRatings: module.totalRatings || 0
      }));

      setProducts(videoProducts);
      setCustomers(data.users || []);
      setOrders(data.purchases || []);

      // Calculate stats
      const totalRevenue = (data.purchases || []).reduce((sum, purchase) => sum + purchase.amount, 0);
      const totalSales = (data.purchases || []).length;
      const totalCustomers = (data.users || []).filter(u => u.role === 'user').length;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      setStats({
        totalRevenue,
        totalSales,
        totalCustomers,
        averageOrderValue,
        topSellingProduct: videoProducts[0]?.title || 'No products',
        monthlyGrowth: 15.2
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!productForm.title.trim()) {
      alert('Please enter a product title');
      return;
    }
    
    if (!productForm.description.trim()) {
      alert('Please enter a product description');
      return;
    }
    
    if (productForm.price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    // Validate video source
    if (productForm.videoSource === 'file' && !productForm.videoFile) {
      alert('Please select a video file to upload');
      return;
    }
    
    if ((productForm.videoSource === 'youtube' || productForm.videoSource === 'url') && !productForm.videoUrl.trim()) {
      alert('Please enter a valid video URL');
      return;
    }
    
    // Validate cover image
    if (productForm.coverSource === 'file' && !productForm.coverFile) {
      alert('Please select a cover image to upload');
      return;
    }
    
    if (productForm.coverSource === 'url' && !productForm.thumbnail.trim()) {
      alert('Please enter a valid cover image URL');
      return;
    }
    
    try {
      const data = await vpsDataStore.loadData();
      const modules = data.modules || [];

      let videoUrl = productForm.videoUrl;
      let thumbnailUrl = productForm.thumbnail;

      if (productForm.videoSource === 'file' && productForm.videoFile) {
        const formData = new FormData();
        formData.append('file', productForm.videoFile);
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        const result = await response.json();
        if (result.success) {
          videoUrl = result.url;
        } else {
          alert('Video upload failed');
          return;
        }
      }

      if (productForm.coverSource === 'file' && productForm.coverFile) {
        const formData = new FormData();
        formData.append('file', productForm.coverFile);
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        const result = await response.json();
        if (result.success) {
          thumbnailUrl = result.url;
        } else {
          alert('Cover image upload failed');
          return;
        }
      }

      if (editingProduct) {
        // Update existing product
        const updatedModules = modules.map(module => 
          module.id === editingProduct.id 
            ? {
                ...module,
                title: productForm.title,
                description: productForm.description,
                price: productForm.price,
                originalPrice: productForm.originalPrice,
                tags: productForm.tags,
                isActive: productForm.isActive,
                videoUrl: videoUrl,
                thumbnail: thumbnailUrl,
                updatedAt: new Date().toISOString()
              }
            : module
        );
        await vpsDataStore.saveData({ ...data, modules: updatedModules });
      } else {
        // Create new product
        const newModule = {
          id: `video_${Date.now()}`,
          title: productForm.title,
          description: productForm.description,
          price: productForm.price,
          originalPrice: productForm.originalPrice,
          character: 'kiki' as const,
          ageRange: productForm.ageGroup,
          features: [productForm.description],
          rating: 0,
          totalRatings: 0,
          demoVideo: productForm.previewUrl || videoUrl,
          videoUrl: videoUrl,
          thumbnail: thumbnailUrl,
          fullContent: [],
          isActive: productForm.isActive,
          category: productForm.category,
          difficulty: 'beginner' as const,
          estimatedDuration: productForm.duration,
          tags: productForm.tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await vpsDataStore.saveData({ ...data, modules: [...modules, newModule] });
      }

      setShowProductForm(false);
      setEditingProduct(null);
      resetProductForm();
      loadDashboardData();
      
      // Show success message
      alert('Product saved successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      title: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: 'educational',
      ageGroup: '2-4',
      duration: '',
      thumbnail: '',
      videoUrl: '',
      previewUrl: '',
      tags: [],
      isActive: true,
      videoSource: 'file',
      videoFile: null,
      coverSource: 'file',
      coverFile: null,
      features: '',
      tagsString: ''
    });
  };

  const handleEditProduct = (product: VideoProduct) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      category: product.category,
      ageGroup: product.ageGroup,
      duration: product.duration,
      thumbnail: product.thumbnail,
      videoUrl: product.videoUrl,
      previewUrl: product.previewUrl || '',
      videoSource: 'url',
      videoFile: null,
      coverSource: 'url',
      coverFile: null,
      features: '',
      tagsString: product.tags.join(', '),
      tags: product.tags,
      isActive: product.isActive
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const data = await vpsDataStore.loadData();
        const updatedModules = (data.modules || []).filter(module => module.id !== productId);
        await vpsDataStore.saveData({ ...data, modules: updatedModules });
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  📹 Video Store Admin
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-semibold text-purple-600">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
              { id: 'products', label: 'Products', icon: Icons.Video },
              { id: 'customers', label: 'Customers', icon: Icons.Users },
              { id: 'analytics', label: 'Analytics', icon: Icons.Analytics }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalSales}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Customers</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.averageOrderValue)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Products</span>
                    <span className="font-semibold text-green-600">{products.filter(p => p.isActive).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Products</span>
                    <span className="font-semibold text-blue-600">{products.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Growth</span>
                    <span className="font-semibold text-purple-600">+{stats.monthlyGrowth}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Top Selling Product</h3>
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="font-semibold text-lg text-purple-600">{stats.topSellingProduct}</p>
                  <p className="text-gray-600 text-sm">Leading in sales this month</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">🎬 Video Products</h2>
              <button
                onClick={() => {
                  resetProductForm();
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                ➕ Add New Product
              </button>
            </div>

            {showProductForm && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                </h3>
                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={productForm.title}
                      onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="educational">📚 Educational</option>
                      <option value="entertainment">🎭 Entertainment</option>
                      <option value="music">🎵 Music</option>
                      <option value="stories">📖 Stories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                    <select
                      value={productForm.ageGroup}
                      onChange={(e) => setProductForm({...productForm, ageGroup: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="2-4">👶 2-4 years</option>
                      <option value="5-7">🧒 5-7 years</option>
                      <option value="8-10">👦 8-10 years</option>
                      <option value="11-13">👧 11-13 years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={productForm.duration}
                      onChange={(e) => setProductForm({...productForm, duration: e.target.value})}
                      placeholder="e.g., 30 minutes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({...productForm, originalPrice: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  {/* File Manager Style Upload Section */}
                  <div className="md:col-span-2">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-dashed border-purple-300">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Icons.Upload />
                        <span>📁 Media Files</span>
                      </h4>
                      
                      {/* Video Upload */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h5 className="font-medium text-gray-800 flex items-center space-x-2">
                            <Icons.Video />
                            <span>🎬 Video Source</span>
                          </h5>
                          
                          <div className="space-y-3">
                            <div className="flex space-x-4">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="videoSource"
                                  value="file"
                                  checked={productForm.videoSource === 'file'}
                                  onChange={(e) => setProductForm({...productForm, videoSource: e.target.value as any})}
                                  className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="ml-2 text-sm">📁 Upload File</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="videoSource"
                                  value="youtube"
                                  checked={productForm.videoSource === 'youtube'}
                                  onChange={(e) => setProductForm({...productForm, videoSource: e.target.value as any})}
                                  className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="ml-2 text-sm flex items-center space-x-1">
                                  <Icons.Youtube />
                                  <span>YouTube</span>
                                </span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="videoSource"
                                  value="url"
                                  checked={productForm.videoSource === 'url'}
                                  onChange={(e) => setProductForm({...productForm, videoSource: e.target.value as any})}
                                  className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="ml-2 text-sm">🔗 Direct URL</span>
                              </label>
                            </div>
                            
                            {productForm.videoSource === 'file' && (
                              <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => setProductForm({...productForm, videoFile: e.target.files?.[0] || null})}
                                  className="hidden"
                                  id="video-upload"
                                />
                                <label htmlFor="video-upload" className="cursor-pointer">
                                  <div className="space-y-2">
                                    <div className="text-3xl">📹</div>
                                    <p className="text-sm text-gray-600">
                                      {productForm.videoFile ? productForm.videoFile.name : 'Click to upload video file'}
                                    </p>
                                    <p className="text-xs text-gray-500">MP4, MOV, AVI up to 500MB</p>
                                  </div>
                                </label>
                              </div>
                            )}
                            
                            {productForm.videoSource === 'youtube' && (
                              <input
                                type="url"
                                value={productForm.videoUrl}
                                onChange={(e) => {
                                  const url = e.target.value;
                                  setProductForm({...productForm, videoUrl: url});
                                  
                                  // Auto-extract YouTube thumbnail
                                  if (url.includes('youtube.com') || url.includes('youtu.be')) {
                                    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
                                    if (videoId) {
                                      const thumbnailUrl = `https://img.youtube.com/vi/${videoId[1]}/maxresdefault.jpg`;
                                      setProductForm(prev => ({...prev, videoUrl: url, thumbnail: thumbnailUrl}));
                                    }
                                  }
                                }}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                              />
                            )}
                            
                            {productForm.videoSource === 'url' && (
                              <input
                                type="url"
                                value={productForm.videoUrl}
                                onChange={(e) => setProductForm({...productForm, videoUrl: e.target.value})}
                                placeholder="https://example.com/video.mp4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                              />
                            )}
                          </div>
                        </div>
                        
                        {/* Cover Image Upload */}
                        <div className="space-y-4">
                          <h5 className="font-medium text-gray-800 flex items-center space-x-2">
                            <Icons.Image />
                            <span>🖼️ Cover Image</span>
                          </h5>
                          
                          <div className="space-y-3">
                            <div className="flex space-x-4">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="coverSource"
                                  value="file"
                                  checked={productForm.coverSource === 'file'}
                                  onChange={(e) => setProductForm({...productForm, coverSource: e.target.value as any})}
                                  className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="ml-2 text-sm">📁 Upload Image</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="coverSource"
                                  value="url"
                                  checked={productForm.coverSource === 'url'}
                                  onChange={(e) => setProductForm({...productForm, coverSource: e.target.value as any})}
                                  className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="ml-2 text-sm">🔗 Image URL</span>
                              </label>
                            </div>
                            
                            {productForm.coverSource === 'file' && (
                              <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const validation = imageUtils.validateImageFile(file);
                                      if (validation.valid) {
                                        setProductForm({...productForm, coverFile: file});
                                      } else {
                                        alert(validation.error);
                                        e.target.value = '';
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="cover-upload"
                                />
                                <label htmlFor="cover-upload" className="cursor-pointer">
                                  <div className="space-y-2">
                                    <div className="text-3xl">🖼️</div>
                                    <p className="text-sm text-gray-600">
                                      {productForm.coverFile ? productForm.coverFile.name : 'Click to upload cover image'}
                                    </p>
                                    <p className="text-xs text-gray-500">JPG, PNG, GIF up to 10MB</p>
                                  </div>
                                </label>
                              </div>
                            )}
                            
                            {productForm.coverSource === 'url' && (
                              <div className="space-y-2">
                                <input
                                  type="url"
                                  value={productForm.thumbnail}
                                  onChange={(e) => setProductForm({...productForm, thumbnail: e.target.value})}
                                  placeholder="https://example.com/image.jpg"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                />
                                {productForm.thumbnail && !imageUtils.isValidImageUrl(productForm.thumbnail) && (
                                  <p className="text-xs text-amber-600 flex items-center space-x-1">
                                    <span>⚠️</span>
                                    <span>URL may not be a valid image. Please verify it works.</span>
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {/* Preview */}
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 mb-2">Preview:</p>
                              <div className="w-24 h-16 bg-gray-100 rounded border overflow-hidden">
                                {productForm.coverFile ? (
                                  <img 
                                    src={URL.createObjectURL(productForm.coverFile)} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = '/zinga-linga-logo.png';
                                    }}
                                  />
                                ) : productForm.thumbnail ? (
                                  <img 
                                    src={productForm.thumbnail} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = '/zinga-linga-logo.png';
                                    }}
                                  />
                                ) : productForm.videoSource === 'youtube' && productForm.videoUrl ? (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-xs">🎬 YouTube</span>
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-xs">No image</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={productForm.isActive}
                        onChange={(e) => setProductForm({...productForm, isActive: e.target.checked})}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active (visible to customers)</span>
                    </label>
                  </div>
                  <div className="md:col-span-2 flex space-x-4">
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                      {editingProduct ? '💾 Update Product' : '➕ Create Product'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                        resetProductForm();
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {product.thumbnail ? (
                                <img 
                                  src={product.thumbnail} 
                                  alt={product.title}
                                  className="h-10 w-10 rounded-lg object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center" style={{display: product.thumbnail ? 'none' : 'flex'}}>
                                <span className="text-lg">🎬</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.title}</div>
                              <div className="text-sm text-gray-500">{product.ageGroup} • {product.duration}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(product.price)}
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="ml-2 text-xs text-gray-500 line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? '✅ Active' : '❌ Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-purple-600 hover:text-purple-900 mr-4"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">👨‍👩‍👧‍👦 Customers</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchases</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.filter(customer => customer.role === 'user').map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-lg">👤</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(customer.purchasedModules || []).length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(customer.totalSpent || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(customer.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">🛒 Orders</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => {
                      const customer = customers.find(c => c.id === order.userId);
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.id.slice(-8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer?.name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(order.moduleIds || []).length} item(s)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(order.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Completed
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Icons.Analytics />
              <span>Analytics</span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Sales Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Month</span>
                    <span className="font-semibold text-gray-600">{formatCurrency(stats.totalRevenue * 0.85)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Growth</span>
                    <span className="font-semibold text-purple-600">+{stats.monthlyGrowth}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Product Performance</h3>
                <div className="space-y-4">
                  {products.slice(0, 3).map((product, index) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                        <span className="text-gray-600 text-sm">{product.title}</span>
                      </div>
                      <span className="font-semibold text-purple-600">{product.salesCount || 0} sales</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Key Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.totalCustomers}</div>
                  <div className="text-sm text-gray-600">Total Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{formatCurrency(stats.averageOrderValue)}</div>
                  <div className="text-sm text-gray-600">Average Order Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{products.filter(p => p.isActive).length}</div>
                  <div className="text-sm text-gray-600">Active Products</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};