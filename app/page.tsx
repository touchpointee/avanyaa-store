import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';
import CategoryCarousel from '@/components/CategoryCarousel';
import MarqueeBanner from '@/components/MarqueeBanner';
import { getHomepageData } from '@/lib/homepage';
import type { HomepageBanner, HomepageCategory, HomepageSectionData } from '@/lib/homepage';
import { ProductWithId } from '@/types';
import { Sparkles, Truck, RotateCcw, ShieldCheck, Star, ArrowRight } from 'lucide-react';
import AnimatedStat from '@/components/AnimatedStat';

/* ───── Trust strip ───── */
const ICON_MAP: Record<string, React.ElementType> = {
  truck: Truck,
  rotateCCW: RotateCcw,
  shieldCheck: ShieldCheck,
  sparkles: Sparkles,
  star: Star,
  heart: Star, // fallback
  package: Truck,
  zap: Sparkles,
};

const DEFAULT_TRUST = [
  { icon: 'truck', label: 'Free Shipping', sub: 'On orders above ₹999' },
  { icon: 'rotateCCW', label: '7-Day Returns', sub: 'Hassle-free exchanges' },
  { icon: 'shieldCheck', label: 'Secure Payment', sub: 'COD & online accepted' },
  { icon: 'sparkles', label: 'Premium Quality', sub: 'Curated fabrics & style' },
];

async function getTrustBadges() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/settings`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.trustBadges) && data.trustBadges.length) return data.trustBadges;
    }
  } catch {}
  return DEFAULT_TRUST;
}

async function TrustStrip() {
  const badges = await getTrustBadges();
  return (
    <section
      className="relative pt-8 pb-8 md:pt-12 md:pb-12 border-b border-border"
      style={{ background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)' }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map(({ icon, label, sub }: { icon: string; label: string; sub: string }) => {
            const Icon = ICON_MAP[icon] || Sparkles;
            return (
              <div
                key={label}
                className="group relative overflow-hidden bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl flex flex-col items-center text-center gap-4 px-4 py-8 md:py-10 hover:bg-white/80 hover:border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1"
              >
                {/* Subtle gradient glow inside card */}
                <div className="absolute -inset-2 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                
                <div className="relative w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <p className="text-[15px] font-semibold text-foreground tracking-tight mb-1">{label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px] mx-auto">{sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───── Reviews ───── */
const DEFAULT_REVIEWS = [
  { name: 'Priya M.', text: 'Absolutely love the quality! Fits perfectly and looks stunning.', stars: 5 },
  { name: 'Divya R.', text: 'Fast delivery and the packaging was beautiful. Will order again!', stars: 5 },
  { name: 'Ananya K.', text: 'The dress looked even better in person. Highly recommend AVANYAA!', stars: 5 },
  { name: 'Meera S.', text: 'Great customer service and the return process was so easy.', stars: 5 },
];

async function getTestimonials() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/settings`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.testimonials) && data.testimonials.length) return data.testimonials;
    }
  } catch {}
  return DEFAULT_REVIEWS;
}

