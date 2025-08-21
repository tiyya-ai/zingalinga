'use client';

import React from 'react';
import { X, CheckCircle, Package } from 'lucide-react';

interface PurchaseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchasedItems: any[];
  userEmail: string;
}

export const PurchaseSuccessModal: React.FC<PurchaseSuccessModalProps> = ({
  isOpen,
  onClose,
  purchasedItems,
  userEmail
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Purchase Successful!</h2>
          <p className="text-green-100">Your account has been created and content is ready</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              Welcome to Zinga Linga! Your account has been created with email:
            </p>
            <p className="font-semibold text-gray-800 bg-gray-100 px-4 py-2 rounded-lg">
              {userEmail}
            </p>
          </div>

          {/* Purchased Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2 text-green-600" />
              Your Content ({purchasedItems.length} items)
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {purchasedItems.map((item, index) => (
                <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-600">${item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              onClose();
              window.location.href = '/dashboard';
            }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg"
          >
            Go to Dashboard
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            You can access all your content from the dashboard
          </p>
        </div>
      </div>
    </div>
  );
};