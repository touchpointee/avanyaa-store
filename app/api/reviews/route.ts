import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

/* ── GET /api/reviews?productId=xxx ─────────────────────────── */
export async function GET(req: NextRequest) {
    try {
        const productId = req.nextUrl.searchParams.get('productId');
        if (!productId) {
            return NextResponse.json({ error: 'productId is required' }, { status: 400 });
        }

        await connectDB();

        const reviews = await Review.find({ productId, isHidden: { $ne: true } })
            .sort({ createdAt: -1 })
            .lean();

        const serialized = reviews.map((r) => ({
            ...r,
            _id: r._id.toString(),
            productId: r.productId.toString(),
            userId: r.userId.toString(),
        }));

        // Aggregate stats
        const total = serialized.length;
        const avg = total > 0
            ? Math.round((serialized.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
            : 0;
        const dist = [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: serialized.filter((r) => r.rating === star).length,
        }));

        return NextResponse.json({ reviews: serialized, stats: { total, avg, dist } });
    } catch (err) {
        console.error('[Reviews GET]', err);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

/* ── POST /api/reviews ───────────────────────────────────────── */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'user') {
            return NextResponse.json({ error: 'Sign in to submit a review' }, { status: 401 });
        }

        const { productId, rating, title, body } = await req.json();

        if (!productId || !rating || !title?.trim() || !body?.trim()) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }
        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        await connectDB();

        // Check product exists
        const product = await Product.findById(productId).lean();
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const userId = (session.user as any).id;
        const userName = session.user.name || 'Customer';

        // Check if user has purchased the product (not cancelled/returned)
        const hasPurchased = await Order.exists({
            userId,
            status: { $nin: ['cancelled', 'returned'] },
            'items.productId': productId,
        });

        if (!hasPurchased && (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Only verified purchasers can leave a review' }, { status: 403 });
        }

        // Upsert — one review per user per product
        const review = await Review.findOneAndUpdate(
            { productId, userId },
            { productId, userId, userName, rating, title: title.trim(), body: body.trim() },
            { upsert: true, new: true, runValidators: true }
        );

        return NextResponse.json(
            {
                ...review.toObject(),
                _id: review._id.toString(),
                productId: review.productId.toString(),
                userId: review.userId.toString(),
            },
            { status: 201 }
        );
    } catch (err: any) {
        console.error('[Reviews POST]', err);
        return NextResponse.json({ error: err.message || 'Failed to submit review' }, { status: 500 });
    }
}

/* ── DELETE /api/reviews?id=xxx ─────────────────────────────── */
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = req.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        await connectDB();

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        const review = await Review.findById(id);
        if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

        // Only owner or admin can delete
        if (review.userId.toString() !== userId && role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await review.deleteOne();
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[Reviews DELETE]', err);
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}
