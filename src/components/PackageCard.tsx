import React, { useState } from 'react';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  contentIds: string[];
  colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  icon?: string;
  isActive?: boolean;
  isPopular?: boolean;
  lastContentUpdate?: string;
  userPurchaseDate?: string;
  coverImage?: string;
  features?: string[];
  contentUpgradePrice?: number;
}

interface PackageCardProps {
  package: Package;
  isPurchased: boolean;
  hasNewContent?: boolean;
  onBuy: (packageId: string) => void;
  onUpgrade?: (packageId: string) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  isPurchased,
  hasNewContent = false,
  onBuy,
  onUpgrade
}) => {
  const colors = pkg.colorScheme || {
    primary: '#D97706',
    secondary: '#F59E0B',
    accent: '#FCD34D'
  };

  // Different bright children-friendly background for each package
  const getCardBackground = () => {
    const backgrounds = {
      'explorer-pack': 'linear-gradient(135deg, #FDE68A, #F59E0B)', // Darker yellow
      'adventurer-pack': 'linear-gradient(135deg, #FCA5A5, #EF4444)', // Darker red/pink
      'roadtripper-pack': 'linear-gradient(135deg, #A7F3D0, #10B981)', // Darker green
      'bookie-pack': 'linear-gradient(135deg, #C7D2FE, #8B5CF6)', // Darker blue/purple
    };
    return backgrounds[pkg.id as keyof typeof backgrounds] || 'linear-gradient(135deg, #F3F4F6, #FFFFFF)';
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 group border border-white/10 hover:border-white/20 transform hover:-translate-y-2 hover:bg-white/10">
      {/* Glass overlay for extra effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>
      <div className="relative z-10">
      {/* Cover Image Header */}
      <div className="relative h-56 overflow-hidden">
        {pkg.coverImage ? (
          <>
            <img 
              src={pkg.coverImage} 
              alt={pkg.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </>
        ) : null}
        
        {/* Fallback gradient background */}
        <div 
          className="w-full h-full flex items-center justify-center text-white relative"
          style={{ 
            display: pkg.coverImage ? 'none' : 'flex',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="text-center relative z-10">
            <div className="text-7xl mb-4 drop-shadow-lg">{pkg.icon || '📦'}</div>
            <h3 className="text-2xl font-bold drop-shadow-md">{pkg.name}</h3>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {hasNewContent && isPurchased && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-bold animate-pulse shadow-lg">
              🆕 New
            </span>
          )}
          <div className="flex-1"></div>
          {pkg.isPopular && (
            <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs rounded-full font-bold shadow-lg">
              ⭐ Popular
            </span>
          )}
        </div>

        {/* Package Title Overlay */}
        {pkg.coverImage && (
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">{pkg.name}</h3>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {!pkg.coverImage && (
          <h3 className="text-xl font-bold text-white mb-3">{pkg.name}</h3>
        )}
        
        <p className="text-white/80 text-sm mb-4 line-clamp-2 leading-relaxed">{pkg.description}</p>
        
        {/* Features */}
        {pkg.features && pkg.features.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-white mb-2">What's included:</h4>
            <ul className="text-xs text-white/70 space-y-1">
              {pkg.features.slice(0, 3).map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
              {pkg.features.length > 3 && (
                <li className="text-white/50 text-xs">+{pkg.features.length - 3} more features...</li>
              )}
            </ul>
          </div>
        )}
        
        {/* Package Stats */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white/10 rounded-2xl border border-white/20">
          <div>
            <div className="text-sm font-semibold text-white">{pkg.contentIds?.filter(id => id && id.trim()).length || 0} Items</div>
            <div className="text-xs text-white/60">Included</div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400">
              ${pkg.price.toFixed(2)}
            </div>
            <div className="text-xs text-white/60">One-time</div>
          </div>
        </div>

        {/* Status & Actions */}
        {isPurchased ? (
          <div className="space-y-3">
            <button
              onClick={() => {
                // Navigate to all-content tab to show package content
                window.dispatchEvent(new CustomEvent('navigateToContent', { detail: { packageId: pkg.id } }));
              }}
              className="w-full flex items-center justify-center py-3 bg-green-50 text-green-700 rounded-2xl text-sm font-bold border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Owned - Access Your Content
            </button>
            
            {hasNewContent && onUpgrade && (
              <button
                onClick={() => onUpgrade(pkg.id)}
                className="w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-orange-500 to-red-500"
              >
                ⬆️ Upgrade ${pkg.contentUpgradePrice ? `$${pkg.contentUpgradePrice}` : 'Free'}
              </button>
            )}
          </div>
        ) : pkg.isActive ? (
          <button
            onClick={() => onBuy(pkg.id)}
            className="w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Buy Package
            </span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
        ) : (
          <button
            disabled
            className="w-full py-4 rounded-2xl font-bold bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          >
            🔒 Coming Soon
          </button>
        )}
      </div>
      </div>
    </div>
  );
};