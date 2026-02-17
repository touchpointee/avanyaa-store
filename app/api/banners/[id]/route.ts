import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Banner from '@/models/Banner';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    const body = await req.json();
    const banner = await Banner.findByIdAndUpdate(
      params.id,
      {
        ...(body.type && { type: body.type }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
        ...(body.buttonText !== undefined && { buttonText: body.buttonText }),
        ...(body.link !== undefined && { link: body.link }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId || null }),
      },
      { new: true }
    ).lean();

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }
    return NextResponse.json({ ...banner, _id: banner._id.toString() });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    const banner = await Banner.findByIdAndDelete(params.id);
    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Banner deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
