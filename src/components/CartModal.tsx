'use client';

import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Card,
  CardBody,
  Divider,
  Input,
  Select,
  SelectItem,
  Chip
} from '@nextui-org/react';
import { ShoppingCart, X, CreditCard, Lock, Star, Minus, Plus, CheckCircle, Heart, Gift } from 'lucide-react';
import { useCart, CartItem, PRODUCTS } from '../hooks/useCart';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (items: CartItem[]) => void;
  initialProduct?: 'kiki' | 'tano' | 'bundle';
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onPurchase, initialProduct }) => {
  const { items: cartItems, addItem, removeItem, updateQuantity, getTotalItems, getTotalPrice, getSavings, clearCart } = useCart();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Add initial product when modal opens
  useEffect(() => {
    if (isOpen && initialProduct && cartItems.length === 0) {
      switch (initialProduct) {
        case 'kiki':
          addItem(PRODUCTS.KIKI_LETTERS);
          break;
        case 'tano':
          addItem(PRODUCTS.TANO_SONGS);
          break;
        case 'bundle':
          addItem(PRODUCTS.COMPLETE_BUNDLE);
          break;
      }
    }
  }, [isOpen, initialProduct]);

  const [showCheckout, setShowCheckout] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    country: 'US'
  });

  const addBundleOffer = () => {
    clearCart();
    addItem(PRODUCTS.COMPLETE_BUNDLE);
  };

  const subtotal = getTotalPrice();
  const savings = getSavings();
  const total = subtotal;

  const handlePurchase = async () => {
    try {
      // Validate form
      if (!paymentForm.email || !paymentForm.name) {
        alert('Please fill in your email and name');
        return;
      }
      
      // Create guest account and purchase
      const { vpsDataStore } = await import('../utils/vpsDataStore');
      const data = await vpsDataStore.loadData();
      
      // Create new user account
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser = {
        id: newUserId,
        name: paymentForm.name,
        email: paymentForm.email,
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        purchasedModules: cartItems.map(item => item.id),
        totalSpent: total
      };
      
      // Create purchase records
      const newPurchases = cartItems.map(item => ({
        id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: newUserId,
        moduleId: item.id,
        purchaseDate: new Date().toISOString(),
        amount: item.price * item.quantity,
        status: 'completed' as const,
        type: 'video' as const
      }));
      
      // Save to database
      const updatedData = {
        ...data,
        users: [...(data.users || []), newUser],
        purchases: [...(data.purchases || []), ...newPurchases]
      };
      await vpsDataStore.saveData(updatedData);
      
      // Store account info for login
      localStorage.setItem('guestAccountEmail', paymentForm.email);
      localStorage.setItem('guestAccountName', paymentForm.name);
      localStorage.setItem('purchasedItems', JSON.stringify(cartItems));
      
      onPurchase(cartItems);
      setShowThankYou(true);
      setShowCheckout(false);
      clearCart();
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  const handleCloseThankYou = () => {
    setShowThankYou(false);
    setShowCheckout(false);
    onClose();
    // Trigger login modal globally after a short delay
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('showGuestLogin'));
    }, 300);
  };

  const canShowBundleOffer = cartItems.length === 2 && 
    cartItems.some(item => item.id === 'kiki-letters') && 
    cartItems.some(item => item.id === 'tano-songs') &&
    !cartItems.some(item => item.type === 'bundle');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-mali font-bold text-gray-900">Shopping Cart</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {showThankYou ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-mali font-bold text-gray-900 mb-2">🎉 Success!</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 font-mali text-center">
                    <span className="font-bold text-lg">Account Created & Payment Complete!</span><br/>
                    Your videos are ready to watch
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-blue-800 font-mali mb-2">📝 Your Login Details:</h4>
                  <div className="text-sm text-blue-800 font-mali space-y-1">
                    <div><strong>Email:</strong> {paymentForm.email}</div>
                    <div><strong>Password:</strong> <span className="bg-blue-200 px-2 py-1 rounded font-mono">guest123</span></div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-yellow-800 font-mali text-center">
                    💡 <strong>Easy Login:</strong> Use the email above with password "guest123"
                  </p>
                </div>
                
                <button 
                  onClick={handleCloseThankYou}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-mali font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all text-base shadow-lg"
                >
                  🚀 Login & Watch My Videos
                </button>
                
                <p className="text-xs text-gray-500 font-mali text-center mt-3">
                  You'll be redirected to login page with your email pre-filled
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🛒</div>
                  <p className="text-gray-600 font-mali text-base mb-4">Your cart is empty</p>
                  <button 
                    onClick={onClose}
                    className="bg-gradient-to-r from-brand-yellow to-brand-red text-white font-mali font-bold py-3 px-6 rounded-2xl hover:from-brand-yellow hover:to-brand-red transform hover:scale-105 transition-all duration-300 shadow-lg text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-brand-blue rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {item.name.charAt(0)}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-mali font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-gray-600 font-mali truncate">{item.description}</p>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-brand-green font-mali">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border-t-2 border-gray-200">
                    <div className="flex justify-between font-bold text-lg font-mali mb-4">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-brand-green">${total.toFixed(2)}</span>
                    </div>
                    
                    {!showCheckout ? (
                      <button 
                        onClick={() => setShowCheckout(true)}
                        className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-white font-mali font-bold py-3 px-4 rounded-xl hover:from-brand-green hover:to-brand-blue transform hover:scale-105 transition-all duration-300 shadow-lg text-sm"
                      >
                        Checkout (${total.toFixed(2)})
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="text-lg font-mali font-bold text-gray-900 text-center">Secure Checkout</h4>
                        
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={paymentForm.email}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mali focus:outline-none focus:ring-2 focus:ring-brand-green"
                        />
                        
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={paymentForm.name}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mali focus:outline-none focus:ring-2 focus:ring-brand-green"
                        />
                        
                        <input
                          type="text"
                          placeholder="Card Number"
                          value={paymentForm.cardNumber}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mali focus:outline-none focus:ring-2 focus:ring-brand-green"
                        />
                        
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={paymentForm.expiryDate}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mali focus:outline-none focus:ring-2 focus:ring-brand-green"
                          />
                          <input
                            type="text"
                            placeholder="CVV"
                            value={paymentForm.cvv}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mali focus:outline-none focus:ring-2 focus:ring-brand-green"
                          />
                        </div>
                        

                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setShowCheckout(false)}
                            className="flex-1 bg-gray-100 text-gray-700 font-mali font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            Back
                          </button>
                          <button 
                            onClick={handlePurchase}
                            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white font-mali font-bold py-2 px-4 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all text-sm"
                          >
                            Pay ${total.toFixed(2)}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      

    </div>
  );
};