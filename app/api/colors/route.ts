import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Color from '@/models/Color';

const DEFAULT_COLORS = [
  { name: 'Red', hex: '#EF4444', sortOrder: 0 },
  { name: 'Pink', hex: '#EC4899', sortOrder: 1 },
  { name: 'Orange', hex: '#F97316', sortOrder: 2 },
  { name: 'Yellow', hex: '#EAB308', sortOrder: 3 },
  { name: 'Green', hex: '#22C55E', sortOrder: 4 },
  { name: 'Blue', hex: '#3B82F6', sortOrder: 5 },
  { name: 'Purple', hex: '#A855F7', sortOrder: 6 },
  { name: 'White', hex: '#F9FAFB', sortOrder: 7 },
  { name: 'Black', hex: '#111827', sortOrder: 8 },
  { name: 'Beige', hex: '#D4B896', sortOrder: 9 },
  { name: 'Brown', hex: '#92400E', sortOrder: 10 },
  { name: 'Grey', hex: '#6B7280', sortOrder: 11 },
];

// GET /api/colors — public; seeds defaults if empty
export async function GET() {
  try {
    await connectDB();
    let colors = await Color.find().sort({ sortOrder: 1 }).lean();
    if (colors.length === 0) {
      await Color.insertMany(DEFAULT_COLORS);
      colors = await Color.find().sort({ sortOrder: 1 }).lean();
    }
    return NextResponse.json(colors.map(c => ({ ...c, _id: (c as any)._id.toString() })));
  } catch (error) {
    console.error('Colors fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 });
  }
}

// POST /api/colors — admin only
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    const body = await req.json();
    const { name, hex, sortOrder } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Color name is required' }, { status: 400 });
    }
    if (!hex?.trim()) {
      return NextResponse.json({ error: 'Hex color is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const existing = await Color.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    if (existing) {
      return NextResponse.json({ error: 'A color with this name already exists' }, { status: 400 });
    }

    const color = await Color.create({
      name: trimmedName,
      hex: hex.trim(),
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 999,
    });

    return NextResponse.json({ ...color.toObject(), _id: color._id.toString() }, { status: 201 });
  } catch (error: any) {
    console.error('Color create error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create color' }, { status: 500 });
  }
}
