import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';

const DEFAULT_ABOUT = {
  heroEyebrow: 'Our Story',
  heroHeadline: 'Dressing Women.\nCelebrating Confidence.',
  heroSubtext: 'AVANYAA was born from a simple belief — every woman deserves to feel beautiful, every day, in clothing made just for her.',
  stats: [
    { value: '5,000+', label: 'Happy Customers' },
    { value: '200+', label: 'Styles Available' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '7-Day', label: 'Easy Returns' },
  ],
  storyHeading: 'Where It All Began',
  storyParagraphs: [
    'AVANYAA started as a small boutique in Murukkumpuzha, Thiruvananthapuram — a dream nurtured by a passion for fashion that feels personal. We noticed a gap: beautiful, well-crafted ethnic and contemporary dresses that were actually affordable and accessible across India.',
    'So we set out to build that brand ourselves. From hand-picking fabrics to working closely with skilled craftspeople, every AVANYAA piece carries the care and attention of a small team that genuinely loves what it does.',
    'Today, we ship hundreds of orders every month — but our goal remains the same as day one: make a woman feel effortlessly confident the moment she puts on one of our pieces.',
  ],
  storyTagline: 'AVANYAA',
  storyLocation: 'Est. Murukkumpuzha, Thiruvananthapuram',
  valuesHeading: 'What We Stand For',
  valuesSubtext: 'Our values shape every decision — from which fabrics we source to how we handle returns.',
  values: [
    { icon: 'heart',    title: 'Made with Love',        desc: 'Every piece in our collection is thoughtfully curated with care for the woman who wears it.' },
    { icon: 'sparkles', title: 'Premium Quality',       desc: 'We work only with fabrics and finishes that meet our high standards — because you deserve the best.' },
    { icon: 'shield',   title: 'Trusted & Transparent', desc: 'Honest pricing, clear sizing, and a no-hassle return policy — we stand behind every order.' },
    { icon: 'leaf',     title: 'Mindful Fashion',       desc: 'We believe in thoughtful production — styles made to last, not just for a season.' },
  ],
  ctaHeading: 'Ready to Explore?',
  ctaSubtext: "Browse our latest collection or reach out — we'd love to help you find your perfect look.",
};

// GET /api/settings/about — public
export async function GET() {
  try {
    await connectDB();
    const doc = await Settings.findOne({ key: 'global' }).lean() as any;
    return NextResponse.json((doc as any)?.aboutPage ?? DEFAULT_ABOUT);
  } catch {
    return NextResponse.json(DEFAULT_ABOUT);
  }
}

// PUT /api/settings/about — admin only
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();
    const doc = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $set: { aboutPage: body } },
      { upsert: true, new: true }
    );
    return NextResponse.json(doc.aboutPage ?? body);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save' }, { status: 500 });
  }
}
