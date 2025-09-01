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
  coverImage?: string;
}

interface PackageCheckoutModalProps {
  package: Package;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (packageId: string) => Promise<void>;
  isProcessing?: boolean;
}

export const PackageCheckoutModal: React.FC<PackageCheckoutModalProps> = ({
  package: pkg,
  isOpen,
  onClose,
  onPurchase,
  isProcessing = false
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'processing'>('cart');

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('cart');
    onClose();
  };

  const colors = pkg.colorScheme || {
    primary: '#8B5CF6',
    secondary: '#A78BFA', 
    accent: '#C4B5FD'
  };

  const handlePurchase = async () => {
    setStep('processing');
    try {
      await onPurchase(pkg.id);
      // Show success briefly then close
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      setStep('checkout');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-white/20" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div 
          className="p-6 text-white relative"
          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-all z-10"
          >
            ×
          </button>
          
          <div className="text-center relative z-10">
            {pkg.coverImage ? (
              <img 
                src={pkg.coverImage} 
                alt={pkg.name}
                className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-white/30 object-cover"
              />
            ) : (
              <div className="text-5xl mb-4 drop-shadow-lg">{pkg.icon || '📦'}</div>
            )}
            <h2 className="text-2xl font-bold mb-2">{pkg.name}</h2>
            <p className="text-white/90 text-sm">{pkg.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'cart' && (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  🎁 Package Includes:
                </h3>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">All package content</span>
                    <span className="text-sm text-yellow-400 bg-white/20 px-2 py-1 rounded-full font-bold">{pkg.contentIds?.length || 0} items</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-white">💰 Total:</span>
                  <span className="text-3xl font-bold text-yellow-400">
                    ${pkg.price.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep('checkout')}
                disabled={!pkg.contentIds || pkg.contentIds.length === 0}
                className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-xl border-2 ${
                  !pkg.contentIds || pkg.contentIds.length === 0 
                    ? 'opacity-50 cursor-not-allowed bg-gray-500 border-gray-400' 
                    : 'hover:shadow-2xl transform hover:scale-105 border-amber-400'
                }`}
                style={!pkg.contentIds || pkg.contentIds.length === 0 ? {} : { background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
              >
                🛒 Continue to Checkout
              </button>
            </>
          )}

          {step === 'checkout' && (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  ✨ Complete Purchase
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white">{pkg.name}</span>
                      <span className="font-bold text-yellow-400">${pkg.price.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-white/70 font-semibold">🎁 {pkg.contentIds?.length || 0} items included</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-white">💰 Final Total:</span>
                  <span className="text-3xl font-bold text-yellow-400">
                    ${pkg.price.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('cart')}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-4 rounded-2xl transition-colors border border-white/30"
                >
                  ← Back
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={!pkg.contentIds || pkg.contentIds.length === 0}
                  className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-xl border-2 ${
                    !pkg.contentIds || pkg.contentIds.length === 0 
                      ? 'opacity-50 cursor-not-allowed bg-gray-500 border-gray-400' 
                      : 'hover:shadow-2xl border-amber-400'
                  }`}
                  style={!pkg.contentIds || pkg.contentIds.length === 0 ? {} : { background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  🛒 Buy Now
                </button>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-500">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-6">🎉 You bought it all!</h3>
              <button
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('navigateToContent', { detail: { packageId: pkg.id } }));
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Access Your Content
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};