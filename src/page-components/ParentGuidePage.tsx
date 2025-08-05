import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';

interface ParentGuidePageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLoginClick?: () => void;
}

const ParentGuidePage: React.FC<ParentGuidePageProps> = ({ onBack, onNavigate, onLoginClick }) => {
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-green hover:text-green-600 transition-colors mb-6 font-mali">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="bg-gradient-to-br from-brand-blue to-brand-green rounded-3xl p-8 text-white mb-8">
            <h1 className="text-4xl font-mali font-bold mb-4">Parent Guide</h1>
            <p className="text-xl font-mali">A comprehensive guide for parents to maximize their child's learning experience.</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">Parent Guide</h2>
            <p className="font-mali text-gray-700">Parent guide content coming soon...</p>
          </div>
        </div>
      </div>
      
      {/* Spacer to ensure footer appears */}
      <div className="h-20"></div>
    </div>
  );
};

export default ParentGuidePage;
export { ParentGuidePage };