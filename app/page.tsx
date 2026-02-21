import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';
import { getHomepageData } from '@/lib/homepage';
import type { HomepageBanner, HomepageCategory, HomepageSectionData } from '@/lib/homepage';
import { ProductWithId } from '@/types';

function FeaturedCategories({ categories }: { categories: HomepageCategory[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="py-10 md:py-14 bg-muted/40">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-8 md:mb-10 text-foreground tracking-tight">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/products?categoryId=${cat._id}`}
              className="group block"
            >
              <div className="aspect-[3/4] rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20 shadow">
                {cat.image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-4">
                      <span className="font-semibold text-white drop-shadow text-sm text-center px-2">{cat.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full p-4 flex flex-col items-center justify-center gap-2 bg-muted">
                    <span className="font-semibold text-primary text-center text-sm">{cat.name}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSection({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: ProductWithId[];
  viewAllHref?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="py-10 md:py-14 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-foreground tracking-tight">{title}</h2>
          {viewAllHref && (
            <Button variant="outline" size="sm" className="rounded-lg w-fit shrink-0" asChild>
              <Link href={viewAllHref}>View All</Link>
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PromoBanner({ banners }: { banners: HomepageBanner[] }) {
  const promo = banners.filter((b) => b.type === 'promo');
  if (promo.length === 0) return null;
  const b = promo[0];
  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <Link href={b.link || '#'} className="block rounded-2xl overflow-hidden shadow-md">
          <div className="relative h-44 md:h-60 rounded-2xl overflow-hidden bg-muted">
            <Image src={b.image} alt={b.title || 'Promo'} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <div className="text-center text-white px-4">
                {b.title && <h3 className="font-heading text-xl md:text-2xl font-semibold">{b.title}</h3>}
                {b.subtitle && <p className="mt-1 text-sm md:text-base opacity-95">{b.subtitle}</p>}
                {b.buttonText && (
                  <Button className="mt-4 rounded-lg" variant="secondary" size="sm">
                    {b.buttonText}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

function DynamicSection({ section }: { section: HomepageSectionData }) {
  if (section.type === 'featured_categories') return null;
  if (section.type === 'promo') return null;
  const viewAllHref =
    section.type === 'big_size'
      ? '/products?bigSize=true'
      : section.categoryId
        ? `/products?categoryId=${section.categoryId}`
        : '/products';
  return (
    <ProductSection
      title={section.title || 'Shop'}
      products={section.products as ProductWithId[]}
      viewAllHref={viewAllHref}
    />
  );
}

export default async function HomePage() {
  const { banners, categories, sections } = await getHomepageData();

  const featuredCategoriesSection = sections.find((s) => s.type === 'featured_categories');
  const promoSection = sections.find((s) => s.type === 'promo');

  return (
    <div>
      <HeroCarousel banners={banners} />

      <FeaturedCategories categories={categories} />

      {sections
        .filter((s) => s.type !== 'featured_categories' && s.type !== 'promo')
        .map((section) => (
          <DynamicSection key={section._id} section={section} />
        ))}

      <PromoBanner banners={banners} />

      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-10 tracking-tight">Why Choose AVANYAA</h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10 max-w-4xl mx-auto">
            <div className="space-y-4 p-6 rounded-xl border border-border bg-card shadow">
              <div className="w-14 h-14 mx-auto rounded-xl bg-muted flex items-center justify-center">
                <span className="text-2xl" aria-hidden>✨</span>
              </div>
              <h3 className="font-semibold">Premium Quality</h3>
              <p className="text-sm text-muted-foreground">
                Carefully curated collection of high-quality fabrics and designs
              </p>
            </div>
            <div className="space-y-4 p-6 rounded-xl border border-border bg-card shadow">
              <div className="w-14 h-14 mx-auto rounded-xl bg-muted flex items-center justify-center">
                <span className="text-2xl" aria-hidden>🚚</span>
              </div>
              <h3 className="font-semibold">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Quick and reliable shipping to your doorstep
              </p>
            </div>
            <div className="space-y-4 p-6 rounded-xl border border-border bg-card shadow">
              <div className="w-14 h-14 mx-auto rounded-xl bg-muted flex items-center justify-center">
                <span className="text-2xl" aria-hidden>💳</span>
              </div>
              <h3 className="font-semibold">Cash on Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Pay when you receive your order — safe and convenient
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
