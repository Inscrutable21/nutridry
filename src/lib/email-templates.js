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
 * Email template for order confirmation
 * @param {Object} params - Template parameters
 * @returns {string} HTML email content
 */
export function orderConfirmationTemplate(params) {
  const {
    customerName,
    orderId,
    items,
    address,
    total,
    orderDate
  } = params;

  // Calculate expected delivery date (7 days from order date)
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  
  // Format dates
  const formattedOrderDate = new Date(orderDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format address
  const formattedAddress = `
    ${address.name}<br>
    ${address.address}<br>
    ${address.locality}, ${address.city}<br>
    ${address.state} - ${address.pincode}<br>
    Phone: ${address.phone}
  `;

  // Format items
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${item.name} ${item.variant ? `(${item.variant})` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ₹${item.price.toFixed(2)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ₹${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2b9348;
        }
        .order-info {
          padding: 20px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2b9348;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background-color: #f3f4f6;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 14px;
          color: #6b7280;
        }
        .button {
          display: inline-block;
          background-color: #2b9348;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
          margin-top: 20px;
        }
        .total-row {
          font-weight: bold;
          background-color: #f9fafb;
        }
        .address-box {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 4px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TheNutriDry</div>
          <p>Premium Dehydrated Foods</p>
        </div>
        
        <div class="order-info">
          <h2>Order Confirmation</h2>
          <p>Hello ${customerName},</p>
          <p>Thank you for your order! We're currently processing it and will ship it soon.</p>
          
          <div>
            <p><strong>Order Number:</strong> #${orderId}</p>
            <p><strong>Order Date:</strong> ${formattedOrderDate}</p>
            <p><strong>Expected Delivery:</strong> ${formattedDeliveryDate}</p>
          </div>
        </div>
        
        <div style="padding: 20px 0; border-bottom: 1px solid #e5e7eb;">
          <div class="section-title">Order Summary</div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="3" style="padding: 12px; text-align: right;">Total:</td>
                <td style="padding: 12px; text-align: right;">₹${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style="padding: 20px 0; border-bottom: 1px solid #e5e7eb;">
          <div class="section-title">Shipping Address</div>
          <div class="address-box">
            ${formattedAddress}
          </div>
        </div>
        
        
        
        <div class="footer">
          <p>If you have any questions, please contact our customer service at support@thenutridry.com</p>
          <p>&copy; ${new Date().getFullYear()} TheNutriDry. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

