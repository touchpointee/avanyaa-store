import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { generateOrderId } from '@/lib/utils';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email';

// GET /api/orders - Get orders (user's own or all for admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    let orders;

    if (role === 'admin') {
      // Admin sees all orders
      orders = await Order.find().sort({ createdAt: -1 }).lean();
    } else {
      // User sees only their orders
      orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create order (customer only; admin must use store as customer)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (session && (session.user as any).role === 'admin') {
      return NextResponse.json({ error: 'Sign in as a customer to place orders' }, { status: 401 });
    }
    const body = await req.json();
    const { items, address } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // Validate address
    if (!address || !address.fullName || !address.email || !address.phone || !address.street || !address.city || !address.state || !address.zipCode) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    // Verify products and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();

      totalAmount += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.images[0],
        price: product.price,
        quantity: item.quantity,
        size: item.size,
      });
    }

    const orderId = generateOrderId();

    const order = await Order.create({
      orderId,
      userId: session ? (session.user as any).id : null,
      items: orderItems,
      totalAmount,
      address,
      status: 'placed',
      paymentMethod: 'cod',
    });

    // Send emails
    try {
      const emailData = {
        orderId,
        customerName: address.fullName,
        customerEmail: address.email,
        items: orderItems.map((item: any) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
        totalAmount,
        address,
      };

      await Promise.all([
        sendOrderConfirmationEmail(emailData),
        sendAdminOrderNotification(emailData),
      ]);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
