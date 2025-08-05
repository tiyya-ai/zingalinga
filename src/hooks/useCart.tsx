'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  quantity: number;
  type: 'module' | 'bundle';
  ageRange?: string;
  features?: string[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSavings: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === newItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getSavings = () => {
    return items.reduce((total, item) => {
      if (item.originalPrice) {
        return total + ((item.originalPrice - item.price) * item.quantity);
      }
      return total;
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      getSavings
    }}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export { CartProvider, useCart };

// Predefined products
const PRODUCTS = {
  KIKI_LETTERS: {
    id: 'kiki-letters',
    name: "Kiki's Letters Hunt",
    price: 11.00,
    description: "Interactive letter recognition games for ages 1-3",
    type: 'module' as const,
    ageRange: '1-3 years',
    features: [
      'Interactive letter recognition games',
      "Kiki's musical alphabet songs",
      'Touch-and-learn activities',
      '26 African animal friends'
    ]
  },
  TANO_SONGS: {
    id: 'tano-songs',
    name: "Tano's Jungle Songs",
    price: 6.99,
    description: "Animated music videos for ages 2-6",
    type: 'module' as const,
    ageRange: '2-6 years',
    features: [
      'Animated music videos',
      "Tano's jungle adventures",
      'Sing-along alphabet songs',
      'Cultural storytelling'
    ]
  },
  COMPLETE_BUNDLE: {
    id: 'complete-bundle',
    name: 'Complete Adventure Bundle',
    price: 14.99,
    originalPrice: 17.99,
    description: "Both Kiki's Letters Hunt AND Tano's Jungle Songs",
    type: 'bundle' as const,
    ageRange: '1-6 years',
    features: [
      'All Kiki\'s Letters Hunt content',
      'All Tano\'s Jungle Songs content',
      'Exclusive bundle bonus content',
      'Save $3.00 compared to individual purchase'
    ]
  }
};

export { PRODUCTS };