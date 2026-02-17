import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const USE_RESEND = !!process.env.RESEND_API_KEY;

// Initialize Resend if API key exists
const resend = USE_RESEND ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
  }>;
  totalAmount: number;
  address: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

function generateOrderEmailHTML(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .item { border-bottom: 1px solid #eee; padding: 15px 0; }
    .item:last-child { border-bottom: none; }
    .total { font-size: 20px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #667eea; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AVANYAA</h1>
      <p>Order Confirmation</p>
    </div>
    <div class="content">
      <h2>Thank you for your order!</h2>
      <p>Hi ${data.customerName},</p>
      <p>Your order has been received and is being processed.</p>
      
      <div class="order-details">
        <h3>Order #${data.orderId}</h3>
        
        <h4>Items:</h4>
        ${data.items.map(item => `
          <div class="item">
            <strong>${item.name}</strong> ${item.size ? `(Size: ${item.size})` : ''}<br>
            Quantity: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')} = ₹${(item.quantity * item.price).toLocaleString('en-IN')}
          </div>
        `).join('')}
        
        <div class="total">
          Total: ₹${data.totalAmount.toLocaleString('en-IN')}
        </div>
      </div>
      
      <div class="order-details">
        <h4>Delivery Address:</h4>
        <p>
          ${data.address.fullName}<br>
          ${data.address.phone}<br>
          ${data.address.street}<br>
          ${data.address.city}, ${data.address.state} ${data.address.zipCode}
        </p>
      </div>
      
      <div class="order-details">
        <h4>Payment Method:</h4>
        <p>Cash on Delivery (COD)</p>
      </div>
      
      <p>We'll send you a shipping confirmation email as soon as your order ships.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 AVANYAA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateAdminOrderEmailHTML(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a1a; color: white; padding: 20px; }
    .content { background: white; padding: 20px; border: 1px solid #ddd; }
    .item { border-bottom: 1px solid #eee; padding: 10px 0; }
    .total { font-size: 18px; font-weight: bold; margin-top: 15px; padding-top: 15px; border-top: 2px solid #333; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🛍️ New Order Received</h2>
    </div>
    <div class="content">
      <h3>Order #${data.orderId}</h3>
      
      <p><strong>Customer:</strong> ${data.customerName}</p>
      <p><strong>Email:</strong> ${data.customerEmail}</p>
      <p><strong>Phone:</strong> ${data.address.phone}</p>
      
      <h4>Items:</h4>
      ${data.items.map(item => `
        <div class="item">
          ${item.name} ${item.size ? `(${item.size})` : ''} - Qty: ${item.quantity} - ₹${(item.quantity * item.price).toLocaleString('en-IN')}
        </div>
      `).join('')}
      
      <div class="total">Total: ₹${data.totalAmount.toLocaleString('en-IN')}</div>
      
      <h4>Delivery Address:</h4>
      <p>
        ${data.address.fullName}<br>
        ${data.address.phone}<br>
        ${data.address.street}<br>
        ${data.address.city}, ${data.address.state} ${data.address.zipCode}
      </p>
      
      <p><strong>Payment:</strong> Cash on Delivery</p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const html = generateOrderEmailHTML(data);
  
  try {
    if (USE_RESEND && resend) {
      await resend.emails.send({
        from: 'AVANYAA <orders@avanyaa.com>',
        to: data.customerEmail,
        subject: `Order Confirmation - #${data.orderId}`,
        html,
      });
    } else {
      await transporter.sendMail({
        from: `"AVANYAA" <${process.env.SMTP_USER}>`,
        to: data.customerEmail,
        subject: `Order Confirmation - #${data.orderId}`,
        html,
      });
    }
  } catch (error) {
    console.error('Error sending customer email:', error);
    throw error;
  }
}

export async function sendAdminOrderNotification(data: OrderEmailData) {
  const html = generateAdminOrderEmailHTML(data);
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not configured, skipping admin notification');
    return;
  }
  
  try {
    if (USE_RESEND && resend) {
      await resend.emails.send({
        from: 'AVANYAA <orders@avanyaa.com>',
        to: adminEmail,
        subject: `New Order - #${data.orderId}`,
        html,
      });
    } else {
      await transporter.sendMail({
        from: `"AVANYAA" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `New Order - #${data.orderId}`,
        html,
      });
    }
  } catch (error) {
    console.error('Error sending admin email:', error);
  }
}
