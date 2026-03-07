import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product'; // needed for populate

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Fetch all reviews, populate product details, sort by newest
        const reviews = await Review.find()
            .populate({
                path: 'productId',
                select: 'name images _id slug',
                model: Product,
            })
            .sort({ createdAt: -1 })
            .lean();

        // Standardize output
        const serialized = reviews.map((r: any) => ({
            _id: r._id.toString(),
            productId: r.productId?._id?.toString() || r.productId?.toString(),
            userId: r.userId.toString(),
            userName: r.userName,
            rating: r.rating,
            title: r.title,
            body: r.body,
            createdAt: r.createdAt,
            productName: r.productId?.name || 'Unknown Product',
            productImage: r.productId?.images?.[0] || '',
            productSlug: r.productId?.slug || '',
            isHidden: r.isHidden || false,
        }));

        return NextResponse.json({ reviews: serialized });
    } catch (err) {
        console.error('[Admin Reviews GET]', err);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, isHidden } = body;

        if (!id) {
            return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
        }

        await connectDB();

        const review = await Review.findByIdAndUpdate(
            id,
            { isHidden },
            { new: true }
        );

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, isHidden: review.isHidden });
    } catch (err) {
        console.error('[Admin Reviews PUT]', err);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}
