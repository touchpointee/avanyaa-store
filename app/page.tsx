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

/* ───── Trust strip ───── */
const TRUST = [
  { icon: Truck, label: 'Free Shipping', sub: 'On orders above ₹999', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { icon: RotateCcw, label: '7-Day Returns', sub: 'Hassle-free exchanges', iconBg: 'bg-rose-100', iconColor: 'text-rose-500' },
  { icon: ShieldCheck, label: 'Secure Payment', sub: 'COD & online accepted', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { icon: Sparkles, label: 'Premium Quality', sub: 'Curated fabrics & style', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
];

function TrustStrip() {
  return (
    <section
      className="relative py-6"
      style={{ background: 'linear-gradient(135deg, hsl(212 51% 20%) 0%, hsl(212 51% 28%) 100%)' }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {TRUST.map(({ icon: Icon, label, sub, iconBg, iconColor }) => (
            <div
              key={label}
              className="bg-white/10 border border-white/15 rounded-2xl flex items-center gap-3 px-4 py-4 hover:bg-white/15 transition-colors duration-200"
            >
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{label}</p>
                <p className="text-[11px] text-white/60 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Reviews ───── */
const REVIEWS = [
  { name: 'Priya M.', text: 'Absolutely love the quality! Fits perfectly and looks stunning.', stars: 5 },
  { name: 'Divya R.', text: 'Fast delivery and the packaging was beautiful. Will order again!', stars: 5 },
  { name: 'Ananya K.', text: 'The dress looked even better in person. Highly recommend AVANYAA!', stars: 5 },
  { name: 'Meera S.', text: 'Great customer service and the return process was so easy.', stars: 5 },
];


/* ─── Creative category showcase ─── */
function CategoryShowcase({ categories }: { categories: HomepageCategory[] }) {
  if (categories.length === 0) return null;

  // Split: first 2 large, rest small
  const large = categories.slice(0, 2);
  const small = categories.slice(2);

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Collections</p>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5 text-primary hidden sm:flex" asChild>
            <Link href="/products">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>

        {/* Large cards row */}
        {large.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {large.map((cat) => (
              <Link key={cat._id} href={`/products?categoryId=${cat._id}`} className="group block">
                <div className="relative aspect-[1.5/1] md:aspect-[2/1] rounded-2xl overflow-hidden bg-muted shadow-sm">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                  {/* Dark overlay + label */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Category</p>
                    <h3 className="font-heading text-white text-2xl font-semibold">{cat.name}</h3>
                    <span className="inline-flex items-center gap-1.5 mt-3 text-white text-xs font-medium border border-white/40 rounded-full px-3 py-1 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                      Shop Now <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Small cards — grid (≤6) or horizontal carousel (>6) */}
        {small.length > 0 && (() => {
          const cardInner = (cat: HomepageCategory) => (
            <div className="relative rounded-xl overflow-hidden bg-muted shadow-sm" style={{ aspectRatio: '3/4' }}>
              {cat.image ? (
                <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3">
                <p className="text-white/70 text-[10px] uppercase tracking-widest mb-0.5">Category</p>
                <h3 className="font-heading text-white text-sm font-semibold leading-tight">{cat.name}</h3>
                <span className="inline-flex items-center gap-1 mt-2 text-white text-[10px] font-medium border border-white/40 rounded-full px-2.5 py-0.5 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                  Shop Now <ArrowRight className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>
          );

          if (small.length > 6) {
            return <CategoryCarousel categories={small} />;
          }

          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {small.map((cat) => (
                <Link key={cat._id} href={`/products?categoryId=${cat._id}`} className="group block">
                  {cardInner(cat)}
                </Link>
              ))}
            </div>
          );
        })()}
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
    <section className={`py-14 md:py-18 ${bg}`}>
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

        <ProductCarousel products={products} />

        {viewAllHref && (
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild className="rounded-full px-8">
              <Link href={viewAllHref}>View All</Link>
            </Button>
          </div>
        )}
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
    <section className="relative overflow-hidden">
      <div className="relative h-[55vh] md:h-[70vh] w-full">
        <Image src={b.image} alt={b.title || 'Promo'} fill className="object-cover" priority={false} />
        {/* Left gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-8 md:px-16">
            <div className="max-w-lg">
              <p className="text-white/60 text-xs uppercase tracking-[0.3em] mb-4">Limited Time</p>
              {b.title && (
                <h2 className="font-heading text-3xl md:text-5xl font-semibold text-white leading-tight mb-4">
                  {b.title}
                </h2>
              )}
              {b.subtitle && (
                <p className="text-white/85 text-sm md:text-base mb-7 leading-relaxed">{b.subtitle}</p>
              )}
              <Link
                href={b.link || '/products'}
                className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold rounded-full px-7 py-3 hover:bg-primary hover:text-white transition-all duration-300"
              >
                {b.buttonText || 'Shop the Collection'} <ArrowRight className="h-4 w-4" />
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
    <section className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '5,000+', label: 'Happy Customers' },
            { value: '200+', label: 'Styles Available' },
            { value: '4.8★', label: 'Average Rating' },
            { value: '7-Day', label: 'Easy Returns' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-heading text-3xl md:text-4xl font-bold mb-1">{value}</p>
              <p className="text-sm opacity-70 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Reviews ─── */
function ReviewsStrip() {
  return (
    <section className="py-14 md:py-18 bg-accent/20 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Testimonials</p>
          <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">What Our Customers Say</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex gap-0.5">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
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
function WhyUs() {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Our Promise</p>
          <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">Why Choose AVANYAA</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Sparkles, color: 'text-violet-500 bg-violet-50', title: 'Premium Quality', desc: 'Curated fabrics and finishes made to last, not just a season.' },
            { icon: Truck, color: 'text-blue-500 bg-blue-50', title: 'Fast Delivery', desc: 'Reliable pan-India shipping with real-time tracking.' },
            { icon: RotateCcw, color: 'text-rose-500 bg-rose-50', title: 'Easy Returns', desc: '7-day no-questions-asked returns policy.' },
            { icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50', title: 'Cash on Delivery', desc: 'Pay only when your package arrives safely.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon className="h-[22px] w-[22px]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Newsletter CTA ─── */
function NewsletterCTA() {
  return (
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-4 text-center max-w-xl">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Stay Updated</p>
        <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-3">
          New Arrivals, Every Week
        </h2>
        <p className="text-sm text-muted-foreground mb-7">
          Be the first to know about new collections, exclusive offers, and style inspiration.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 h-11 rounded-full border border-border bg-card px-5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button className="h-11 rounded-full bg-primary text-primary-foreground px-7 text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Dynamic section router ─── */
function DynamicSection({ section, index }: { section: HomepageSectionData; index: number }) {
  if (section.type === 'featured_categories' || section.type === 'promo') return null;
  const viewAllHref =
    section.type === 'big_size'
      ? '/products?bigSize=true'
      : section.categoryId
        ? `/products?categoryId=${section.categoryId}`
        : '/products';
  const subtitle = index % 2 === 0 ? 'Collection' : 'Featured Picks';
  const bg = index % 2 === 1 ? 'bg-accent/20' : 'bg-muted/30';
  return (
    <ProductShowcase
      title={section.title || 'Shop'}
      subtitle={subtitle}
      products={section.products as ProductWithId[]}
      viewAllHref={viewAllHref}
      bg={bg}
    />
  );
}

/* ═══════════════════ PAGE ═══════════════════ */
export default async function HomePage() {
  const { banners, categories, sections } = await getHomepageData();
  const dynamicSections = sections.filter(
    (s) => s.type !== 'featured_categories' && s.type !== 'promo'
  );

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
      {dynamicSections.map((section, i) => (
        <DynamicSection key={section._id} section={section} index={i} />
      ))}

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
