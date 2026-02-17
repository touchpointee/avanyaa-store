import connectDB from './db';
import Banner from '@/models/Banner';
import Category from '@/models/Category';
import HomepageSection from '@/models/HomepageSection';
import Product from '@/models/Product';
import { getBigSizeNames } from '@/lib/sizes';
import mongoose from 'mongoose';

export interface HomepageBanner {
  _id: string;
  type: string;
  image: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
  order: number;
}

export interface HomepageCategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  order: number;
}

export interface HomepageSectionData {
  _id: string;
  type: string;
  title: string;
  order: number;
  categoryId: string | null;
  products: Array<{
    _id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    category?: string;
  }>;
}

export async function getHomepageData(): Promise<{
  banners: HomepageBanner[];
  categories: HomepageCategory[];
  sections: HomepageSectionData[];
}> {
  await connectDB();

  const [banners, categories, sections] = await Promise.all([
    Banner.find({ active: true }).sort({ type: 1, order: 1 }).lean(),
    Category.find({ active: true }).sort({ order: 1 }).lean(),
    HomepageSection.find({ active: true }).sort({ order: 1 }).lean(),
  ]);

  const sectionProductIds = sections.flatMap((s) =>
    (s.linkedProductIds || []).map((id: mongoose.Types.ObjectId) => id.toString())
  );
  const uniqueIds = Array.from(new Set(sectionProductIds));
  const productIdList = uniqueIds.map((id) => new mongoose.Types.ObjectId(id));
  const productsMap: Record<string, any> = {};
  if (productIdList.length > 0) {
    const products = await Product.find({ _id: { $in: productIdList } }).lean();
    products.forEach((p) => {
      productsMap[p._id.toString()] = { ...p, _id: p._id.toString() };
    });
  }

  // Fetch big size products for sections with type 'big_size'
  let bigSizeProducts: any[] = [];
  const hasBigSizeSection = sections.some((s) => s.type === 'big_size');
  if (hasBigSizeSection) {
    const bigSizes = await getBigSizeNames();
    bigSizeProducts = await Product.find({ sizes: { $in: bigSizes } })
      .limit(12)
      .sort({ createdAt: -1 })
      .lean();
    bigSizeProducts = bigSizeProducts.map((p) => ({ ...p, _id: p._id.toString() }));
  }

  const sectionsWithProducts: HomepageSectionData[] = sections.map((s) => {
    if (s.type === 'big_size') {
      return {
        _id: s._id.toString(),
        type: s.type,
        title: s.title || 'Big Size',
        order: s.order,
        categoryId: null,
        products: bigSizeProducts,
      };
    }
    return {
      _id: s._id.toString(),
      type: s.type,
      title: s.title || '',
      order: s.order,
      categoryId: s.categoryId ? s.categoryId.toString() : null,
      products: (s.linkedProductIds || [])
        .map((id: any) => productsMap[id.toString()])
        .filter(Boolean),
    };
  });

  return {
    banners: banners.map((b) => ({
      _id: b._id.toString(),
      type: b.type,
      image: b.image,
      title: b.title,
      subtitle: b.subtitle,
      buttonText: b.buttonText,
      link: b.link,
      order: b.order,
    })),
    categories: categories.map((c) => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      image: c.image,
      order: c.order,
    })),
    sections: sectionsWithProducts,
  };
}
