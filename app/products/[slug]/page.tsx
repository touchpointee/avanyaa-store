'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProductWithId } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import { isCustomerSession } from '@/lib/customerSession';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<ProductWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  const addToCart = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) =>
    product ? state.isInWishlist(product._id) : false
  );

  useEffect(() => {
    fetchProduct();
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/slug/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setSelectedSize(data.sizes[0] || '');
      } else {
        toast({
          title: 'Product not found',
          variant: 'destructive',
        });
        router.push('/products');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      toast({
        title: 'Please select a size',
        variant: 'destructive',
      });
      return;
    }

    if (product.stock === 0) {
      toast({
        title: 'Out of stock',
        variant: 'destructive',
      });
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      stock: product.stock,
    });

    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    toggleWishlist(product._id);

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
        toggleWishlist(product._id);
      }
    }

    toast({
      title: isInWishlist ? 'Removed from wishlist' : 'Added to wishlist',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="aspect-[4/5] rounded-xl bg-muted animate-pulse border border-border" />
          <div className="space-y-5">
            <div className="h-6 w-32 rounded-lg bg-muted animate-pulse" />
            <div className="h-8 w-3/4 rounded-lg bg-muted animate-pulse" />
            <div className="h-10 w-1/2 rounded-lg bg-muted animate-pulse" />
            <div className="h-20 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 pb-28 md:pb-10">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
        {/* Images */}
        <div className="space-y-3 w-full max-w-md md:max-w-full">
          <div className="relative w-full aspect-[4/5] max-h-[400px] md:max-h-[420px] rounded-xl overflow-hidden bg-muted shadow border border-border">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover object-top"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {discountPercent > 0 && (
              <Badge className="absolute top-2 left-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold">
                -{discountPercent}%
              </Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  <Image src={image} alt="" fill className="object-cover object-top" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          {product.category && (
            <Badge variant="secondary" className="rounded-lg capitalize border-border">
              {product.category}
            </Badge>
          )}
          <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <Separator className="bg-border" />

          <div>
            <h3 className="font-heading font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Select Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-lg min-w-[44px] border-border"
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">Colors</h3>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <Badge key={color} variant="outline" className="rounded-lg border-border">
                  {color}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            {product.stock > 0 ? (
              <Badge variant="secondary" className="rounded-lg border-border">In Stock ({product.stock})</Badge>
            ) : (
              <Badge variant="destructive" className="rounded-lg">Out of Stock</Badge>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-3 pt-2">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 rounded-lg h-12"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to bag
            </Button>
            <Button
              onClick={handleToggleWishlist}
              variant="outline"
              size="lg"
              className="rounded-lg h-12 border-border"
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky bottom CTA - Mobile only */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 p-4 bg-card border-t border-border shadow-lg safe-area-pb">
        <div className="container mx-auto flex gap-3">
          <Button
            onClick={handleToggleWishlist}
            variant="outline"
            size="lg"
            className="rounded-lg shrink-0 h-12 px-4 border-border"
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 rounded-lg h-12 text-base font-semibold"
            size="lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to bag · {formatPrice(product.price)}
          </Button>
        </div>
      </div>
    </div>
  );
}
