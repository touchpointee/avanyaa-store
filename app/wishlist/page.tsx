'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { isCustomerSession } from '@/lib/customerSession';
import { useWishlistStore } from '@/store/wishlistStore';
import { ProductWithId } from '@/types';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';

export default function WishlistPage() {
  const { data: session } = useSession();
  const wishlistIds = useWishlistStore((state) => state.items);
  const setWishlistItems = useWishlistStore((state) => state.setItems);
  
  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, [session]);

  const fetchWishlist = async () => {
    setLoading(true);

    if (isCustomerSession(session)) {
      // Fetch from API if logged in as customer (admin is separate)
      try {
        const response = await fetch('/api/wishlist');
        if (response.ok) {
          const data = await response.json();
          const productIds = data.productIds.map((p: any) => p._id);
          setWishlistItems(productIds);
          setProducts(data.productIds);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      }
    } else {
      // Fetch products from localStorage IDs
      if (wishlistIds.length > 0) {
        try {
          const productPromises = wishlistIds.map((id) =>
            fetch(`/api/products/${id}`).then((r) => r.json())
          );
          const productsData = await Promise.all(productPromises);
          setProducts(productsData.filter((p) => p && !p.error));
        } catch (error) {
          console.error('Failed to fetch wishlist products:', error);
        }
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 pb-24 md:pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-border bg-card shadow">
              <div className="aspect-[4/5] bg-muted animate-pulse" />
              <div className="p-3 md:p-4 space-y-2">
                <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-20 pb-24 md:pb-20">
        <div className="text-center space-y-5 max-w-sm mx-auto">
          <div className="w-20 h-20 mx-auto rounded-xl bg-muted border border-border flex items-center justify-center">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Your wishlist is empty</h1>
          <p className="text-muted-foreground text-sm">
            Save your favorite items and move them to cart anytime
          </p>
          <Button className="rounded-lg w-full" size="lg" asChild>
            <Link href="/products">Shop now</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      <h1 className="font-heading text-2xl md:text-3xl font-semibold mb-2 tracking-tight">My Wishlist</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {products.length} {products.length === 1 ? 'item' : 'items'}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
