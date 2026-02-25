'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { ProductWithId } from '@/types';
import Link from 'next/link';

interface Props {
  products: ProductWithId[];
  viewAllHref?: string;   // if provided, a "View All" card is appended at the end
}

export default function ProductCarousel({ products, viewAllHref }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeft(scrollLeft > 4);
    setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const amount = scrollContainerRef.current.clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  const CARD = 'flex-none snap-start w-[52vw] sm:w-[40vw] md:w-[28vw] lg:w-[21vw] xl:w-[18vw]';

  return (
    <div className="relative">
      {/* ── Left arrow ── */}
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-background/95 hover:bg-background border border-border shadow-md backdrop-blur-sm w-9 h-9 rounded-full items-center justify-center text-foreground transition-all duration-200 hover:scale-105"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* ── Scroll track ── */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 md:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-hide snap-x snap-mandatory scroll-smooth"
      >
        {products.map((product) => (
          <div key={product._id} className={CARD}>
            <ProductCard product={product} />
          </div>
        ))}

        {/* ── "View All" end-card ── */}
        {viewAllHref && (
          <div className={`${CARD} flex`}>
            <Link
              href={viewAllHref}
              className="flex flex-col items-center justify-center gap-3 w-full h-full min-h-[18rem] rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 text-center px-4 group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary leading-tight">View All</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">See more styles</p>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* ── Right arrow ── */}
      {showRight && (
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-background/95 hover:bg-background border border-border shadow-md backdrop-blur-sm w-9 h-9 rounded-full items-center justify-center text-foreground transition-all duration-200 hover:scale-105"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
