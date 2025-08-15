import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Video, Globe, BarChart3, TreePine, Leaf, ShoppingCart, Star, PlayCircle, Mail, Phone, MapPin } from 'lucide-react';
import { Kiki, Tano } from './Characters';
import { CartModal } from './CartModal';
import { useCart, PRODUCTS } from '../hooks/useCart';

interface LandingPageProps {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [animateLetters, setAnimateLetters] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [initialProduct, setInitialProduct] = useState<'kiki' | 'tano' | 'bundle' | undefined>();
  const { addItem, clearCart } = useCart();
  
  const handleBuyNow = (product: 'kiki' | 'tano' | 'bundle') => {
    console.log('Buy now clicked for:', product);
    clearCart(); // Clear any existing items
    setInitialProduct(product);
    setShowCart(true);
    console.log('Cart modal should be showing:', true);
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimateLetters(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const FloatingLetter = ({ letter, delay, position }: { letter: string; delay: number; position: string }) => (
    <div 
      className={`absolute ${position} text-6xl font-mali font-bold text-brand-green/60 animate-bounce`}
      style={{ 
        animationDelay: `${delay}s`,
        animationDuration: '3s',
        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {letter}
    </div>
  );

  return (
    <>
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-white via-blue-50 to-purple-50 pt-32">
        {/* Animated jungle background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-brand-green/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-20 w-24 h-24 bg-brand-yellow/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-brand-blue/10 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-brand-pink/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Floating alphabet letters */}
          {animateLetters && (
            <>
              <FloatingLetter letter="A" delay={0} position="top-32 left-20" />
              <FloatingLetter letter="B" delay={0.5} position="top-48 right-32" />
              <FloatingLetter letter="C" delay={1} position="bottom-40 left-32" />
              <FloatingLetter letter="Z" delay={1.5} position="bottom-32 right-40" />
            </>
          )}
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/zinga linga logo.png" 
              alt="Zinga Linga Logo" 
              className="h-40 w-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Characters - Kiki and Tano */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16 mb-12">
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="bg-white rounded-full p-4 shadow-xl mb-4">
                <Kiki className="mx-auto" />
              </div>
              <p className="text-brand-green font-mali font-bold text-xl drop-shadow-sm">Meet Kiki</p>
              <p className="text-gray-600 font-mali text-sm">Letter Explorer</p>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="bg-white rounded-full p-4 shadow-xl mb-4">
                <Tano className="mx-auto" />
              </div>
              <p className="text-brand-blue font-mali font-bold text-xl drop-shadow-sm">Meet Tano</p>
              <p className="text-gray-600 font-mali text-sm">Song Master</p>
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-mali font-bold text-brand-green mb-6 drop-shadow-sm leading-tight">
            Magical Alphabet Adventures
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl font-mali text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Fun, educational, and culturally rich learning experiences for children ages 3-6
          </p>

          {/* Features highlight */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-12">
            <div className="bg-white rounded-full px-3 sm:px-6 py-2 sm:py-3 shadow-lg">
              <span className="text-brand-green font-mali font-bold text-xs sm:text-sm">🎵 Audio Adventures</span>
            </div>
            <div className="bg-white rounded-full px-3 sm:px-6 py-2 sm:py-3 shadow-lg">
              <span className="text-brand-blue font-mali font-bold text-xs sm:text-sm">🎬 Video Stories</span>
            </div>
            <div className="bg-white rounded-full px-3 sm:px-6 py-2 sm:py-3 shadow-lg">
              <span className="text-brand-pink font-mali font-bold text-xs sm:text-sm">🎮 Interactive Games</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-gradient-to-r from-brand-yellow to-brand-red text-white font-mali font-bold text-lg sm:text-xl py-4 sm:py-5 px-8 sm:px-14 rounded-full hover:from-brand-yellow hover:to-brand-red transform hover:scale-110 transition-all duration-300 shadow-2xl flex items-center gap-3">
              <Play className="w-5 h-5 sm:w-6 sm:h-6" />
              Start Adventure
            </button>
            
            <button 
              onClick={onLoginClick}
              className="bg-white text-brand-green font-mali font-bold text-base sm:text-lg py-4 sm:py-5 px-8 sm:px-12 rounded-full hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 border-2 border-brand-green shadow-lg"
            >
              Parent Portal
            </button>
          </div>
        </div>
      </section>



      {/* Jungle Learning Adventures Section */}
      <section id="features" className="py-24 px-4 bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-brand-green/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-brand-yellow/10 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-brand-blue/10 rounded-full animate-ping"></div>
          <TreePine className="absolute top-20 right-10 w-16 h-16 text-brand-green/20" />
          <Leaf className="absolute bottom-40 left-20 w-12 h-12 text-brand-green/30" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-mali font-bold text-brand-green mb-6">
              Learning Adventures
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl font-mali text-gray-700 mb-8">
              Discover the magic of learning with Kiki & Tano
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-brand-yellow to-brand-red mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16">
            {/* Audio Adventures */}
            <div className="bg-gradient-to-br from-brand-yellow to-brand-red rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-30">
                <div className="w-8 h-8 bg-white rounded-full animate-pulse"></div>
                <div className="w-6 h-6 bg-white rounded-full mt-2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-4 h-4 bg-white rounded-full mt-2 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              
              <div className="relative z-10">
                <div className="bg-white/20 rounded-full p-4 w-fit mb-6">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-mali font-bold mb-4">Audio Adventures</h3>
                <p className="font-mali text-yellow-100 leading-relaxed">
                  Join Kiki on musical journeys through the African alphabet.
                </p>
              </div>
            </div>

            {/* Video Safaris */}
            <div className="bg-gradient-to-br from-brand-blue to-brand-pink rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-30">
                <div className="w-12 h-8 bg-white rounded-lg animate-bounce"></div>
                <div className="w-8 h-2 bg-white rounded-full mt-2"></div>
              </div>
              
              <div className="relative z-10">
                <div className="bg-white/20 rounded-full p-4 w-fit mb-6">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-mali font-bold mb-4">Video Safaris</h3>
                <p className="font-mali text-blue-100 leading-relaxed">
                  Watch Tano explore the jungle with animated alphabet animals.
                </p>
              </div>
            </div>

            {/* African Culture */}
            <div className="bg-gradient-to-br from-brand-green to-teal-500 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-30">
                <div className="w-10 h-10 bg-white rounded-full"></div>
                <div className="w-8 h-8 bg-white rounded-full mt-2 ml-2"></div>
                <div className="w-6 h-6 bg-white rounded-full mt-2 ml-4"></div>
              </div>
              
              <div className="relative z-10">
                <div className="bg-white/20 rounded-full p-4 w-fit mb-6">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-mali font-bold mb-4">African Culture</h3>
                <p className="font-mali text-green-100 leading-relaxed">
                  Learn letters through beautiful African animals and stories.
                </p>
              </div>
            </div>

            {/* Parental Portal */}
            <div className="bg-gradient-to-br from-brand-red to-brand-pink rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-30">
                <div className="grid grid-cols-3 gap-1">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
              </div>
              
              <div className="relative z-10">
                <div className="bg-white/20 rounded-full p-4 w-fit mb-6">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-mali font-bold mb-4">Parental Portal</h3>
                <p className="font-mali text-red-100 leading-relaxed">
                  Track your little explorer's alphabet adventure progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Purchase Modules Section */}
      <section id="modules" className="py-24 px-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-40 h-40 bg-white/5 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-28 h-28 bg-brand-yellow/10 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-white/5 rounded-full animate-ping"></div>
          <ShoppingCart className="absolute top-40 right-10 w-16 h-16 text-white/10 animate-pulse" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-mali font-bold text-white mb-6 drop-shadow-lg">
              Learning Modules
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl font-mali text-purple-100 mb-8">
              Choose the perfect adventure for your little explorer
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-brand-yellow to-brand-red mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-16">
            {/* Kiki's Letters Hunt Module */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-full p-6 w-fit mx-auto mb-4 shadow-lg">
                  <Kiki className="scale-75" />
                </div>
                <h3 className="text-3xl font-mali font-bold text-gray-800 mb-2">Kiki's Letters Hunt</h3>
                <p className="font-mali text-gray-600 text-lg mb-4">Perfect for ages 1-3 years</p>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-brand-yellow fill-current" />
                  ))}
                  <span className="text-gray-700 font-mali ml-2 font-bold">(4.9/5)</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-3 h-3 bg-brand-yellow rounded-full"></div>
                  <span className="font-mali">Interactive letter recognition games</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-3 h-3 bg-brand-yellow rounded-full"></div>
                  <span className="font-mali">Kiki's musical alphabet songs</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-3 h-3 bg-brand-yellow rounded-full"></div>
                  <span className="font-mali">Touch-and-learn activities</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-3 h-3 bg-brand-yellow rounded-full"></div>
                  <span className="font-mali">26 African animal friends</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-mali font-bold text-brand-green mb-4">$11.00</div>
                <button 
                  onClick={() => handleBuyNow('kiki')}
                  className="w-full bg-gradient-to-r from-brand-yellow to-brand-red text-white font-mali font-bold py-4 px-8 rounded-2xl hover:from-brand-yellow hover:to-brand-red transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now - $11.00
                </button>
                <p className="font-mali text-gray-500 text-sm mt-3">One-time purchase • Lifetime access</p>
              </div>
            </div>

            {/* Tano's Jungle Songs Module */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-full p-6 w-fit mx-auto mb-4 shadow-lg">
                  <Tano className="scale-75" />
                </div>
                <h3 className="text-3xl font-mali font-bold text-gray-800 mb-2">Tano's Jungle Songs</h3>
                <p className="font-mali text-gray-600 text-lg mb-4">Perfect for ages 2-6 years</p>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-brand-yellow fill-current" />
                  ))}
                  <span className="text-gray-700 font-mali ml-2 font-bold">(4.8/5)</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-3 h-3 bg-brand-pink rounded-full"></div>
                  <span className="font-mali">Animated music videos</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-3 h-3 bg-brand-pink rounded-full"></div>
                  <span className="font-mali">Tano's jungle adventures</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-3 h-3 bg-brand-pink rounded-full"></div>
                  <span className="font-mali">Sing-along alphabet songs</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-3 h-3 bg-brand-pink rounded-full"></div>
                  <span className="font-mali">Cultural storytelling</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-mali font-bold text-brand-blue mb-4">$6.99</div>
                <button 
                  onClick={() => handleBuyNow('tano')}
                  className="w-full bg-gradient-to-r from-brand-pink to-brand-red text-white font-mali font-bold py-4 px-8 rounded-2xl hover:from-brand-pink hover:to-brand-red transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now - $6.99
                </button>
                <p className="font-mali text-gray-500 text-sm mt-3">One-time purchase • Lifetime access</p>
              </div>
            </div>
          </div>

          {/* Bundle Offer */}
          <div className="text-center">
            <div className="bg-white rounded-3xl p-10 max-w-3xl mx-auto shadow-2xl border-4 border-brand-yellow relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-red text-white px-6 py-2 rounded-bl-2xl font-mali font-bold text-sm">
                BEST VALUE
              </div>
              
              <h3 className="text-4xl font-mali font-bold text-gray-800 mb-4">
                🎉 Complete Adventure Bundle
              </h3>
              <p className="font-mali text-gray-600 text-xl mb-8">
                Get both Kiki's Letters Hunt AND Tano's Jungle Songs together!
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-full p-4 mb-2">
                    <Kiki className="scale-50" />
                  </div>
                  <p className="font-mali text-sm text-gray-600">Kiki's Module</p>
                </div>
                <div className="text-6xl text-brand-yellow">+</div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-full p-4 mb-2">
                    <Tano className="scale-50" />
                  </div>
                  <p className="font-mali text-sm text-gray-600">Tano's Module</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-8">
                <span className="text-xl sm:text-2xl font-mali text-gray-500 line-through">$17.99</span>
                <span className="text-3xl sm:text-5xl font-mali font-bold text-brand-green">$14.99</span>
                <span className="bg-brand-red text-white px-3 sm:px-4 py-2 rounded-full text-base sm:text-lg font-mali font-bold animate-pulse">
                  SAVE $3
                </span>
              </div>
              
              <button 
                onClick={() => handleBuyNow('bundle')}
                className="bg-gradient-to-r from-brand-green to-brand-blue text-white font-mali font-bold py-4 sm:py-5 px-8 sm:px-16 rounded-2xl hover:from-brand-green hover:to-brand-blue transform hover:scale-110 transition-all duration-300 shadow-2xl text-lg sm:text-2xl mb-4"
              >
                Get Complete Bundle
              </button>
              
              <p className="font-mali text-gray-500 text-sm">
                One-time purchase • Lifetime access • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-br from-white via-blue-50 to-purple-50 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-brand-blue/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-brand-yellow/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-brand-pink/10 rounded-full animate-ping"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-mali font-bold text-brand-green mb-4">
              Get in Touch
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl font-mali text-gray-700 mb-8">
              Have questions? We'd love to hear from you!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <h3 className="text-2xl font-mali font-bold text-brand-green mb-6">
                Send us a Message
              </h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Parent's Name"
                    className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  />
                </div>
                
                <input
                  type="text"
                  placeholder="Child's Age (Optional)"
                  className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                />
                
                <select className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all">
                  <option>What can we help you with?</option>
                  <option>General Questions</option>
                  <option>Technical Support</option>
                  <option>Billing & Purchases</option>
                  <option>Educational Content</option>
                  <option>Partnership Opportunities</option>
                </select>
                
                <textarea
                  placeholder="Your Message"
                  rows={5}
                  className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all resize-none"
                ></textarea>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-white font-mali font-bold py-4 px-8 rounded-xl hover:from-brand-green hover:to-brand-blue transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="bg-gradient-to-br from-brand-yellow to-brand-red rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-mali font-bold mb-6">
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 rounded-full p-3">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-mali font-bold">Email Us</p>
                      <p className="font-mali text-yellow-100">hello@zingalinga.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 rounded-full p-3">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-mali font-bold">Call Us</p>
                      <p className="font-mali text-yellow-100">+1 (555) 123-KIDS</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 rounded-full p-3">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-mali font-bold">Visit Us</p>
                      <p className="font-mali text-yellow-100">Educational Excellence Center</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Quick Links */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h3 className="text-2xl font-mali font-bold text-brand-green mb-6">
                  Quick Help
                </h3>
                
                <div className="space-y-3">
                  {[
                    'How do I access purchased content?',
                    'What ages is Zinga Linga suitable for?',
                    'Can I get a refund?',
                    'Technical support needed',
                    'Parental controls guide'
                  ].map((question, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors font-mali text-gray-700 hover:text-brand-green"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-br from-brand-blue to-brand-pink rounded-3xl p-6 text-white text-center">
                <h4 className="font-mali font-bold text-lg mb-2">
                  We're Here to Help!
                </h4>
                <p className="font-mali text-blue-100">
                  Average response time: 2-4 hours
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-mali">Online now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-brand-green via-brand-blue to-brand-pink rounded-3xl p-8 text-white">
              <h3 className="text-3xl font-mali font-bold mb-4">
                Ready to Start the Adventure?
              </h3>
              <p className="text-xl font-mali mb-8">
                Join thousands of families already exploring with Kiki and Tano!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button 
                  onClick={() => handleBuyNow('bundle')}
                  className="bg-white text-brand-green font-mali font-bold text-xl py-4 px-12 rounded-full hover:bg-gray-100 transform hover:scale-110 transition-all duration-300 shadow-2xl"
                >
                  Buy Now & Start Learning
                </button>
                
                <button className="bg-white/20 backdrop-blur-sm text-white font-mali font-bold text-lg py-4 px-10 rounded-full hover:bg-white/30 transform hover:scale-105 transition-all duration-300 border-2 border-white/30">
                  Watch Demo Videos
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Cart Modal */}
      {showCart && (
        <CartModal 
          isOpen={showCart}
          onClose={() => {
            console.log('Closing cart modal');
            setShowCart(false);
            setInitialProduct(undefined);
          }}
          initialProduct={initialProduct}
          onPurchase={(items) => {
            console.log('Purchase completed:', items);
            alert(`Purchase completed! Total: $${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}`);
            setShowCart(false);
            setInitialProduct(undefined);
            clearCart();
          }}
        />
      )}
    </>
  );
};