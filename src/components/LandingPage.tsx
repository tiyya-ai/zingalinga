import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Video, Globe, BarChart3, TreePine, Leaf, ShoppingCart, Star, PlayCircle } from 'lucide-react';
import { Kiki, Tano } from './Characters';

interface LandingPageProps {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [animateLetters, setAnimateLetters] = useState(false);

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
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4 py-20 bg-white pt-32">
        {/* Animated jungle background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-brand-green/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-20 w-24 h-24 bg-brand-yellow/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-brand-blue/20 rounded-full animate-ping"></div>
          
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
          {/* Logo - Made Larger */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/zinga linga logo.png" 
              alt="Zinga Linga Logo" 
              className="h-48 w-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Characters - Kiki and Tano */}
          <div className="flex justify-center items-center gap-12 mb-8">
            <div className="text-center">
              <Kiki className="mx-auto mb-2" />
              <p className="text-gray-800 font-mali font-bold text-lg drop-shadow-sm">Kiki</p>
            </div>
            <div className="text-center">
              <Tano className="mx-auto mb-2" />
              <p className="text-gray-800 font-mali font-bold text-lg drop-shadow-sm">Tano</p>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-mali font-bold text-brand-green mb-6 drop-shadow-sm">
            Join Kiki and Tano on an African Alphabet Adventure
          </h2>
          
          <p className="text-xl font-mali text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
            Fun learning for children ages 1-6 with audio lessons, videos & interactive games.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-gradient-to-r from-brand-yellow to-brand-red text-white font-mali font-bold text-xl py-4 px-12 rounded-full hover:from-brand-yellow hover:to-brand-red transform hover:scale-110 transition-all duration-300 shadow-2xl flex items-center gap-3">
              <Play className="w-6 h-6" />
              Start Learning
            </button>
            
            <button 
              onClick={onLoginClick}
              className="bg-brand-green text-white font-mali font-bold text-lg py-4 px-10 rounded-full hover:bg-green-600 transform hover:scale-105 transition-all duration-300 border-2 border-brand-green"
            >
              Parental Login
            </button>
          </div>
        </div>
      </section>



      {/* Jungle Learning Adventures Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-brand-green/20 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-brand-yellow/20 rounded-full"></div>
          <TreePine className="absolute top-20 right-10 w-16 h-16 text-brand-green/30" />
          <Leaf className="absolute bottom-40 left-20 w-12 h-12 text-brand-green/40" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-5xl font-mali font-bold text-center text-brand-green mb-4">
            Explore the African Alphabet
          </h2>
          <p className="text-2xl font-mali text-center text-gray-700 mb-16">
            with Kiki & Tano
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
      <section id="modules" className="py-20 px-4 bg-gradient-to-br from-brand-blue via-brand-pink to-brand-red relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-28 h-28 bg-brand-yellow/20 rounded-full animate-bounce"></div>
          <ShoppingCart className="absolute top-40 right-10 w-16 h-16 text-white/20 animate-pulse" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-mali font-bold text-white mb-4 drop-shadow-lg">
              Learning Modules
            </h2>
            <p className="text-2xl font-mali text-purple-100 mb-8">
              Choose the perfect adventure for your little explorer
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Kiki's Letters Hunt Module */}
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-8 border border-orange-300 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-brand-yellow to-brand-red rounded-full p-6 w-fit mx-auto mb-4">
                  <Kiki className="scale-75" />
                </div>
                <h3 className="text-3xl font-mali font-bold text-white mb-2">Kiki's Letters Hunt</h3>
                <p className="font-mali text-orange-100 text-lg mb-4">Perfect for ages 1-3 years</p>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-brand-yellow fill-current" />
                  ))}
                  <span className="text-white font-mali ml-2">(4.9/5)</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-2 h-2 bg-brand-yellow rounded-full"></div>
                  <span className="font-mali">Interactive letter recognition games</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-2 h-2 bg-brand-yellow rounded-full"></div>
                  <span className="font-mali">Kiki's musical alphabet songs</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-2 h-2 bg-brand-yellow rounded-full"></div>
                  <span className="font-mali">Touch-and-learn activities</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-2 h-2 bg-brand-yellow rounded-full"></div>
                  <span className="font-mali">26 African animal friends</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-mali font-bold text-brand-yellow mb-4">$11.00</div>
                <button 
                  onClick={onLoginClick}
                  className="w-full bg-gradient-to-r from-brand-yellow to-brand-red text-white font-mali font-bold py-4 px-8 rounded-2xl hover:from-brand-yellow hover:to-brand-red transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Start Kiki's Adventure
                </button>
                <p className="font-mali text-orange-200 text-sm mt-3">One-time purchase • Lifetime access</p>
              </div>
            </div>

            {/* Tano's Jungle Songs Module */}
            <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl p-8 border border-teal-300 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-brand-pink to-brand-red rounded-full p-6 w-fit mx-auto mb-4">
                  <Tano className="scale-75" />
                </div>
                <h3 className="text-3xl font-mali font-bold text-white mb-2">Tano's Jungle Songs</h3>
                <p className="font-mali text-teal-100 text-lg mb-4">Perfect for ages 2-6 years</p>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-brand-yellow fill-current" />
                  ))}
                  <span className="text-white font-mali ml-2">(4.8/5)</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-2 h-2 bg-brand-pink rounded-full"></div>
                  <span className="font-mali">Animated music videos</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-2 h-2 bg-brand-pink rounded-full"></div>
                  <span className="font-mali">Tano's jungle adventures</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-2 h-2 bg-brand-pink rounded-full"></div>
                  <span className="font-mali">Sing-along alphabet songs</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-2 h-2 bg-brand-pink rounded-full"></div>
                  <span className="font-mali">Cultural storytelling</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-mali font-bold text-brand-pink mb-4">$6.99</div>
                <button 
                  onClick={onLoginClick}
                  className="w-full bg-gradient-to-r from-brand-pink to-brand-red text-white font-mali font-bold py-4 px-8 rounded-2xl hover:from-brand-pink hover:to-brand-red transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Join Tano's Safari
                </button>
                <p className="font-mali text-teal-200 text-sm mt-3">One-time purchase • Lifetime access</p>
              </div>
            </div>
          </div>

          {/* Bundle Offer */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-brand-yellow to-brand-red rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl">
              <h3 className="text-3xl font-mali font-bold text-white mb-4">🎉 Complete Adventure Bundle</h3>
              <p className="font-mali text-white/90 text-lg mb-6">Get both Kiki's Letters Hunt AND Tano's Jungle Songs together!</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-2xl font-mali text-white/70 line-through">$17.99</span>
                <span className="text-4xl font-mali font-bold text-white">$14.99</span>
                <span className="bg-brand-red text-white px-3 py-1 rounded-full text-sm font-mali font-bold">SAVE $3</span>
              </div>
              <button 
                onClick={onLoginClick}
                className="bg-white text-brand-red font-mali font-bold py-4 px-12 rounded-2xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg text-xl"
              >
                Get Complete Bundle
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-br from-brand-green via-brand-blue to-brand-pink relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-brand-yellow/20 rounded-full animate-bounce"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-5xl font-mali font-bold text-white mb-8 drop-shadow-lg">
            Ready to Start the Adventure?
          </h2>
          <p className="text-2xl font-mali text-white/90 mb-12">
            Join thousands of families already exploring with Kiki and Tano!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={onLoginClick}
              className="bg-gradient-to-r from-brand-yellow to-brand-red text-white font-mali font-bold text-xl py-4 px-12 rounded-full hover:from-brand-yellow hover:to-brand-red transform hover:scale-110 transition-all duration-300 shadow-2xl"
            >
              Start Learning Today
            </button>
            
            <button className="bg-white/20 backdrop-blur-sm text-white font-mali font-bold text-lg py-4 px-10 rounded-full hover:bg-white/30 transform hover:scale-105 transition-all duration-300 border-2 border-white/30">
              Watch More Videos
            </button>
          </div>
        </div>
      </section>
    </>
  );
};