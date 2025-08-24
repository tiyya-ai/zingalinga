// Test script to add pending payments for notification testing
// Run this in browser console to test notifications

const testPendingPayments = [
  {
    id: 'pending_test_1',
    email: 'test1@example.com',
    items: [
      {
        id: 'video_1',
        name: 'Test Video Package',
        price: 29.99,
        quantity: 1,
        type: 'video'
      }
    ],
    total: 29.99,
    paymentDate: new Date().toISOString(),
    status: 'pending',
    registrationToken: 'test_token_123'
  },
  {
    id: 'pending_test_2',
    email: 'test2@example.com',
    items: [
      {
        id: 'package_1',
        name: 'Premium Package',
        price: 99.99,
        quantity: 1,
        type: 'package'
      }
    ],
    total: 99.99,
    paymentDate: new Date().toISOString(),
    status: 'pending',
    registrationToken: 'test_token_456'
  }
];

// Add test data to localStorage
localStorage.setItem('pendingPayments', JSON.stringify(testPendingPayments));

console.log('Test pending payments added to localStorage');
console.log('Refresh the admin dashboard to see notifications');

// To clear test data, run:
// localStorage.removeItem('pendingPayments');