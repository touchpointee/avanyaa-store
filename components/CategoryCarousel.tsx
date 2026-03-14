'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HomepageCategory } from '@/lib/homepage';

export default function CategoryCarousel({ categories }: { categories: HomepageCategory[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pausedRef = useRef(false);
    // Arrow clicks add a velocity burst here; rAF loop drains it gradually
    const velocityRef = useRef(0);

    // Triplicate so there's always content on both sides of the wrap point
    const displayCategories = [...categories, ...categories, ...categories];

    useEffect(() => {
        const el = containerRef.current;
        if (!el || categories.length === 0) return;

        // oneSetWidth = scroll distance of ONE copy of the category list
        const oneSetWidth = () => el.scrollWidth / 3;

        // Begin in the middle copy — allows wrapping in both directions
        el.scrollLeft = oneSetWidth();

        let pos = el.scrollLeft;
        let rafId: number;

        const wrap = (x: number) => {
            const w = oneSetWidth();
            if (x >= w * 2) return x - w;
            if (x < w)      return x + w;
            return x;
        };

        const tick = () => {
            if (!pausedRef.current) {
                // Base auto-scroll speed + any injected arrow velocity
                pos += 0.8 + velocityRef.current;

                // Decay arrow velocity so it eases out naturally
                velocityRef.current *= 0.92;
                if (Math.abs(velocityRef.current) < 0.05) velocityRef.current = 0;

                // Seamless wrap — single source of truth, no scrollBy anywhere
                pos = wrap(pos);
                el.scrollLeft = pos;
            }
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [categories]); // only re-runs when category list changes

    // Arrow clicks inject a burst of velocity — the loop handles the rest
    const nudge = (dir: 'left' | 'right') => {
        velocityRef.current += dir === 'right' ? 12 : -12;
    };

    if (categories.length === 0) return null;

    return (
        <div
            className="relative group -mx-4 md:mx-0 mt-10"
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
            onTouchStart={() => { pausedRef.current = true; }}
            onTouchEnd={() => { setTimeout(() => { pausedRef.current = false; }, 1000); }}
        >
            {/* Left arrow */}
            <button
                onClick={() => nudge('left')}
                className="absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 z-20 bg-background/90 hover:bg-background border shadow-lg backdrop-blur-sm w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-center justify-center text-foreground"
                aria-label="Scroll left"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* overflow-x-auto (so scrollLeft works) + scrollbar-hide + pointer-events clipping */}
            <div
                ref={containerRef}
                className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-4 pt-1 px-4 md:px-2"
                style={{ scrollBehavior: 'auto' }}          // no browser smooth-scroll interference
            >
                {displayCategories.map((cat, idx) => (
                    <Link
                        key={`${cat._id}-${idx}`}
                        href={`/products?categoryId=${cat._id}`}
                        className="group/card block flex-none"
                        style={{ width: 'clamp(200px, 45vw, 300px)' }}
                    >
                        <div
                            className="relative rounded-xl overflow-hidden bg-muted shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
                            style={{ aspectRatio: '3/4' }}
                        >
                            {cat.image ? (
                                <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-4 w-full">
                                <p className="text-white/70 text-[11px] uppercase tracking-widest mb-1">Category</p>
                                <h3 className="font-heading text-white text-base font-semibold leading-tight truncate">
                                    {cat.name}
                                </h3>
                                <span className="inline-flex items-center gap-1.5 mt-2.5 text-white text-xs font-medium border border-white/40 rounded-full px-3 py-1 group-hover/card:bg-white group-hover/card:text-black transition-colors duration-300">
                                    Shop Now <ArrowRight className="h-3 w-3" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Right arrow */}
            <button
                onClick={() => nudge('right')}
                className="absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 z-20 bg-background/90 hover:bg-background border shadow-lg backdrop-blur-sm w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-center justify-center text-foreground"
                aria-label="Scroll right"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}
