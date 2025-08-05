import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Video, Globe, BarChart3, TreePine, Leaf, ShoppingCart, Star, PlayCircle, Mail, Phone, MapPin } from 'lucide-react';
import { Kiki, Tano } from './Characters';
import { CartModal } from './CartModal';
import { useCart, PRODUCTS } from '../hooks/useCart';

interface LandingPageProps {
  onLoginClick: () => void;
  onPackagesClick?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onPackagesClick }) => {
  const [animateLetters, setAnimateLetters] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [initialProduct, setInitialProduct] = useState<'kiki' | 'tano' | 'bundle' | undefined>();
  const { addItem, clearCart } = useCart();
  
  const handleBuyNow = (product: 'kiki' | 'tano' | 'bundle' | 'explorer' | 'adventurer' | 'roadtripper' | 'bookie') => {
    console.log('handleBuyNow called with:', product);
    clearCart();
    setInitialProduct(product);
    setShowCart(true);
    console.log('showCart set to true');
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
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-white via-blue-50 to-purple-50">
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
          <div className="flex flex-row justify-center items-center gap-4 sm:gap-8 lg:gap-16 mb-12">
            <div className="text-center transform hover:scale-110 transition-transform duration-300 flex flex-col items-center">
              <div className="bg-white rounded-full p-4 shadow-xl mb-4">
                <Kiki className="mx-auto" />
              </div>
              <p className="text-brand-green font-mali font-bold text-xl drop-shadow-sm">Meet Kiki</p>
              <p className="text-gray-600 font-mali text-sm">Letter Explorer</p>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300 flex flex-col items-center">
              <div className="bg-white rounded-full p-4 shadow-xl mb-4">
                <Tano className="mx-auto" />
              </div>
              <p className="text-brand-blue font-mali font-bold text-xl drop-shadow-sm">Meet Tano</p>
              <p className="text-gray-600 font-mali text-sm">Song Master</p>
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-mali font-bold text-brand-green mb-6 drop-shadow-sm leading-tight">
            African Alphabet Adventures
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl font-mali text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Fun learning for kids ages 1-6
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
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <button 
              onClick={onPackagesClick}
              className="w-full sm:w-auto bg-gradient-to-r from-brand-yellow to-brand-red text-white font-mali font-bold text-base sm:text-lg md:text-xl py-3 sm:py-4 md:py-5 px-6 sm:px-8 md:px-14 rounded-full hover:from-brand-yellow hover:to-brand-red transform hover:scale-110 transition-all duration-300 shadow-2xl flex items-center justify-center gap-2 sm:gap-3"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              Start Adventure
            </button>
            
            <button 
              onClick={onLoginClick}
              className="w-full sm:w-auto bg-white text-brand-green font-mali font-bold text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-5 px-6 sm:px-8 md:px-12 rounded-full hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 border-2 border-brand-green shadow-lg"
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
            {/* Audio Adventures */}
            <div className="bg-gradient-to-br from-brand-yellow to-brand-red rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-30">
                <div className="w-8 h-8 bg-white rounded-full animate-pulse"></div>
                <div className="w-6 h-6 bg-white rounded-full mt-2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-4 h-4 bg-white rounded-full mt-2 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              
              <div className="relative z-10">
                <div className="bg-white/20 rounded-full p-4 w-fit mb-6">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-mali font-bold mb-3 sm:mb-4">Audio Adventures</h3>
                <p className="font-mali text-yellow-100 leading-relaxed text-sm sm:text-base">
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

      {/* Zingalinga Learning Packages Section */}
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
              🌟 Zingalinga Learning Packages
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl font-mali text-purple-100 mb-8">
              Fun Adventures for Little Geniuses!
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-brand-yellow to-brand-red mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Explorer Pack */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full p-6 w-fit mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">🎒</span>
                </div>
                <h3 className="text-3xl font-mali font-bold text-gray-800 mb-2">Explorer Pack</h3>
                <p className="font-mali text-gray-600 text-lg mb-4">Where Letters Come to Life!</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-green rounded-full mt-2"></div>
                  <span className="font-mali text-sm">Letter Safari with playful letter recognition games</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-green rounded-full mt-2"></div>
                  <span className="font-mali text-sm">Magic Word Builder to create fun words like a word wizard!</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-green rounded-full mt-2"></div>
                  <span className="font-mali text-sm">Phonics party - sing along to catchy letter sounds</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-green rounded-full mt-2"></div>
                  <span className="font-mali text-sm">Storytime with exciting tales role plays for children</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-green rounded-full mt-2"></div>
                  <span className="font-mali text-sm">15 Learning Quests - colorful lessons that feel like playtime</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-mali font-bold text-brand-green mb-4">$30/year</div>
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
              <div className="absolute top-4 right-4 bg-brand-red text-white px-3 py-1 rounded-full font-mali font-bold text-xs">
                POPULAR
              </div>
              
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full p-6 w-fit mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">🚀</span>
                </div>
                <h3 className="text-3xl font-mali font-bold text-gray-800 mb-2">Adventurer Pack</h3>
                <p className="font-mali text-gray-600 text-lg mb-4">Reading Superpowers Unlocked!</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mt-2"></div>
                  <span className="font-mali text-sm font-bold">Everything in Explorer Pack PLUS:</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mt-2"></div>
                  <span className="font-mali text-sm">Word Architect: Build bigger, cooler words!</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mt-2"></div>
                  <span className="font-mali text-sm">25 Learning Quests with more stories, more adventures</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mt-2"></div>
                  <span className="font-mali text-sm">25 Gold Star Challenges to earn rewards after each lesson</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-mali font-bold text-brand-blue mb-4">$45/year</div>
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
                  <span className="text-4xl">🚗</span>
                </div>
                <h3 className="text-3xl font-mali font-bold text-gray-800 mb-2">Roadtripper Pack</h3>
                <p className="font-mali text-gray-600 text-lg mb-4">Learning On-The-Go!</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-yellow rounded-full mt-2"></div>
                  <span className="font-mali text-sm">125 Audio adventures, perfect for car rides & travel</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-yellow rounded-full mt-2"></div>
                  <span className="font-mali text-sm">150 Sing-along phonics - turn travel time into learning time</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-yellow rounded-full mt-2"></div>
                  <span className="font-mali text-sm">Story podcasts with African tales that spark imagination</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-mali font-bold text-brand-yellow mb-4">$80</div>
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
                  <span className="text-4xl">📚</span>
                </div>
                <h3 className="text-3xl font-mali font-bold text-gray-800 mb-2">Zingalinga Bookie Pack</h3>
                <p className="font-mali text-gray-600 text-lg mb-4">Interactive Learning Device</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-pink rounded-full mt-2"></div>
                  <span className="font-mali text-sm">Fully aligned PP1 and PP2 equivalent literacy product</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-pink rounded-full mt-2"></div>
                  <span className="font-mali text-sm">Learn through stories anywhere anytime</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-pink rounded-full mt-2"></div>
                  <span className="font-mali text-sm">Battery that lasts 4 days when fully utilized</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-brand-pink rounded-full mt-2"></div>
                  <span className="font-mali text-sm">Interactive screen with 20+ interactive lessons</span>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="text-2xl font-mali font-bold text-brand-pink">$60</div>
                  <span className="text-gray-500 font-mali">or</span>
                  <div className="text-2xl font-mali font-bold text-brand-pink">$82</div>
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
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-mali font-bold text-brand-green mb-4 sm:mb-6">
                Send us a Message
              </h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Parent's Name"
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all text-sm sm:text-base"
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
                  className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-white font-mali font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl hover:from-brand-green hover:to-brand-blue transform hover:scale-105 transition-all duration-300 shadow-lg text-sm sm:text-base"
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
                  onClick={onPackagesClick}
                  className="bg-white text-brand-green font-mali font-bold text-xl py-4 px-12 rounded-full hover:bg-gray-100 transform hover:scale-110 transition-all duration-300 shadow-2xl"
                >
                  View All Packages
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
            // Don't close the cart modal here - let the CartModal handle the thank you flow
          }}
        />
      )}
    </>
  );
};