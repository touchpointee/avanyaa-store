import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Wishlist from '@/models/Wishlist';

// POST /api/wishlist/sync - Sync localStorage wishlist with DB after login
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((session.user as any).role === 'admin') {
      return NextResponse.json({ error: 'Admin session cannot use customer wishlist' }, { status: 401 });
    }

    await connectDB();

    const { productIds } = await req.json();
    const userId = (session.user as any).id;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId,
        productIds,
      });
    } else {
      // Merge with existing wishlist (avoid duplicates)
      const mergedIds = Array.from(new Set([...wishlist.productIds.map(id => id.toString()), ...productIds]));
      wishlist.productIds = mergedIds as any;
      await wishlist.save();
    }

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('productIds').lean();

    return NextResponse.json(populatedWishlist);
  } catch (error) {
    console.error('Wishlist sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync wishlist' },
      { status: 500 }
    );
  }
}
