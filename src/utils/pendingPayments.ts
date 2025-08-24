export interface PendingPayment {
  id: string;
  email: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    type: string;
  }>;
  total: number;
  paymentDate: string;
  status: 'pending' | 'completed' | 'expired';
  registrationToken?: string;
}

export const pendingPaymentsManager = {
  // Store pending payment
  storePendingPayment: (payment: Omit<PendingPayment, 'id' | 'paymentDate' | 'status'>) => {
    const pendingPayment: PendingPayment = {
      ...payment,
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentDate: new Date().toISOString(),
      status: 'pending',
      registrationToken: Math.random().toString(36).substr(2, 16)
    };
    
    const existing = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
    existing.push(pendingPayment);
    localStorage.setItem('pendingPayments', JSON.stringify(existing));
    
    return pendingPayment;
  },

  // Get pending payments by email
  getPendingPaymentsByEmail: (email: string): PendingPayment[] => {
    const pending = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
    return pending.filter((p: PendingPayment) => p.email === email && p.status === 'pending');
  },

  // Complete pending payment
  completePendingPayment: (paymentId: string) => {
    const pending = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
    const updated = pending.map((p: PendingPayment) => 
      p.id === paymentId ? { ...p, status: 'completed' } : p
    );
    localStorage.setItem('pendingPayments', JSON.stringify(updated));
  },

  // Get all pending payments (for admin)
  getAllPendingPayments: (): PendingPayment[] => {
    const allPayments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
    return allPayments.filter((p: PendingPayment) => p.status === 'pending');
  }
};