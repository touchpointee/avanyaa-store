import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Banner from '@/models/Banner';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const session = await getServerSession(authOptions);
    const isAdmin = session && (session.user as any).role === 'admin';

    const query: Record<string, unknown> = {};
    if (!isAdmin) query.active = true;
    if (type) query.type = type;

    const banners = await Banner.find(query)
      .sort({ order: 1 })
      .populate('categoryId', 'name slug')
      .lean();

    return NextResponse.json(
      banners.map((b) => ({
        ...b,
        _id: b._id.toString(),
        categoryId: b.categoryId && typeof b.categoryId === 'object' && '_id' in b.categoryId
          ? (b.categoryId as { _id: unknown })._id?.toString?.()
          : b.categoryId != null ? String(b.categoryId) : null,
      }))
    );
  } catch (error) {
    console.error('Banners fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    const body = await req.json();
    const { type, image, title, subtitle, buttonText, link, active, order, categoryId } = body;

    const banner = await Banner.create({
      type: type || 'hero',
      image: image || '',
      title,
      subtitle,
      buttonText,
      link,
      active: active ?? true,
      order: order ?? 0,
      categoryId: categoryId || undefined,
    });

    return NextResponse.json(
      { ...banner.toObject(), _id: banner._id.toString() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Banner create error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create banner' },
      { status: 500 }
    );
  }
}
