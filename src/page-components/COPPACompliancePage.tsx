import React, { useState } from 'react';
import { ArrowLeft, Shield, Users, Lock, Eye, AlertTriangle, CheckCircle, Heart } from 'lucide-react';
import Header from '../components/Header';

interface COPPACompliancePageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLoginClick?: () => void;
}

const COPPACompliancePage: React.FC<COPPACompliancePageProps> = ({ onBack, onNavigate, onLoginClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 font-mali">
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
          
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-blue to-brand-pink rounded-3xl p-8 text-white mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8" />
              <h1 className="text-4xl font-mali font-bold">COPPA Compliance</h1>
            </div>
            <p className="text-xl font-mali">Our unwavering commitment to children's online privacy and safety.</p>
            <p className="text-sm font-mali mt-2 opacity-90">Fully compliant with the Children's Online Privacy Protection Act</p>
          </div>

          {/* COPPA Certification Badge */}
          <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-mali font-bold text-green-800">COPPA Certified Platform</h3>
            </div>
            <p className="text-green-700 font-mali">
              Zinga Linga is designed specifically for children under 13 and fully complies with all COPPA requirements. 
              We prioritize your child's safety and privacy above all else.
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            
            {/* What is COPPA */}
            <div className="p-8 space-y-8">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-brand-blue" />
                  <h2 className="text-2xl font-mali font-bold text-gray-800">What is COPPA?</h2>
                </div>
                <p className="font-mali text-gray-700 leading-relaxed mb-4">
                  The Children's Online Privacy Protection Act (COPPA) is a federal law that protects the privacy of children under 13 years old. 
                  It requires websites and online services to obtain verifiable parental consent before collecting, using, or disclosing personal information from children.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-mali text-blue-800 font-bold mb-2">COPPA applies to:</p>
                  <ul className="list-disc list-inside text-blue-700 font-mali space-y-1">
                    <li>Websites and online services directed to children under 13</li>
                    <li>General audience sites that knowingly collect information from children under 13</li>
                    <li>Educational platforms serving young learners</li>
                  </ul>
                </div>
              </section>

              {/* Our COPPA Compliance */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-brand-green" />
                  <h2 className="text-2xl font-mali font-bold text-gray-800">How Zinga Linga Complies with COPPA</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-mali font-bold text-green-800 mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Parental Consent
                    </h4>
                    <p className="text-green-700 font-mali text-sm">
                      We require verifiable parental consent before collecting any personal information from children. 
                      Parents must create accounts and approve all activities.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-mali font-bold text-blue-800 mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Limited Data Collection
                    </h4>
                    <p className="text-blue-700 font-mali text-sm">
                      We only collect information necessary for educational purposes and never collect more than needed 
                      for the child's participation in our learning activities.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-mali font-bold text-purple-800 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Parental Control
                    </h4>
                    <p className="text-purple-700 font-mali text-sm">
                      Parents have full control over their child's account, can review collected information, 
                      and can request deletion at any time.
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-mali font-bold text-yellow-800 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      No Third-Party Sharing
                    </h4>
                    <p className="text-yellow-700 font-mali text-sm">
                      We never share, sell, or disclose children's personal information to third parties 
                      without explicit parental consent.
                    </p>
                  </div>
                </div>
              </section>

              {/* Information We Collect */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6 text-brand-yellow" />
                  <h2 className="text-2xl font-mali font-bold text-gray-800">Information We Collect from Children</h2>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-mali font-bold text-yellow-800">With Parental Consent Only:</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-mali font-bold text-yellow-800 mb-2">Educational Data:</h5>
                      <ul className="list-disc list-inside text-yellow-700 font-mali space-y-1 text-sm">
                        <li>Learning progress and achievements</li>
                        <li>Completed lessons and activities</li>
                        <li>Time spent on educational content</li>
                        <li>Preferred learning modules</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-mali font-bold text-yellow-800 mb-2">Technical Data:</h5>
                      <ul className="list-disc list-inside text-yellow-700 font-mali space-y-1 text-sm">
                        <li>Device type (for compatibility)</li>
                        <li>App usage patterns (anonymized)</li>
                        <li>Error logs (for improvement)</li>
                        <li>Session duration</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-100 rounded">
                    <p className="font-mali text-yellow-800 font-bold text-sm">
                      ⚠️ We NEVER collect: Names, photos, addresses, phone numbers, or any personally identifiable information from children.
                    </p>
                  </div>
                </div>
              </section>

              {/* Parental Rights */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-6 h-6 text-brand-pink" />
                  <h2 className="text-2xl font-mali font-bold text-gray-800">Your Parental Rights</h2>
                </div>
                
                <div className="bg-pink-50 p-6 rounded-lg">
                  <p className="font-mali text-pink-800 mb-4">As a parent or guardian, you have the right to:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="list-disc list-inside text-pink-700 font-mali space-y-2">
                      <li>Review all information collected about your child</li>
                      <li>Request deletion of your child's information</li>
                      <li>Refuse further collection of information</li>
                      <li>Withdraw consent at any time</li>
                    </ul>
                    <ul className="list-disc list-inside text-pink-700 font-mali space-y-2">
                      <li>Control your child's account settings</li>
                      <li>Monitor all learning activities</li>
                      <li>Receive notifications about data practices</li>
                      <li>Contact us with any concerns</li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-4 bg-pink-100 rounded-lg">
                    <h4 className="font-mali font-bold text-pink-800 mb-2">How to Exercise Your Rights:</h4>
                    <p className="font-mali text-pink-700 text-sm">
                      Contact our COPPA Compliance Officer at: <strong>coppa@zingalinga.com</strong><br/>
                      Or use your parent dashboard to manage your child's account settings.
                    </p>
                  </div>
                </div>
              </section>

              {/* Safety Measures */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-brand-red" />
                  <h2 className="text-2xl font-mali font-bold text-gray-800">Our Safety Measures</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-mali font-bold text-red-800 mb-2">Secure Platform</h4>
                    <p className="text-red-700 font-mali text-sm">All data encrypted and stored securely</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-mali font-bold text-blue-800 mb-2">No Social Features</h4>
                    <p className="text-blue-700 font-mali text-sm">No chat, messaging, or social interaction</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-mali font-bold text-green-800 mb-2">Parental Oversight</h4>
                    <p className="text-green-700 font-mali text-sm">Full transparency and parental control</p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-gradient-to-r from-brand-green to-brand-blue p-6 rounded-lg text-white">
                <h3 className="text-xl font-mali font-bold mb-4">COPPA Compliance Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-mali font-bold mb-2">COPPA Compliance Officer</p>
                    <p className="font-mali">Email: coppa@zingalinga.com</p>
                    <p className="font-mali">Phone: +1 (555) 123-KIDS</p>
                  </div>
                  <div>
                    <p className="font-mali font-bold mb-2">Questions or Concerns?</p>
                    <p className="font-mali text-sm">
                      If you have any questions about our COPPA compliance or your child's privacy, 
                      please don't hesitate to contact us. We're here to help!
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => onNavigate('privacy')}
              className="bg-brand-green text-white px-6 py-3 rounded-full font-mali font-bold hover:bg-green-600 transition-colors"
            >
              View Privacy Policy
            </button>
            <button 
              onClick={() => onNavigate('terms')}
              className="bg-brand-blue text-white px-6 py-3 rounded-full font-mali font-bold hover:bg-blue-600 transition-colors"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => onNavigate('contact')}
              className="bg-brand-yellow text-gray-900 px-6 py-3 rounded-full font-mali font-bold hover:bg-yellow-400 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default COPPACompliancePage;
export { COPPACompliancePage };