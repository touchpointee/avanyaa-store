'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, Heart, Search, User, LogOut, MapPin } from 'lucide-react';
import { isCustomerSession } from '@/lib/customerSession';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<{ _id: string; name: string; slug: string }[]>([]);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';

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
    <header className="sticky top-0 z-40 w-full min-w-0 overflow-x-hidden bg-card border-b border-border shadow-sm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <div className="container mx-auto w-full min-w-0 px-4">
        <div className="flex h-14 md:h-16 items-center justify-between gap-2 md:gap-4">
          <Link href="/" className="shrink-0 flex items-center min-w-0">
            <Image
              src="/logo.png"
              alt="Avanyaa"
              width={120}
              height={48}
              className="h-10 w-auto md:h-12 object-contain"
              priority
            />
          </Link>

          <span className="hidden lg:inline-flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
            <MapPin className="h-4 w-4" aria-hidden />
            India
          </span>

          <form onSubmit={handleSearch} className="hidden md:block flex-1 min-w-0 max-w-md mx-4 lg:mx-6">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search dresses..."
                className="pl-11 h-10 rounded-lg border-border bg-muted/40 focus:bg-background focus:ring-2 focus:ring-primary/20 w-full min-w-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="rounded-lg" asChild>
              <Link href="/wishlist" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-lg" asChild>
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
                <Button variant="ghost" size="icon" className="rounded-lg" asChild>
                  <Link href="/orders">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => signOut()}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                {isAdmin && (
                  <Button variant="outline" size="sm" className="rounded-lg border-border hidden sm:inline-flex" asChild>
                    <Link href="/admin">Admin</Link>
                  </Button>
                )}
                <Button size="sm" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="md:hidden border-t border-border px-4 py-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search dresses..."
            className="pl-10 h-10 rounded-lg border-border bg-muted/40 w-full min-w-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      <nav className="border-t border-border bg-card w-full min-w-0" aria-label="Main">
        <div className="w-full min-w-0 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-0 min-w-max md:min-w-0 pl-4 pr-4 md:pl-0 md:pr-0 md:container md:mx-auto md:flex md:justify-center md:gap-1">
            <Link
              href="/products?sort=newest"
              className="shrink-0 px-4 py-3 min-h-[44px] md:py-2.5 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap touch-manipulation"
            >
              New Arrivals
            </Link>
            <Link
              href="/products"
              className="shrink-0 px-4 py-3 min-h-[44px] md:py-2.5 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap touch-manipulation"
            >
              Dresses
            </Link>
            <Link
              href="/products?bigSize=true"
              className="shrink-0 px-4 py-3 min-h-[44px] md:py-2.5 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap touch-manipulation"
            >
              Big Size
            </Link>
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat._id}
                href={`/products?categoryId=${cat._id}`}
                className="shrink-0 px-4 py-3 min-h-[44px] md:py-2.5 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap touch-manipulation"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/products?featured=true"
              className="shrink-0 px-4 py-3 min-h-[44px] md:py-2.5 flex items-center text-sm font-medium text-primary hover:underline whitespace-nowrap touch-manipulation"
            >
              Sale
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
