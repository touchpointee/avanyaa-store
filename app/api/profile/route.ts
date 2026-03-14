import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

// GET /api/profile — return current user's profile (including mobile)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById((session.user as any).id).select('name email mobile').lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const result = {
      name: (user as any).name,
      email: (user as any).email,
      mobile: (user as any).mobile ?? '',
    };
    console.log('[Profile API] returning:', result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PATCH /api/profile — update name and/or mobile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role === 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, mobile } = await req.json();

    const update: Record<string, string> = {};
    if (name && name.trim()) update.name = name.trim();
    if (typeof mobile === 'string') update.mobile = mobile.trim();

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      (session.user as any).id,
      { $set: update },
      { new: true }
    ).lean();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      name: (user as any).name,
      email: (user as any).email,
      mobile: (user as any).mobile ?? '',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
