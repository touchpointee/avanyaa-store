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
      <div className="h-full flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:border-primary/20">
        {/* Image - compact fixed aspect (4/5), same on all cards */}
        <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-muted/50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
            className="absolute top-1.5 right-1.5 rounded-full bg-white/95 p-1.5 shadow-soft transition-transform hover:scale-110 active:scale-95"
          >
            <Heart
              className={`h-3.5 w-3.5 ${
                isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'
              }`}
            />
          </button>
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="absolute top-1.5 left-1.5 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-soft">
              -{discountPercent}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        {/* Content - compact padding, button at bottom */}
        <div className="flex flex-1 flex-col p-2.5 md:p-3">
          <h3 className="font-semibold text-xs md:text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.category && (
            <p className="mt-0.5 text-[10px] md:text-xs text-muted-foreground capitalize">{product.category}</p>
          )}
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="mt-auto w-full rounded-lg h-9 text-xs font-medium"
            size="sm"
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
}
