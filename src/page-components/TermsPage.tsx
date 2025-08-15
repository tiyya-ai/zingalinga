'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';


interface TermsPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onLoginClick?: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onBack, onNavigate, onLoginClick }) => {
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
          <div className="bg-gradient-to-br from-brand-red to-brand-pink rounded-3xl p-8 text-white mb-8">
            <h1 className="text-4xl font-mali font-bold mb-4">Terms and Conditions</h1>
            <p className="text-xl font-mali">Terms and conditions for using Zinga Linga services.</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
            <div>
              <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">Terms & Conditions</h2>
              <p className="font-mali text-gray-700 mb-4">
                These Terms & Conditions ("Terms") of (a) use of our website app.nurtura.tech ("Website"), our applications ("Application") or any products or services in connection with the Application/Website/products ("Services") or (b) any modes of registrations or usage of products, including through SD cards, tablets or other storage/transmitting device are between Nurtura Ltd ("Company/We/Us/Our") and its users ("User/You/Your").
              </p>
              <p className="font-mali text-gray-700 mb-4">
                Please read the Terms and the privacy policy of the Company ("Privacy Policy") with respect to registration with us, the use of the Application, Website, Services and products carefully before using the Application, Website, Services or products. In the event of any discrepancy between the Terms and any other policies with respect to the Application or Website or Services or products, the provisions of the Terms shall prevail.
              </p>
              <p className="font-mali text-gray-700 mb-4">
                Your use/access/browsing of the Application or Website or the Services or products or registration (with or without payment/with or without subscription) through any means shall signify Your acceptance of the Terms and Your agreement to be legally bound by the same.
              </p>
              <p className="font-mali text-gray-700 mb-4">
                If you do not agree with the Terms or the Privacy Policy, please do not use the Application or Website or avail the Services or products. Any access to our Application/Website/Services/products through registrations/subscription is non-transferable.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">1. Proprietary Information</h2>
              <p className="font-mali text-gray-700 mb-4">
                Except as mentioned below, all information, content, material, trademarks, services marks, trade names, and trade secrets including but not limited to the software, text, images, graphics, video, script and audio, contained in the Application, Website, Services and products are proprietary property of the Company ("Proprietary Information"). No Proprietary Information may be copied, downloaded, reproduced, modified, republished, uploaded, posted, transmitted or distributed in any way without obtaining prior written permission from the Company and nothing on this Application or Website or Services shall be or products deemed to confer a license of or any other right, interest or title to or in any of the intellectual property rights belonging to the Company, to the User.
              </p>
              <p className="font-mali text-gray-700 mb-4">
                You may own the medium on which the information, content or materials resides, but the Company shall at all times retain full and complete title to the information, content or materials and all intellectual property rights inserted by the Company on such medium. Certain contents on the Website may belong to third parties. Such contents have been reproduced after taking prior consent from said party and all rights relating to such content will remain with such third party.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">2. Personal and Non-Commercial Use</h2>
              <p className="font-mali text-gray-700 mb-4">
                Your use of our Application, Website, Services and products is solely for Your personal and non-commercial use. Any use of the Application, Website, Services or products or their contents other than for personal purposes is prohibited. Your personal and non-commercial use of this Application, Website, Services and/or our products shall be subjected to the following restrictions:
              </p>
              <div className="font-mali text-gray-700 space-y-3">
                <p><strong>I.</strong> You may not decompile, reverse engineer, or disassemble the contents of the Application and/or our Website and/or Services and/or products or modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information or software obtained from the Application and / or our Website and/or Services/products, or remove any copyright, trademark registration, or other proprietary notices from the contents of the Application and / or and / or our Website and/or Services/products.</p>
                <p><strong>II.</strong> You will not (a) use this Application and / or our Website and/or any of our product/s or Service/s for commercial purposes of any kind, or (b) advertise or sell the Application or any products, Services or domain names or otherwise (whether or not for profit), or solicit others (including, without limitation, solicitations for contributions or donations) or use any public forum for commercial purposes of any kind, or (c) use the Application and / or Website/our products and Services in any way that is unlawful, or harms the Company or any other person or entity as determined by the Company.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">3. Prohibited Activities</h2>
              <p className="font-mali text-gray-700 mb-4">
                No User shall be permitted to perform any of the following prohibited activities while availing our Services:
              </p>
              <div className="font-mali text-gray-700 space-y-3">
                <p>• Making available any content that is misleading, unlawful, harmful, threatening, abusive, tortious, defamatory, libelous, vulgar, obscene, child-pornographic, lewd, lascivious, profane, invasive of another's privacy, hateful, or racially, ethnically or otherwise objectionable;</p>
                <p>• Stalking, intimidating and/or harassing another and/or inciting other to commit violence;</p>
                <p>• Transmitting material that encourages anyone to commit a criminal offence, that results in civil liability or otherwise breaches any relevant laws, regulations or code of practice;</p>
                <p>• Interfering with any other person's use or enjoyment of the Application/Website/Services;</p>
                <p>• Making, transmitting or storing electronic copies of materials protected by copyright without the permission of the owner, committing any act that amounts to the infringement of intellectual property or making available any material that infringes any intellectual property rights or other proprietary rights of anyone else;</p>
                <p>• Impersonate any person or entity, or falsely state or otherwise misrepresent Your affiliation with a person or entity;</p>
                <p>• Post, transmit or make available any material that contains viruses, trojan horses, worms, spyware, time bombs, cancel bots, or other computer programming routines, code, files or such other programs that may harm the Application/services, interests or rights of other users or limit the functionality of any computer software, hardware or telecommunications;</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">4. User Responsibilities</h2>
              <div className="font-mali text-gray-700 space-y-3">
                <p>• Access or use the Application/Website/Services/products in any manner that could damage, disable, overburden or impair any of the Application's/Website's servers or the networks connected to any of the servers on which the Application/Website is hosted;</p>
                <p>• Intentionally or unintentionally interfere with or disrupt the Application/Website/Services/products or violate any applicable laws related to the access to or use of the Application/Website/Services/products;</p>
                <p>• Disrupt or interfere with the security of, or otherwise cause harm to, the Application/Website/Services/products, systems resources, accounts, passwords, servers or networks connected to or accessible through the Application/Website/Services/products or any affiliated or linked sites;</p>
                <p>• Collect or store data about other users in connection with the prohibited conduct and activities set forth in this paragraph.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-mali font-bold text-brand-green mb-4">5. Contact Information</h2>
              <div className="font-mali text-gray-700 space-y-2">
                <p><strong>Our Customer Relations Manager shall undertake all reasonable efforts to address your grievances at the earliest possible opportunity.</strong></p>
                <p><strong>Contact us at our Address:</strong> P.O. Box 20525, Nairobi 00100 or Nurtura Ltd, The Watermark Business Park, Cove Court, Ndege Road, Karen, Nairobi County, Kenya.</p>
                <p><strong>Reach out to us:</strong> karibu@nurtura.tech, in case of any queries</p>
                <p className="text-sm text-gray-600 mt-6">Last updated: January 2025</p>
              </div>
            </div>

            <div className="bg-brand-blue/10 rounded-lg p-6 mt-8">
              <h3 className="text-xl font-mali font-bold text-brand-blue mb-3">Related Policies</h3>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => onNavigate('privacy')}
                  className="bg-brand-blue text-white px-6 py-2 rounded-full font-mali hover:bg-blue-600 transition-colors"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => onNavigate('coppa')}
                  className="bg-brand-green text-white px-6 py-2 rounded-full font-mali hover:bg-green-600 transition-colors"
                >
                  COPPA Compliance
                </button>
                <button 
                  onClick={() => onNavigate('refund')}
                  className="bg-brand-pink text-white px-6 py-2 rounded-full font-mali hover:bg-pink-600 transition-colors"
                >
                  Refund Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default TermsPage;