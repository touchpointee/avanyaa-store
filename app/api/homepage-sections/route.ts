import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import HomepageSection from '@/models/HomepageSection';

// GET - List sections (admin: all, public via /api/homepage)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const isAdmin = session && (session.user as any).role === 'admin';

    const query: any = {};
    if (!isAdmin) query.active = true;

    const sections = await HomepageSection.find(query)
      .sort({ order: 1 })
      .populate('linkedProductIds', 'name slug images price')
      .populate('categoryId', 'name slug image')
      .lean();

    return NextResponse.json(
      sections.map((s) => ({
        ...s,
        _id: s._id.toString(),
        linkedProductIds: (s.linkedProductIds || []).map((p: any) =>
          typeof p === 'object' ? { ...p, _id: p._id.toString() } : p
        ),
        categoryId: s.categoryId
          ? typeof s.categoryId === 'object' && s.categoryId !== null
            ? { ...(s.categoryId as any), _id: (s.categoryId as any)._id.toString() }
            : s.categoryId
          : null,
      }))
    );
  } catch (error) {
    console.error('Sections fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// POST - Create section (Admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    const body = await req.json();
    const { type, title, linkedProductIds, categoryId, order, active } = body;

    const section = await HomepageSection.create({
      type: type || 'trending',
      title: title || '',
      linkedProductIds: linkedProductIds || [],
      categoryId: categoryId || undefined,
      order: order ?? 0,
      active: active ?? true,
    });

    return NextResponse.json(
      { ...section.toObject(), _id: section._id.toString() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Section create error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create section' },
      { status: 500 }
    );
  }
}
