import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { generateSlug } from '@/lib/utils';
import mongoose from 'mongoose';

// GET /api/products/[id] - Get single product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const product = await Product.findById(params.id).lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product (Admin only)
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
    const { name, description, price, compareAtPrice, category, categoryId, sizes, colors, images, variants, stock, featured, colorImages } = body;

    const existing = await Product.findById(params.id);

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update slug if name changed
    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = generateSlug(name);
      const duplicate = await Product.findOne({ slug, _id: { $ne: params.id } });
      if (duplicate) {
        return NextResponse.json(
          { error: 'Product with this name already exists' },
          { status: 400 }
        );
      }
    }

    const resolvedVariants = variants ?? existing.variants ?? [];
    // The Total stock is strictly the sum of all variant stocks
    const resolvedStock = resolvedVariants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);

    // Build update object with all fields explicitly
    const updateData: any = {
      slug,
      name,
      description,
      price,
      compareAtPrice: compareAtPrice ?? existing.compareAtPrice,
      category: category ?? existing.category,
      categoryId: categoryId || existing.categoryId,
      sizes: sizes ?? existing.sizes,
      colors: colors ?? existing.colors,
      images: images ?? existing.images,
      variants: resolvedVariants,
      stock: resolvedStock,
      featured: featured ?? existing.featured,
      colorImages: colorImages ?? existing.colorImages ?? [],
    };

    const updated = await Product.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product (Admin only)
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

    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
