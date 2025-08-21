interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'aws-ses' | 'custom';
  apiKey: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  fromEmail: string;
  fromName: string;
  adminEmail: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function sanitizeForLog(data: any): any {
  if (typeof data === 'string') {
    return data.replace(/[\r\n\t]/g, ' ').substring(0, 100);
  }
  return data;
}

export class EmailService {
  private config: EmailConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): EmailConfig {
    // Try to load from localStorage first (admin settings)
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('emailSettings');
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          return {
            provider: parsed.provider || 'custom',
            apiKey: parsed.apiKey || '',
            smtpHost: parsed.smtpHost,
            smtpPort: parsed.smtpPort,
            smtpUser: parsed.smtpUser,
            smtpPassword: parsed.smtpPassword,
            smtpSecure: parsed.smtpSecure,
            fromEmail: parsed.fromEmail || 'noreply@zingalinga.com',
            fromName: parsed.fromName || 'ZingaLinga',
            adminEmail: parsed.adminEmail || 'admin@zingalinga.com'
          };
        } catch (error) {
          console.warn('Failed to parse saved email config:', error);
        }
      }
    }

    // Fallback to environment variables
    return {
      provider: (process.env.EMAIL_PROVIDER as any) || 'custom',
      apiKey: process.env.EMAIL_API_KEY || '',
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      smtpUser: process.env.SMTP_USER,
      smtpPassword: process.env.SMTP_PASSWORD,
      smtpSecure: process.env.SMTP_SECURE === 'true',
      fromEmail: process.env.FROM_EMAIL || 'noreply@zingalinga.com',
      fromName: process.env.FROM_NAME || 'ZingaLinga',
      adminEmail: process.env.ADMIN_EMAIL || 'admin@zingalinga.com'
    };
  }

  public updateConfig(newConfig: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Save to localStorage if available
    if (typeof window !== 'undefined') {
      localStorage.setItem('emailSettings', JSON.stringify(this.config));
    }
  }

  public getConfig(): EmailConfig {
    return { ...this.config };
  }

  public async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const testResult = await this.sendTestEmail();
      return {
        success: testResult,
        message: testResult ? 'Email test successful!' : 'Email test failed. Please check your configuration.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Email test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async sendTestEmail(): Promise<boolean> {
    const testEmailData: EmailData = {
      to: this.config.adminEmail,
      subject: 'ZingaLinga Email Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify your email configuration is working correctly.</p>
        <p><strong>Provider:</strong> ${this.config.provider}</p>
        <p><strong>From:</strong> ${this.config.fromName} &lt;${this.config.fromEmail}&gt;</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
      text: `Email Configuration Test\n\nThis is a test email to verify your email configuration is working correctly.\n\nProvider: ${this.config.provider}\nFrom: ${this.config.fromName} <${this.config.fromEmail}>\nTimestamp: ${new Date().toISOString()}`
    };
    
    return await this.sendEmail(testEmailData);
  }

  public async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const dashboardUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'https://zingalinga.com/dashboard';
    
    const emailData: EmailData = {
      to: userEmail,
      subject: 'Welcome to ZingaLinga! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Welcome to ZingaLinga!</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">Hi ${userName},</p>
          
          <p style="font-size: 16px; line-height: 1.6;">Thank you for joining ZingaLinga! We're excited to have you as part of our community.</p>
          
          <p style="font-size: 16px; line-height: 1.6;">Your account has been successfully created and you can now access all our features.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Go to Dashboard</a>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">What's Next?</h3>
            <ul style="color: #6b7280; line-height: 1.6;">
              <li>Explore your dashboard and available features</li>
              <li>Complete your profile setup</li>
              <li>Check out our latest packages and services</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">If you have any questions, feel free to reach out to our support team at <a href="mailto:${this.config.adminEmail}" style="color: #2563eb;">${this.config.adminEmail}</a>.</p>
          
          <p style="font-size: 16px; line-height: 1.6;">Best regards,<br><strong>The ZingaLinga Team</strong></p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">This email was sent from ${this.config.fromEmail}</p>
        </div>
      `,
      text: `Welcome to ZingaLinga!\n\nHi ${userName},\n\nThank you for joining ZingaLinga! We're excited to have you as part of our community.\n\nYour account has been successfully created and you can now access all our features.\n\nVisit your dashboard: ${dashboardUrl}\n\nWhat's Next?\n- Explore your dashboard and available features\n- Complete your profile setup\n- Check out our latest packages and services\n\nIf you have any questions, feel free to reach out to our support team at ${this.config.adminEmail}.\n\nBest regards,\nThe ZingaLinga Team`
    };

    const emailSent = await this.sendEmail(emailData);
    
    // Also notify admin of new registration
    if (emailSent) {
      await this.notifyAdminNewRegistration(userEmail, userName);
    }
    
    return emailSent;
  }

  public async sendPurchaseConfirmation(
    userEmail: string,
    userName: string,
    items: Array<{ name: string; price: number }>,
    total: number,
    orderId: string
  ): Promise<boolean> {
    const itemsList = items.map(item => 
      `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>`
    ).join('');
    
    const emailData: EmailData = {
      to: userEmail,
      subject: `Purchase Confirmation - Order #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Purchase Confirmation</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Order #${orderId}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">Hi ${userName},</p>
          
          <p style="font-size: 16px; line-height: 1.6;">Thank you for your purchase! Here are the details of your order:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #e5e7eb;">
                  <th style="padding: 12px 8px; text-align: left; font-weight: bold;">Item</th>
                  <th style="padding: 12px 8px; text-align: right; font-weight: bold;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr style="background-color: #e5e7eb; font-weight: bold;">
                  <td style="padding: 12px 8px;">Total</td>
                  <td style="padding: 12px 8px; text-align: right;">$${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">What Happens Next?</h3>
            <ul style="color: #1e40af; line-height: 1.6; margin: 0;">
              <li>Your items will be processed and activated within 24 hours</li>
              <li>You'll receive access details via email once ready</li>
              <li>Check your dashboard for real-time status updates</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">If you have any questions about your order, please contact our support team at <a href="mailto:${this.config.adminEmail}" style="color: #2563eb;">${this.config.adminEmail}</a>.</p>
          
          <p style="font-size: 16px; line-height: 1.6;">Best regards,<br><strong>The ZingaLinga Team</strong></p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Order Date: ${new Date().toLocaleDateString()} | This email was sent from ${this.config.fromEmail}</p>
        </div>
      `,
      text: `Purchase Confirmation - Order #${orderId}\n\nHi ${userName},\n\nThank you for your purchase! Here are the details of your order:\n\nOrder #${orderId}\n${items.map(item => `- ${item.name} - $${item.price.toFixed(2)}`).join('\n')}\n\nTotal: $${total.toFixed(2)}\n\nWhat Happens Next?\n- Your items will be processed and activated within 24 hours\n- You'll receive access details via email once ready\n- Check your dashboard for real-time status updates\n\nIf you have any questions about your order, please contact our support team at ${this.config.adminEmail}.\n\nBest regards,\nThe ZingaLinga Team\n\nOrder Date: ${new Date().toLocaleDateString()}`
    };

    const emailSent = await this.sendEmail(emailData);
    
    // Also notify admin of new purchase
    if (emailSent) {
      await this.notifyAdminNewPurchase(userEmail, userName, items, total, orderId);
    }
    
    return emailSent;
  }

  public async sendRegistrationReminder(userEmail: string, registrationToken: string, items: Array<{ name: string; price: number }>, total: number): Promise<boolean> {
    const registrationUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/register?token=${registrationToken}`
      : `https://zingalinga.com/register?token=${registrationToken}`;
    
    const itemsList = items.map(item => `<li>${item.name} - $${item.price.toFixed(2)}</li>`).join('');
    
    const emailData: EmailData = {
      to: userEmail,
      subject: '⏰ Complete Your Registration - ZingaLinga',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f59e0b; margin: 0;">Complete Your Registration</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Your payment is waiting for you!</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">⚠️ Action Required</h3>
            <p style="color: #92400e; margin: 0;">We received your payment but you haven't completed your registration yet. Complete it now to access your purchased items!</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Your Purchase</h3>
            <ul style="color: #6b7280; line-height: 1.6;">${itemsList}</ul>
            <p style="font-weight: bold; color: #374151; margin: 10px 0 0 0;">Total: $${total.toFixed(2)}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${registrationUrl}" style="background-color: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">Complete Registration Now</a>
          </div>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Why Complete Registration?</h3>
            <ul style="color: #1e40af; line-height: 1.6; margin: 0;">
              <li>Access your purchased items immediately</li>
              <li>Track your orders and services</li>
              <li>Receive important updates and support</li>
              <li>Manage your account and preferences</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">If you're having trouble with the link above, copy and paste this URL into your browser:</p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${registrationUrl}</p>
          
          <p style="font-size: 16px; line-height: 1.6;">Need help? Contact our support team at <a href="mailto:${this.config.adminEmail}" style="color: #2563eb;">${this.config.adminEmail}</a>.</p>
          
          <p style="font-size: 16px; line-height: 1.6;">Best regards,<br><strong>The ZingaLinga Team</strong></p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">This email was sent from ${this.config.fromEmail}</p>
        </div>
      `,
      text: `Complete Your Registration - ZingaLinga\n\nYour payment is waiting for you!\n\nWe received your payment but you haven't completed your registration yet. Complete it now to access your purchased items!\n\nYour Purchase:\n${items.map(item => `- ${item.name} - $${item.price.toFixed(2)}`).join('\n')}\nTotal: $${total.toFixed(2)}\n\nComplete your registration here: ${registrationUrl}\n\nWhy Complete Registration?\n- Access your purchased items immediately\n- Track your orders and services\n- Receive important updates and support\n- Manage your account and preferences\n\nNeed help? Contact our support team at ${this.config.adminEmail}.\n\nBest regards,\nThe ZingaLinga Team`
    };

    return await this.sendEmail(emailData);
  }
  
  public async notifyAdminNewRegistration(userEmail: string, userName: string): Promise<boolean> {
    const emailData: EmailData = {
      to: this.config.adminEmail,
      subject: '🎉 New User Registration - ZingaLinga',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">New User Registration</h2>
          <p>A new user has registered on ZingaLinga:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Name:</strong> ${userName}</li>
              <li><strong>Email:</strong> ${userEmail}</li>
              <li><strong>Registration Date:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          <p>Welcome email has been sent to the user.</p>
          <p style="font-size: 12px; color: #6b7280;">Sent from ZingaLinga Admin System</p>
        </div>
      `,
      text: `New User Registration\n\nA new user has registered on ZingaLinga:\n\nName: ${userName}\nEmail: ${userEmail}\nRegistration Date: ${new Date().toLocaleString()}\n\nWelcome email has been sent to the user.`
    };

    return await this.sendEmail(emailData);
  }

  public async notifyAdminNewPurchase(
    userEmail: string,
    userName: string,
    items: Array<{ name: string; price: number }>,
    total: number,
    orderId: string
  ): Promise<boolean> {
    const itemsList = items.map(item => 
      `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>`
    ).join('');
    
    const emailData: EmailData = {
      to: this.config.adminEmail,
      subject: `💰 New Purchase - Order #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">New Purchase Notification</h2>
          <p style="font-size: 16px;">A new purchase has been made on ZingaLinga:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Customer Details</h3>
            <table style="width: 100%; margin-bottom: 20px;">
              <tr><td style="padding: 5px 0; font-weight: bold;">Name:</td><td style="padding: 5px 0;">${userName}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Email:</td><td style="padding: 5px 0;">${userEmail}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Order ID:</td><td style="padding: 5px 0;">${orderId}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Purchase Date:</td><td style="padding: 5px 0;">${new Date().toLocaleString()}</td></tr>
            </table>
            
            <h3 style="color: #374151;">Items Purchased</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <thead>
                <tr style="background-color: #e5e7eb;">
                  <th style="padding: 10px 8px; text-align: left;">Item</th>
                  <th style="padding: 10px 8px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr style="background-color: #e5e7eb; font-weight: bold;">
                  <td style="padding: 10px 8px;">Total</td>
                  <td style="padding: 10px 8px; text-align: right;">$${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1e40af; margin: 0; font-weight: bold;">✅ Purchase confirmation email has been sent to the customer.</p>
          </div>
          
          <p style="font-size: 12px; color: #6b7280;">Sent from ZingaLinga Admin System at ${new Date().toLocaleString()}</p>
        </div>
      `,
      text: `New Purchase Notification\n\nA new purchase has been made on ZingaLinga:\n\nCustomer Details:\nName: ${userName}\nEmail: ${userEmail}\nOrder ID: ${orderId}\nPurchase Date: ${new Date().toLocaleString()}\n\nItems Purchased:\n${items.map(item => `- ${item.name} - $${item.price.toFixed(2)}`).join('\n')}\n\nTotal: $${total.toFixed(2)}\n\nPurchase confirmation email has been sent to the customer.`
    };

    return await this.sendEmail(emailData);
  }
  
  public async notifyAdminOverduePayment(
    userEmail: string,
    items: Array<{ name: string; price: number }>,
    total: number,
    hoursSincePayment: number,
    registrationToken: string
  ): Promise<boolean> {
    const urgencyLevel = hoursSincePayment >= 168 ? 'CRITICAL' : 
                        hoursSincePayment >= 72 ? 'HIGH' : 
                        hoursSincePayment >= 48 ? 'MEDIUM' : 'LOW';
    
    const urgencyColor = hoursSincePayment >= 168 ? '#dc2626' : 
                        hoursSincePayment >= 72 ? '#ea580c' : 
                        hoursSincePayment >= 48 ? '#d97706' : '#2563eb';
    
    const itemsList = items.map(item => `<li>${item.name} - $${item.price.toFixed(2)}</li>`).join('');
    
    const emailData: EmailData = {
      to: this.config.adminEmail,
      subject: `🚨 ${urgencyLevel} ALERT: Overdue Payment Registration - ${Math.floor(hoursSincePayment)}h`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${urgencyColor}; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">🚨 ${urgencyLevel} ALERT</h2>
            <p style="margin: 5px 0 0 0;">Overdue Payment Registration</p>
          </div>
          
          <p style="font-size: 16px;">A customer paid but hasn't completed registration for <strong>${Math.floor(hoursSincePayment)} hours</strong>:</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #dc2626; margin-top: 0;">Customer Details</h3>
            <table style="width: 100%; margin-bottom: 15px;">
              <tr><td style="padding: 5px 0; font-weight: bold;">Email:</td><td style="padding: 5px 0;">${userEmail}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Hours Since Payment:</td><td style="padding: 5px 0; color: ${urgencyColor}; font-weight: bold;">${Math.floor(hoursSincePayment)}h</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Registration Token:</td><td style="padding: 5px 0; font-family: monospace; font-size: 12px;">${registrationToken}</td></tr>
            </table>
            
            <h3 style="color: #dc2626;">Purchase Details</h3>
            <ul style="margin: 0;">${itemsList}</ul>
            <p style="font-weight: bold; margin: 10px 0 0 0;">Total: $${total.toFixed(2)}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Recommended Actions</h3>
            <ul style="color: #92400e; margin: 0;">
              <li>Send a registration reminder email to the customer</li>
              <li>Check if there are any technical issues preventing registration</li>
              <li>Consider reaching out via phone if this is a high-value customer</li>
              ${hoursSincePayment >= 72 ? '<li style="font-weight: bold;">URGENT: Consider manual follow-up for this critical case</li>' : ''}
            </ul>
          </div>
          
          <p style="font-size: 12px; color: #6b7280;">Sent from ZingaLinga Payment Monitoring System at ${new Date().toLocaleString()}</p>
        </div>
      `,
      text: `${urgencyLevel} ALERT: Overdue Payment Registration - ${Math.floor(hoursSincePayment)}h\n\nA customer paid but hasn't completed registration for ${Math.floor(hoursSincePayment)} hours:\n\nCustomer Details:\nEmail: ${userEmail}\nHours Since Payment: ${Math.floor(hoursSincePayment)}h\nRegistration Token: ${registrationToken}\n\nPurchase Details:\n${items.map(item => `- ${item.name} - $${item.price.toFixed(2)}`).join('\n')}\nTotal: $${total.toFixed(2)}\n\nRecommended Actions:\n- Send a registration reminder email to the customer\n- Check if there are any technical issues preventing registration\n- Consider reaching out via phone if this is a high-value customer${hoursSincePayment >= 72 ? '\n- URGENT: Consider manual follow-up for this critical case' : ''}`
    };

    return await this.sendEmail(emailData);
  }

  public async sendCustomEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<boolean> {
    const emailData: EmailData = {
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, '') // Simple HTML to text conversion
    };

    return await this.sendEmail(emailData);
  }

  private async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // In development, just log the email
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent:', {
          to: sanitizeForLog(emailData.to),
          subject: emailData.subject,
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          provider: this.config.provider
        });
        return true;
      }

      // In production, send via configured provider
      switch (this.config.provider) {
        case 'sendgrid':
          return await this.sendViaSendGrid(emailData);
        case 'mailgun':
          return await this.sendViaMailgun(emailData);
        case 'aws-ses':
          return await this.sendViaAWSSES(emailData);
        default:
          return await this.sendViaCustomSMTP(emailData);
      }
    } catch (error) {
      console.error('Failed to send email:', sanitizeForLog(error));
      return false;
    }
  }

  private async sendViaSendGrid(emailData: EmailData): Promise<boolean> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: emailData.to }]
          }],
          from: {
            email: this.config.fromEmail,
            name: this.config.fromName
          },
          subject: emailData.subject,
          content: [
            {
              type: 'text/html',
              value: emailData.html
            },
            ...(emailData.text ? [{
              type: 'text/plain',
              value: emailData.text
            }] : [])
          ]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('SendGrid error:', sanitizeForLog(error));
      return false;
    }
  }

  private async sendViaMailgun(emailData: EmailData): Promise<boolean> {
    try {
      const domain = this.config.smtpHost || 'mg.zingalinga.com';
      const formData = new FormData();
      formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('html', emailData.html);
      if (emailData.text) {
        formData.append('text', emailData.text);
      }

      const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`
        },
        body: formData
      });

      return response.ok;
    } catch (error) {
      console.error('Mailgun error:', sanitizeForLog(error));
      return false;
    }
  }

  private async sendViaAWSSES(emailData: EmailData): Promise<boolean> {
    try {
      // This would require AWS SDK implementation
      // For now, we'll use a generic API approach
      const response = await fetch('https://email.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: {
          'Authorization': `AWS4-HMAC-SHA256 ${this.config.apiKey}`,
          'Content-Type': 'application/x-amz-json-1.0'
        },
        body: JSON.stringify({
          Action: 'SendEmail',
          Source: `${this.config.fromName} <${this.config.fromEmail}>`,
          Destination: {
            ToAddresses: [emailData.to]
          },
          Message: {
            Subject: {
              Data: emailData.subject
            },
            Body: {
              Html: {
                Data: emailData.html
              },
              ...(emailData.text ? {
                Text: {
                  Data: emailData.text
                }
              } : {})
            }
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('AWS SES error:', sanitizeForLog(error));
      return false;
    }
  }

  private async sendViaCustomSMTP(emailData: EmailData): Promise<boolean> {
    try {
      // For custom SMTP, we'll use a generic email service API
      // In a real implementation, you'd use nodemailer or similar
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          smtp: {
            host: this.config.smtpHost,
            port: this.config.smtpPort,
            secure: this.config.smtpSecure,
            auth: {
              user: this.config.smtpUser,
              pass: this.config.smtpPassword
            }
          },
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Custom SMTP error:', sanitizeForLog(error));
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;