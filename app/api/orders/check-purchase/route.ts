import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ hasPurchased: false });
        }

        const productId = req.nextUrl.searchParams.get('productId');
        if (!productId) {
            return NextResponse.json({ error: 'productId is required' }, { status: 400 });
        }

        await connectDB();

        const userId = (session.user as any).id;

        // Find any valid order (not cancelled/returned) for this user that contains the product
        const order = await Order.findOne({
            userId,
            status: { $nin: ['cancelled', 'returned'] },
            'items.productId': productId,
        }).lean();

        return NextResponse.json({ hasPurchased: !!order });
    } catch (err) {
        console.error('[Check Purchase GET]', err);
        return NextResponse.json({ error: 'Failed to verify purchase' }, { status: 500 });
    }
}
