import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
interface RefundPolicyPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLoginClick?: () => void;
}

const RefundPolicyPage: React.FC<RefundPolicyPageProps> = ({ onBack, onNavigate, onLoginClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-mali">
      <Header 
        onLoginClick={onLoginClick || (() => {})}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onNavigate={onNavigate}
      />
      
      <div className="pt-32"> {/* Account for fixed header */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={onBack} className="flex items-center gap-2 text-brand-green hover:text-green-600 transition-colors mb-6 font-mali">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="bg-gradient-to-br from-brand-red to-brand-yellow rounded-3xl p-8 text-white mb-8">
            <h1 className="text-4xl font-mali font-bold mb-4">Refund Policy</h1>
            <p className="text-xl font-mali">Our commitment to customer satisfaction and refund terms.</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
            <section>
              <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">Refund Policy</h2>
              <p className="font-mali text-gray-700">At Zinga Linga, we strive to provide the highest quality educational content for your children. We understand that sometimes circumstances change, and we've created a fair and transparent refund policy to address these situations.</p>
            </section>

            <section>
              <h3 className="text-xl font-mali font-bold text-brand-green mb-3">Subscription Refunds</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <h4 className="font-mali font-bold text-gray-800 mb-2">14-Day Money-Back Guarantee</h4>
                  <p className="font-mali text-gray-700">We offer a 14-day money-back guarantee for all new subscriptions. If you're not satisfied with our service within the first 14 days of your subscription, you can request a full refund, no questions asked.</p>
                </div>
                <div>
                  <h4 className="font-mali font-bold text-gray-800 mb-2">Monthly Subscriptions</h4>
                  <p className="font-mali text-gray-700">Monthly subscriptions can be canceled at any time. Refunds are prorated based on usage, with a minimum service fee of one month.</p>
                </div>
                <div>
                  <h4 className="font-mali font-bold text-gray-800 mb-2">Annual Subscriptions</h4>
                  <p className="font-mali text-gray-700">Annual subscriptions canceled after the 14-day period are eligible for a prorated refund of unused months, less any applied discounts.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-mali font-bold text-brand-green mb-3">How to Request a Refund</h3>
              <div className="space-y-4">
                <p className="font-mali text-gray-700">To request a refund, you can:</p>
                <ol className="list-decimal ml-6 font-mali text-gray-700 space-y-2">
                  <li>Log into your account and visit the billing section</li>
                  <li>Contact our support team at billing@zingalinga.com</li>
                  <li>Use the contact form on our <span className="text-brand-green cursor-pointer" onClick={() => onNavigate('contact')}>Contact Page</span></li>
                </ol>
                <p className="font-mali text-gray-700 mt-4">Please include your account email and reason for requesting a refund.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-mali font-bold text-brand-green mb-3">Non-Refundable Items</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc ml-6 font-mali text-gray-700 space-y-2">
                  <li>Special promotional offers marked as non-refundable</li>
                  <li>Add-on content purchases after download or access</li>
                  <li>Subscription time already used or consumed</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-mali font-bold text-brand-green mb-3">Processing Time</h3>
              <div className="space-y-4">
                <p className="font-mali text-gray-700">Refund requests are typically processed within 3-5 business days. The actual time for the refund to appear in your account depends on your payment method:</p>
                <ul className="list-disc ml-6 font-mali text-gray-700 space-y-2">
                  <li>Credit/Debit Cards: 5-10 business days</li>
                  <li>PayPal: 2-3 business days</li>
                  <li>Bank Transfers: 5-7 business days</li>
                </ul>
              </div>
            </section>

            <section className="border-t pt-6">
              <h3 className="text-xl font-mali font-bold text-brand-green mb-3">Special Circumstances</h3>
              <p className="font-mali text-gray-700">We understand that special circumstances may arise. If you have a unique situation not covered by our standard policy, please contact our support team, and we'll be happy to work with you to find a fair solution.</p>
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <p className="font-mali text-gray-700">For any questions about our refund policy, please contact:</p>
                <p className="font-mali text-brand-green mt-2">billing@zingalinga.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default RefundPolicyPage;
export { RefundPolicyPage };