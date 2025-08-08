'use client';

import React, { useState } from 'react';

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
}

interface EnhancedCheckoutProps {
  items: CheckoutItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function EnhancedCheckout({ items, onClose, onSuccess }: EnhancedCheckoutProps) {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  const [processing, setProcessing] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discount = items.reduce((sum, item) => sum + (item.price * (item.discount || 0) / 100), 0);
  const tax = (subtotal - discount) * 0.1; // 10% tax
  const total = subtotal - discount + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 3000);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-purple-500/30">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-purple-500/30">
          <h2 className="text-2xl font-bold text-white">Complete Purchase</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Order Summary */}
          <div className="lg:w-1/3 p-6 bg-white/5 border-r border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex items-center space-x-3">
                  {item.image && item.image.trim() ? (
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white">🎬</div>
                  )}
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{item.name}</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 font-bold">
                        ${item.discount ? (item.price * (1 - item.discount / 100)).toFixed(2) : item.price}
                      </span>
                      {item.discount && (
                        <span className="text-gray-400 line-through text-sm">${item.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 border-t border-purple-500/30 pt-4">
              <div className="flex justify-between text-purple-200">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-purple-200">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-yellow-400 border-t border-purple-500/30 pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:w-2/3 p-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map(stepNum => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= stepNum 
                      ? 'bg-yellow-400 text-purple-900' 
                      : 'bg-white/20 text-white'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNum ? 'bg-yellow-400' : 'bg-white/20'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Contact Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
                  
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 px-8 py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white mb-4">Shipping Address</h3>
                  
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-white/20 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/30 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 px-8 py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white mb-4">Payment Method</h3>
                  
                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[
                      { id: 'card', label: 'Credit Card', icon: '💳' },
                      { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                      { id: 'apple', label: 'Apple Pay', icon: '🍎' }
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          paymentMethod === method.id
                            ? 'border-yellow-400 bg-yellow-400/20'
                            : 'border-white/30 bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <div className="text-white font-medium">{method.label}</div>
                      </button>
                    ))}
                  </div>

                  {/* Card Details */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Card Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white text-sm font-medium mb-2">Expiry Date</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-white text-sm font-medium mb-2">CVV</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Name on Card</label>
                        <input
                          type="text"
                          name="nameOnCard"
                          value={formData.nameOnCard}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 focus:border-yellow-400 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Other Payment Methods */}
                  {paymentMethod !== 'card' && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">
                        {paymentMethod === 'paypal' ? '🅿️' : '🍎'}
                      </div>
                      <div className="text-white text-lg mb-2">
                        You will be redirected to {paymentMethod === 'paypal' ? 'PayPal' : 'Apple Pay'}
                      </div>
                      <div className="text-purple-200 text-sm">
                        to complete your payment securely
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-white/20 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/30 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-lg font-bold hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Purchase</span>
                          <span>${total.toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-6 border-t border-purple-500/30 bg-white/5">
          <div className="flex items-center justify-center space-x-4 text-purple-200 text-sm">
            <span>🔒</span>
            <span>Your transaction is protected with 256-bit SSL encryption</span>
            <span>•</span>
            <span>We don't store your credit card information</span>
            <span>•</span>
            <span>30-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}