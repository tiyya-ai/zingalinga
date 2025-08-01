import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface RefundPolicyPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const RefundPolicyPage: React.FC<RefundPolicyPageProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-brand-green hover:text-green-600 transition-colors mb-6 font-mali">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
        <div className="bg-gradient-to-br from-brand-red to-brand-yellow rounded-3xl p-8 text-white mb-8">
          <h1 className="text-4xl font-mali font-bold mb-4">Refund Policy</h1>
          <p className="text-xl font-mali">Our commitment to customer satisfaction and refund terms.</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">Refund Policy</h2>
          <p className="font-mali text-gray-700">Refund policy content coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
export { RefundPolicyPage };