import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Size from '@/models/Size';

const DEFAULT_SIZES = [
  { name: 'XS', sortOrder: 0, isBigSize: false },
  { name: 'S', sortOrder: 1, isBigSize: false },
  { name: 'M', sortOrder: 2, isBigSize: false },
  { name: 'L', sortOrder: 3, isBigSize: false },
  { name: 'XL', sortOrder: 4, isBigSize: true },
  { name: 'XXL', sortOrder: 5, isBigSize: true },
  { name: '2XL', sortOrder: 6, isBigSize: true },
  { name: '3XL', sortOrder: 7, isBigSize: true },
  { name: '4XL', sortOrder: 8, isBigSize: true },
];

// GET /api/sizes - List all sizes (public; used by filter + product form). Seeds defaults if empty.
export async function GET() {
  try {
    await connectDB();

    let sizes = await Size.find().sort({ sortOrder: 1 }).lean();

    if (sizes.length === 0) {
      await Size.insertMany(DEFAULT_SIZES);
      sizes = await Size.find().sort({ sortOrder: 1 }).lean();
    }

    return NextResponse.json(
      sizes.map((s) => ({ ...s, _id: (s as any)._id.toString() }))
    );
  } catch (error) {
    console.error('Sizes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sizes' },
      { status: 500 }
    );
  }
}

// POST /api/sizes - Create size (Admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    const body = await req.json();
    const { name, sortOrder, isBigSize } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Size name is required' },
        { status: 400 }
      );
    }

    const trimmed = name.trim().toUpperCase();
    const existing = await Size.findOne({ name: trimmed });
    if (existing) {
      return NextResponse.json(
        { error: 'A size with this name already exists' },
        { status: 400 }
      );
    }

    const size = await Size.create({
      name: trimmed,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 999,
      isBigSize: !!isBigSize,
    });

    return NextResponse.json(
      { ...size.toObject(), _id: size._id.toString() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Size create error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create size' },
      { status: 500 }
    );
  }
}
