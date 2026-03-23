import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import Settings from '@/models/Settings';
import InventoryHistory from '@/models/InventoryHistory';
import { generateOrderId } from '@/lib/utils';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email';
import mongoose from 'mongoose';
import crypto from 'crypto';

// GET /api/orders - Get orders (user's own, admin all, or guest lookup by email+phone)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const guestEmail = searchParams.get('email');
    const guestPhone = searchParams.get('phone');

    // ── Guest order lookup (no session required) ──────────────────
    if (guestEmail && guestPhone) {
      const orders = await Order.find({
        'address.email': guestEmail.toLowerCase().trim(),
        'address.phone': guestPhone.trim(),
      }).sort({ createdAt: -1 }).lean();
      return NextResponse.json(orders);
    }

    // ── Authenticated lookup ──────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = (session.user as any).email;
    const role = (session.user as any).role;

    if (role === 'admin') {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json(orders);
    }

    // Fetch the user's saved mobile from DB so we can match guest orders too
    const userDoc = await User.findById(userId).lean();
    const userMobile = (userDoc as any)?.mobile?.trim() ?? '';

    // Cast userId string → ObjectId so Mongoose matches correctly inside $or
    let userObjectId: mongoose.Types.ObjectId | string = userId;
    try { userObjectId = new mongoose.Types.ObjectId(userId); } catch { /* keep string */ }

    // Base condition: orders placed while logged in
    const orConditions: any[] = [{ userId: userObjectId }];

    // Link guest orders only when BOTH email AND mobile match the order address
    if (userEmail && userMobile) {
      orConditions.push({
        'address.email': userEmail.toLowerCase().trim(),
        'address.phone': userMobile,
      });
    }

    const rawOrders = await Order.find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .lean();

    // Deduplicate by _id (multiple conditions may match the same order)
    const seen = new Set<string>();
    const orders = rawOrders.filter((o: any) => {
      const id = o._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}



// POST /api/orders - Create order (guests and customers; admin sessions treated as guest)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    // If session belongs to an admin, treat this as a guest order (no userId)
    const isAdmin = session && (session.user as any).role === 'admin';
    const body = await req.json();
    const { items, address, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // Validate address
    if (!address || !address.fullName || !address.email || !address.phone || !address.street || !address.city || !address.state || !address.zipCode) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing Razorpay payment details' }, { status: 400 });
    }

    // Verify products and calculate total
    let itemsTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      let availableStock = product.stock || 0;
      if (product.variants && product.variants.length > 0) {
        const variantIndex = product.variants.findIndex(
          (v: any) => v.size === item.size && v.color === item.color
        );
        availableStock = variantIndex > -1 ? product.variants[variantIndex].stock : 0;
      }

      if (availableStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name} (${item.size || ''} ${item.color || ''})` },
          { status: 400 }
        );
      }

      itemsTotal += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.images[0],
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      });

      // We will reduce stock and record history after order is fully validated
    }

    // Fetch settings for shipping charge calculations
    const settingsDoc = await Settings.findOne({ key: 'global' }).lean() as any;
    const shippingCharge = settingsDoc?.shippingCharge || 0;
    const freeShippingThreshold = settingsDoc?.freeShippingThreshold || 0;

    let appliedShippingFee = 0;
    if (itemsTotal > 0 && itemsTotal < freeShippingThreshold) {
      appliedShippingFee = shippingCharge;
    }

    const totalAmount = itemsTotal + appliedShippingFee;

    // Verify Razorpay Signature
    const bodyString = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(bodyString)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const orderId = generateOrderId();
    // Admin sessions → guest order (no userId); customers → link to their account
    const userId = (session && !isAdmin) ? (session.user as any).id : null;

    const order = await Order.create({
      orderId,
      userId,
      items: orderItems,
      totalAmount,
      shippingFee: appliedShippingFee,
      address,
      status: 'placed',
      paymentMethod: 'razorpay',
      isPaid: true,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    // Reduce stock and create history logs
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        if (product.variants && product.variants.length > 0) {
          const variantIndex = product.variants.findIndex(
            (v: any) => v.size === item.size && v.color === item.color
          );
          
          if (variantIndex > -1) {
            product.variants[variantIndex].stock -= item.quantity;
            product.stock = product.variants.reduce((total: number, v: any) => total + (Number(v.stock) || 0), 0);

            await InventoryHistory.create({
              productId: product._id,
              productName: product.name,
              variant: { size: item.size, color: item.color },
              changeAmount: -item.quantity,
              reason: 'Order Placed',
              referenceId: orderId,
            });
          }
        } else {
          // No variants, directly reduce master stock
          product.stock -= item.quantity;
          
          await InventoryHistory.create({
            productId: product._id,
            productName: product.name,
            changeAmount: -item.quantity,
            reason: 'Order Placed',
            referenceId: orderId,
          });
        }
        
        await product.save();
      }
    }

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
          color: item.color,
        })),
        totalAmount,
        shippingFee: appliedShippingFee,
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
