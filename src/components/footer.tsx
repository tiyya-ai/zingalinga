import React from 'react';
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Shield,
  Star,
  Users,
  Award,
  Zap
} from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      window.location.href = `#${page}`;
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-6">
              <img 
                src="/zinga linga logo.png" 
                alt="Zinga Linga" 
                className="h-16 w-auto cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleNavigation('home')}
              />
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed font-mali">
              Join Kiki and Tano on magical African alphabet adventures! 
              Fun, educational, and culturally rich learning experiences 
              for children ages 1-6.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-full">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-300 font-mali">COPPA Safe</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-full">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-300 font-mali">4.9/5 Rating</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-3 justify-center md:justify-start">
              <a 
                href="#facebook" 
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors group"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-gray-300 group-hover:text-white" />
              </a>
              <a 
                href="#instagram" 
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-gray-300 group-hover:text-white" />
              </a>
              <a 
                href="#youtube" 
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors group"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 text-gray-300 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-mali font-bold text-brand-yellow mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', page: 'home' },
                { name: 'Learning Packages', page: 'packages' },
                { name: 'About Us', page: 'about' },
                { name: 'Contact', page: 'contact' },
                { name: 'Help Center', page: 'help' }
              ].map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleNavigation(link.page)}
                    className="text-gray-300 hover:text-brand-yellow transition-colors font-mali text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div className="mt-8">
              <h5 className="font-mali font-bold text-brand-yellow mb-3">
                Stay Updated
              </h5>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  placeholder="Your email"
                  className="w-full sm:flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-yellow font-mali text-sm"
                />
                <button className="bg-brand-yellow text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-mali font-bold text-sm w-full sm:w-auto">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-mali font-bold text-brand-yellow mb-6">
              Legal & Support
            </h4>
            
            <ul className="space-y-3">
              {[
                { name: 'Privacy Policy', page: 'privacy' },
                { name: 'Terms of Service', page: 'terms' },
                { name: 'Refund Policy', page: 'refund' },
                { name: 'COPPA Compliance', page: 'coppa' },
                { name: 'Help Center', page: 'help' },
                { name: 'Technical Support', page: 'support' }
              ].map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleNavigation(link.page)}
                    className="text-gray-300 hover:text-brand-yellow transition-colors font-mali text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>

            {/* Trust Indicators */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400 font-mali">COPPA Compliant</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400 font-mali">Educational Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <p className="text-sm text-gray-400 font-mali">
                Made with love for children's education
              </p>
            </div>
            
            <div className="text-center order-last sm:order-none">
              <p className="text-sm text-gray-400 font-mali">
                © {currentYear} Zinga Linga. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 font-mali">
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};