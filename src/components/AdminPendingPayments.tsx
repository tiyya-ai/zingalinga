import React, { useState, useEffect } from 'react';
import { Clock, Mail, Package, CheckCircle, X, AlertTriangle, Bell } from 'lucide-react';
import { pendingPaymentsManager, PendingPayment } from '../utils/pendingPayments';
import { paymentMonitoringService } from '../utils/paymentMonitoring';

export const AdminPendingPayments: React.FC = () => {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [overduePayments, setOverduePayments] = useState<{ payment: PendingPayment; hoursSince: number }[]>([]);
  const [paymentStats, setPaymentStats] = useState({
    totalPending: 0,
    overdue24h: 0,
    overdue48h: 0,
    overdue72h: 0,
    overdueWeek: 0
  });

  useEffect(() => {
    loadPendingPayments();
    loadOverduePayments();
    loadPaymentStats();
    
    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      loadPendingPayments();
      loadOverduePayments();
      loadPaymentStats();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadPendingPayments = () => {
    const payments = pendingPaymentsManager.getAllPendingPayments();
    setPendingPayments(payments.filter(p => p.status === 'pending'));
  };
  
  const loadOverduePayments = () => {
    const overdue = paymentMonitoringService.getOverduePayments();
    setOverduePayments(overdue);
  };
  
  const loadPaymentStats = () => {
    const stats = paymentMonitoringService.getPaymentStats();
    setPaymentStats(stats);
  };

  const sendRegistrationReminder = async (payment: PendingPayment) => {
    try {
      await paymentMonitoringService.sendManualReminder(payment.email, payment.registrationToken, payment.items, payment.total);
      alert('Registration reminder sent successfully!');
      // Refresh the data to update any statistics
      loadPendingPayments();
    } catch (error) {
      console.error('Failed to send reminder:', error);
      alert('Failed to send reminder. Please try again.');
    }
  };
  
  const getUrgencyColor = (hoursSince: number) => {
    if (hoursSince >= 168) return 'text-red-600 bg-red-50'; // 1 week+
    if (hoursSince >= 72) return 'text-orange-600 bg-orange-50'; // 3 days+
    if (hoursSince >= 48) return 'text-yellow-600 bg-yellow-50'; // 2 days+
    if (hoursSince >= 24) return 'text-blue-600 bg-blue-50'; // 1 day+
    return 'text-gray-600 bg-gray-50';
  };
  
  const getUrgencyLabel = (hoursSince: number) => {
    if (hoursSince >= 168) return 'CRITICAL';
    if (hoursSince >= 72) return 'HIGH';
    if (hoursSince >= 48) return 'MEDIUM';
    if (hoursSince >= 24) return 'LOW';
    return 'RECENT';
  };
  
  const formatTimeSince = (hoursSince: number) => {
    if (hoursSince < 24) {
      return `${Math.floor(hoursSince)}h ago`;
    } else {
      const days = Math.floor(hoursSince / 24);
      return `${days}d ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-gray-800">{paymentStats.totalPending}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">24h+ Overdue</p>
              <p className="text-2xl font-bold text-blue-600">{paymentStats.overdue24h}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">48h+ Overdue</p>
              <p className="text-2xl font-bold text-yellow-600">{paymentStats.overdue48h}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">72h+ Overdue</p>
              <p className="text-2xl font-bold text-orange-600">{paymentStats.overdue72h}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">1w+ Critical</p>
              <p className="text-2xl font-bold text-red-600">{paymentStats.overdueWeek}</p>
            </div>
            <Bell className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-800">Payments Pending Registration</h2>
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingPayments.length} pending
          </span>
          {overduePayments.length > 0 && (
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {overduePayments.length} overdue
            </span>
          )}
        </div>

        {pendingPayments.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">All payments processed!</h3>
            <p className="text-gray-500">No pending registrations at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPayments.map((payment) => {
              const overdueInfo = overduePayments.find(op => op.payment.id === payment.id);
              const hoursSince = overdueInfo ? overdueInfo.hoursSince : 0;
              const isOverdue = hoursSince >= 24;
              
              return (
                <div key={payment.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-800">{payment.email}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </span>
                        {isOverdue && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getUrgencyColor(hoursSince)
                          }`}>
                            {getUrgencyLabel(hoursSince)} - {formatTimeSince(hoursSince)}
                          </span>
                        )}
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
                        className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                          isOverdue 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isOverdue ? 'Send Urgent Reminder' : 'Send Reminder'}
                      </button>
                      <span className="text-xs text-gray-500 text-center">
                        Token: {payment.registrationToken?.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};