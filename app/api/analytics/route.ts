import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import ContactMessage from '@/models/ContactMessage';

// GET /api/analytics - Get dashboard analytics (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Aggregate orders data
    const [totalOrders, totalRevenue, totalProducts, totalUsers, totalMessages, recentOrders, ordersLast7Days, products] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
      ContactMessage.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(10).lean(),
      Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Fetch all products to process stock solely based on variants
      Product.find({
        $or: [
          { variants: { $exists: false } },
          { variants: { $size: 0 } },
          { variants: { $elemMatch: { stock: { $lte: 5 } } } }
        ]
      }).select('name variants images').lean()
    ]);

    // Process products into granular variant alerts
    const outOfStockItems: any[] = [];
    const lowStockItems: any[] = [];

    products.forEach((p: any) => {
      // ONLY focus on new stock concept with variants
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v: any) => {
          const item = {
            _id: `${p._id}_${v.size}_${v.color}`,
            productId: p._id,
            name: `${p.name} (${v.size} / ${v.color})`,
            stock: v.stock || 0,
            images: p.images,
            isVariant: true
          };
          if ((v.stock || 0) <= 0) {
            outOfStockItems.push(item);
          } else if (v.stock > 0 && v.stock <= 5) {
            lowStockItems.push(item);
          }
        });
      } else {
        // No variants = ZERO stock under the new system
        const item = {
          _id: p._id.toString(),
          productId: p._id.toString(),
          name: p.name,
          stock: 0,
          images: p.images,
          isVariant: false
        };
        outOfStockItems.push(item);
      }
    });

    // Format the response
    const stats = {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProducts,
      totalUsers,
      totalMessages,
      recentOrders,
      ordersLast7Days: ordersLast7Days.map((item: any) => ({
        date: item._id,
        count: item.count,
      })),
      outOfStockProducts: outOfStockItems.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 100),
      lowStockProducts: lowStockItems.sort((a, b) => a.stock - b.stock).slice(0, 100),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
