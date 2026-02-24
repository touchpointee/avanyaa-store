'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, Heart, User, LogOut, MapPin } from 'lucide-react';
import { isCustomerSession } from '@/lib/customerSession';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import NavLinks from '@/components/NavLinks';
import SearchBox from '@/components/SearchBox';

export default function Navbar() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [locationError, setLocationError] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string; slug: string }[]>([]);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => { });
  }, []);

  useEffect(() => {
    setMounted(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || 'India';
            setLocation(city);
          } catch {
            setLocation('India');
          }
        },
        () => {
          setLocationError(true);
          setLocation('India');
        }
      );
    } else {
      setLocation('India');
    }
  }, []);

  return (
    <header className="fixed top-0 z-40 w-full min-w-0 overflow-x-hidden bg-card border-b border-border shadow-sm">
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

          {mounted && (
            <span
              className="hidden lg:inline-flex items-center gap-1.5 text-sm text-muted-foreground shrink-0 max-w-[140px] truncate"
              title={locationError ? 'Location access denied' : location}
            >
              <MapPin
                className={`h-4 w-4 shrink-0 ${!location ? 'animate-pulse' : ''}`}
                aria-hidden
              />
              <span className="truncate">{location || 'Locating\u2026'}</span>
            </span>
          )}

          <SearchBox
            className="hidden md:block flex-1 min-w-0 max-w-md mx-4 lg:mx-6"
          />

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
                  <Link href="/profile">
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

      <div className="md:hidden border-t border-border px-4 py-3">
        <SearchBox isMobile />
      </div>

      <nav className="border-t border-border bg-card w-full min-w-0" aria-label="Main">
        <div className="w-full min-w-0 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-0 min-w-max md:min-w-0 pl-4 pr-4 md:pl-0 md:pr-0 md:container md:mx-auto md:flex md:justify-center md:gap-1">
            <NavLinks
              items={[
                { label: 'New Arrivals', href: '/products?sort=newest' },
                { label: 'Dresses', href: '/products' },
                { label: 'Big Size', href: '/products?bigSize=true' },
                ...categories.slice(0, 5).map((cat) => ({
                  label: cat.name,
                  href: `/products?categoryId=${cat._id}`,
                })),
                { label: 'Sale', href: '/products?featured=true' },
              ]}
            />
          </div>
        </div>
      </nav>
    </header >
  );
}
