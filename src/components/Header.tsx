import React from 'react';
import { Play, ShoppingCart, User, Menu, X, Star, Heart, Gift } from 'lucide-react';

interface HeaderProps {
  onLoginClick: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onNavigate?: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick, isMenuOpen, setIsMenuOpen, onNavigate }) => {
  const handleNavigation = (sectionId: string) => {
    // Pages that should navigate to separate pages
    const separatePages = ['about', 'contact'];
    
    if (onNavigate && separatePages.includes(sectionId)) {
      // Navigate to separate page
      onNavigate(sectionId);
    } else if (onNavigate) {
      // Navigate to home page first, then scroll to section
      onNavigate('home');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Fallback: scroll to section if on same page
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo Only */}
          <div className="flex items-center">
            <img 
              src="/zinga linga logo.png" 
              alt="Zinga Linga" 
              className="h-16 w-auto cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleNavigation('home')}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('home')}
              className="font-mali text-gray-700 hover:text-brand-green transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('about')}
              className="font-mali text-gray-700 hover:text-brand-green transition-colors"
            >
              About
            </button>

            <button
              onClick={() => handleNavigation('features')}
              className="font-mali text-gray-700 hover:text-brand-green transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => handleNavigation('modules')}
              className="font-mali text-gray-700 hover:text-brand-green transition-colors"
            >
              Modules
            </button>
            <button
              onClick={() => handleNavigation('contact')}
              className="font-mali text-gray-700 hover:text-brand-green transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4 mr-4">
              <div className="flex items-center gap-1 text-brand-yellow">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-mali text-sm font-bold">4.9</span>
              </div>
              <div className="flex items-center gap-1 text-brand-pink">
                <Heart className="w-4 h-4 fill-current" />
                <span className="font-mali text-sm font-bold">1.2k</span>
              </div>
            </div>



            {/* Login Button */}
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 bg-gradient-to-r from-brand-green to-brand-blue text-white px-4 py-2 rounded-full hover:from-brand-green hover:to-brand-blue transform hover:scale-105 transition-all duration-200 font-mali font-bold shadow-lg"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-brand-green transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => handleNavigation('home')}
                className="text-left font-mali text-gray-700 hover:text-brand-green transition-colors py-2"
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation('about')}
                className="text-left font-mali text-gray-700 hover:text-brand-green transition-colors py-2"
              >
                About
              </button>

              <button
                onClick={() => handleNavigation('features')}
                className="text-left font-mali text-gray-700 hover:text-brand-green transition-colors py-2"
              >
                Features
              </button>
              <button
                onClick={() => handleNavigation('modules')}
                className="text-left font-mali text-gray-700 hover:text-brand-green transition-colors py-2"
              >
                Modules
              </button>
              <button
                onClick={() => handleNavigation('contact')}
                className="text-left font-mali text-gray-700 hover:text-brand-green transition-colors py-2"
              >
                Contact
              </button>
              
              {/* Mobile Action Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-3">

                
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-1 text-brand-yellow">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-mali font-bold">4.9 Rating</span>
                  </div>
                  <div className="flex items-center gap-1 text-brand-pink">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="font-mali font-bold">1.2k Families</span>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-brand-yellow to-brand-red text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-mali">
          <Gift className="w-4 h-4" />
          <span className="font-bold">Limited Time:</span>
          <span>Get Kiki's Alphabet + Tano's Songs for just $14.99 (Save $3!)</span>
          <button
            onClick={() => handleNavigation('modules')}
            className="underline hover:no-underline ml-2"
          >
            Learn More
          </button>
        </div>
      </div>
    </header>
  );
};