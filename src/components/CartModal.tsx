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
import { pendingPaymentsManager } from '../utils/pendingPayments';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (items: CartItem[]) => void;
  initialProduct?: 'kiki' | 'tano' | 'bundle' | 'explorer' | 'adventurer' | 'roadtripper' | 'bookie';
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onPurchase, initialProduct }) => {
  console.log('CartModal render - isOpen:', isOpen, 'initialProduct:', initialProduct);
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
        case 'explorer':
          addItem({
            id: 'explorer-pack',
            name: 'Explorer Pack',
            price: 30.00,
            description: 'Where Letters Come to Life!',
            type: 'package' as const,
            ageRange: '3-6 years',
            features: [
              'Letter Safari with playful letter recognition games',
              'Magic Word Builder to create fun words like a word wizard!',
              'Phonics party - sing along to catchy letter sounds',
              'Storytime with exciting tales role plays for children',
              '15 Learning Quests - colorful lessons that feel like playtime'
            ]
          });
          break;
        case 'adventurer':
          addItem({
            id: 'adventurer-pack',
            name: 'Adventurer Pack',
            price: 45.00,
            description: 'Reading Superpowers Unlocked!',
            type: 'package' as const,
            ageRange: '3-6 years',
            features: [
              'Everything in Explorer Pack PLUS:',
              'Word Architect: Build bigger, cooler words!',
              '25 Learning Quests with more stories, more adventures',
              '25 Gold Star Challenges to earn rewards after each lesson'
            ]
          });
          break;
        case 'roadtripper':
          addItem({
            id: 'roadtripper-pack',
            name: 'Roadtripper Pack',
            price: 80.00,
            description: 'Learning On-The-Go!',
            type: 'package' as const,
            ageRange: '3-6 years',
            features: [
              '125 Audio adventures, perfect for car rides & travel',
              '125 Sing-along phonics - turn travel time into learning time',
              'Story podcasts with African tales that spark imagination'
            ]
          });
          break;
        case 'bookie':
          addItem({
            id: 'bookie-pack',
            name: 'Zingalinga Bookie Pack',
            price: 60.00,
            description: 'Interactive Learning Device',
            type: 'package' as const,
            ageRange: '3-6 years',
            features: [
              'Fully aligned PP1 and PP2 equivalent literacy product',
              'Learn through stories anywhere anytime',
              'Battery that lasts 4 days when fully utilized',
              'Interactive screen with 20+ interactive lessons'
            ]
          });
          break;
      }
    }
  }, [isOpen, initialProduct]);

  const [showCheckout, setShowCheckout] = useState(false);
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
      
      // Store payment info for registration
      localStorage.setItem('pendingPurchase', JSON.stringify({
        email: paymentForm.email,
        name: paymentForm.name,
        items: cartItems,
        total: total,
        timestamp: Date.now()
      }));
      
      // Also store in pending payments for admin tracking
      pendingPaymentsManager.storePendingPayment({
        email: paymentForm.email,
        items: cartItems,
        total: total
      });
      
      onPurchase(cartItems);
      
      // Close cart modal
      onClose();
      clearCart();
      
      // Redirect to registration page with pre-filled email
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('showRegistration', {
          detail: { email: paymentForm.email, name: paymentForm.name }
        }));
      }, 300);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }
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
                            Complete Purchase
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};