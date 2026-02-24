'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { ProductWithId } from '@/types';

export default function ProductCarousel({ products }: { products: ProductWithId[] }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const checkScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeft(scrollLeft > 0);
        setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [products]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = direction === 'left' ? -350 : 350;
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    if (products.length === 0) return null;

    return (
        <div className="relative group">
            {showLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 md:-ml-4 z-10 bg-background/90 hover:bg-background border shadow-lg backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center text-foreground transition-all duration-200"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}

            <div
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 px-2 -mx-2 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            >
                {products.map((product) => (
                    <div
                        key={product._id}
                        className="flex-none snap-start w-[65vw] sm:w-[45vw] md:w-[30vw] lg:w-[22vw]"
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>

            {showRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 md:-mr-4 z-10 bg-background/90 hover:bg-background border shadow-lg backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center text-foreground transition-all duration-200"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
