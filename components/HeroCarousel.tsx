'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HomepageBanner } from '@/lib/homepage';

interface HeroCarouselProps {
  banners: HomepageBanner[];
}

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);

  const heroBanners = banners.filter((b) => b.type === 'hero');

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(t);
  }, [heroBanners.length]);

  if (heroBanners.length === 0) {
    return (
      <section className="relative min-h-[320px] md:min-h-[420px] bg-muted overflow-hidden">
        <div className="container mx-auto px-4 h-full min-h-[320px] md:min-h-[420px] flex items-center">
          <div className="max-w-2xl space-y-5">
            <h1 className="font-heading text-4xl md:text-5xl font-semibold leading-tight text-foreground tracking-tight">
              Welcome to <span className="text-primary">AVANYAA</span>
            </h1>
            <p className="text-lg text-muted-foreground">Add hero banners from Admin → Banners.</p>
            <Button size="lg" className="rounded-lg" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const current = heroBanners[index];

  const goPrev = () => setIndex((i) => (i - 1 + heroBanners.length) % heroBanners.length);
  const goNext = () => setIndex((i) => (i + 1) % heroBanners.length);

  return (
    <section className="relative overflow-hidden bg-muted/30">
      {/* Taller on mobile so content + dots don't collide */}
      <div className="relative w-full aspect-[2/1] sm:aspect-[2.5/1] md:aspect-[3/1]">
        {heroBanners.map((banner, i) => (
          <div
            key={banner._id}
            className="absolute inset-0 transition-all duration-1000 ease-in-out"
            style={{ 
              opacity: i === index ? 1 : 0, 
              zIndex: i === index ? 1 : 0,
              transform: i === index ? 'scale(1)' : 'scale(1.05)',
            }}
          >
            <div className={`relative w-full h-full ${i === index ? 'animate-slow-pan' : ''}`}>
              <Image
                src={banner.image}
                alt={banner.title || 'Banner'}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6 md:px-12">
                  <div className="max-w-2xl space-y-5">
                    {banner.title && (
                      <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1]">
                        {banner.title}
                      </h1>
                    )}
                    {banner.subtitle && (
                      <p className="text-base sm:text-lg md:text-xl text-white/90 font-light tracking-wide max-w-xl">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.buttonText && banner.link && (
                      <div className="pt-4">
                        <Button size="lg" className="rounded-none px-8 py-6 text-sm uppercase tracking-[0.15em] font-medium bg-white text-black hover:bg-white/90 transition-colors" asChild>
                          <Link href={banner.link}>{banner.buttonText}</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Elegant Left / Right arrows */}
      {heroBanners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={goPrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all duration-300 group"
          >
            <ChevronLeft className="h-6 w-6 text-white group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={goNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all duration-300 group"
          >
            <ChevronRight className="h-6 w-6 text-white group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Modern pill indicators */}
      {heroBanners.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-2.5">
          {heroBanners.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`transition-all duration-500 rounded-full !min-h-0 ${i === index
                ? 'w-8 h-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
