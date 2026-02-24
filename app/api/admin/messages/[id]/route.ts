import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContactMessage from '@/models/ContactMessage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PATCH  /api/admin/messages/[id]  — update status
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();
    if (!['new', 'read', 'replied'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    const updated = await ContactMessage.findByIdAndUpdate(
        params.id,
        { status },
        { new: true }
    );

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
}
