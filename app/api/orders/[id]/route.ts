import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

// GET /api/orders/[id] - Get single order
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const order = await Order.findById(params.id).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const userEmail = (session.user as any).email;

    const isOwner = order.userId?.toString() === userId || 
                   (order.address?.email && userEmail && order.address.email.toLowerCase() === userEmail.toLowerCase());

    if (role !== 'admin' && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT /api/orders/[id] - Update order status (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { status } = await req.json();

    if (!['placed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'return_requested'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const currentOrder = await Order.findById(params.id);
    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updates: any = { status };

    // When marking as delivered for the very first time, lock in the timestamp.
    if (status === 'delivered' && !currentOrder.deliveredAt) {
      updates.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      updates,
      { new: true }
    ).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// PATCH /api/orders/[id] - Cancel order (Customer only, only if placed/pending)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (role === 'admin') {
      return NextResponse.json({ error: 'Admins should use PUT' }, { status: 403 });
    }

    await connectDB();

    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId?.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['placed', 'pending'].includes(order.status)) {
      return NextResponse.json(
        { error: `Order cannot be cancelled (current status: ${order.status})` },
        { status: 400 }
      );
    }

    const body = await req.json();
    const cancellationReason = body.cancellationReason ?? '';

    const updated = await Order.findByIdAndUpdate(
      params.id,
      { status: 'cancelled', cancellationReason },
      { new: true }
    ).lean();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Order cancellation error:', error);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
