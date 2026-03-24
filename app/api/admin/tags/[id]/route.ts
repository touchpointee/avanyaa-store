import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import ProductTag from '@/models/ProductTag';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const tag = await ProductTag.findById(params.id).lean();
    if (!tag) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(tag);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const { tag, productIds } = await req.json();
    
    let formattedTag = tag;
    if (formattedTag) {
      formattedTag = formattedTag.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      // check uniqueness
      const existing = await ProductTag.findOne({ tag: formattedTag, _id: { $ne: params.id } });
      if (existing) {
        return NextResponse.json({ error: 'This tag name already exists' }, { status: 400 });
      }
    }
    
    const updated = await ProductTag.findByIdAndUpdate(
      params.id,
      { 
        ...(formattedTag && { tag: formattedTag }), 
        ...(Array.isArray(productIds) && { productIds: productIds.map((id: string) => new mongoose.Types.ObjectId(id)) }) 
      },
      { new: true }
    );
    
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const deleted = await ProductTag.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
