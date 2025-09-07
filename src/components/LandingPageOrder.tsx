import React, { useState } from 'react';

interface Package {
  id: string;
  name: string;
  price: number;
}

interface LandingPageOrderProps {
  package: Package;
  currentUser?: { id: string; email: string; name: string } | null;
}

export const LandingPageOrder: React.FC<LandingPageOrderProps> = ({ package: pkg, currentUser }) => {
  const [showForm, setShowForm] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ email: '', name: '' });
  const [loading, setLoading] = useState(false);

  const createOrder = async (packageId: string, amount: number, userInfo?: { email: string; name: string; userId?: string }) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          amount,
          userEmail: userInfo?.email,
          userName: userInfo?.name,
          userId: userInfo?.userId
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Order creation failed:', error);
      return { success: false, error: 'Failed to create order' };
    }
  };

  const handleBuy = async () => {
    if (currentUser) {
      // User is logged in - create completed order
      setLoading(true);
      const result = await createOrder(pkg.id, pkg.price, {
        email: currentUser.email,
        name: currentUser.name,
        userId: currentUser.id
      });
      setLoading(false);
      
      if (result.success) {
        alert('Order completed! Access your content in the dashboard.');
      }
    } else {
      // User not logged in - show form for guest info
      setShowForm(true);
    }
  };

  const handleGuestOrder = async () => {
    if (!guestInfo.email || !guestInfo.name) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await createOrder(pkg.id, pkg.price, {
      email: guestInfo.email,
      name: guestInfo.name
    });
    setLoading(false);

    if (result.success) {
      alert('Order created! Please register an account to access your content.');
      setShowForm(false);
    }
  };

  if (showForm && !currentUser) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold mb-4">Complete Your Order</h3>
          <p className="text-gray-600 mb-4">Package: {pkg.name} - ${pkg.price}</p>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={guestInfo.name}
              onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={guestInfo.email}
              onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleGuestOrder}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Complete Order'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
    >
      {loading ? 'Processing...' : `Buy ${pkg.name} - $${pkg.price}`}
    </button>
  );
};