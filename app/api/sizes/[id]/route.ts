import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Size from '@/models/Size';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const size = await Size.findById(params.id).lean();
    if (!size) {
      return NextResponse.json({ error: 'Size not found' }, { status: 404 });
    }
    return NextResponse.json({ ...size, _id: (size as any)._id.toString() });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch size' },
      { status: 500 }
    );
  }
}

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
    const { name, sortOrder, isBigSize } = body;

    const size = await Size.findById(params.id);
    if (!size) {
      return NextResponse.json({ error: 'Size not found' }, { status: 404 });
    }

    if (name !== undefined && name !== size.name) {
      const trimmed = (name as string).trim().toUpperCase();
      const existing = await Size.findOne({ name: trimmed, _id: { $ne: params.id } });
      if (existing) {
        return NextResponse.json(
          { error: 'A size with this name already exists' },
          { status: 400 }
        );
      }
      size.name = trimmed;
    }
    if (sortOrder !== undefined) size.sortOrder = sortOrder;
    if (isBigSize !== undefined) size.isBigSize = !!isBigSize;

    await size.save();

    return NextResponse.json({
      ...size.toObject(),
      _id: size._id.toString(),
    });
  } catch (error: any) {
    console.error('Size update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update size' },
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

    const size = await Size.findByIdAndDelete(params.id);
    if (!size) {
      return NextResponse.json({ error: 'Size not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Size delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete size' },
      { status: 500 }
    );
  }
}
