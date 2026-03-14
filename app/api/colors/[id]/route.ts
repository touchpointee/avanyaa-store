import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Color from '@/models/Color';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const color = await Color.findById(params.id).lean();
    if (!color) return NextResponse.json({ error: 'Color not found' }, { status: 404 });
    return NextResponse.json({ ...color, _id: (color as any)._id.toString() });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch color' }, { status: 500 });
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
    const { name, hex, sortOrder } = body;

    const color = await Color.findById(params.id);
    if (!color) return NextResponse.json({ error: 'Color not found' }, { status: 404 });

    if (name !== undefined && name.trim() !== color.name) {
      const trimmed = name.trim();
      const existing = await Color.findOne({
        name: { $regex: new RegExp(`^${trimmed}$`, 'i') },
        _id: { $ne: params.id },
      });
      if (existing) {
        return NextResponse.json({ error: 'A color with this name already exists' }, { status: 400 });
      }
      color.name = trimmed;
    }
    if (hex !== undefined) color.hex = hex.trim();
    if (sortOrder !== undefined) color.sortOrder = sortOrder;

    await color.save();
    return NextResponse.json({ ...color.toObject(), _id: color._id.toString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update color' }, { status: 500 });
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

    const color = await Color.findByIdAndDelete(params.id);
    if (!color) return NextResponse.json({ error: 'Color not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete color' }, { status: 500 });
  }
}
