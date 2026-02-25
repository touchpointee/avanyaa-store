'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HomepageCategory } from '@/lib/homepage';

export default function CategoryCarousel({ categories }: { categories: HomepageCategory[] }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // We triplicate the items to create a seamless infinite scroll effect loop
    const displayCategories = [...categories, ...categories, ...categories];
    const isManualScrolling = useRef(false);

    useEffect(() => {
        if (!scrollContainerRef.current || categories.length === 0) return;
        const container = scrollContainerRef.current;
        let animationFrameId: number;

        // Initially set scroll to the start of the middle set
        if (container.scrollLeft === 0) {
            container.scrollLeft = container.scrollWidth / 3;
        }

        const autoScroll = () => {
            if (!isHovered && !isManualScrolling.current) {
                container.scrollLeft += 1; // Animation speed

                // Infinite loop jump
                const oneSetWidth = container.scrollWidth / 3;
                if (container.scrollLeft >= oneSetWidth * 2) {
                    // Jump back to the start of the middle set without smooth scrolling
                    container.scrollLeft -= oneSetWidth;
                }
            }
            animationFrameId = requestAnimationFrame(autoScroll);
        };

        // If the user manually scrolls or swipes out of bounds, jump them back instantly
        const handleManualScrollLoop = () => {
            const oneSetWidth = container.scrollWidth / 3;
            if (container.scrollLeft <= 0) {
                container.scrollLeft += oneSetWidth;
            } else if (container.scrollLeft >= oneSetWidth * 2) {
                container.scrollLeft -= oneSetWidth;
            }
        };

        container.addEventListener('scroll', handleManualScrollLoop, { passive: true });
        animationFrameId = requestAnimationFrame(autoScroll);

        return () => {
            cancelAnimationFrame(animationFrameId);
            container.removeEventListener('scroll', handleManualScrollLoop);
        };
    }, [isHovered, categories]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        isManualScrolling.current = true;
        const scrollAmount = direction === 'left' ? -350 : 350;

        // Perform smooth scroll manually
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });

        // Resume auto-scroll after the smooth transition finishes
        setTimeout(() => {
            isManualScrolling.current = false;
        }, 500);
    };

    if (categories.length === 0) return null;

    return (
        <div
            className="relative group -mx-4 md:mx-0 mt-10"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
        >
            <button
                onClick={() => scroll('left')}
                className="absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 z-20 bg-background/90 hover:bg-background border shadow-lg backdrop-blur-sm w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-center justify-center text-foreground"
                aria-label="Scroll left"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <div
                ref={scrollContainerRef}
                className="flex gap-3 md:gap-4 overflow-x-auto pb-4 pt-1 px-4 md:px-2 scrollbar-hide snap-mandatory"
            >
                {displayCategories.map((cat, idx) => (
                    <Link
                        key={`${cat._id}-${idx}`}
                        href={`/products?categoryId=${cat._id}`}
                        className="group/card block flex-none snap-start"
                        style={{ width: 'clamp(140px, 40vw, 200px)' }}
                    >
                        <div className="relative rounded-xl overflow-hidden bg-muted shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md" style={{ aspectRatio: '3/4' }}>
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
                            <div className="absolute bottom-0 left-0 p-3 w-full">
                                <p className="text-white/70 text-[10px] uppercase tracking-widest mb-0.5">Category</p>
                                <h3 className="font-heading text-white text-sm font-semibold leading-tight truncate">{cat.name}</h3>
                                <span className="inline-flex items-center gap-1 mt-2 text-white text-[10px] font-medium border border-white/40 rounded-full px-2.5 py-0.5 group-hover/card:bg-white group-hover/card:text-black transition-colors duration-300">
                                    Shop Now <ArrowRight className="h-2.5 w-2.5" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <button
                onClick={() => scroll('right')}
                className="absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 z-20 bg-background/90 hover:bg-background border shadow-lg backdrop-blur-sm w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-center justify-center text-foreground"
                aria-label="Scroll right"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}
