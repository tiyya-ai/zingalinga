import { sanitizeInput, sanitizeForLog } from './securityUtils';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface UserData {
  name: string;
  email: string;
  id?: string;
}

interface PurchaseData {
  orderNumber: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  purchaseDate: string;
}

export class EmailService {
  private static instance: EmailService;
  private apiKey: string;
  private fromEmail: string;
  private adminEmail: string;

  private constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || '';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@zingalinga.com';
    this.adminEmail = process.env.ADMIN_EMAIL || 'admin@zingalinga.com';
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private generateWelcomeTemplate(userData: UserData): EmailTemplate {
    const sanitizedName = sanitizeInput(userData.name);
    
    return {
      subject: '🎉 Welcome to Zinga Linga - Your Adventure Begins!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .feature { background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 Welcome to Zinga Linga!</h1>
              <p>Hi ${sanitizedName}, your magical learning adventure starts now!</p>
            </div>
            <div class="content">
              <h2>🎮 Meet Your Learning Companions</h2>
              <p>Get ready to explore amazing adventures with <strong>Kiki</strong> and <strong>Tano</strong>! They can't wait to guide you through exciting educational journeys.</p>
              
              <div class="features">
                <div class="feature">
                  <h3>🎨 Creative Learning</h3>
                  <p>Express yourself through art, music, and storytelling</p>
                </div>
                <div class="feature">
                  <h3>🧮 Math Adventures</h3>
                  <p>Solve puzzles and discover the magic of numbers</p>
                </div>
                <div class="feature">
                  <h3>📚 Reading Quests</h3>
                  <p>Unlock new worlds through exciting stories</p>
                </div>
                <div class="feature">
                  <h3>🌍 World Explorer</h3>
                  <p>Discover cultures, languages, and geography</p>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">
                  🚀 Start Your Adventure
                </a>
              </div>

              <h3>📧 Stay Connected</h3>
              <p>We'll send you updates about new adventures, learning tips, and special offers. You can unsubscribe anytime.</p>
              
              <p><strong>Need Help?</strong> Our support team is here for you at <a href="mailto:support@zingalinga.com">support@zingalinga.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to Zinga Linga, ${sanitizedName}!

Your magical learning adventure starts now! Get ready to explore amazing adventures with Kiki and Tano.

What awaits you:
• Creative Learning - Express yourself through art, music, and storytelling
• Math Adventures - Solve puzzles and discover the magic of numbers  
• Reading Quests - Unlock new worlds through exciting stories
• World Explorer - Discover cultures, languages, and geography

Start your adventure: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}

Need help? Contact us at support@zingalinga.com

Welcome aboard!
The Zinga Linga Team`
    };
  }

  private generatePurchaseTemplate(userData: UserData, purchaseData: PurchaseData): EmailTemplate {
    const sanitizedName = sanitizeInput(userData.name);
    const itemsHtml = purchaseData.items.map(item => 
      `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${sanitizeInput(item.name)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>`
    ).join('');

    return {
      subject: `🎉 Purchase Confirmation - Order #${purchaseData.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 10px; overflow: hidden; }
            .order-table th { background: #e5e7eb; padding: 15px; text-align: left; }
            .total-row { background: #f3f4f6; font-weight: bold; }
            .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Thank You for Your Purchase!</h1>
              <p>Hi ${sanitizedName}, your order has been confirmed!</p>
            </div>
            <div class="content">
              <h2>📋 Order Details</h2>
              <p><strong>Order Number:</strong> #${purchaseData.orderNumber}</p>
              <p><strong>Purchase Date:</strong> ${purchaseData.purchaseDate}</p>
              
              <table class="order-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="2" style="padding: 15px; text-align: right;">Total:</td>
                    <td style="padding: 15px; text-align: right;">$${purchaseData.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <h3>🎮 Your Account Access</h3>
              <p>Your personal learning account has been activated! You now have access to all purchased content and can track your child's progress.</p>

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">
                  🚀 Access Your Account
                </a>
              </div>

              <h3>📧 What's Next?</h3>
              <ul>
                <li>Log in to your account to access purchased content</li>
                <li>Set up your child's learning profile</li>
                <li>Explore educational adventures with Kiki & Tano</li>
                <li>Track learning progress and achievements</li>
              </ul>
              
              <p><strong>Need Help?</strong> Contact us at <a href="mailto:support@zingalinga.com">support@zingalinga.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Thank You for Your Purchase!

Hi ${sanitizedName}, your order has been confirmed!

Order Details:
Order Number: #${purchaseData.orderNumber}
Purchase Date: ${purchaseData.purchaseDate}

Items:
${purchaseData.items.map(item => `• ${item.name} (${item.quantity}x) - $${item.price.toFixed(2)}`).join('\n')}

Total: $${purchaseData.total.toFixed(2)}

Your personal learning account has been activated! Access your account at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}

What's Next:
• Log in to access purchased content
• Set up your child's learning profile  
• Explore adventures with Kiki & Tano
• Track learning progress

Need help? Contact support@zingalinga.com

Thank you for choosing Zinga Linga!`
    };
  }

  private generateAdminNotificationTemplate(userData: UserData, type: 'registration' | 'purchase', additionalData?: any): EmailTemplate {
    const sanitizedName = sanitizeInput(userData.name);
    const sanitizedEmail = sanitizeInput(userData.email);
    
    if (type === 'registration') {
      return {
        subject: `🆕 New User Registration - ${sanitizedName}`,
        html: `
          <h2>New User Registration</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>User ID:</strong> ${userData.id || 'Pending'}</p>
        `,
        text: `New User Registration\n\nName: ${sanitizedName}\nEmail: ${sanitizedEmail}\nRegistration Date: ${new Date().toLocaleString()}\nUser ID: ${userData.id || 'Pending'}`
      };
    } else {
      const purchaseData = additionalData as PurchaseData;
      return {
        subject: `💰 New Purchase - Order #${purchaseData.orderNumber}`,
        html: `
          <h2>New Purchase Notification</h2>
          <p><strong>Customer:</strong> ${sanitizedName} (${sanitizedEmail})</p>
          <p><strong>Order Number:</strong> #${purchaseData.orderNumber}</p>
          <p><strong>Total Amount:</strong> $${purchaseData.total.toFixed(2)}</p>
          <p><strong>Purchase Date:</strong> ${purchaseData.purchaseDate}</p>
          <h3>Items:</h3>
          <ul>
            ${purchaseData.items.map(item => `<li>${sanitizeInput(item.name)} (${item.quantity}x) - $${item.price.toFixed(2)}</li>`).join('')}
          </ul>
        `,
        text: `New Purchase Notification\n\nCustomer: ${sanitizedName} (${sanitizedEmail})\nOrder: #${purchaseData.orderNumber}\nTotal: $${purchaseData.total.toFixed(2)}\nDate: ${purchaseData.purchaseDate}\n\nItems:\n${purchaseData.items.map(item => `• ${item.name} (${item.quantity}x) - $${item.price.toFixed(2)}`).join('\n')}`
      };
    }
  }

  public async sendWelcomeEmail(userData: UserData): Promise<boolean> {
    try {
      const template = this.generateWelcomeTemplate(userData);
      const success = await this.sendEmail(userData.email, template);
      
      if (success) {
        // Also notify admin
        const adminTemplate = this.generateAdminNotificationTemplate(userData, 'registration');
        await this.sendEmail(this.adminEmail, adminTemplate);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to send welcome email:', sanitizeForLog(error));
      return false;
    }
  }

  public async sendPurchaseConfirmation(userData: UserData, purchaseData: PurchaseData): Promise<boolean> {
    try {
      const template = this.generatePurchaseTemplate(userData, purchaseData);
      const success = await this.sendEmail(userData.email, template);
      
      if (success) {
        // Also notify admin
        const adminTemplate = this.generateAdminNotificationTemplate(userData, 'purchase', purchaseData);
        await this.sendEmail(this.adminEmail, adminTemplate);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to send purchase confirmation:', sanitizeForLog(error));
      return false;
    }
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      // In a real implementation, you would use a service like SendGrid, AWS SES, or similar
      // For now, we'll simulate the email sending
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent to:', sanitizeForLog(to));
        console.log('📧 Subject:', template.subject);
        console.log('📧 Content:', template.text.substring(0, 200) + '...');
        return true;
      }

      // Example with a generic email service
      const response = await fetch(process.env.EMAIL_SERVICE_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: sanitizeInput(to),
          subject: template.subject,
          html: template.html,
          text: template.text
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Email sending failed:', sanitizeForLog(error));
      return false;
    }
  }
}

export const emailService = EmailService.getInstance();