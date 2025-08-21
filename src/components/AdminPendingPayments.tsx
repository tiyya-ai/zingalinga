import React, { useState, useEffect } from 'react';
import { Clock, Mail, Package, CheckCircle, X } from 'lucide-react';
import { pendingPaymentsManager, PendingPayment } from '../utils/pendingPayments';

export const AdminPendingPayments: React.FC = () => {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = () => {
    const payments = pendingPaymentsManager.getAllPendingPayments();
    setPendingPayments(payments.filter(p => p.status === 'pending'));
  };

  const sendRegistrationReminder = (payment: PendingPayment) => {
    // Simulate sending email reminder
    console.log(`📧 Registration reminder sent to: ${payment.email}`);
    console.log(`🔗 Registration token: ${payment.registrationToken}`);
    alert(`Registration reminder sent to ${payment.email}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-800">Payments Pending Registration</h2>
        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
          {pendingPayments.length} pending
        </span>
      </div>

      {pendingPayments.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">All payments processed!</h3>
          <p className="text-gray-500">No pending registrations at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map((payment) => (
            <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-800">{payment.email}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      {payment.items.length} items - ${payment.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {payment.items.map((item, index) => (
                      <div key={index} className="text-sm text-gray-600 ml-6">
                        • {item.name} - ${item.price.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => sendRegistrationReminder(payment)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Send Reminder
                  </button>
                  <span className="text-xs text-gray-500 text-center">
                    Token: {payment.registrationToken?.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};