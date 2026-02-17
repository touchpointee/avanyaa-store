import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

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
    const [totalOrders, totalRevenue, totalProducts, recentOrders, ordersLast7Days] = await Promise.all([
      // Total orders count
      Order.countDocuments(),
      
      // Total revenue
      Order.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
          },
        },
      ]),
      
      // Total products count
      Product.countDocuments(),
      
      // Recent orders (last 10)
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      
      // Orders per day for last 7 days
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),
    ]);

    // Format the response
    const stats = {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProducts,
      recentOrders,
      ordersLast7Days: ordersLast7Days.map((item: any) => ({
        date: item._id,
        count: item.count,
      })),
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
