import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

interface ContactPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onBack, onNavigate }) => {
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
        
        <div className="bg-gradient-to-br from-brand-blue to-brand-pink rounded-3xl p-8 text-white mb-8">
          <h1 className="text-4xl font-mali font-bold mb-4">Contact Us</h1>
          <p className="text-xl font-mali">
            We'd love to hear from you! Get in touch with our team.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-mali font-bold text-brand-green mb-6">Get in Touch</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-blue" />
                <span className="font-mali">hello@zingalinga.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-blue" />
                <span className="font-mali">+1 (555) 123-KIDS</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-brand-blue" />
                <span className="font-mali">Educational Excellence Center</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-mali font-bold text-brand-green mb-6">Send a Message</h2>
            
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3 border border-gray-300 rounded-lg font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 border border-gray-300 rounded-lg font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg font-mali focus:ring-2 focus:ring-brand-green focus:border-transparent"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-white font-mali font-bold py-3 px-6 rounded-lg hover:from-brand-green hover:to-brand-blue transform hover:scale-105 transition-all duration-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ContactPage;