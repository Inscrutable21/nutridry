/**
 * Email templates for various notifications
 */

/**
 * Generates the delivery date string (1 week from provided date)
 * @param {Date} fromDate - Base date to calculate from
 * @returns {string} Formatted delivery date
 */
export const getDeliveryDate = (fromDate = new Date()) => {
  const deliveryDate = new Date(fromDate);
  deliveryDate.setDate(deliveryDate.getDate() + 7); // 1 week from today
  
  return deliveryDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Order confirmation email template
 * @param {Object} params - Email parameters
 * @param {string} params.customerName - Customer's name
 * @param {Array} params.items - Order items
 * @param {Object} params.address - Shipping address
 * @param {string} params.orderId - Order ID
 * @param {number} params.total - Order total
 * @returns {string} HTML email content
 */
export const orderConfirmationTemplate = ({ 
  customerName, 
  items, 
  address, 
  orderId, 
  total,
  orderDate = new Date()
}) => {
  const deliveryDate = getDeliveryDate(orderDate);
  
  // Generate items HTML
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.name} ${item.variant ? `(${item.variant})` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  // Get the base URL from environment or default to production URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thenutridry.com';
  const logoUrl = `${baseUrl}/logo.svg`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      
      
      <h2 style="color: #4CAF50; text-align: center;">Order Confirmation</h2>
      
      <p>Hello ${customerName},</p>
      
      <p>Thank you for your order! We're excited to let you know that we've received your order and are preparing it for shipment.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order ID:</strong> ${orderId}</p>
        <p style="margin: 10px 0 0;"><strong>Expected Delivery Date:</strong> ${deliveryDate}</p>
      </div>
      
      <h3 style="border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Order Summary</h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold;">₹${total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      
      <h3 style="border-bottom: 2px solid #4CAF50; padding-bottom: 10px; margin-top: 30px;">Shipping Address</h3>
      
      <p>
        ${address.name}<br>
        ${address.address}<br>
        ${address.locality ? `${address.locality}<br>` : ''}
        ${address.city}, ${address.state} ${address.pincode}<br>
        Phone: ${address.phone}
        ${address.landmark ? `<br>Landmark: ${address.landmark}` : ''}
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #777; font-size: 14px;">
        <p>If you have any questions about your order, please contact our customer service at <a href="mailto:support@thenutridry.com" style="color: #4CAF50;">support@thenutridry.com</a></p>
        <p>Thank you for shopping with TheNutriDry!</p>
      </div>
    </div>
  `;
};
