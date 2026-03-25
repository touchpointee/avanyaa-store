import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    await connectDB();

    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId?.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: `Return cannot be requested (current status: ${order.status})` },
        { status: 400 }
      );
    }

    // Fallback to updatedAt if older orders were marked delivered without the deliveredAt stamp
    const deliveryDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.updatedAt);

    // 10-day window calculation
    const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
    const timeSinceDelivery = Date.now() - deliveryDate.getTime();

    if (timeSinceDelivery > TEN_DAYS_MS) {
      return NextResponse.json(
        { error: 'The 10-day return window has closed for this order.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const returnReason = body.returnReason ?? 'No reason provided';

    const updated = await Order.findByIdAndUpdate(
      params.id,
      { 
        status: 'return_requested', 
        cancellationReason: `Return Request: ${returnReason}` // We reuse cancellationReason field for returns
      },
      { new: true }
    ).lean();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Order return error:', error);
    return NextResponse.json({ error: 'Failed to process return request' }, { status: 500 });
  }
}

// DELETE /api/orders/[id]/return - Cancel a return request
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    await connectDB();

    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId?.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (order.status !== 'return_requested') {
      return NextResponse.json(
        { error: `Return cannot be cancelled because the status is ${order.status}.` },
        { status: 400 }
      );
    }

    const updated = await Order.findByIdAndUpdate(
      params.id,
      { 
        status: 'delivered', 
        cancellationReason: '' 
      },
      { new: true }
    ).lean();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Order return cancellation error:', error);
    return NextResponse.json({ error: 'Failed to process return cancellation' }, { status: 500 });
  }
}
