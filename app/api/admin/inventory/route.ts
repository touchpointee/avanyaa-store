import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import InventoryHistory from '@/models/InventoryHistory';

// GET /api/admin/inventory - List all flattened product variants with stock
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';

        let query: any = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
            ];
        }

        const products = await Product.find(query).sort({ createdAt: -1 }).lean();

        // Flatten products into variants for the inventory table
        const inventoryItems: any[] = [];

        for (const product of products) {
            if (product.variants && product.variants.length > 0) {
                for (const variant of product.variants) {
                    inventoryItems.push({
                        productId: product._id.toString(),
                        productName: product.name,
                        image: product.images && product.images.length > 0 ? product.images[0] : null,
                        slug: product.slug,
                        variant: {
                            size: variant.size,
                            color: variant.color,
                        },
                        globalSizes: product.sizes || [],
                        globalColors: product.colors || [],
                        stock: variant.stock,
                        status: variant.stock === 0 ? 'Out of Stock' : (variant.stock <= 3 ? 'Low Stock' : 'In Stock')
                    });
                }
            } else {
                // Fallback for products without variants yet defined
                inventoryItems.push({
                    productId: product._id.toString(),
                    productName: product.name,
                    image: product.images && product.images.length > 0 ? product.images[0] : null,
                    slug: product.slug,
                    variant: null,
                    globalSizes: product.sizes || [],
                    globalColors: product.colors || [],
                    stock: 0,
                    status: 'Out of Stock'
                });
            }
        }

        return NextResponse.json(inventoryItems);
    } catch (error) {
        console.error('Inventory fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
    }
}

// PUT /api/admin/inventory - Update variant stock
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const { productId, size, color, newStock, reason, newSize, newColor } = body;

        if (!productId || newStock === undefined || newStock < 0 || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        let oldStock = 0;
        let changeAmount = 0;

        if (!size || !color) {
            return NextResponse.json({ error: 'Size and Color are required for stock updates' }, { status: 400 });
        }

        if (!product.variants || product.variants.length === 0) {
            return NextResponse.json({ error: 'Product has no variants' }, { status: 404 });
        }

        const variantIndex = product.variants.findIndex(
            (v: any) => v.size === size && v.color === color
        );

        if (variantIndex === -1) {
            return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
        }

        oldStock = product.variants[variantIndex].stock;
        changeAmount = newStock - oldStock;
        product.variants[variantIndex].stock = newStock;

        // Update size and color if provided (for renaming variants)
        if (newSize !== undefined) product.variants[variantIndex].size = newSize;
        if (newColor !== undefined) product.variants[variantIndex].color = newColor;

        // Always keep total stock = sum of all variant stocks
        product.stock = product.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);

        await product.save();

        // Log to history
        await InventoryHistory.create({
            productId: product._id,
            productName: product.name,
            variant: { size: size || 'Default', color: color || 'Default' },
            changeAmount,
            reason,
            referenceId: (session.user as any).id, // Admin user ID
        });

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error('Inventory update error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update inventory' },
            { status: 500 }
        );
    }
}

// POST /api/admin/inventory — Add a new variant to a product
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await connectDB();
        const { productId, size, color, stock } = await req.json();
        if (!productId || !size || !color || stock === undefined) {
            return NextResponse.json({ error: 'productId, size, color and stock are required' }, { status: 400 });
        }
        const product = await Product.findById(productId);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        const exists = (product.variants || []).some((v: any) => v.size === size && v.color === color);
        if (exists) return NextResponse.json({ error: 'Variant with this size and color already exists' }, { status: 400 });

        product.variants = [...(product.variants || []), { size, color, stock: Number(stock) || 0 }];
        product.stock = product.variants.reduce((s: number, v: any) => s + (Number(v.stock) || 0), 0);
        await product.save();

        await InventoryHistory.create({
            productId: product._id, productName: product.name,
            variant: { size, color }, changeAmount: Number(stock) || 0,
            reason: 'Variant Added', referenceId: (session.user as any).id,
        });
        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to add variant' }, { status: 500 });
    }
}

// DELETE /api/admin/inventory — Remove a variant from a product
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await connectDB();
        const { productId, size, color } = await req.json();
        if (!productId || !size || !color) {
            return NextResponse.json({ error: 'productId, size and color are required' }, { status: 400 });
        }
        const product = await Product.findById(productId);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        const before = (product.variants || []).length;
        product.variants = (product.variants || []).filter((v: any) => !(v.size === size && v.color === color));
        if (product.variants.length === before) return NextResponse.json({ error: 'Variant not found' }, { status: 404 });

        product.stock = product.variants.reduce((s: number, v: any) => s + (Number(v.stock) || 0), 0);
        await product.save();

        await InventoryHistory.create({
            productId: product._id, productName: product.name,
            variant: { size, color }, changeAmount: 0,
            reason: 'Variant Removed', referenceId: (session.user as any).id,
        });
        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to remove variant' }, { status: 500 });
    }
}
