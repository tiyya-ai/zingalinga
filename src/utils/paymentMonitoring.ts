import { pendingPaymentsManager, PendingPayment } from './pendingPayments';
import emailService from './emailService';

interface PaymentAlert {
  id: string;
  paymentId: string;
  email: string;
  alertType: '24h' | '48h' | '72h' | 'weekly';
  sentAt: string;
  status: 'sent' | 'failed';
}

export class PaymentMonitoringService {
  private static instance: PaymentMonitoringService;
  private alertHistory: PaymentAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadAlertHistory();
    this.startMonitoring();
  }

  public static getInstance(): PaymentMonitoringService {
    if (!PaymentMonitoringService.instance) {
      PaymentMonitoringService.instance = new PaymentMonitoringService();
    }
    return PaymentMonitoringService.instance;
  }

  private loadAlertHistory(): void {
    try {
      const saved = localStorage.getItem('paymentAlerts');
      if (saved) {
        this.alertHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load alert history:', error);
    }
  }

  private saveAlertHistory(): void {
    try {
      localStorage.setItem('paymentAlerts', JSON.stringify(this.alertHistory));
    } catch (error) {
      console.error('Failed to save alert history:', error);
    }
  }

  private startMonitoring(): void {
    // Check every hour for payments that need alerts
    this.monitoringInterval = setInterval(() => {
      this.checkForOverduePayments();
    }, 60 * 60 * 1000); // 1 hour

    // Also check immediately
    this.checkForOverduePayments();
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private async checkForOverduePayments(): Promise<void> {
    const pendingPayments = pendingPaymentsManager.getAllPendingPayments()
      .filter(p => p.status === 'pending');

    const now = new Date();

    for (const payment of pendingPayments) {
      const paymentDate = new Date(payment.paymentDate);
      const hoursSincePayment = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60);

      // Check for different alert thresholds
      if (hoursSincePayment >= 24 && !this.hasAlertBeenSent(payment.id, '24h')) {
        await this.sendPaymentAlert(payment, '24h');
      } else if (hoursSincePayment >= 48 && !this.hasAlertBeenSent(payment.id, '48h')) {
        await this.sendPaymentAlert(payment, '48h');
      } else if (hoursSincePayment >= 72 && !this.hasAlertBeenSent(payment.id, '72h')) {
        await this.sendPaymentAlert(payment, '72h');
      } else if (hoursSincePayment >= 168 && !this.hasAlertBeenSent(payment.id, 'weekly')) {
        await this.sendPaymentAlert(payment, 'weekly');
      }
    }
  }

  private hasAlertBeenSent(paymentId: string, alertType: PaymentAlert['alertType']): boolean {
    return this.alertHistory.some(
      alert => alert.paymentId === paymentId && 
               alert.alertType === alertType && 
               alert.status === 'sent'
    );
  }

  private async sendPaymentAlert(payment: PendingPayment, alertType: PaymentAlert['alertType']): Promise<void> {
    try {
      // Send reminder email to customer
      await this.sendCustomerReminder(payment, alertType);
      
      // Send alert to admin
      await this.sendAdminAlert(payment, alertType);

      // Record the alert
      const alert: PaymentAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentId: payment.id,
        email: payment.email,
        alertType,
        sentAt: new Date().toISOString(),
        status: 'sent'
      };

      this.alertHistory.push(alert);
      this.saveAlertHistory();

      console.log(`📧 Payment alert sent: ${alertType} for payment ${payment.id}`);
    } catch (error) {
      console.error('Failed to send payment alert:', error);
      
      // Record failed alert
      const alert: PaymentAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentId: payment.id,
        email: payment.email,
        alertType,
        sentAt: new Date().toISOString(),
        status: 'failed'
      };

      this.alertHistory.push(alert);
      this.saveAlertHistory();
    }
  }

  private async sendCustomerReminder(payment: PendingPayment, alertType: PaymentAlert['alertType']): Promise<void> {
    const urgencyLevel = this.getUrgencyLevel(alertType);
    const subject = this.getCustomerReminderSubject(alertType);
    const content = this.getCustomerReminderContent(payment, alertType);

    // In a real implementation, this would use the actual email service
    console.log(`📧 Customer reminder (${alertType}):`, {
      to: payment.email,
      subject,
      urgency: urgencyLevel
    });

    // Simulate email sending
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Customer reminder email content:', content);
    }
  }

  private async sendAdminAlert(payment: PendingPayment, alertType: PaymentAlert['alertType']): Promise<void> {
    const subject = `🚨 Unregistered Payment Alert - ${alertType.toUpperCase()}`;
    const content = `
      PAYMENT ALERT: ${alertType.toUpperCase()}
      
      Customer: ${payment.email}
      Payment Date: ${new Date(payment.paymentDate).toLocaleString()}
      Amount: $${payment.total.toFixed(2)}
      Items: ${payment.items.map(item => item.name).join(', ')}
      
      This payment has been pending registration for ${this.getTimeSincePayment(payment)}.
      
      Action Required:
      - Contact customer directly
      - Check for technical issues
      - Consider manual account creation
      
      Registration Token: ${payment.registrationToken}
    `;

    console.log(`🚨 Admin alert (${alertType}):`, {
      subject,
      payment: payment.id,
      customer: payment.email
    });

    // In development, log the alert content
    if (process.env.NODE_ENV === 'development') {
      console.log('🚨 Admin alert content:', content);
    }
  }

  private getUrgencyLevel(alertType: PaymentAlert['alertType']): 'low' | 'medium' | 'high' | 'critical' {
    switch (alertType) {
      case '24h': return 'low';
      case '48h': return 'medium';
      case '72h': return 'high';
      case 'weekly': return 'critical';
      default: return 'low';
    }
  }

  private getCustomerReminderSubject(alertType: PaymentAlert['alertType']): string {
    switch (alertType) {
      case '24h': return '🎯 Complete Your Zinga Linga Registration';
      case '48h': return '⏰ Don\'t Miss Out - Complete Your Registration';
      case '72h': return '🚨 Final Reminder - Complete Your Zinga Linga Account';
      case 'weekly': return '💔 We Miss You - Complete Your Registration';
      default: return 'Complete Your Zinga Linga Registration';
    }
  }

  private getCustomerReminderContent(payment: PendingPayment, alertType: PaymentAlert['alertType']): string {
    const urgencyMessage = this.getUrgencyMessage(alertType);
    const itemsList = payment.items.map(item => `• ${item.name} - $${item.price.toFixed(2)}`).join('\n');
    
    return `
      Hi there!
      
      ${urgencyMessage}
      
      Your Purchase Details:
      ${itemsList}
      Total: $${payment.total.toFixed(2)}
      Purchase Date: ${new Date(payment.paymentDate).toLocaleDateString()}
      
      To access your content:
      1. Visit our registration page
      2. Use your email: ${payment.email}
      3. Create your password
      4. Start learning immediately!
      
      Registration Token: ${payment.registrationToken}
      
      Need help? Reply to this email or contact support@zingalinga.com
      
      Best regards,
      The Zinga Linga Team
    `;
  }

  private getUrgencyMessage(alertType: PaymentAlert['alertType']): string {
    switch (alertType) {
      case '24h': 
        return 'Thank you for your recent purchase! We noticed you haven\'t completed your account registration yet. Your educational content is waiting for you!';
      case '48h': 
        return 'It\'s been 2 days since your purchase, and we want to make sure you can access your content. Please complete your registration to start learning!';
      case '72h': 
        return 'This is our final reminder - it\'s been 3 days since your purchase. We don\'t want you to miss out on your educational content!';
      case 'weekly': 
        return 'It\'s been a week since your purchase, and we\'re concerned you might be having trouble accessing your account. Our support team is here to help!';
      default: 
        return 'Please complete your registration to access your purchased content.';
    }
  }

  private getTimeSincePayment(payment: PendingPayment): string {
    const now = new Date();
    const paymentDate = new Date(payment.paymentDate);
    const hoursDiff = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60));
    
    if (hoursDiff < 24) {
      return `${hoursDiff} hours`;
    } else {
      const daysDiff = Math.floor(hoursDiff / 24);
      return `${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
    }
  }

  // Public methods for admin dashboard
  public getOverduePayments(): { payment: PendingPayment; hoursSince: number }[] {
    const pendingPayments = pendingPaymentsManager.getAllPendingPayments()
      .filter(p => p.status === 'pending');
    
    const now = new Date();
    
    return pendingPayments
      .map(payment => {
        const paymentDate = new Date(payment.paymentDate);
        const hoursSince = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60);
        return { payment, hoursSince };
      })
      .filter(({ hoursSince }) => hoursSince >= 24)
      .sort((a, b) => b.hoursSince - a.hoursSince);
  }

  public getAlertHistory(): PaymentAlert[] {
    return [...this.alertHistory].sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }

  public async sendManualReminder(
    userEmail: string,
    registrationToken: string,
    items: Array<{ name: string; price: number }>,
    total: number
  ): Promise<boolean> {
    try {
      // Send reminder email using email service
      const success = await emailService.sendRegistrationReminder(
        userEmail,
        registrationToken,
        items,
        total
      );
      
      if (success) {
        // Find the payment to update reminder history
        const payments = pendingPaymentsManager.getAllPendingPayments();
        const payment = payments.find(p => p.email === userEmail && p.registrationToken === registrationToken);
        if (payment) {
          // Record the manual alert
          const alert: PaymentAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            paymentId: payment.id,
            email: payment.email,
            alertType: '24h',
            sentAt: new Date().toISOString(),
            status: 'sent'
          };
          this.alertHistory.push(alert);
          this.saveAlertHistory();
        }
      }
      
      return success;
    } catch (error) {
      console.error('Failed to send manual reminder:', error);
      return false;
    }
  }

  public getPaymentStats(): {
    totalPending: number;
    overdue24h: number;
    overdue48h: number;
    overdue72h: number;
    overdueWeek: number;
  } {
    const pendingPayments = pendingPaymentsManager.getAllPendingPayments()
      .filter(p => p.status === 'pending');
    
    const now = new Date();
    let overdue24h = 0, overdue48h = 0, overdue72h = 0, overdueWeek = 0;
    
    pendingPayments.forEach(payment => {
      const paymentDate = new Date(payment.paymentDate);
      const hoursSince = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSince >= 168) overdueWeek++;
      else if (hoursSince >= 72) overdue72h++;
      else if (hoursSince >= 48) overdue48h++;
      else if (hoursSince >= 24) overdue24h++;
    });
    
    return {
      totalPending: pendingPayments.length,
      overdue24h,
      overdue48h,
      overdue72h,
      overdueWeek
    };
  }
}

// Export singleton instance
export const paymentMonitoringService = PaymentMonitoringService.getInstance();