import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';

const DEFAULT_BADGES = [
  { icon: 'truck', label: 'Free Shipping', sub: 'On orders above ₹999' },
  { icon: 'rotateCCW', label: '7-Day Returns', sub: 'Hassle-free exchanges' },
  { icon: 'shieldCheck', label: 'Secure Payment', sub: 'COD & online accepted' },
  { icon: 'sparkles', label: 'Premium Quality', sub: 'Curated fabrics & style' },
];

const DEFAULT_MARQUEE = [
  '✨ Free Shipping on Orders Above ₹999',
  '🛡️ 7-Day Easy Returns',
  '💳 Cash on Delivery Available',
  '📦 Pan-India Delivery',
  '🌸 New Arrivals Every Week',
];

const DEFAULT_TESTIMONIALS = [
  { name: 'Priya M.', text: 'Absolutely love the quality! Fits perfectly and looks stunning.', stars: 5 },
  { name: 'Divya R.', text: 'Fast delivery and the packaging was beautiful. Will order again!', stars: 5 },
  { name: 'Ananya K.', text: 'The dress looked even better in person. Highly recommend AVANYAA!', stars: 5 },
  { name: 'Meera S.', text: 'Great customer service and the return process was so easy.', stars: 5 },
];

const DEFAULT_WHY_CARDS = [
  { icon: 'sparkles', title: 'Premium Quality', desc: 'Curated fabrics and finishes made to last, not just a season.' },
  { icon: 'truck', title: 'Fast Delivery', desc: 'Reliable pan-India shipping with real-time tracking.' },
  { icon: 'rotateCCW', title: 'Easy Returns', desc: '7-day no-questions-asked returns policy.' },
  { icon: 'shieldCheck', title: 'Cash on Delivery', desc: 'Pay only when your package arrives safely.' },
];

const DEFAULT_FAQ_CATEGORIES = [
  {
    category: 'Orders & Delivery',
    icon: 'truck',
    faqs: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 4–7 business days across India. Express delivery (2–3 days) is available in select metro cities at checkout.' },
      { q: 'How do I track my order?', a: "Once your order ships, you'll receive a tracking link via email and WhatsApp. You can also check order status under My Orders." },
      { q: 'Can I change or cancel my order?', a: 'Orders can be modified or cancelled within 12 hours of placement. After that, contact us immediately via WhatsApp.' },
      { q: 'Do you offer Cash on Delivery?', a: 'Yes, COD is available for orders across India. Additional handling charges may apply for certain pin codes.' },
    ],
  },
  {
    category: 'Returns & Exchanges',
    icon: 'rotateCCW',
    faqs: [
      { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery. Items must be unused, unwashed, and in original packaging with tags attached.' },
      { q: 'How do I initiate a return?', a: 'Contact us via WhatsApp or email with your order ID and reason. Our team will arrange a pickup from your address.' },
      { q: 'When will I get my refund?', a: 'Refunds are processed within 5–7 business days after we receive and inspect the returned item.' },
      { q: 'Are sale items returnable?', a: 'Sale items are eligible for exchange only — not refunds — unless the item is defective or damaged.' },
    ],
  },
  {
    category: 'Sizing & Products',
    icon: 'ruler',
    faqs: [
      { q: 'How do I find my size?', a: "Each product page has a size chart with bust, waist, and hip measurements. If you're between sizes, we recommend sizing up." },
      { q: 'Are the colours accurate?', a: 'We maintain colour accuracy as far as possible, but slight variations may occur due to screen settings and lighting.' },
      { q: 'Do you offer custom stitching?', a: "We don't currently offer custom stitching, but reach out via WhatsApp and we'll try our best to help." },
      { q: 'Are all products in stock?', a: 'Most products are in stock. If an item shows as unavailable, you can contact us to check restock timelines.' },
    ],
  },
  {
    category: 'Payments & Offers',
    icon: 'creditCard',
    faqs: [
      { q: 'What payment methods are accepted?', a: 'We currently accept Cash on Delivery (COD). Online payment options (UPI, cards) are coming soon.' },
      { q: 'How do I apply a discount code?', a: 'Enter your promo code at checkout. Only one code can be applied per order.' },
      { q: 'Do you have a loyalty programme?', a: "We're working on it! Subscribe to our newsletter to be the first to know when our rewards programme launches." },
      { q: 'Do you ship outside India?', a: 'Currently we ship within India only. International shipping is coming soon — stay tuned!' },
    ],
  },
];

// GET /api/settings — public
export async function GET() {
  try {
    await connectDB();
    const doc = await Settings.findOne({ key: 'global' }).lean() as any;
    return NextResponse.json({
      trustBadges: doc?.trustBadges?.length ? doc.trustBadges : DEFAULT_BADGES,
      marqueeMessages: doc?.marqueeMessages?.length ? doc.marqueeMessages : DEFAULT_MARQUEE,
       testimonials: doc?.testimonials?.length ? doc.testimonials : DEFAULT_TESTIMONIALS,
      whyCards: doc?.whyCards?.length ? doc.whyCards : DEFAULT_WHY_CARDS,
      faqCategories: doc?.faqCategories?.length ? doc.faqCategories : DEFAULT_FAQ_CATEGORIES,
      shippingCharge: doc?.shippingCharge || 0,
      freeShippingThreshold: doc?.freeShippingThreshold || 0,
    });
  } catch {
    return NextResponse.json({
      trustBadges: DEFAULT_BADGES,
      marqueeMessages: DEFAULT_MARQUEE,
      testimonials: DEFAULT_TESTIMONIALS,
      whyCards: DEFAULT_WHY_CARDS,
      faqCategories: DEFAULT_FAQ_CATEGORIES,
      shippingCharge: 0,
      freeShippingThreshold: 0,
    });
  }
}

// PUT /api/settings — admin only
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { trustBadges, marqueeMessages, testimonials, whyCards, faqCategories, shippingCharge, freeShippingThreshold } = body;

    const updateData: Record<string, any> = {};
    if (trustBadges !== undefined) updateData.trustBadges = trustBadges;
    if (marqueeMessages !== undefined) updateData.marqueeMessages = marqueeMessages;
    if (testimonials !== undefined) updateData.testimonials = testimonials;
    if (whyCards !== undefined) updateData.whyCards = whyCards;
    if (faqCategories !== undefined) updateData.faqCategories = faqCategories;
    if (shippingCharge !== undefined) updateData.shippingCharge = shippingCharge;
    if (freeShippingThreshold !== undefined) updateData.freeShippingThreshold = freeShippingThreshold;

    const doc = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $set: updateData },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      trustBadges: doc.trustBadges,
      marqueeMessages: doc.marqueeMessages,
      testimonials: doc.testimonials,
      whyCards: doc.whyCards,
      faqCategories: doc.faqCategories,
      shippingCharge: doc.shippingCharge,
      freeShippingThreshold: doc.freeShippingThreshold,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save' }, { status: 500 });
  }
}
