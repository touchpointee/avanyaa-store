'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { ProductWithId } from '@/types';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { isCustomerSession } from '@/lib/customerSession';

interface ProductCardProps {
  product: ProductWithId;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const addToCart = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product._id));
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reviewStats, setReviewStats] = useState<{ total: number; avg: number } | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const images = product.images ?? [];

  useEffect(() => {
    setMounted(true);

    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${product._id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setReviewStats(data.stats);
          } else {
            setReviewStats({ total: 0, avg: 0 });
          }
        } else {
          setReviewStats({ total: 0, avg: 0 });
        }
      } catch (err) {
        setReviewStats({ total: 0, avg: 0 });
      }
    };

    fetchReviews();
  }, [product._id]);

  // Auto-cycle images every 6 seconds — always running, no hover pause
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIdx((i) => (i + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length]);

  let computedStock = product.stock || 0;
  if (product.variants && product.variants.length > 0) {
    computedStock = product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }
  const isOutOfStock = computedStock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast({
        title: 'Out of stock',
        description: 'This product is currently out of stock',
        variant: 'destructive',
      });
      return;
    }

    let defaultSize = product.sizes?.[0];
    let defaultColor = product.colors?.[0];
    let addedStock = computedStock;

    if (product.variants && product.variants.length > 0) {
      const inStockVariant = product.variants.find(v => (Number(v.stock) || 0) > 0);
      if (inStockVariant) {
        defaultSize = inStockVariant.size;
        defaultColor = inStockVariant.color;
        addedStock = Number(inStockVariant.stock) || 0;
      } else {
        defaultSize = product.variants[0]?.size || defaultSize;
        defaultColor = product.variants[0]?.color || defaultColor;
        addedStock = 0;
      }
    } else {
      addedStock = product.stock || 0;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: defaultSize || undefined,
      color: defaultColor || undefined,
      stock: addedStock,
    });

    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlistLoading(true);

    // Toggle locally first for immediate feedback
    toggleWishlist(product._id);

    // If user is logged in as customer, sync with backend (admin is separate)
    if (isCustomerSession(session)) {
      try {
        if (!isInWishlist) {
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product._id }),
          });
        } else {
          await fetch(`/api/wishlist?productId=${product._id}`, {
            method: 'DELETE',
          });
        }
      } catch (error) {
        console.error('Wishlist sync error:', error);
        // Revert on error
        toggleWishlist(product._id);
      }
    }

    toast({
      title: isInWishlist ? 'Removed from wishlist' : 'Added to wishlist',
      description: isInWishlist
        ? `${product.name} has been removed from your wishlist`
        : `${product.name} has been added to your wishlist`,
    });

    setIsWishlistLoading(false);
  };

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div
        className="h-full flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      >
        {/* Image — auto-cycles every 6 s, crossfade */}
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted/50">
          {/* Crossfade image stack */}
          {images.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={i === 0 ? product.name : ''}
              aria-hidden={i !== activeImageIdx}
              fill
              className={`object-cover object-top absolute inset-0 transition-opacity duration-700 ${i === activeImageIdx ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={i === 0}
            />
          ))}

          {/* Dot indicators — always visible when multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveImageIdx(i); }}
                  className={`rounded-full transition-all duration-300 ${i === activeImageIdx ? 'bg-white w-4 h-1.5' : 'bg-white/50 w-1.5 h-1.5'}`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Wishlist - top right */}
          <button
            onClick={handleToggleWishlist}
            disabled={!mounted || isWishlistLoading}
            className="absolute top-2 right-2 z-10 rounded-lg bg-card/95 p-2 shadow border border-border transition-transform hover:scale-105 active:scale-95"
          >
            <Heart
              className={`h-4 w-4 ${mounted && isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`}
            />
          </button>
          {discountPercent > 0 && (
            <span
              className="absolute top-3 left-0 text-white text-xs font-bold px-3 pr-4 py-1 shadow-md leading-tight"
              style={{
                background: 'linear-gradient(135deg, hsl(212 51% 28%) 0%, hsl(212 51% 18%) 100%)',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)',
              }}
            >
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none">
              <span className="rounded-lg bg-card px-3 py-1.5 text-sm font-medium border border-border">
                Out of Stock
              </span>
            </div>
          )}
          {/* Quick add on hover (desktop) */}
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:block hidden z-30">
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full rounded-lg h-10 text-sm font-medium shadow disabled:opacity-50 disabled:cursor-not-allowed"
              size="sm"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to bag
            </Button>
          </div>
        </div>
        {/* Content */}
        <div className="flex flex-1 flex-col p-3 md:p-4">
          <h3 className="font-heading font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors tracking-tight">
            {product.name}
          </h3>

          {mounted && reviewStats && (
            <div className="mt-1 flex items-center gap-1">
              {reviewStats.total > 0 ? (
                <>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold">{reviewStats.avg}</span>
                  <span className="text-xs text-muted-foreground">({reviewStats.total})</span>
                </>
              ) : (
                <>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-muted-foreground">No reviews</span>
                </>
              )}
            </div>
          )}

          {product.category && (
            <p className="mt-1 text-xs text-muted-foreground capitalize">{product.category}</p>
          )}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="mt-auto w-full rounded-lg h-10 text-sm font-medium md:hidden"
            size="sm"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to bag
          </Button>
        </div>
      </div>
    </Link>
  );
}
