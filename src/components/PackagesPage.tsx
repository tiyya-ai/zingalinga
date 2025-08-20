'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Lock, Unlock, ArrowRight, CheckCircle } from 'lucide-react';
import { vpsDataStore } from '../utils/vpsDataStore';

interface PackagesPageProps {
  currentUser?: any;
  onLoginClick?: () => void;
  onPurchase?: (packageId: string) => void;
  onBack?: () => void;
}

export const PackagesPage: React.FC<PackagesPageProps> = ({ 
  currentUser, 
  onLoginClick, 
  onPurchase 
}) => {
  const [packages, setPackages] = useState<any[]>([]);
  const [userPackages, setUserPackages] = useState<string[]>([]);
  const [availableUpgrades, setAvailableUpgrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
    if (currentUser) {
      loadUserPackages();
    }
  }, [currentUser]);

  const loadPackages = async () => {
    try {
      const packageData = await vpsDataStore.getPackages();
      setPackages(packageData);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPackages = async () => {
    if (!currentUser) return;
    
    try {
      const data = await vpsDataStore.loadData();
      const purchases = data.purchases?.filter(p => p.userId === currentUser.id) || [];
      const packageIds = purchases.map(p => p.moduleId);
      setUserPackages(packageIds);
      
      const upgrades = await vpsDataStore.getAvailableUpgrades(currentUser.id);
      setAvailableUpgrades(upgrades);
    } catch (error) {
      console.error('Error loading user packages:', error);
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

  const handleUpgrade = async (upgradePackage: any) => {
    if (!currentUser) return;
    
    try {
      const success = await vpsDataStore.upgradePackage(
        currentUser.id,
        upgradePackage.upgradeFrom,
        upgradePackage.id
      );
      
      if (success) {
        await loadUserPackages();
        alert(`Successfully upgraded to ${upgradePackage.name}!`);
      } else {
        alert('Upgrade failed. Please try again.');
      }
    } catch (error) {
      console.error('Error upgrading package:', error);
      alert('Upgrade failed. Please try again.');
    }
  };

  const getPackageStatus = (pkg: any) => {
    if (pkg.comingSoon) return 'coming-soon';
    if (userPackages.includes(pkg.id)) return 'owned';
    return 'available';
  };

  const renderPackageCard = (pkg: any) => {
    const status = getPackageStatus(pkg);
    const upgrade = availableUpgrades.find(u => u.id === pkg.id);
    
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
          {pkg.features.map((feature: string, index: number) => (
            <div key={index} className="flex items-start gap-3 text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <span className="font-mali text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="text-4xl font-mali font-bold text-blue-600 mb-4">
            ${pkg.price}{pkg.billingCycle === 'yearly' ? '/year' : ''}
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
          ) : upgrade ? (
            <div className="space-y-2">
              <button 
                onClick={() => handleUpgrade(upgrade)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-mali font-bold py-4 px-8 rounded-2xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
              >
                <ArrowRight className="w-5 h-5" />
                Upgrade for ${upgrade.upgradePrice}
              </button>
              <p className="font-mali text-gray-500 text-sm">
                Upgrade from {upgrade.fromPackage?.name}
              </p>
            </div>
          ) : (
            <button 
              onClick={() => handlePurchase(pkg.id)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-mali font-bold py-4 px-8 rounded-2xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
            >
              <ShoppingCart className="w-5 h-5" />
              Start Exploring - ${pkg.price}{pkg.billingCycle === 'yearly' ? '/year' : ''}
            </button>
          )}
          
          {pkg.billingCycle && (
            <p className="font-mali text-gray-500 text-sm mt-3">
              {pkg.billingCycle === 'yearly' ? 'Annual subscription' : 
               pkg.billingCycle === 'one-time' ? 'One-time purchase' : 
               pkg.isPhysical ? 'Physical device • Works 100% offline' : ''}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mali text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-mali font-bold text-white mb-6 drop-shadow-lg">
            🌟 Zingalinga Learning Packages
          </h1>
          <p className="text-xl md:text-2xl font-mali text-purple-100 mb-8">
            Fun Adventures for Little Geniuses!
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto rounded-full"></div>
        </div>

        {availableUpgrades.length > 0 && (
          <div className="mb-12 bg-green-50 border border-green-200 rounded-2xl p-6">
            <h3 className="font-mali font-bold text-green-800 text-xl mb-4">
              🎉 Upgrade Available!
            </h3>
            <p className="font-mali text-green-700 mb-4">
              Enjoying the adventures with us? Become an Adventurer or Roadtripper and unlock more content!
            </p>
          </div>
        )}

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
  );
};