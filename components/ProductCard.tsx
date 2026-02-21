'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { ProductWithId } from '@/types';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) {
      toast({
        title: 'Out of stock',
        description: 'This product is currently out of stock',
        variant: 'destructive',
      });
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: product.sizes[0],
      stock: product.stock,
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

  const secondaryImage = product.images?.[1];

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div className="h-full flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        {/* Image - fixed aspect 4/5, secondary on hover if available */}
        <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-muted/50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt=""
              aria-hidden
              fill
              className="object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
          {/* Wishlist - top right */}
          <button
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
            className="absolute top-2 right-2 z-10 rounded-lg bg-card/95 p-2 shadow border border-border transition-transform hover:scale-105 active:scale-95"
          >
            <Heart
              className={`h-4 w-4 ${
                isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'
              }`}
            />
          </button>
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 rounded-md bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold shadow">
              -{discountPercent}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-lg bg-card px-3 py-1.5 text-sm font-medium border border-border">
                Out of Stock
              </span>
            </div>
          )}
          {/* Quick add on hover (desktop) */}
          {product.stock > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:block hidden">
              <Button
                onClick={handleAddToCart}
                className="w-full rounded-lg h-10 text-sm font-medium shadow"
                size="sm"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to bag
              </Button>
            </div>
          )}
        </div>
        {/* Content */}
        <div className="flex flex-1 flex-col p-3 md:p-4">
          <h3 className="font-heading font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors tracking-tight">
            {product.name}
          </h3>
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
            disabled={product.stock === 0}
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
