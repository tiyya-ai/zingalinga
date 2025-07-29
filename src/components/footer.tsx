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
  FileText,
  HelpCircle,
  Star,
  Globe,
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
      // Fallback for when onNavigate is not provided
      window.location.href = `#${page}`;
    }
  };

  const quickLinks = [
    { name: 'Home', page: 'home' },
    { name: 'About Us', page: 'about' },
    { name: 'Learning Modules', page: 'modules' },
    { name: 'Demo', page: 'demo' },
    { name: 'Contact', page: 'contact' }
  ];

  const supportLinks = [
    { name: 'Help Center', page: 'help' },
    { name: 'Parent Guide', page: 'guide' },
    { name: 'Technical Support', page: 'support' },
    { name: 'System Requirements', page: 'requirements' },
    { name: 'Troubleshooting', page: 'troubleshoot' }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', page: 'privacy' },
    { name: 'Terms of Service', page: 'terms' },
    { name: 'Cookie Policy', page: 'cookies' },
    { name: 'Refund Policy', page: 'refund' },
    { name: 'COPPA Compliance', page: 'coppa' }
  ];

  const features = [
    { icon: Users, text: '1000+ Happy Families' },
    { icon: Award, text: 'Educational Excellence' },
    { icon: Shield, text: 'Child-Safe Platform' },
    { icon: Globe, text: 'Available Worldwide' }
  ];

  return (
    <footer className="bg-gradient-to-br from-brand-dark via-gray-800 to-brand-dark text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <img 
                src="/zinga linga logo.png" 
                alt="Zinga Linga" 
                className="h-20 w-auto cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleNavigation('home')}
              />
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed font-mali text-center lg:text-left">
              Join Kiki and Tano on magical African alphabet adventures! 
              Fun, educational, and culturally rich learning experiences 
              for children ages 1-6.
            </p>

            {/* Features */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 justify-center lg:justify-start">
                  <feature.icon className="w-4 h-4 text-brand-yellow" />
                  <span className="text-sm text-gray-300 font-mali">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center lg:text-left">
            <h4 className="text-lg font-mali font-bold text-brand-yellow mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleNavigation(link.page)}
                    className="text-gray-300 hover:text-brand-yellow transition-colors font-mali text-sm flex items-center gap-2 group mx-auto lg:mx-0"
                  >
                    <span className="w-1 h-1 bg-brand-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>

            {/* Newsletter Signup */}
            <div className="mt-8">
              <h5 className="font-mali font-bold text-brand-yellow mb-3">
                Stay Updated
              </h5>
              <p className="text-sm text-gray-300 mb-4 font-mali">
                Get the latest updates and educational tips!
              </p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-yellow font-mali text-sm"
                />
                <button className="bg-brand-yellow text-brand-dark px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-mali font-bold text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="text-center lg:text-left">
            <h4 className="text-lg font-mali font-bold text-brand-yellow mb-6">
              Support & Help
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleNavigation(link.page)}
                    className="text-gray-300 hover:text-brand-yellow transition-colors font-mali text-sm flex items-center gap-2 group mx-auto lg:mx-0"
                  >
                    <HelpCircle className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="mt-8 space-y-3">
              <h5 className="font-mali font-bold text-brand-yellow">
                Contact Us
              </h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <Mail className="w-4 h-4 text-brand-yellow" />
                  <span className="text-sm text-gray-300 font-mali">
                    hello@zingalinga.com
                  </span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <Phone className="w-4 h-4 text-brand-yellow" />
                  <span className="text-sm text-gray-300 font-mali">
                    +1 (555) 123-KIDS
                  </span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <MapPin className="w-4 h-4 text-brand-yellow" />
                  <span className="text-sm text-gray-300 font-mali">
                    Educational Excellence Center
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal & Social */}
          <div className="text-center lg:text-left">
            <h4 className="text-lg font-mali font-bold text-brand-yellow mb-6">
              Legal & Privacy
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleNavigation(link.page)}
                    className="text-gray-300 hover:text-brand-yellow transition-colors font-mali text-sm flex items-center gap-2 group mx-auto lg:mx-0"
                  >
                    <FileText className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div className="mt-8">
              <h5 className="font-mali font-bold text-brand-yellow mb-4">
                Follow Our Adventures
              </h5>
              <div className="flex gap-3 justify-center lg:justify-start">
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
                  href="#twitter" 
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors group"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
                <a 
                  href="#youtube" 
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors group"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
              </div>

              {/* App Store Badges */}
              <div className="mt-6">
                <p className="text-sm text-gray-300 font-mali mb-3">
                  Coming Soon to Mobile
                </p>
                <div className="flex flex-col gap-2">
                  <div className="bg-gray-700 rounded-lg px-3 py-2 text-center">
                    <span className="text-xs text-gray-400 font-mali">
                      📱 iOS App Store
                    </span>
                  </div>
                  <div className="bg-gray-700 rounded-lg px-3 py-2 text-center">
                    <span className="text-xs text-gray-400 font-mali">
                      🤖 Google Play Store
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-wrap justify-center items-center gap-6 text-center">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-300 font-mali">
                COPPA Compliant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-300 font-mali">
                Educational Excellence
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-300 font-mali">
                4.9/5 Parent Rating
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-300 font-mali">
                Instant Access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <p className="text-sm text-gray-400 font-mali">
                Made with love for children's education
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400 font-mali">
                © {currentYear} Zinga Linga. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 font-mali mt-1">
                Empowering young minds through African culture and alphabet learning
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 font-mali">
                Version 1.0.0
              </span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-gray-500 font-mali">
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};