import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const ids = url.searchParams.getAll('ids');

    if (!ids || ids.length === 0) {
      return NextResponse.json([]);
    }

    const products = await Product.find({ _id: { $in: ids } }, 'name images slug').lean();
    
    // Convert _id ObjectIds to strings before returning
    const formatted = products.map(p => ({
      ...p,
      _id: p._id.toString()
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Batch product fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products batch' },
      { status: 500 }
    );
  }
}
