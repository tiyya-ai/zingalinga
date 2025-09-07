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
  // Get pending payments from database
  async getAllPendingPayments(): Promise<PendingPayment[]> {
    try {
      const response = await fetch('/api/orders?status=pending');
      if (!response.ok) return [];
      
      const orders = await response.json();
      return orders.map((order: any) => ({
        id: order.id,
        email: order.guestEmail || order.user?.email || 'unknown@email.com',
        items: [{
          id: order.moduleId,
          name: order.module?.title || 'Unknown Item',
          price: order.amount,
          quantity: 1,
          type: 'package'
        }],
        total: order.amount,
        paymentDate: order.createdAt,
        status: order.status,
        registrationToken: order.id
      }));
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return [];
    }
  },

  // Get pending payments by email
  async getPendingPaymentsByEmail(email: string): Promise<PendingPayment[]> {
    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(email)}&status=pending`);
      if (!response.ok) return [];
      
      const orders = await response.json();
      return orders.map((order: any) => ({
        id: order.id,
        email: order.guestEmail || order.user?.email || email,
        items: [{
          id: order.moduleId,
          name: order.module?.title || 'Unknown Item',
          price: order.amount,
          quantity: 1,
          type: 'package'
        }],
        total: order.amount,
        paymentDate: order.createdAt,
        status: order.status,
        registrationToken: order.id
      }));
    } catch (error) {
      console.error('Error fetching pending payments by email:', error);
      return [];
    }
  },

  // Complete pending payment
  async completePendingPayment(paymentId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/orders/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      return response.ok;
    } catch (error) {
      console.error('Error completing payment:', error);
      return false;
    }
  },

  // Store pending payment (for backward compatibility)
  storePendingPayment: (payment: Omit<PendingPayment, 'id' | 'paymentDate' | 'status'>) => {
    console.warn('storePendingPayment is deprecated. Use /api/orders endpoint instead.');
    return {
      ...payment,
      id: `pending_${Date.now()}`,
      paymentDate: new Date().toISOString(),
      status: 'pending' as const,
      registrationToken: Math.random().toString(36).substr(2, 16)
    };
  }
};