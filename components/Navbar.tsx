'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, Heart, User, LogOut, MapPin, Menu, X, Home, ShoppingBag, Info, Phone, HelpCircle, Package } from 'lucide-react';
import { isCustomerSession } from '@/lib/customerSession';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import SearchBox from '@/components/SearchBox';

const NAV_LINKS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Shop All', href: '/products', icon: ShoppingBag },
  { label: 'My Orders', href: '/orders', icon: Package },
  { label: 'About Us', href: '/about', icon: Info },
  { label: 'Contact', href: '/contact', icon: Phone },
  { label: 'FAQ', href: '/faq', icon: HelpCircle },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [locationError, setLocationError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';

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

  // Close menu on route change / resize to desktop
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed top-0 z-40 w-full min-w-0 overflow-x-hidden bg-card border-b border-border shadow-sm">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <div className="container mx-auto w-full min-w-0 px-4">
          <div className="flex h-14 md:h-16 items-center justify-between gap-2 md:gap-4">

            {/* ── Logo ─────────────────────────────────────── */}
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

            {/* ── Location (desktop only) ───────────────────── */}
            {mounted && (
              <span
                className="hidden lg:inline-flex items-center gap-1.5 text-sm text-muted-foreground shrink-0 max-w-[140px] truncate"
                title={locationError ? 'Location access denied' : location}
              >
                <MapPin
                  className={`h-4 w-4 shrink-0 ${!location ? 'animate-pulse' : ''}`}
                  aria-hidden
                />
                <span className="truncate">{location || 'Locating…'}</span>
              </span>
            )}

            {/* ── Search ── visible on all screen sizes inline */}
            <SearchBox className="flex-1 min-w-0 max-w-md mx-2 md:mx-4 lg:mx-6" />

            {/* ── Action icons ─────────────────────────────── */}
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Wishlist & Cart: hidden on mobile (bottom nav handles it) */}
              <Button variant="ghost" size="icon" className="rounded-lg hidden md:inline-flex" asChild>
                <Link href="/wishlist" className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-lg hidden md:inline-flex" asChild>
                <Link href="/cart" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </Button>
              {/* User & LogOut: desktop only — on mobile they live in the sidebar */}
              {isCustomerSession(session) ? (
                <>
                  <Button variant="ghost" size="icon" className="rounded-lg hidden md:inline-flex" asChild>
                    <Link href="/profile">
                      <User className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-lg hidden md:inline-flex" onClick={() => signOut()}>
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
                  <Button size="sm" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hidden md:inline-flex" asChild>
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

      </header>

      {/* ════════════════════════════════════════════════
          MOBILE DRAWER — visible on md:hidden screens
      ════════════════════════════════════════════════ */}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-card shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        aria-label="Navigation menu"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Image src="/logo.png" alt="Avanyaa" width={100} height={40} className="h-9 w-auto object-contain" />
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Mobile navigation">
          <ul className="space-y-1">
            {NAV_LINKS.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Drawer footer — auth */}
        <div className="border-t border-border px-4 py-4">
          {isCustomerSession(session) ? (
            <button
              onClick={() => { setMenuOpen(false); signOut(); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          ) : (
            <Link
              href="/auth/signin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
