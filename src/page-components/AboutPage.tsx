import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-brand-green hover:text-green-600 transition-colors mb-6 font-mali"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
        
        <div className="bg-gradient-to-br from-brand-green to-brand-blue rounded-3xl p-8 text-white mb-8">
          <h1 className="text-4xl font-mali font-bold mb-4">About Zinga Linga</h1>
          <p className="text-xl font-mali">
            Empowering young minds through African culture and alphabet learning
          </p>
        </div>
        
        <div className="prose max-w-none">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">Our Mission</h2>
            <p className="font-mali text-gray-700 leading-relaxed">
              At Zinga Linga, we believe that learning should be fun, engaging, and culturally enriching. 
              Our mission is to provide children ages 1-6 with high-quality educational content that 
              celebrates African culture while teaching fundamental alphabet and language skills.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">Meet Kiki & Tano</h2>
            <p className="font-mali text-gray-700 leading-relaxed">
              Our beloved characters, Kiki the monkey and Tano the elephant, guide children through 
              exciting adventures across the African continent. Through their stories, children learn 
              letters, sounds, and cultural values in an entertaining and memorable way.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">Educational Excellence</h2>
            <p className="font-mali text-gray-700 leading-relaxed">
              Our content is developed by educational experts and child development specialists to ensure 
              age-appropriate learning experiences. We combine traditional African storytelling with 
              modern educational techniques to create engaging and effective learning modules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
