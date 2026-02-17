import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';

// GET /api/wishlist - Get user's wishlist (customer only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((session.user as any).role === 'admin') {
      return NextResponse.json({ error: 'Admin session cannot use customer wishlist' }, { status: 401 });
    }

    await connectDB();

    const userId = (session.user as any).id;
    
    let wishlist = await Wishlist.findOne({ userId }).populate('productIds').lean();

    if (!wishlist) {
      await Wishlist.create({ userId, productIds: [] });
      wishlist = await Wishlist.findOne({ userId }).populate('productIds').lean();
    }

    return NextResponse.json(wishlist ?? { userId, productIds: [] });
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add product to wishlist (customer only)
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

    const { productId } = await req.json();
    const userId = (session.user as any).id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId,
        productIds: [productId],
      });
    } else {
      if (!wishlist.productIds.includes(productId)) {
        wishlist.productIds.push(productId);
        await wishlist.save();
      }
    }

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('productIds').lean();

    return NextResponse.json(populatedWishlist);
  } catch (error) {
    console.error('Wishlist add error:', error);
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Remove product from wishlist (customer only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((session.user as any).role === 'admin') {
      return NextResponse.json({ error: 'Admin session cannot use customer wishlist' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    const wishlist = await Wishlist.findOne({ userId });

    if (wishlist) {
      wishlist.productIds = wishlist.productIds.filter(
        (id) => id.toString() !== productId
      );
      await wishlist.save();
    }

    const populatedWishlist = await Wishlist.findOne({ userId }).populate('productIds').lean();

    return NextResponse.json(populatedWishlist || { userId, productIds: [] });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}
