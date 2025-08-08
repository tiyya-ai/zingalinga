import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle, ArrowLeft, Shield, Star, Sparkles, Gift } from 'lucide-react';
import { Cart as CartType, PaymentInfo, Purchase, User } from '../types';
import { vpsDataStore } from '../utils/vpsDataStore';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartType;
  onPaymentComplete: () => void;
  onBackToCart: () => void;
  user?: User;
}

export const Checkout: React.FC<CheckoutProps> = ({ 
  isOpen, 
  onClose, 
  cart, 
  onPaymentComplete,
  onBackToCart,
  user 
}) => {
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      // Create purchase record and save to cloudDataStore
      savePurchaseToAdmin();
      setStep('success');
      setTimeout(() => {
        onPaymentComplete();
        onClose();
      }, 3000);
    }, 2000);
  };

  const savePurchaseToAdmin = async () => {
    try {
      const moduleIds = cart.items.flatMap(item => 
        item.type === 'bundle' && item.moduleIds ? item.moduleIds : [item.id]
      );

      // Create purchase record
      const newPurchase: Purchase = {
        id: `purchase_${Date.now()}`,
        userId: user?.id || 'guest',
        moduleId: moduleIds[0] || '', // First module ID for compatibility
        moduleIds,
        amount: cart.total,
        status: 'completed',
        createdAt: new Date().toISOString(),
        purchaseDate: new Date().toISOString(),
        paymentMethod: 'credit_card'
      };

      // Get current data
      const currentData = await vpsDataStore.loadData();
      
      // Add purchase to purchases array
      currentData.purchases.push(newPurchase);
      
      // Update user's purchased modules and total spent
      if (user) {
        const userIndex = currentData.users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          currentData.users[userIndex] = {
            ...currentData.users[userIndex],
            purchasedModules: [...new Set([...currentData.users[userIndex].purchasedModules, ...moduleIds])],
            totalSpent: (currentData.users[userIndex].totalSpent || 0) + cart.total
          };
        }
      }

      // Save updated data
      await vpsDataStore.saveData(currentData);
      
      console.log('Purchase saved to admin dashboard:', newPurchase);
    } catch (error) {
      console.error('Error saving purchase to admin:', error);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl border border-gray-100">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-green-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-green-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing Payment</h2>
          <p className="text-gray-600 mb-6">Please wait while we securely process your payment...</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>256-bit SSL Encryption</span>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            💡 Your purchase will appear in the admin dashboard instantly!
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl border border-gray-100 relative overflow-hidden">
          {/* Celebration Animation */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 animate-bounce delay-100">
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="absolute top-8 right-6 animate-bounce delay-300">
              <Star className="w-5 h-5 text-pink-400" />
            </div>
            <div className="absolute bottom-8 left-8 animate-bounce delay-500">
              <Gift className="w-5 h-5 text-purple-400" />
            </div>
            <div className="absolute bottom-4 right-4 animate-bounce delay-700">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
          </div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              🎉 Welcome to your learning adventure! Your modules are now ready.
            </p>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-green-600" />
                <p className="font-bold text-green-800">What's Next?</p>
              </div>
              <p className="text-green-700 text-sm mb-2">
                You'll be redirected to your dashboard where you can start exploring your new learning modules!
              </p>
              <div className="text-xs text-green-600 bg-green-100 rounded-lg p-2 mt-3">
                ✨ Check your "My Library" tab to access your new content
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">Secure Checkout</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
          <div className="space-y-3">
            {(cart.items || []).map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-600">
                    {item.type === 'bundle' ? 'Bundle Package' : 'Learning Module'}
                  </p>
                </div>
                <p className="font-bold text-green-600">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between items-center">
            <span className="text-xl font-bold text-gray-800">Total:</span>
            <span className="text-2xl font-bold text-green-600">${cart.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                required
                value={paymentInfo.cardholderName}
                onChange={(e) => setPaymentInfo({...paymentInfo, cardholderName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                required
                value={paymentInfo.cardNumber}
                onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: formatCardNumber(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                required
                value={paymentInfo.expiryDate}
                onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: formatExpiryDate(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                required
                value={paymentInfo.cvv}
                onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value.replace(/\D/g, '').substring(0, 4)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-4">
            <Lock className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBackToCart}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 px-6 rounded-2xl hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center gap-3"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Cart
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-4 px-6 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
            >
              <CreditCard className="w-5 h-5" />
              Complete Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};