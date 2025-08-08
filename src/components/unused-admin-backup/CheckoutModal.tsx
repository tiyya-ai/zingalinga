import React, { useState } from 'react';
import { X, CreditCard, Mail, User, Lock, ShoppingCart } from 'lucide-react';
import { sanitizeInput, validateEmail } from '../utils/securityUtils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, items }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    createAccount: false,
    password: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate inputs
      if (!validateEmail(customerInfo.email)) {
        setError('Invalid email format');
        setIsLoading(false);
        return;
      }

      if (customerInfo.createAccount && customerInfo.password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo: {
            name: sanitizeInput(customerInfo.name),
            email: sanitizeInput(customerInfo.email),
            createAccount: customerInfo.createAccount,
            password: customerInfo.createAccount ? sanitizeInput(customerInfo.password) : undefined
          },
          items,
          paymentInfo: {
            method: 'card',
            token: 'demo_token_' + Math.random().toString(36).substring(2, 15)
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Purchase completed! Order #${result.order.orderNumber}. ${result.account.created ? 'Account created - check your email!' : 'Confirmation sent to your email.'}`);
        setTimeout(() => {
          onClose();
          setCustomerInfo({ name: '', email: '', createAccount: false, password: '' });
          setPaymentInfo({ cardNumber: '', expiryDate: '', cvv: '', cardName: '' });
          setSuccess('');
        }, 3000);
      } else {
        setError(result.error || 'Purchase failed');
      }
    } catch (error) {
      setError('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-2xl relative overflow-hidden max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-8 h-8" />
            <h2 className="text-xl sm:text-3xl font-bold font-mali">Complete Your Purchase</h2>
          </div>
          <p className="text-white/90 font-mali text-sm sm:text-lg">Join the Zinga Linga adventure!</p>
        </div>

        <div className="p-4 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <p className="text-sm text-red-700 font-mali">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
              <p className="text-sm text-green-700 font-mali">{success}</p>
            </div>
          )}

          {/* Order Summary */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-bold font-mali mb-4">Order Summary</h3>
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <span className="font-mali">{item.name} x{item.quantity}</span>
                <span className="font-mali font-bold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold font-mali">Total:</span>
                <span className="text-lg font-bold font-mali text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-mali">Customer Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 font-mali mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-mali"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 font-mali mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-mali"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Account Creation Option */}
              <div className="p-4 bg-blue-50 rounded-xl">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={customerInfo.createAccount}
                    onChange={(e) => setCustomerInfo({...customerInfo, createAccount: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-mali font-bold text-blue-800">Create account for easy access and progress tracking</span>
                </label>
                
                {customerInfo.createAccount && (
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-blue-700 font-mali mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={customerInfo.password}
                        onChange={(e) => setCustomerInfo({...customerInfo, password: e.target.value})}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mali"
                        placeholder="Create a password (min 6 characters)"
                        minLength={6}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-mali">Payment Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 font-mali mb-2">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-mali"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 font-mali mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={paymentInfo.expiryDate}
                    onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-mali"
                    placeholder="MM/YY"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 font-mali mb-2">CVV</label>
                  <input
                    type="text"
                    value={paymentInfo.cvv}
                    onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-mali"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-mali text-lg shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing Purchase...
                </div>
              ) : (
                `Complete Purchase - $${total.toFixed(2)}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};