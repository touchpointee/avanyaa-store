import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import HomepageSection from '@/models/HomepageSection';
import { generateSlug } from '@/lib/utils';
import { getBigSizeNames } from '@/lib/sizes';

// GET /api/products - List products with pagination, filtering, and search
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Filters
    const category = searchParams.get('category');
    const categoryId = searchParams.get('categoryId');
    const sectionId = searchParams.get('sectionId');
    const tag = searchParams.get('tag'); // Add tag filtering
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const size = searchParams.get('size');
    const color = searchParams.get('color');
    const minDiscount = searchParams.get('minDiscount');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const bigSize = searchParams.get('bigSize');

    // Sort
    const sort = searchParams.get('sort') || 'newest';

    // Build query
    const query: any = {};

    if (sectionId) {
      const section = await HomepageSection.findById(sectionId);
      if (section && section.linkedProductIds && section.linkedProductIds.length > 0) {
        query._id = { $in: section.linkedProductIds };
      } else {
        query._id = { $in: [] }; // Return no products if section requested but empty
      }
    }

    if (tag) {
      const ProductTag = require('@/models/ProductTag').default;
      const tagDoc = await ProductTag.findOne({ tag: tag.toLowerCase() });
      if (tagDoc && tagDoc.productIds && tagDoc.productIds.length > 0) {
        const tagProductIds = tagDoc.productIds.map((id: any) => id.toString());
        if (query._id && query._id.$in) {
          // INTERSECT if another ID filter is already present (e.g. sectionId)
          query._id.$in = query._id.$in.filter((id: any) => tagProductIds.includes(id.toString()));
        } else {
          query._id = { $in: tagProductIds };
        }
      } else {
        query._id = { $in: [] }; // Return no products if tag requested but empty
      }
    }

    if (categoryId) {
      const ids = categoryId.split(',');
      if (ids.length === 1) query.categoryId = categoryId;
      else query.categoryId = { $in: ids };
    } else if (category) {
      const cats = category.split(',');
      if (cats.length === 1) query.category = category;
      else query.category = { $in: cats };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (size) {
      const sizes = size.split(',');
      if (sizes.length === 1) query.sizes = size;
      else query.sizes = { $in: sizes };
    }

    if (color) {
      const colors = color.split(',');
      if (colors.length === 1) query.colors = color;
      else query.colors = { $in: colors };
    }

    if (minDiscount) {
      const discountVal = parseFloat(minDiscount);
      query.$expr = {
        $gte: [
          {
            $multiply: [
              {
                $divide: [
                  { $subtract: [{ $ifNull: ["$compareAtPrice", "$price"] }, "$price"] },
                  { $ifNull: ["$compareAtPrice", 1] }
                ]
              },
              100
            ]
          },
          discountVal
        ]
      };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    // Big Size: products that have at least one of the backend-configured big sizes
    if (bigSize === 'true') {
      const bigSizes = await getBigSizeNames();
      query.sizes = { $in: bigSizes };
    }

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    let sortOption: any = { createdAt: -1 }; // default: newest

    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'name') {
      sortOption = { name: 1 };
    }

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create product (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { name, description, price, compareAtPrice, category, categoryId, sizes, colors, images, variants, stock, featured, colorImages } = body;

    // Generate slug
    const slug = generateSlug(name);

    // Check if slug exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this name already exists' },
        { status: 400 }
      );
    }

    const resolvedVariants = variants || [];
    const resolvedStock = resolvedVariants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      compareAtPrice,
      category: category || '',
      categoryId: categoryId || undefined,
      sizes,
      colors,
      images,
      variants: resolvedVariants,
      stock: resolvedStock,
      featured: featured || false,
      colorImages: colorImages || [],
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
