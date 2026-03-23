import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Settings from '@/models/Settings';

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    await connectDB();

    let itemsTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
      }

      let availableStock = product.stock || 0;
      if (product.variants && product.variants.length > 0) {
        const variantIndex = product.variants.findIndex(
          (v: any) => v.size === item.size && v.color === item.color
        );
        availableStock = variantIndex > -1 ? product.variants[variantIndex].stock : 0;
      }

      if (availableStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name} (${item.size || ''} ${item.color || ''})` },
          { status: 400 }
        );
      }

      itemsTotal += product.price * item.quantity;
    }

    const settingsDoc = await Settings.findOne({ key: 'global' }).lean() as any;
    const shippingCharge = settingsDoc?.shippingCharge || 0;
    const freeShippingThreshold = settingsDoc?.freeShippingThreshold || 0;

    let appliedShippingFee = 0;
    if (itemsTotal > 0 && itemsTotal < freeShippingThreshold) {
      appliedShippingFee = shippingCharge;
    }

    const totalAmount = itemsTotal + appliedShippingFee;

    const options = {
      amount: totalAmount * 100, // amount in the smallest currency unit (paise)
      currency: 'INR',
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ id: order.id, amount: order.amount }, { status: 200 });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
