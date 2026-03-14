import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import InventoryHistory from '@/models/InventoryHistory';

// GET /api/admin/inventory/history - Get inventory adjustment history
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '100');

        const history = await InventoryHistory.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json(history);
    } catch (error) {
        console.error('Inventory history fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch inventory history' }, { status: 500 });
    }
}
