'use client';

import React, { useState } from 'react';
import { ArrowLeft, Shield, Eye, Lock, Users, Heart, AlertTriangle } from 'lucide-react';
import Header from '../components/Header';


interface PrivacyPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLoginClick?: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack, onNavigate, onLoginClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastUpdated = "January 1, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 font-mali">
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
          
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-green to-brand-blue rounded-3xl p-8 text-white mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8" />
              <h1 className="text-4xl font-mali font-bold">Privacy Policy</h1>
            </div>
            <p className="text-xl font-mali">Your privacy and your child's safety are our top priorities.</p>
            <p className="text-sm font-mali mt-2 opacity-90">Last updated: {lastUpdated}</p>
          </div>

          {/* COPPA Compliance Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-mali font-bold text-yellow-800">COPPA Compliance Notice</h3>
            </div>
            <p className="text-yellow-700 font-mali">
              Zinga Linga is designed for children under 13 and fully complies with the Children's Online Privacy Protection Act (COPPA). 
              We do not knowingly collect personal information from children without verifiable parental consent.
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            
            {/* Table of Contents */}
            <div className="bg-gray-50 p-6 border-b">
              <h3 className="text-lg font-mali font-bold text-gray-800 mb-4">Table of Contents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <a href="#information-we-collect" className="text-brand-green hover:underline font-mali">1. Information We Collect</a>
                <a href="#how-we-use" className="text-brand-green hover:underline font-mali">2. How We Use Information</a>
                <a href="#information-sharing" className="text-brand-green hover:underline font-mali">3. Information Sharing</a>
                <a href="#data-security" className="text-brand-green hover:underline font-mali">4. Data Security</a>
                <a href="#parental-rights" className="text-brand-green hover:underline font-mali">5. Parental Rights</a>
                <a href="#cookies" className="text-brand-green hover:underline font-mali">6. Cookies & Tracking</a>
                <a href="#data-retention" className="text-brand-green hover:underline font-mali">7. Data Retention</a>
                <a href="#contact-us" className="text-brand-green hover:underline font-mali">8. Contact Us</a>
              </div>
            </div>

            <div className="p-8 space-y-8">
              
              {/* Introduction */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-6 h-6 text-brand-pink" />
                  <h2 className="text-2xl font-mali font-bold text-gray-800">Our Commitment to Privacy</h2>
                </div>
                <p className="font-mali text-gray-700 leading-relaxed mb-4">
                  At Zinga Linga, we understand that your child's privacy and safety are paramount. This Privacy Policy explains how we collect, 
                  use, and protect information when you and your child use our educational platform featuring Kiki and Tano's adventures.
                </p>
                <p className="font-mali text-gray-700 leading-relaxed">
                  We are committed to creating a safe, educational environment that complies with all applicable privacy laws, 
                  including the Children's Online Privacy Protection Act (COPPA).
                </p>
              </section>

              {/* Information We Collect */}
              <section id="information-we-collect">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6 text-brand-blue" />
                  <h2 className="text-2xl font-mali font-bold text-gray-800">1. Information We Collect</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-mali font-bold text-blue-800 mb-2">From Parents/Guardians:</h4>
                    <ul className="list-disc list-inside text-blue-700 font-mali space-y-1">
                      <li>Email address for account creation and communication</li>
                      <li>Payment information for purchases (processed securely by third-party providers)</li>
                      <li>Name and contact information when you contact us</li>
                      <li>Parental consent records</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-mali font-bold text-green-800 mb-2">From Children (with parental consent only):</h4>
                    <ul className="list-disc list-inside text-green-700 font-mali space-y-1">
                      <li>Learning progress and achievements</li>
                      <li>Preferred learning modules and activities</li>
                      <li>Time spent on educational activities</li>
                      <li>No personal identifying information is collected from children</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-mali font-bold text-gray-800 mb-2">Technical Information:</h4>
                    <ul className="list-disc list-inside text-gray-700 font-mali space-y-1">
                      <li>Device type and operating system</li>
                      <li>Browser type and version</li>
                      <li>IP address (anonymized)</li>
                      <li>Usage analytics (anonymized)</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section id="how-we-use">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-brand-yellow" />
                  <h2 className="text-2xl font-mali font-bold text-gray-800">2. How We Use Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-mali font-bold text-yellow-800 mb-2">Educational Purposes:</h4>
                    <ul className="list-disc list-inside text-yellow-700 font-mali space-y-1">
                      <li>Personalize learning experiences</li>
                      <li>Track educational progress</li>
                      <li>Recommend appropriate content</li>
                      <li>Improve our educational materials</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-mali font-bold text-purple-800 mb-2">Service Delivery:</h4>
                    <ul className="list-disc list-inside text-purple-700 font-mali space-y-1">
                      <li>Process purchases and subscriptions</li>
                      <li>Send important service updates</li>
                      <li>Provide customer support</li>
                      <li>Ensure platform security</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Information Sharing */}
              <section id="information-sharing">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-brand-red" />
                  <h2 className="text-2xl font-mali font-bold text-gray-800">3. Information Sharing</h2>
                </div>
                
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                  <p className="font-mali font-bold text-red-800 mb-2">We DO NOT sell, rent, or share your child's information with third parties for marketing purposes.</p>
                </div>
                
                <p className="font-mali text-gray-700 mb-4">We may share information only in these limited circumstances:</p>
                <ul className="list-disc list-inside text-gray-700 font-mali space-y-2">
                  <li><strong>Service Providers:</strong> Trusted partners who help us operate our platform (payment processors, hosting services)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect safety</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger or acquisition (with continued privacy protection)</li>
                  <li><strong>Parental Request:</strong> When parents request their child's information</li>
                </ul>
              </section>

              {/* Data Security */}
              <section id="data-security">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-brand-green" />
                  <h2 className="text-2xl font-mali font-bold text-gray-800">4. Data Security</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-mali font-bold text-green-800 mb-2">Encryption</h4>
                    <p className="text-green-700 font-mali text-sm">All data is encrypted in transit and at rest</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Lock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-mali font-bold text-blue-800 mb-2">Secure Access</h4>
                    <p className="text-blue-700 font-mali text-sm">Limited access with strong authentication</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-mali font-bold text-purple-800 mb-2">Regular Audits</h4>
                    <p className="text-purple-700 font-mali text-sm">Continuous security monitoring and updates</p>
                  </div>
                </div>
              </section>

              {/* Parental Rights */}
              <section id="parental-rights">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-brand-pink" />
                  <h2 className="text-2xl font-mali font-bold text-gray-800">5. Parental Rights & Controls</h2>
                </div>
                
                <div className="bg-pink-50 p-6 rounded-lg">
                  <p className="font-mali text-pink-800 mb-4">As a parent or guardian, you have the right to:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="list-disc list-inside text-pink-700 font-mali space-y-2">
                      <li>Review your child's information</li>
                      <li>Request deletion of your child's data</li>
                      <li>Refuse further collection of information</li>
                      <li>Update or correct information</li>
                    </ul>
                    <ul className="list-disc list-inside text-pink-700 font-mali space-y-2">
                      <li>Control your child's account settings</li>
                      <li>Monitor learning progress</li>
                      <li>Withdraw consent at any time</li>
                      <li>Contact us with any concerns</li>
                    </ul>
                  </div>
                  <p className="font-mali text-pink-800 mt-4">
                    <strong>To exercise these rights, contact us at:</strong> privacy@zingalinga.com
                  </p>
                </div>
              </section>

              {/* Cookies & Tracking */}
              <section id="cookies">
                <h2 className="text-2xl font-mali font-bold text-gray-800 mb-4">6. Cookies & Tracking</h2>
                <p className="font-mali text-gray-700 mb-4">
                  We use minimal, child-safe cookies and tracking technologies to:
                </p>
                <ul className="list-disc list-inside text-gray-700 font-mali space-y-2 mb-4">
                  <li>Remember login status and preferences</li>
                  <li>Ensure platform security</li>
                  <li>Analyze usage patterns (anonymized)</li>
                  <li>Improve user experience</li>
                </ul>
                <p className="font-mali text-gray-700">
                  We do not use advertising cookies or behavioral tracking for children under 13.
                </p>
              </section>

              {/* Data Retention */}
              <section id="data-retention">
                <h2 className="text-2xl font-mali font-bold text-gray-800 mb-4">7. Data Retention</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="list-disc list-inside text-gray-700 font-mali space-y-2">
                    <li><strong>Account Information:</strong> Retained while account is active</li>
                    <li><strong>Learning Progress:</strong> Retained to provide educational continuity</li>
                    <li><strong>Payment Information:</strong> Retained as required by law</li>
                    <li><strong>Support Communications:</strong> Retained for 3 years</li>
                  </ul>
                  <p className="font-mali text-gray-700 mt-4">
                    Data is securely deleted when no longer needed or upon parental request.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section id="contact-us">
                <h2 className="text-2xl font-mali font-bold text-gray-800 mb-4">8. Contact Us</h2>
                <div className="bg-gradient-to-r from-brand-green to-brand-blue p-6 rounded-lg text-white">
                  <p className="font-mali mb-4">
                    If you have any questions about this Privacy Policy or your child's privacy, please contact us:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-mali font-bold mb-2">Privacy Officer</p>
                      <p className="font-mali">Email: privacy@zingalinga.com</p>
                      <p className="font-mali">Phone: +1 (555) 123-KIDS</p>
                    </div>
                    <div>
                      <p className="font-mali font-bold mb-2">Mailing Address</p>
                      <p className="font-mali">Zinga Linga Privacy Team</p>
                      <p className="font-mali">123 Education Street</p>
                      <p className="font-mali">Learning City, LC 12345</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Updates Notice */}
              <section className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="font-mali font-bold text-yellow-800 mb-2">Policy Updates</h3>
                <p className="font-mali text-yellow-700">
                  We may update this Privacy Policy from time to time. We will notify parents of any material changes 
                  via email and post the updated policy on our website. Continued use of our service after changes 
                  constitutes acceptance of the updated policy.
                </p>
              </section>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => onNavigate('terms')}
              className="bg-brand-green text-white px-6 py-3 rounded-full font-mali font-bold hover:bg-green-600 transition-colors"
            >
              View Terms of Service
            </button>
            <button 
              onClick={() => onNavigate('coppa')}
              className="bg-brand-blue text-white px-6 py-3 rounded-full font-mali font-bold hover:bg-blue-600 transition-colors"
            >
              COPPA Compliance
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

export default PrivacyPage;