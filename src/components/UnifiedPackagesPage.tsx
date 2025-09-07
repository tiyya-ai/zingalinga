'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, CheckCircle, Play, BookOpen, Video, Globe, BarChart3 } from 'lucide-react';

interface UnifiedPackagesPageProps {
  currentUser?: any;
  onLoginClick?: () => void;
  onPurchase?: (packageId: string) => void;
  onBack?: () => void;
}

export const UnifiedPackagesPage: React.FC<UnifiedPackagesPageProps> = ({ 
  currentUser, 
  onLoginClick, 
  onPurchase 
}) => {
  const [userPackages, setUserPackages] = useState<string[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
    
    // Auto-scroll to packages section
    const timer = setTimeout(() => {
      const packagesSection = document.getElementById('unified-packages');
      if (packagesSection) {
        packagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const loadPackages = async () => {
    try {
      const response = await fetch('/api/packages');
      const packageData = response.ok ? await response.json() : [];
      setPackages(packageData.map((pkg: any) => {
        // Extract icon from description
        const iconMatch = pkg.description?.match(/([\u{1F300}-\u{1F9FF}])/u);
        const icon = iconMatch ? iconMatch[1] : '📦';
        const cleanDescription = pkg.description?.replace(/([\u{1F300}-\u{1F9FF}])/gu, '').trim();
        
        return {
          ...pkg,
          icon,
          description: cleanDescription,
          features: typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features || [],
          contentIds: typeof pkg.contentIds === 'string' ? JSON.parse(pkg.contentIds) : pkg.contentIds || []
        };
      }));
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (packageId: string) => {
    if (!currentUser) {
      if (onLoginClick) onLoginClick();
      return;
    }
    
    if (onPurchase) {
      onPurchase(packageId);
    }
  };



  const getPackageStatus = (pkg: any) => {
    if (!pkg.isActive) return 'coming-soon';
    if (userPackages.includes(pkg.id)) return 'owned';
    return 'available';
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mali text-white">Loading packages...</p>
        </div>
      </div>
    );
  }

  const renderPackageCard = (pkg: any) => {
    const status = getPackageStatus(pkg);
    
    return (
      <div key={pkg.id} className={`bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 border ${
        pkg.isPopular ? 'border-blue-500' : 'border-gray-100'
      } relative`}>
        {pkg.isPopular && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-mali font-bold text-xs">
            POPULAR
          </div>
        )}
        
        <div className="text-center mb-6">
          <div className={`rounded-full p-6 w-fit mx-auto mb-4 shadow-lg ${
            status === 'owned' ? 'bg-green-100' : 'bg-gradient-to-br from-blue-400 to-blue-600'
          }`}>
            <span className="text-4xl">{pkg.icon}</span>
          </div>
          <h3 className="text-3xl font-mali font-bold text-gray-800 mb-2">{pkg.name}</h3>
          <p className="font-mali text-gray-600 text-lg mb-4">{pkg.description}</p>
        </div>

        <div className="space-y-3 mb-8">
          {(pkg.features || []).map((feature: string, index: number) => (
            <div key={index} className="flex items-start gap-3 text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <span className="font-mali text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="text-4xl font-mali font-bold text-blue-600 mb-4">
            ${pkg.price.toFixed(0)}{pkg.type === 'subscription' ? '/year' : ''}
          </div>
          
          {status === 'owned' ? (
            <div className="w-full bg-green-500 text-white font-mali font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3">
              <CheckCircle className="w-5 h-5" />
              Owned
            </div>
          ) : status === 'coming-soon' ? (
            <button 
              disabled
              className="w-full bg-gray-400 text-white font-mali font-bold py-4 px-8 rounded-2xl cursor-not-allowed"
            >
              Coming Soon
            </button>
          ) : (
            <button 
              onClick={() => handlePurchase(pkg.id)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-mali font-bold py-4 px-8 rounded-2xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
            >
              <ShoppingCart className="w-5 h-5" />
              Start Exploring - ${pkg.price.toFixed(0)}{pkg.type === 'subscription' ? '/year' : ''}
            </button>
          )}
          
          <p className="font-mali text-gray-500 text-sm mt-3">
            {pkg.type === 'subscription' ? 'Annual subscription' : 
             pkg.type === 'one-time' ? 'One-time purchase' : 
             pkg.type === 'physical' ? 'Physical device • Works 100% offline' : ''}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Hero Section */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-mali font-bold text-white mb-6 drop-shadow-lg">
            🌟 Zingalinga Learning Packages
          </h1>
          <p className="text-xl md:text-2xl font-mali text-purple-100 mb-8">
            Fun Adventures for Little Geniuses!
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-mali font-bold text-brand-green mb-6">
              Learning Adventures
            </h2>
            <p className="text-lg md:text-xl font-mali text-gray-700">
              Discover the magic of foundational learning with Kiki & Tano
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-yellow-400 to-red-500 rounded-3xl p-8 text-white shadow-2xl">
              <BookOpen className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-mali font-bold mb-2">Audio Stories</h3>
              <p className="font-mali text-sm">Listen to Kiki & Tano explore the Magical Alphabet Kingdom.</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
              <Video className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-mali font-bold mb-2">Animated Adventures</h3>
              <p className="font-mali text-sm">Watch Kiki & Tano explore the Magical Alphabet Kingdom.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl p-8 text-white shadow-2xl">
              <Globe className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-mali font-bold mb-2">Zingalinga Bookie</h3>
              <p className="font-mali text-sm">Your 100% offline Zingalinga literacy tutor.</p>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
              <BarChart3 className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-mali font-bold mb-2">Parental Portal</h3>
              <p className="font-mali text-sm">Track your little explorer's alphabet adventure progress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="unified-packages" className="py-24 px-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {packages.map(renderPackageCard)}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl p-8 text-white shadow-2xl">
              <h3 className="text-3xl font-mali font-bold mb-4">
                Ready to Start the Adventure? ✨
              </h3>
              <p className="text-xl font-mali mb-6">
                Join thousands of families already exploring with Kiki and Tano!
              </p>
              {!currentUser && onLoginClick && (
                <button 
                  onClick={onLoginClick}
                  className="bg-white text-green-600 font-mali font-bold text-xl py-4 px-12 rounded-full hover:bg-gray-100 transform hover:scale-110 transition-all duration-300 shadow-2xl"
                >
                  Login to Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bookie Showcase */}
      <section className="py-20 px-4 bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-mali font-bold text-brand-green mb-4">
              Zingalinga Bookie
            </h2>
            <p className="text-lg md:text-xl font-mali text-gray-700">
              The physical device for young learners to learn each lesson offline
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <img 
                src="/Zingalinga bookie black open.jpg" 
                alt="Zingalinga Bookie Black Open" 
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <img 
                src="/Zingalinga bookie white open.jpg" 
                alt="Zingalinga Bookie White Open" 
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <img 
                src="/Zigalinga bookie white and black open.jpg" 
                alt="Zingalinga Bookie White and Black Open" 
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <img 
                src="/Zingalinga bookie black and white on top.jpg" 
                alt="Zingalinga Bookie Black and White on Top" 
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-mali font-bold mb-4">
                Zingalinga Bookie works 100% offline – learning magic wherever you go! ✨
              </h3>
              <p className="text-lg font-mali">
                "Choose your adventure and watch your little one bloom!" 🌱
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};