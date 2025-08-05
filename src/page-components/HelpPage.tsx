'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';


interface HelpPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLoginClick?: () => void;
}

const HelpPage: React.FC<HelpPageProps> = ({ onBack, onNavigate, onLoginClick }) => {
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
          <div className="bg-gradient-to-br from-brand-yellow to-brand-red rounded-3xl p-8 text-white mb-8">
            <h1 className="text-4xl font-mali font-bold mb-4">Help Center</h1>
            <p className="text-xl font-mali">Find answers to common questions and get support.</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
            <section>
              <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">Frequently Asked Questions</h2>
              <p className="font-mali text-gray-700 mb-6">Find answers to the most common questions about Zinga Linga's educational platform.</p>
            </section>

            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-mali font-bold text-brand-green mb-2">Getting Started</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-mali font-bold text-gray-800 mb-2">How do I create an account?</h4>
                    <p className="font-mali text-gray-700">Click the "Sign Up" button on the homepage, fill in your details, and follow the verification process. Parents must create accounts for children under 13.</p>
                  </div>
                  <div>
                    <h4 className="font-mali font-bold text-gray-800 mb-2">What age groups is Zinga Linga suitable for?</h4>
                    <p className="font-mali text-gray-700">Our platform is designed for children aged 5-12, with content tailored to different age groups and learning levels.</p>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-mali font-bold text-brand-green mb-2">Subscriptions & Payments</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-mali font-bold text-gray-800 mb-2">What subscription plans are available?</h4>
                    <p className="font-mali text-gray-700">We offer monthly and annual subscription plans. Annual subscriptions come with a significant discount.</p>
                  </div>
                  <div>
                    <h4 className="font-mali font-bold text-gray-800 mb-2">Can I cancel my subscription?</h4>
                    <p className="font-mali text-gray-700">Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.</p>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-mali font-bold text-brand-green mb-2">Content & Learning</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-mali font-bold text-gray-800 mb-2">How does the learning system work?</h4>
                    <p className="font-mali text-gray-700">Our platform uses interactive videos, games, and exercises to teach concepts. Progress is tracked automatically, and content adapts to your child's learning pace.</p>
                  </div>
                  <div>
                    <h4 className="font-mali font-bold text-gray-800 mb-2">Can parents track their child's progress?</h4>
                    <p className="font-mali text-gray-700">Yes, parents have access to a dashboard showing learning progress, time spent, and areas of improvement for their child.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-mali font-bold text-brand-green mb-2">Additional Help</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-mali text-gray-700 mb-2">Need more assistance? We're here to help!</p>
                  <ul className="font-mali text-gray-700 space-y-2">
                    <li>• Email us at: help@zingalinga.com</li>
                    <li>• Visit our <span className="text-brand-green cursor-pointer" onClick={() => onNavigate('support')}>Technical Support</span> page</li>
                    <li>• Check our <span className="text-brand-green cursor-pointer" onClick={() => onNavigate('guide')}>Parent Guide</span></li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      
      {/* Spacer to ensure footer appears */}
      <div className="h-20"></div>
    </div>
  );
};


export default HelpPage;