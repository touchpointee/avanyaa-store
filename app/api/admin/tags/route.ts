import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import ProductTag from '@/models/ProductTag';

export async function GET() {
  try {
    await connectDB();
    const tags = await ProductTag.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(tags);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const { tag, productIds } = await req.json();
    
    if (!tag) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }
    
    const formattedTag = tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    const existing = await ProductTag.findOne({ tag: formattedTag });
    if (existing) {
      return NextResponse.json({ error: 'This tag name already exists' }, { status: 400 });
    }
    
    const newTag = await ProductTag.create({ tag: formattedTag, productIds: productIds || [] });
    return NextResponse.json(newTag, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