/* ─── Creative category showcase ─── */
function CategoryShowcase({ categories }: { categories: HomepageCategory[] }) {
  if (categories.length === 0) return null;

  // Split: first 2 large, rest small
  const large = categories.slice(0, 2);
  const small = categories.slice(2);

  return (
    <section className="pt-6 md:pt-10 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="mb-10 md:mb-14 text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80 mb-3 font-medium">Collections</p>
          <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
            Shop by Category
          </h2>
        </div>

        {/* Large cards row */}
        {large.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
            {large.map((cat) => (
              <Link key={cat._id} href={`/products?categoryId=${cat._id}`} className="group block">
                <div className="relative aspect-[4/5] sm:aspect-[4/3] md:aspect-[3/2] rounded-[24px] overflow-hidden bg-muted shadow-sm">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                  {/* Dark overlay + label */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 p-8 md:p-10">
                    <p className="text-white/80 text-[10px] uppercase tracking-[0.3em] font-medium mb-2 opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">Category</p>
                    <h3 className="font-heading text-white text-3xl md:text-4xl font-semibold transform group-hover:-translate-y-1 transition-transform duration-500">{cat.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Small cards — always horizontal carousel */}
        {small.length > 0 && <CategoryCarousel categories={small} />}
      </div>
    </section>
  );
}

/* ─── Product showcase block ─── */
import ProductCarousel from '@/components/ProductCarousel';

function ProductShowcase({
  title, subtitle, products, viewAllHref, bg = 'bg-background'
}: {
  title: string; subtitle?: string; products: ProductWithId[];
  viewAllHref?: string; bg?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className={`pt-6 md:pt-10 ${bg}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            {subtitle && <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">{subtitle}</p>}
            <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
          </div>
          {viewAllHref && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-primary hidden sm:flex" asChild>
              <Link href={viewAllHref}>View all <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          )}
        </div>

        {/* viewAllHref passed so the end-card appears inside the carousel on mobile */}
        <ProductCarousel products={products} viewAllHref={viewAllHref} />
      </div>
    </section>
  );
}

/* ─── Full-bleed editorial promo ─── */
function EditorialBanner({ banners }: { banners: HomepageBanner[] }) {
  const promo = banners.filter((b) => b.type === 'promo');
  if (promo.length === 0) return null;
  const b = promo[0];
  return (
    <section className="relative overflow-hidden my-12 md:my-20">
      <div className="relative h-[60vh] md:h-[80vh] w-full">
        <Image src={b.image} alt={b.title || 'Promo'} fill className="object-cover" priority={false} />
        {/* Sleek Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6 md:px-16">
            <div className="max-w-xl">
              <p className="text-white/70 text-[11px] uppercase tracking-[0.4em] font-medium mb-5">Limited Time</p>
              {b.title && (
                <h2 className="font-heading text-4xl md:text-6xl font-semibold text-white leading-[1.1] tracking-tight mb-5">
                  {b.title}
                </h2>
              )}
              {b.subtitle && (
                <p className="text-white/80 text-sm md:text-lg mb-10 leading-relaxed font-light">{b.subtitle}</p>
              )}
              <Link
                href={b.link || '/products'}
                className="inline-flex items-center justify-center bg-white text-black text-[13px] uppercase tracking-[0.2em] font-semibold rounded-none px-10 py-5 hover:bg-black hover:text-white border border-transparent hover:border-white transition-all duration-400 group"
              >
                {b.buttonText || 'Shop the Collection'} 
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats band ─── */
function StatsBand() {
  return (
    <section className="bg-primary text-primary-foreground py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-14">
          {[
            { value: '5,000+', label: 'Happy Customers' },
            { value: '200+', label: 'Styles Available' },
            { value: '4.8★', label: 'Average Rating' },
            { value: '7-Day', label: 'Easy Returns' },
          ].map(({ value, label }) => (
            <AnimatedStat
              key={label}
              value={value}
              label={label}
              className="text-4xl md:text-5xl font-light tracking-tight"
              labelClassName="text-[11px] md:text-xs opacity-80 uppercase tracking-[0.2em] mt-3 font-medium"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Reviews ─── */
async function ReviewsStrip() {
  const reviews = await getTestimonials();
  return (
    <section className="pt-6 md:pt-10 bg-accent/20 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Testimonials</p>
          <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">What Our Customers Say</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((r: { name: string; text: string; stars: number }, i: number) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex gap-0.5">
                {Array.from({ length: r.stars }).map((_, s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">&ldquo;{r.text}&rdquo;</p>
              <p className="text-xs font-semibold">— {r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Why AVANYAA ─── */
const DEFAULT_WHY_CARDS = [
  { icon: 'sparkles', title: 'Premium Quality', desc: 'Curated fabrics and finishes made to last, not just a season.' },
  { icon: 'truck', title: 'Fast Delivery', desc: 'Reliable pan-India shipping with real-time tracking.' },
  { icon: 'rotateCCW', title: 'Easy Returns', desc: '7-day no-questions-asked returns policy.' },
  { icon: 'shieldCheck', title: 'Cash on Delivery', desc: 'Pay only when your package arrives safely.' },
];

const WHY_ICON_STYLES: Record<string, string> = {
  sparkles: 'text-violet-500 bg-violet-50',
  truck: 'text-blue-500 bg-blue-50',
  rotateCCW: 'text-rose-500 bg-rose-50',
  shieldCheck: 'text-emerald-500 bg-emerald-50',
  star: 'text-amber-500 bg-amber-50',
  heart: 'text-pink-500 bg-pink-50',
  package: 'text-orange-500 bg-orange-50',
  zap: 'text-yellow-500 bg-yellow-50',
};

async function getWhyCards() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/settings`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.whyCards) && data.whyCards.length) return data.whyCards;
    }
  } catch {}
  return DEFAULT_WHY_CARDS;
}

async function WhyUs() {
  const cards = await getWhyCards();
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.3em] font-medium text-muted-foreground/80 mb-3">Our Promise</p>
          <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight leading-tight">Why Choose AVANYAA</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {cards.map((card: { icon: string; title: string; desc: string }, i: number) => {
            const Icon = ICON_MAP[card.icon] || Sparkles;
            const color = WHY_ICON_STYLES[card.icon] || 'text-violet-500 bg-violet-50';
            return (
              <div key={i} className="group flex flex-col items-center text-center gap-5 p-8 rounded-[24px] border border-border/50 bg-card/50 shadow-sm hover:shadow-xl hover:bg-card transition-all duration-500 hover:-translate-y-2">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg tracking-tight mb-2.5">{card.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Newsletter CTA ─── */
function NewsletterCTA() {
  return (
    <section className="pt-6 md:pt-10 border-t border-border">
      <div className="container mx-auto px-4 text-center max-w-xl">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Stay Updated</p>
        <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-3">
          New Arrivals, Every Week
        </h2>
        <p className="text-sm text-muted-foreground mb-7">
          Be the first to know about new collections, exclusive offers, and style inspiration.
        </p>
        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="w-full h-11 rounded-full border border-border bg-card px-5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button className="w-full h-11 rounded-full bg-primary text-primary-foreground px-7 text-sm font-semibold hover:bg-primary/90 transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Dynamic section router ─── */
function DynamicSections({ sections }: { sections: HomepageSectionData[] }) {
  const dynamicSections = sections.filter(
    (s) => s.type !== 'featured_categories' && s.type !== 'promo'
  );

  const renderBlocks: React.ReactNode[] = [];
  let i = 0;

  while (i < dynamicSections.length) {
    const section = dynamicSections[i];

    // Handle full banner
    if (section.type === 'banner' && section.image) {
      const ImgContent = (
        <div className="relative w-full aspect-video md:aspect-[5/1] xl:aspect-[6/1]">
          <Image src={section.image} alt={section.title || 'Banner'} fill className="object-cover" />
        </div>
      );
      renderBlocks.push(
        <section key={section._id} className="w-full mt-5 mb-5">
          {section.link ? (
            <Link href={section.link} className="block w-full h-full group hover:opacity-95 transition-opacity">
              {ImgContent}
            </Link>
          ) : (
            ImgContent
          )}
        </section>
      );
      i++;
      continue;
    }

    // Single semi_banner pair side-by-side
    if (section.type === 'semi_banner' && section.image) {
      const images = [
        { id: `semi-1-${section._id}`, url: section.image, link: section.link },
        ...(section.image2 ? [{ id: `semi-2-${section._id}`, url: section.image2, link: section.link2 }] : [])
      ];

      renderBlocks.push(
        <section key={section._id} className="pt-10 md:pt-16">
          <div className="container mx-auto px-4">
            <div className={`grid grid-cols-1 ${images.length > 1 ? 'md:grid-cols-2' : ''} gap-4 md:gap-6`}>
              {images.map((img) => {
                const ImgContent = (
                  <div className={`relative w-full rounded-[24px] overflow-hidden shadow-sm ${images.length > 1 ? 'aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9]' : 'aspect-square sm:aspect-video md:aspect-[4/1]'}`}>
                    <Image src={img.url} alt={section.title || 'Semi Banner'} fill className="object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                );
                return img.link ? (
                  <Link key={img.id} href={img.link} className="block w-full h-full group hover:shadow-md transition-shadow duration-300 rounded-[24px]">
                    {ImgContent}
                  </Link>
                ) : (
                  <div key={img.id} className="w-full">{ImgContent}</div>
                );
              })}
            </div>
          </div>
        </section>
      );
      i++;
      continue;
    }

    // Other section types (product carousels)
    const viewAllHref =
      section.type === 'big_size'
        ? '/products?bigSize=true'
        : section.categoryId
          ? `/products?categoryId=${section.categoryId}`
          : '/products';
    const subtitle = i % 2 === 0 ? 'Collection' : 'Featured Picks';
    const bg = i % 2 === 1 ? 'bg-accent/20' : 'bg-muted/30';
    renderBlocks.push(
      <ProductShowcase
        key={section._id}
        title={section.title || 'Shop'}
        subtitle={subtitle}
        products={section.products as ProductWithId[]}
        viewAllHref={viewAllHref}
        bg={bg}
      />
    );
    i++;
  }

  return <>{renderBlocks}</>;
}

/* ═══════════════════ PAGE ═══════════════════ */
export default async function HomePage() {
  const { banners, categories, sections } = await getHomepageData();

  return (
    <div>
      {/* 1 — Scrolling trust marquee */}
      <MarqueeBanner />

      {/* 2 — Hero carousel */}
      <HeroCarousel banners={banners} />

      {/* 3 — Trust strip icons */}
      <TrustStrip />

      {/* 4 — Category showcase (large + small cards) */}
      <CategoryShowcase categories={categories} />

      {/* 5 — Dynamic product sections (horizontal scroll on mobile) */}
      <DynamicSections sections={sections} />

      {/* 6 — Full-bleed editorial promo banner */}
      <EditorialBanner banners={banners} />

      {/* 7 — Stats band */}
      <StatsBand />

      {/* 8 — Customer reviews */}
      <ReviewsStrip />

      {/* 9 — Why AVANYAA */}
      <WhyUs />

      {/* 10 — Newsletter CTA */}
      <NewsletterCTA />
    </div>
  );
}
