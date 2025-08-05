'use client';

import React from 'react';

interface HeaderProps {
  onLoginClick: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onNavigate: (page: string) => void;
}

export default function Header({
  onLoginClick,
  isMenuOpen,
  setIsMenuOpen,
  onNavigate,
}: HeaderProps) {
  const [showCart, setShowCart] = React.useState(false);
  return (
    <header className="bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-800 shadow-2xl border-b border-purple-500/30 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo Section */}
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')} 
              className="flex items-center focus:outline-none transform hover:scale-105 transition-transform duration-200"
            >
              <img 
                src="/zinga linga logo.png" 
                alt="Zinga Linga Logo" 
                className="h-12 sm:h-14 md:h-16 w-auto"
              />
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center space-x-6 xl:space-x-8">
            <button onClick={() => onNavigate('home')} className="text-white hover:text-yellow-400 transition-colors font-medium text-sm xl:text-base">
              Home
            </button>
            <button onClick={() => onNavigate('about')} className="text-white hover:text-yellow-400 transition-colors font-medium text-sm xl:text-base">
              About
            </button>
            <button onClick={() => onNavigate('packages')} className="text-white hover:text-yellow-400 transition-colors font-medium text-sm xl:text-base">
              Packages
            </button>
            <button onClick={() => onNavigate('contact')} className="text-white hover:text-yellow-400 transition-colors font-medium text-sm xl:text-base">
              Contact
            </button>
            <button onClick={() => onNavigate('help')} className="text-white hover:text-yellow-400 transition-colors font-medium text-sm xl:text-base">
              Help
            </button>
          </nav>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {/* Cart Button */}
            <button 
              onClick={() => setShowCart(true)}
              className="relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-2 py-2 sm:px-3 sm:py-2 lg:px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg text-xs sm:text-sm lg:text-base"
            >
              <span className="hidden sm:inline">🛒 Cart</span>
              <span className="sm:hidden">🛒</span>
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 text-xs w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center font-bold">
                0
              </span>
            </button>
            
            {/* Parent Portal Button */}
            <button
              onClick={onLoginClick}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold px-3 py-2 sm:px-4 sm:py-2 lg:px-6 rounded-lg transition-all duration-200 shadow-lg text-xs sm:text-sm lg:text-base"
            >
              <span className="hidden sm:inline">Parent Portal</span>
              <span className="sm:hidden">Portal</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/20 bg-gradient-to-r from-purple-800/95 via-blue-800/95 to-indigo-800/95 backdrop-blur-sm">
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}
                className="text-white hover:text-yellow-400 hover:bg-white/10 transition-all font-medium text-left py-2 px-4 rounded-lg block w-full"
              >
                🏠 Home
              </button>
              <button 
                onClick={() => { onNavigate('about'); setIsMenuOpen(false); }}
                className="text-white hover:text-yellow-400 hover:bg-white/10 transition-all font-medium text-left py-2 px-4 rounded-lg block w-full"
              >
                ℹ️ About
              </button>
              <button 
                onClick={() => { onNavigate('packages'); setIsMenuOpen(false); }}
                className="text-white hover:text-yellow-400 hover:bg-white/10 transition-all font-medium text-left py-2 px-4 rounded-lg block w-full"
              >
                📦 Packages
              </button>
              <button 
                onClick={() => { onNavigate('contact'); setIsMenuOpen(false); }}
                className="text-white hover:text-yellow-400 hover:bg-white/10 transition-all font-medium text-left py-2 px-4 rounded-lg block w-full"
              >
                📞 Contact
              </button>
              <button 
                onClick={() => { onNavigate('help'); setIsMenuOpen(false); }}
                className="text-white hover:text-yellow-400 hover:bg-white/10 transition-all font-medium text-left py-2 px-4 rounded-lg block w-full"
              >
                ❓ Help
              </button>
            </div>
          </div>
        )}
      </div>
      
      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-mali font-bold text-brand-green">Shopping Cart</h3>
              <button 
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-600 font-mali text-lg mb-6">Your cart is empty</p>
              <button 
                onClick={() => setShowCart(false)}
                className="bg-gradient-to-r from-brand-yellow to-brand-red text-white font-mali font-bold py-4 px-8 rounded-2xl hover:from-brand-yellow hover:to-brand-red transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}