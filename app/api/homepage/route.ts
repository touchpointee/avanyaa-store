import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Banner from '@/models/Banner';
import Category from '@/models/Category';
import HomepageSection from '@/models/HomepageSection';
import Product from '@/models/Product';

// GET /api/homepage - Public: all data for dynamic homepage (banners, sections, categories)
export async function GET() {
  try {
    await connectDB();

    const [banners, categories, sections] = await Promise.all([
      Banner.find({ active: true }).sort({ type: 1, order: 1 }).lean(),
      Category.find({ active: true }).sort({ order: 1 }).lean(),
      HomepageSection.find({ active: true }).sort({ order: 1 }).lean(),
    ]);

    // Resolve section product IDs
    const sectionProductIds = sections.flatMap((s) =>
      (s.linkedProductIds || []).map((id: any) => id.toString())
    );
    const uniqueIds = Array.from(new Set(sectionProductIds));
    const productsMap: Record<string, any> = {};
    if (uniqueIds.length > 0) {
      const products = await Product.find({ _id: { $in: uniqueIds } }).lean();
      products.forEach((p) => {
        productsMap[p._id.toString()] = { ...p, _id: p._id.toString() };
      });
    }

    const sectionsWithProducts = sections.map((s) => ({
      ...s,
      _id: s._id.toString(),
      type: s.type,
      title: s.title,
      order: s.order,
      categoryId: s.categoryId ? s.categoryId.toString() : null,
      linkedProductIds: (s.linkedProductIds || []).map((id: any) => id.toString()),
      products: (s.linkedProductIds || [])
        .map((id: any) => productsMap[id.toString()])
        .filter(Boolean),
    }));

    return NextResponse.json({
      banners: banners.map((b) => ({
        ...b,
        _id: b._id.toString(),
        categoryId: b.categoryId
          ? (b.categoryId as any)._id?.toString?.() || (b.categoryId as any).toString?.()
          : null,
      })),
      categories: categories.map((c) => ({ ...c, _id: c._id.toString() })),
      sections: sectionsWithProducts,
    });
  } catch (error) {
    console.error('Homepage data error:', error);
    return NextResponse.json(
      { error: 'Failed to load homepage data' },
      { status: 500 }
    );
  }
}
