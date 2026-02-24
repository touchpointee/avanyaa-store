import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

async function getUser() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return null;
    await connectDB();
    return User.findById(userId);
}

/* GET /api/addresses */
export async function GET() {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        return NextResponse.json(user.addresses ?? []);
    } catch (err) {
        console.error('[GET /api/addresses]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

/* POST /api/addresses — save a new address */
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { label, fullName, phone, email, street, city, state, zipCode, country, isDefault } = body;

        if (!fullName || !phone || !street || !city || !state || !zipCode || !country) {
            return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
        }

        // If first address OR caller requests default → clear others, set this as default
        const makeDefault = !user.addresses?.length || !!isDefault;
        if (makeDefault) {
            user.addresses?.forEach((a: any) => { a.isDefault = false; });
        }

        user.addresses.push({
            label: label ?? 'Home',
            fullName,
            phone,
            email: email ?? '',
            street,
            city,
            state,
            zipCode,
            country,
            isDefault: makeDefault,
        });

        await user.save();

        const saved = user.addresses[user.addresses.length - 1];
        return NextResponse.json(saved, { status: 201 });
    } catch (err) {
        console.error('[POST /api/addresses]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

/* DELETE /api/addresses?id=xxx */
export async function DELETE(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const id = new URL(req.url).searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Address id required' }, { status: 400 });

        const before = user.addresses.length;
        user.addresses = user.addresses.filter((a: any) => a._id.toString() !== id);

        if (user.addresses.length === before) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        // Reassign default if needed
        if (user.addresses.length > 0 && !user.addresses.some((a: any) => a.isDefault)) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[DELETE /api/addresses]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
