'use client';

import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageCircle, HelpCircle } from 'lucide-react';
import Header from '../components/Header';


interface ContactPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLoginClick?: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onBack, onNavigate, onLoginClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-mali">
      <Header 
        onLoginClick={onLoginClick || (() => {})}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onNavigate={onNavigate}
      />
      
      <div className="pt-32"> {/* Account for fixed header */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-brand-green hover:text-green-600 transition-colors mb-8 font-mali font-bold text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          
          <div className="bg-gradient-to-br from-brand-green via-brand-blue to-brand-pink rounded-3xl p-12 text-white mb-12 text-center">
            <h1 className="text-5xl font-mali font-bold mb-6">Contact Us</h1>
            <p className="text-2xl font-mali mb-4">
              We'd love to hear from you! Get in touch with our team.
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-mali text-lg">We're online and ready to help!</span>
            </div>
          </div>
          
          {/* Quick Help Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-3xl font-mali font-bold text-brand-green mb-8 text-center">Quick Help</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'How to access content?',
                'Billing questions',
                'Technical support',
                'Age recommendations',
                'Refund policy',
                'Account management'
              ].map((item, index) => (
                <button
                  key={index}
                  className="p-4 rounded-xl hover:bg-gray-50 transition-colors font-mali text-gray-700 hover:text-brand-green flex items-center gap-3 border border-gray-200 hover:border-brand-green"
                >
                  <HelpCircle className="w-5 h-5" />
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-1 gap-8 mb-12">
            {/* Contact Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-mali font-bold text-brand-green mb-8">Contact Form</h2>
                
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-mali font-bold text-gray-700 mb-2">Parent's Name</label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block font-mali font-bold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-mali font-bold text-gray-700 mb-2">Child's Age</label>
                      <select className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all">
                        <option>Select age range</option>
                        <option>1-2 years</option>
                        <option>2-3 years</option>
                        <option>3-4 years</option>
                        <option>4-5 years</option>
                        <option>5-6 years</option>
                        <option>6+ years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mali font-bold text-gray-700 mb-2">Subject</label>
                      <select className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all">
                        <option>What can we help you with?</option>
                        <option>General Questions</option>
                        <option>Technical Support</option>
                        <option>Billing & Purchases</option>
                        <option>Educational Content</option>
                        <option>Partnership Opportunities</option>
                        <option>Feedback & Suggestions</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block font-mali font-bold text-gray-700 mb-2">Your Message</label>
                    <textarea
                      placeholder="Tell us how we can help you and your child..."
                      rows={6}
                      className="w-full p-4 border border-gray-200 rounded-xl font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all resize-none"
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="newsletter" className="w-4 h-4 text-brand-green" />
                    <label htmlFor="newsletter" className="font-mali text-gray-600">
                      Subscribe to our newsletter for educational tips and updates
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-white font-mali font-bold py-4 px-8 rounded-xl hover:from-brand-green hover:to-brand-blue transform hover:scale-105 transition-all duration-300 shadow-lg text-lg flex items-center justify-center gap-3"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Response Time Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Clock className="w-8 h-8 text-brand-blue" />
              <h3 className="text-2xl font-mali font-bold text-gray-800">Response Times</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-fit mx-auto mb-3">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-mali font-bold text-gray-800">Email</h4>
                <p className="font-mali text-gray-600">2-4 hours</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-fit mx-auto mb-3">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-mali font-bold text-gray-800">Phone</h4>
                <p className="font-mali text-gray-600">Immediate</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 w-fit mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-mali font-bold text-gray-800">Live Chat</h4>
                <p className="font-mali text-gray-600">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default ContactPage;