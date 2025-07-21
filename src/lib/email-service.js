import { Resend } from 'resend';
import { orderConfirmationTemplate } from './email-templates';

// Initialize Resend with error handling
let resendInstance;

try {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not defined in environment variables');
  }
  resendInstance = new Resend(process.env.RESEND_API_KEY);
} catch (error) {
  console.error('Failed to initialize Resend:', error);
}

/**
 * Email service for sending various types of emails
 */
class EmailService {
  constructor() {
    this.resend = resendInstance;
    this.fromEmail = 'TheNutriDry <noreply@thenutridry.com>';
  }

  /**
   * Send order confirmation email
   * @param {Object} params - Email parameters
   * @param {string} params.email - Recipient email
   * @param {string} params.customerName - Customer's name
   * @param {Array} params.items - Order items
   * @param {Object} params.address - Delivery address
   * @param {string} params.orderId - Order ID
   * @param {number} params.total - Order total
   * @returns {Promise} Email send result
   */
  async sendOrderConfirmation(params) {
    try {
      if (!this.resend) {
        throw new Error('Resend is not initialized');
      }

      const { email, ...templateParams } = params;
      
      // Log the email parameters for debugging
      console.log('Sending order confirmation email to:', email);
      console.log('Order confirmation template params:', JSON.stringify(templateParams, null, 2));
      
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Your TheNutriDry Order Confirmation',
        html: orderConfirmationTemplate(templateParams)
      });
      
      console.log('Order confirmation email sent:', result);
      return result;
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      throw error;
    }
  }
  
  // Add more email sending methods as needed
}

// Export a singleton instance
export const emailService = new EmailService();
