import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { razorpay } from '@/lib/razorpay';
import mongoose from 'mongoose';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.isPaid || !order.razorpayPaymentId) {
      return NextResponse.json({ error: 'Order has not been paid via Razorpay' }, { status: 400 });
    }

    if (order.isRefunded) {
      return NextResponse.json({ error: 'Order is already refunded' }, { status: 400 });
    }

    // Process Refund via Razorpay SDK (amounts are in paise)
    const refundAmountPaise = Math.round(order.totalAmount * 100);
    
    // Issue the refund
    const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: refundAmountPaise,
      notes: {
        orderId: order.orderId,
        store: 'Avanyaa Store',
      }
    });

    if (!refund || !refund.id) {
      throw new Error('Refund failed at the payment gateway level');
    }

    // Update DB
    order.isRefunded = true;
    order.razorpayRefundId = refund.id;
    
    // Optionally auto-cancel status if it isn't already a terminal state
    if (order.status !== 'cancelled' && order.status !== 'returned') {
      order.status = 'cancelled';
      order.cancellationReason = 'Refund issued by administrator.';
    }

    await order.save();

    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    console.error('Refund Error:', error);
    return NextResponse.json(
      { error: error?.error?.description || error.message || 'Failed to process refund' },
      { status: 500 }
    );
  }
}
