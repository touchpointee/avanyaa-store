import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { generateSlug } from '@/lib/utils';

// GET /api/categories - List categories (public: active only, admin: all)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const isAdmin = session && (session.user as any).role === 'admin';

    const query: any = {};
    if (!isAdmin) query.active = true;

    const categories = await Category.find(query).sort({ order: 1 }).lean();

    return NextResponse.json(
      categories.map((c) => ({ ...c, _id: c._id.toString() }))
    );
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create category (Admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    const body = await req.json();
    const { name, description, image, order, active } = body;
    const slug = generateSlug(name);

    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      order: order ?? 0,
      active: active ?? true,
    });

    return NextResponse.json(
      { ...category.toObject(), _id: category._id.toString() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Category create error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}
