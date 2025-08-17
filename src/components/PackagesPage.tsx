import React, { useState } from 'react';
import { ShoppingCart, Star, Check, X, Backpack, Rocket, Car, BookOpen } from 'lucide-react';
import { CartModal } from './CartModal';
import { useCart } from '../hooks/useCart';

interface PackagesPageProps {
  onBack: () => void;
}

export const PackagesPage: React.FC<PackagesPageProps> = ({ onBack }) => {
  const [showCart, setShowCart] = useState(false);
  const [initialProduct, setInitialProduct] = useState<'kiki' | 'tano' | 'bundle' | undefined>();
  const { clearCart } = useCart();

  const handleBuyNow = (product: 'explorer' | 'adventurer' | 'roadtripper' | 'bookie') => {
    // Map package types to cart product types
    let cartProduct: 'kiki' | 'tano' | 'bundle' | undefined;
    
    switch (product) {
      case 'explorer':
        cartProduct = 'kiki';
        break;
      case 'adventurer':
        cartProduct = 'bundle';
        break;
      case 'roadtripper':
        cartProduct = 'tano';
        break;
      case 'bookie':
        cartProduct = 'bundle';
        break;
    }
    
    setInitialProduct(cartProduct);
    setShowCart(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-white hover:text-yellow-400 font-mali font-bold flex items-center gap-2 transition-colors"
            >
              ← Back to Home
            </button>
            <h1 className="text-2xl font-mali font-bold text-white">Learning Packages</h1>
            <div></div>
          </div>
        </div>

        {/* Packages Section */}
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-mali font-bold text-white mb-6 drop-shadow-lg">
                🌟 Zingalinga Learning Packages
              </h2>
              <p className="text-xl md:text-2xl font-mali text-purple-100 mb-8">
                Fun Adventures for Little Geniuses!
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {/* Explorer Pack */}
              <div className="bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full p-6 w-fit mx-auto mb-4 shadow-lg">
                    <Backpack className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-mali font-bold text-gray-800 mb-2">Explorer Pack</h3>
                  <p className="font-mali text-gray-600 text-lg mb-4">Where Letters Come to Life!</p>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">Letter Safari with playful letter recognition games</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">Magic Word Builder to create fun words like a word wizard!</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">Phonics party - sing along to catchy letter sounds</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">Storytime with exciting tales role plays for children</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">15 Learning Quests - colorful lessons that feel like playtime</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-mali font-bold text-green-600 mb-4">$30/year</div>
                  <button 
                    onClick={() => handleBuyNow('explorer')}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-mali font-bold py-4 px-8 rounded-2xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Start Exploring - $30/year
                  </button>
                  <p className="font-mali text-gray-500 text-sm mt-3">Annual subscription • Works 100% offline</p>
                </div>
              </div>

              {/* Adventurer Pack */}
              <div className="bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 relative">
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-mali font-bold text-xs">
                  POPULAR
                </div>
                
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full p-6 w-fit mx-auto mb-4 shadow-lg">
                    <Rocket className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-mali font-bold text-gray-800 mb-2">Adventurer Pack</h3>
                  <p className="font-mali text-gray-600 text-lg mb-4">Reading Superpowers Unlocked!</p>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm font-bold">Everything in Explorer Pack PLUS:</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">Word Architect: Build bigger, cooler words!</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">25 Learning Quests with more stories, more adventures</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">25 Gold Star Challenges to earn rewards after each lesson</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-mali font-bold text-blue-600 mb-4">$45/year</div>
                  <button 
                    onClick={() => handleBuyNow('adventurer')}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-mali font-bold py-4 px-8 rounded-2xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Start Adventure - $45/year
                  </button>
                  <p className="font-mali text-gray-500 text-sm mt-3">Annual subscription • Works 100% offline</p>
                </div>
              </div>

              {/* Roadtripper Pack */}
              <div className="bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-full p-6 w-fit mx-auto mb-4 shadow-lg">
                    <Car className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-mali font-bold text-gray-800 mb-2">Roadtripper Pack</h3>
                  <p className="font-mali text-gray-600 text-lg mb-4">Learning On-The-Go!</p>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">125 Audio adventures, perfect for car rides & travel</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">150 Sing-along phonics - turn travel time into learning time</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">Story podcasts with African tales that spark imagination</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-mali font-bold text-orange-600 mb-4">$80</div>
                  <button 
                    onClick={() => handleBuyNow('roadtripper')}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-mali font-bold py-4 px-8 rounded-2xl hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Get Roadtripper - $80
                  </button>
                  <p className="font-mali text-gray-500 text-sm mt-3">One-time purchase • Works 100% offline</p>
                </div>
              </div>

              {/* Bookie Pack */}
              <div className="bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-full p-6 w-fit mx-auto mb-4 shadow-lg">
                    <BookOpen className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-mali font-bold text-gray-800 mb-2">Zingalinga Bookie Pack</h3>
                  <p className="font-mali text-gray-600 text-lg mb-4">Interactive Learning Device</p>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">Fully aligned PP1 and PP2 equivalent literacy product</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">Learn through stories anywhere anytime</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">Battery that lasts 4 days when fully utilized</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mali text-sm">Interactive screen with 20+ interactive lessons</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="text-2xl font-mali font-bold text-purple-600">$60</div>
                    <span className="text-gray-500 font-mali">or</span>
                    <div className="text-2xl font-mali font-bold text-purple-600">$82</div>
                    <span className="text-xs font-mali text-gray-500">for 2 packs</span>
                  </div>
                  <button 
                    onClick={() => handleBuyNow('bookie')}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-mali font-bold py-4 px-8 rounded-2xl hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Get Bookie Pack - $60
                  </button>
                  <p className="font-mali text-gray-500 text-sm mt-3">Physical device • Interactive learning</p>
                </div>
              </div>
            </div>

            {/* Offline Learning Banner */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl p-8 text-white shadow-2xl">
                <h3 className="text-3xl font-mali font-bold mb-4">
                  All packages work 100% offline – learning magic wherever you go! ✨
                </h3>
                <p className="text-xl font-mali mb-6">
                  "Choose your adventure and watch your little one bloom!" 🌱
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <CartModal 
          isOpen={showCart}
          onClose={() => {
            setShowCart(false);
            setInitialProduct(undefined);
          }}
          initialProduct={initialProduct}
          onPurchase={(items) => {
            // Handle purchase
          }}
        />
      )}
    </>
  );
};