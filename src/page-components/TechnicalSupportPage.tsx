import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';

interface TechnicalSupportPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLoginClick?: () => void;
}

const TechnicalSupportPage: React.FC<TechnicalSupportPageProps> = ({ onBack, onNavigate, onLoginClick }) => {
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
            <h1 className="text-4xl font-mali font-bold mb-4">Technical Support</h1>
            <p className="text-xl font-mali">Get technical help and troubleshooting assistance.</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
            <section>
              <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">Technical Support</h2>
              <p className="font-mali text-gray-700 mb-4">Welcome to Zinga Linga's Technical Support. Our team is here to help you resolve any technical issues you may encounter.</p>
            </section>

            <section>
              <h3 className="text-xl font-mali font-bold text-brand-green mb-3">Common Issues</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-mali font-bold text-brand-green mb-2">Login Problems</h4>
                  <p className="font-mali text-gray-700">If you're having trouble logging in, try these steps:</p>
                  <ul className="list-disc ml-6 mt-2 font-mali text-gray-700">
                    <li>Clear your browser cache and cookies</li>
                    <li>Ensure your password is correctly entered</li>
                    <li>Check if your email address is verified</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-mali font-bold text-brand-green mb-2">Video Playback Issues</h4>
                  <p className="font-mali text-gray-700">To resolve video playback problems:</p>
                  <ul className="list-disc ml-6 mt-2 font-mali text-gray-700">
                    <li>Check your internet connection</li>
                    <li>Update your browser to the latest version</li>
                    <li>Try a different browser</li>
                    <li>Disable browser extensions temporarily</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-mali font-bold text-brand-green mb-2">Payment Issues</h4>
                  <p className="font-mali text-gray-700">For payment-related problems:</p>
                  <ul className="list-disc ml-6 mt-2 font-mali text-gray-700">
                    <li>Verify your payment information is correct</li>
                    <li>Check if your card has sufficient funds</li>
                    <li>Contact your bank if payment is declined</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-mali font-bold text-brand-green mb-3">Contact Support</h3>
              <p className="font-mali text-gray-700 mb-4">Still need help? Our support team is available:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="font-mali text-gray-700 space-y-2">
                  <li><span className="font-bold">Email:</span> support@zingalinga.com</li>
                  <li><span className="font-bold">Hours:</span> Monday-Friday, 9:00 AM - 6:00 PM EST</li>
                  <li><span className="font-bold">Response Time:</span> Within 24 hours</li>
                </ul>
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

export default TechnicalSupportPage;
export { TechnicalSupportPage };