import React, { useState, useEffect } from 'react';
import { vpsDataStore } from '../utils/vpsDataStore';

interface PackageUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  currentPackages: string[];
  onUpgradeComplete: () => void;
}

export const PackageUpgradeModal: React.FC<PackageUpgradeModalProps> = ({
  isOpen,
  onClose,
  user,
  currentPackages,
  onUpgradeComplete
}) => {
  const [availableUpgrades, setAvailableUpgrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user?.id) {
      loadAvailableUpgrades();
    }
  }, [isOpen, user?.id]);

  const loadAvailableUpgrades = async () => {
    try {
      setLoading(true);
      const upgrades = await vpsDataStore.getAvailableUpgrades(user.id);
      setAvailableUpgrades(upgrades);
    } catch (error) {
      console.error('Failed to load upgrades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (fromPackageId: string, toPackageId: string, upgradePrice: number) => {
    try {
      setUpgrading(toPackageId);
      
      const success = await vpsDataStore.upgradePackage(user.id, fromPackageId, toPackageId);
      
      if (success) {
        alert(`✅ Successfully upgraded! You paid $${upgradePrice} for the upgrade.`);
        onUpgradeComplete();
        onClose();
      } else {
        alert('❌ Upgrade failed. Please try again.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('❌ Upgrade failed. Please try again.');
    } finally {
      setUpgrading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">🚀 Package Upgrades</h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-all"
            >
              ×
            </button>
          </div>
          <p className="text-purple-100 mt-2">Upgrade your packages to unlock more features</p>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading available upgrades...</p>
            </div>
          ) : availableUpgrades.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">No Upgrades Available</h4>
              <p className="text-gray-600">You have the latest packages or no eligible packages for upgrade.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableUpgrades.map((upgrade) => (
                <div key={upgrade.id} className="border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{upgrade.icon || '📦'}</span>
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">{upgrade.name}</h4>
                          <p className="text-sm text-gray-600">Upgrade from {upgrade.fromPackage?.name}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{upgrade.description}</p>
                      
                      {upgrade.features && upgrade.features.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-800 mb-2">What you'll get:</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {upgrade.features.slice(0, 3).map((feature: string, index: number) => (
                              <li key={index} className="flex items-center">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                                {feature}
                              </li>
                            ))}
                            {upgrade.features.length > 3 && (
                              <li className="text-purple-600 text-xs">+{upgrade.features.length - 3} more features...</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        ${upgrade.upgradePrice?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-gray-500 mb-3">Upgrade price</div>
                      
                      <button
                        onClick={() => handleUpgrade(upgrade.fromPackage.id, upgrade.id, upgrade.upgradePrice)}
                        disabled={upgrading === upgrade.id}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {upgrading === upgrade.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Upgrading...</span>
                          </div>
                        ) : (
                          'Upgrade Now'
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Original Price: <span className="line-through">${upgrade.price?.toFixed(2)}</span></span>
                      <span className="text-green-600 font-semibold">You Save: ${((upgrade.price || 0) - (upgrade.upgradePrice || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};