'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProductWithId } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, ShoppingCart, Loader2, Star, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import { isCustomerSession } from '@/lib/customerSession';
import ProductReviews from '@/components/ProductReviews';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [product, setProduct] = useState<ProductWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewStats, setReviewStats] = useState({ total: 0, avg: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleImageChange = (index: number) => {
    setSelectedImage(index);
    if (!product) return;
    const colorMap = (product.colorImages || []).find((ci) => ci.image === product.images[index]);
    if (colorMap?.color) {
      setSelectedColor(colorMap.color);
    }
  };

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight' && product)
        handleImageChange((selectedImage + 1) % product.images.length);
      if (e.key === 'ArrowLeft' && product)
        handleImageChange((selectedImage - 1 + product.images.length) % product.images.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, product, selectedImage]);

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
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
        if (data.colors && data.colors.length > 0) {
          const initialColor = data.colors[0];
          setSelectedColor(initialColor);
          // Auto-select the image mapped to the initial color
          const colorMap = (data.colorImages || []).find(
            (ci: { color: string; image: string }) => ci.color === initialColor
          );
          if (colorMap?.image) {
            const imgIndex = (data.images || []).indexOf(colorMap.image);
            if (imgIndex !== -1) setSelectedImage(imgIndex);
          }
        }

        // Fetch review stats
        try {
          const revRes = await fetch(`/api/reviews?productId=${data._id}`);
          if (revRes.ok) {
            const revData = await revRes.json();
            if (revData.stats) {
              setReviewStats(revData.stats);
            }
          }
        } catch {
          // ignore error, just don't show stats
        }
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

  const getVariantStock = () => {
    if (!product) return 0;
    if (product.variants && product.variants.length > 0) {
      if (product.sizes.length > 0 && !selectedSize) return 0;
      if (product.colors.length > 0 && !selectedColor) return 0;
      const variant = product.variants.find(
        (v) => (!v.size || v.size === selectedSize) && (!v.color || v.color === selectedColor)
      );
      return variant ? variant.stock : 0;
    }
    // If there are no variants or selections, stock is fundamentally the product's master stock
    return product.stock || 0;
  };

  const currentStock = getVariantStock();
  const selectedVariant = product?.variants?.find(
    (v) => (!v.size || v.size === selectedSize) && (!v.color || v.color === selectedColor)
  );

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayCompareAtPrice = selectedVariant?.compareAtPrice ?? product?.compareAtPrice;

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize && product.sizes.length > 0) {
      toast({
        title: 'Please select a size',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedColor && product.colors.length > 0) {
      toast({
        title: 'Please select a color',
        variant: 'destructive',
      });
      return;
    }

    if (currentStock === 0) {
      toast({
        title: 'Out of stock',
        variant: 'destructive',
      });
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: displayPrice,
      image: product.images[selectedImage] || product.images[0],
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      stock: currentStock,
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

  const discountPercent = displayCompareAtPrice
    ? Math.round(((displayCompareAtPrice - displayPrice) / displayCompareAtPrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
        {/* Images: main image + thumbnails */}
        <div className="flex flex-col lg:flex-row gap-4 w-full items-start">
          {/* Main image */}
          <div
            className="relative rounded-xl overflow-hidden bg-muted shadow border border-border group cursor-zoom-in w-full aspect-[4/5] lg:w-[480px] lg:h-[560px] lg:shrink-0"
            onClick={() => setLightboxOpen(true)}
            title="Click to enlarge"
          >
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
              priority
              sizes="(max-width: 768px) 100vw, 480px"
            />
            {discountPercent > 0 && (
              <Badge className="absolute top-2 left-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold">
                -{discountPercent}%
              </Badge>
            )}
            
            {/* Mobile Wishlist Button */}
            <button
              type="button"
              className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-border/50 text-foreground hover:bg-white transition-colors sm:hidden"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleWishlist();
              }}
              aria-label="Toggle wishlist"
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Zoom hint icon */}
            <div className="absolute bottom-2 right-2 bg-black/40 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ZoomIn className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div
              className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto pb-2 lg:pb-0"
              style={{
                maxHeight: '560px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'hsl(var(--border)) transparent',
              }}
            >
              {product.images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleImageChange(index)}
                  className={`relative w-20 h-20 lg:w-32 lg:h-32 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-primary ring-2 ring-primary/20 scale-105'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Image src={image} alt="" fill className="object-cover object-top" sizes="(max-width: 768px) 80px, 128px" />
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

          <div className="flex items-center gap-1.5 mt-1">
            {reviewStats.total > 0 ? (
              <>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold">{reviewStats.avg}</span>
                <span className="text-sm text-muted-foreground">({reviewStats.total} review{reviewStats.total !== 1 ? 's' : ''})</span>
              </>
            ) : (
              <>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm text-muted-foreground">No reviews yet</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold">{formatPrice(displayPrice)}</span>
            {displayCompareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(displayCompareAtPrice)}
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
                <Button
                  key={color}
                  variant={selectedColor === color ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-lg border-border"
                  onClick={() => {
                    setSelectedColor(color);
                    // Auto-switch to the mapped image for this color (if configured)
                    const colorMap = (product.colorImages || []).find((ci) => ci.color === color);
                    if (colorMap?.image) {
                      const imgIndex = product.images.indexOf(colorMap.image);
                      if (imgIndex !== -1) setSelectedImage(imgIndex);
                    }
                  }}
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>

          <div>
            {currentStock > 0 ? (
              <Badge variant="secondary" className="rounded-lg border-border">In Stock ({currentStock})</Badge>
            ) : (
              <Badge variant="destructive" className="rounded-lg">Out of Stock</Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full">
            <Button
              onClick={handleAddToCart}
              disabled={currentStock === 0}
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
              className="hidden sm:flex rounded-lg h-12 border-border"
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 transition-colors"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous arrow */}
          {product.images.length > 1 && (
            <button
              className="absolute left-3 md:left-6 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 transition-colors"
              onClick={(e) => { e.stopPropagation(); handleImageChange((selectedImage - 1 + product.images.length) % product.images.length); }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-[90vw] max-w-2xl h-[85vh] rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
            {/* Caption bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
              <p className="text-white text-sm font-medium">{product.name}</p>
              {product.images.length > 1 && (
                <p className="text-white/60 text-xs mt-0.5">{selectedImage + 1} / {product.images.length}</p>
              )}
            </div>
          </div>

          {/* Next arrow */}
          {product.images.length > 1 && (
            <button
              className="absolute right-3 md:right-6 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 transition-colors"
              onClick={(e) => { e.stopPropagation(); handleImageChange((selectedImage + 1) % product.images.length); }}
              aria-label="Next image"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}

          {/* Dot indicators */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); handleImageChange(idx); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === selectedImage ? 'bg-white scale-125' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Reviews */}
      <ProductReviews productId={product._id} />

      </div>
  );
}
