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
  
  console.log('CartModal render:', { isOpen, cartItems: cartItems.length, initialProduct });
  
  // Debug effect to track modal state changes
  useEffect(() => {
    console.log('CartModal isOpen changed:', isOpen);
    if (isOpen) {
      console.log('Modal should be visible now');
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
    // Clear cart and add bundle
    clearCart();
    addItem(PRODUCTS.COMPLETE_BUNDLE);
  };

  const subtotal = getTotalPrice();
  const savings = getSavings();
  const total = subtotal;

  const handlePurchase = () => {
    onPurchase(cartItems);
    setShowThankYou(true);
    setShowCheckout(false);
    clearCart();
  };

  const handleCloseThankYou = () => {
    setShowThankYou(false);
    onClose();
  };

  const canShowBundleOffer = cartItems.length === 2 && 
    cartItems.some(item => item.id === 'kiki-letters') && 
    cartItems.some(item => item.id === 'tano-songs') &&
    !cartItems.some(item => item.type === 'bundle');

  // Simple test to verify modal is being rendered
  if (isOpen) {
    console.log('CartModal: About to render modal with isOpen=true');
  }
  
  return (
    <>
      <Modal 
        isOpen={isOpen && !showThankYou} 
        onClose={onClose} 
        size="2xl"
        scrollBehavior="inside"
        placement="center"
        backdrop="opaque"
        classNames={{
          base: "max-h-[90vh] z-[9999] bg-white shadow-2xl",
          body: "p-0 bg-white",
          backdrop: "z-[9998] bg-black/50 backdrop-blur-sm",
          wrapper: "z-[9999]",
          header: "bg-white border-b border-gray-200",
          footer: "bg-white border-t border-gray-200"
        }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          }
        }}
      >
      <ModalContent className="bg-white">
        <ModalHeader className="flex items-center gap-2 px-6 py-4 border-b">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          <span className="text-xl font-bold">Shopping Cart</span>
          <Chip color="primary" size="sm" className="ml-auto">
            {getTotalItems()} items
          </Chip>
        </ModalHeader>

        <ModalBody className="p-0 bg-white">
          {!showCheckout ? (
            <div className="p-6 space-y-6 bg-white">
              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Your cart is empty</p>
                    <Button color="primary" onPress={onClose} className="mt-4">
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <Card key={item.id} className="p-4">
                      <CardBody className="p-0">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {item.name.charAt(0)}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                <p className="text-gray-600 text-sm">{item.description}</p>
                                {item.type === 'bundle' && (
                                  <Chip color="success" size="sm" className="mt-1">
                                    Bundle Offer - Save ${((item.originalPrice || 0) - item.price).toFixed(2)}
                                  </Chip>
                                )}
                              </div>
                              
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => removeItem(item.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="bordered"
                                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="bordered"
                                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              <div className="text-right">
                                {item.originalPrice && (
                                  <p className="text-sm text-gray-500 line-through">
                                    ${(item.originalPrice * item.quantity).toFixed(2)}
                                  </p>
                                )}
                                <p className="font-bold text-lg">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>

              {/* Bundle Offer */}
              {canShowBundleOffer && (
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-green-800">🎉 Bundle Offer Available!</h3>
                        <p className="text-green-700 text-sm">Get both modules together and save $3.00</p>
                      </div>
                      <Button color="success" size="sm" onPress={addBundleOffer}>
                        Add Bundle
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Order Summary */}
              {cartItems.length > 0 && (
                <Card>
                  <CardBody className="p-4">
                    <h3 className="font-semibold mb-3">Order Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {savings > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Savings:</span>
                          <span>-${savings.toFixed(2)}</span>
                        </div>
                      )}
                      <Divider />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          ) : (
            /* Checkout Form */
            <div className="p-6 space-y-6 bg-white">
              <div className="text-center mb-6 bg-white">
                <h3 className="text-xl font-bold text-gray-900">Secure Checkout</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">SSL Encrypted & Secure</span>
                </div>
              </div>

              <div className="space-y-6 bg-white">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={paymentForm.email}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Cardholder Name *</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={paymentForm.name}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Card Number *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Expiry Date *</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentForm.expiryDate}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">CVV *</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Country *</label>
                  <select
                    value={paymentForm.country}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, country: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>

              {/* Order Summary in Checkout */}
              <Card className="bg-gray-50">
                <CardBody className="p-4">
                  <h4 className="font-semibold mb-2">Your Order</h4>
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm mb-1">
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <Divider className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="px-6 py-4 border-t bg-white">
          {!showCheckout ? (
            <div className="flex gap-2 w-full bg-white">
              <Button 
                variant="light" 
                onPress={onClose}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Continue Shopping
              </Button>
              {cartItems.length > 0 && (
                <Button 
                  color="primary" 
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  onPress={() => setShowCheckout(true)}
                >
                  Proceed to Checkout (${total.toFixed(2)})
                </Button>
              )}
            </div>
          ) : (
            <div className="flex gap-2 w-full bg-white">
              <Button 
                variant="light" 
                onPress={() => setShowCheckout(false)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Back to Cart
              </Button>
              <Button 
                color="success" 
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
                onPress={handlePurchase}
                startContent={<Lock className="w-4 h-4" />}
              >
                Complete Purchase (${total.toFixed(2)})
              </Button>
            </div>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Thank You Modal */}
    <Modal 
      isOpen={showThankYou} 
      onClose={handleCloseThankYou} 
      size="lg"
      placement="center"
      backdrop="opaque"
      classNames={{
        base: "z-[9999] bg-white shadow-2xl",
        body: "p-0 bg-white",
        backdrop: "z-[9998] bg-black/50 backdrop-blur-sm",
        wrapper: "z-[9999]",
        header: "bg-white border-b border-gray-200",
        footer: "bg-white border-t border-gray-200"
      }}
    >
      <ModalContent className="bg-white">
        <ModalHeader className="flex items-center gap-2 px-6 py-4 border-b bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <CheckCircle className="w-6 h-6" />
          <span className="text-xl font-bold">Purchase Successful!</span>
        </ModalHeader>

        <ModalBody className="p-8 bg-white text-center">
          <div className="space-y-6">
            {/* Success Animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Heart className="w-6 h-6 text-red-500 animate-bounce" />
                </div>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 font-mali">Thank You!</h2>
              <p className="text-lg text-gray-700 font-mali">
                🎉 Your purchase was successful! Welcome to the Zinga Linga family!
              </p>
              <p className="text-gray-600 font-mali">
                Get ready for amazing educational adventures with Kiki and Tano!
              </p>
            </div>

            {/* Purchase Details */}
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200">
              <CardBody className="p-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 font-mali">What's Next?</h3>
                </div>
                <div className="space-y-2 text-sm text-blue-800 font-mali">
                  <p>✨ Access your purchased content immediately</p>
                  <p>📚 Start learning with interactive lessons</p>
                  <p>🎯 Track your child's progress</p>
                  <p>💌 Check your email for receipt and access details</p>
                </div>
              </CardBody>
            </Card>

            {/* Fun Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-mali font-medium">
                🌟 Kiki and Tano are excited to meet you! 🌟
              </p>
              <p className="text-yellow-700 font-mali text-sm mt-1">
                Your learning adventure starts now!
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="px-6 py-4 border-t bg-white">
          <div className="flex gap-3 w-full justify-center">
            <Button 
              color="primary" 
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-mali font-bold px-8"
              onPress={handleCloseThankYou}
            >
              Start Learning! 🚀
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  );
};