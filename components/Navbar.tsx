'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, Heart, Search, User, LogOut, ChevronDown, MapPin } from 'lucide-react';
import { isCustomerSession } from '@/lib/customerSession';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<{ _id: string; name: string; slug: string }[]>([]);
  const [countryOpen, setCountryOpen] = useState(false);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full min-w-0 overflow-x-hidden bg-white border-b border-border shadow-soft">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>
      {/* Main header row: logo | search (desktop) | icons */}
      <div className="container mx-auto w-full min-w-0 px-4">
        <div className="flex h-14 md:h-16 items-center justify-between gap-2 md:gap-4">
          {/* Logo (left) - never shrink */}
          <Link href="/" className="shrink-0 flex items-center min-w-0">
            <Image
              src="/logo.png"
              alt="Avanyaa - BY ANU"
              width={120}
              height={48}
              className="h-10 w-auto md:h-12 object-contain"
              priority
            />
          </Link>

          {/* Country/region (desktop only) */}
          <div className="hidden lg:flex relative shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-foreground hover:bg-muted"
              onClick={() => setCountryOpen(!countryOpen)}
            >
              <MapPin className="h-4 w-4" />
              India
              <ChevronDown className={cn('h-4 w-4', countryOpen && 'rotate-180')} />
            </Button>
            {countryOpen && (
              <>
                <div className="fixed inset-0 z-40" aria-hidden onClick={() => setCountryOpen(false)} />
                <div className="absolute top-full left-0 mt-1 w-40 rounded-lg border bg-white py-2 shadow-lg z-50">
                  <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-muted">
                    India
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Search (center, hidden on mobile - shown in row below) */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 min-w-0 max-w-xl mx-2 lg:mx-6">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search here..."
                className="pl-11 h-10 md:h-11 rounded-full border border-border bg-muted/30 focus:bg-white focus:border-primary/50 w-full min-w-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Right: wishlist, cart, profile - touch-friendly spacing on mobile */}
          <div className="flex items-center gap-1 sm:gap-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="/wishlist" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
            {isCustomerSession(session) ? (
              <>
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <Link href="/orders">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => signOut()}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: search bar full width below logo row */}
      <form onSubmit={handleSearch} className="md:hidden border-t border-border/50 px-4 pb-3 pt-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search here..."
            className="pl-10 h-10 rounded-full border border-border bg-muted/30 w-full min-w-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      {/* Primary navigation bar (horizontal links) - safe-area padding on mobile so items aren't clipped */}
      <nav className="border-t border-border bg-white w-full min-w-0">
        <div className="w-full min-w-0 overflow-x-auto scrollbar-hide -webkit-overflow-scrolling-touch">
          <div className="flex items-center gap-1 py-2 md:py-0 md:flex-wrap md:justify-center md:gap-0 min-w-max md:min-w-0 pl-4 pr-4 md:pl-0 md:pr-0 md:container md:mx-auto md:flex">
            <Link
              href="/products?sort=newest"
              className="shrink-0 px-3 py-3 min-h-[44px] md:min-h-0 md:py-2.5 flex items-center text-sm font-medium text-foreground hover:text-primary whitespace-nowrap touch-manipulation"
            >
              New Arrivals
            </Link>
            <Link
              href="/products"
              className="shrink-0 px-3 py-3 min-h-[44px] md:min-h-0 md:py-2.5 flex items-center text-sm font-medium text-foreground hover:text-primary whitespace-nowrap touch-manipulation"
            >
              Women
            </Link>
            <Link
              href="/products?bigSize=true"
              className="shrink-0 px-3 py-3 min-h-[44px] md:min-h-0 md:py-2.5 flex items-center text-sm font-medium text-foreground hover:text-primary whitespace-nowrap touch-manipulation"
            >
              Big Size
            </Link>
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat._id}
                href={`/products?categoryId=${cat._id}`}
                className="shrink-0 px-3 py-3 min-h-[44px] md:min-h-0 md:py-2.5 flex items-center text-sm font-medium text-foreground hover:text-primary whitespace-nowrap touch-manipulation"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/products?featured=true"
              className="shrink-0 px-3 py-3 min-h-[44px] md:min-h-0 md:py-2.5 flex items-center text-sm font-medium text-primary hover:underline whitespace-nowrap touch-manipulation"
            >
              Sale
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
