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
      <section className="relative min-h-[320px] md:min-h-[420px] bg-muted rounded-b-2xl md:rounded-b-3xl overflow-hidden">
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
    <section className="relative overflow-hidden rounded-b-2xl md:rounded-b-3xl bg-muted/30">
      {/* Fixed 3:1 aspect on all screen sizes so full hero banner is always visible */}
      <div className="relative w-full aspect-[3/1]">
        {heroBanners.map((banner, i) => (
          <div
            key={banner._id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === index ? 1 : 0, zIndex: i === index ? 1 : 0 }}
          >
            <div className="relative w-full h-full">
              <Image
                src={banner.image}
                alt={banner.title || 'Banner'}
                fill
                className="object-contain"
                priority={i === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl space-y-4">
                    {banner.title && (
                      <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold text-white drop-shadow-md tracking-tight">
                        {banner.title}
                      </h1>
                    )}
                    {banner.subtitle && (
                      <p className="text-base md:text-xl text-white/95 drop-shadow">{banner.subtitle}</p>
                    )}
                    {banner.buttonText && banner.link && (
                      <Button size="lg" className="mt-4 rounded-lg" asChild>
                        <Link href={banner.link}>{banner.buttonText}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Left / Right arrow overlays */}
      {heroBanners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={goPrev}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 md:w-14 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
          >
            <ChevronLeft className="h-7 w-7 text-white drop-shadow" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={goNext}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 md:w-14 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
          >
            <ChevronRight className="h-7 w-7 text-white drop-shadow" />
          </button>
        </>
      )}

      {/* Dots */}
      {heroBanners.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 z-10 flex justify-center gap-2">
          {heroBanners.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? 'w-5 bg-white' : 'w-1 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
