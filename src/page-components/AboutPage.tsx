'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';


interface AboutPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLoginClick?: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack, onNavigate, onLoginClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-mali">
      <Header 
        onLoginClick={onLoginClick || (() => {})}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onNavigate={onNavigate}
      />
      
      <div className="pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-brand-green hover:text-green-600 transition-colors mb-4 sm:mb-6 font-mali"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Home</span>
          </button>
          
          <div className="bg-gradient-to-br from-brand-green to-brand-blue rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-mali font-bold mb-3 sm:mb-4">About Zinga Linga</h1>
            <p className="text-lg sm:text-xl font-mali leading-relaxed">
              Empowering young minds through African culture and alphabet learning
            </p>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-mali font-bold text-brand-green mb-3 sm:mb-4">Our Mission</h2>
              <p className="font-mali text-gray-700 leading-relaxed text-sm sm:text-base">
                At Zinga Linga, we believe that learning should be fun, engaging, and culturally enriching. 
                Our mission is to provide children ages 1-6 with high-quality educational content that 
                celebrates African culture while teaching fundamental alphabet and language skills.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-mali font-bold text-brand-green mb-3 sm:mb-4">Meet Kiki & Tano</h2>
              <p className="font-mali text-gray-700 leading-relaxed text-sm sm:text-base">
                Our beloved characters, Kiki the monkey and Tano the elephant, guide children through 
                exciting adventures across the African continent. Through their stories, children learn 
                letters, sounds, and cultural values in an entertaining and memorable way.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-mali font-bold text-brand-green mb-3 sm:mb-4">Educational Excellence</h2>
              <p className="font-mali text-gray-700 leading-relaxed text-sm sm:text-base">
                Our content is developed by educational experts and child development specialists to ensure 
                age-appropriate learning experiences. We combine traditional African storytelling with 
                modern educational techniques to create engaging and effective learning modules.
              </p>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default AboutPage;