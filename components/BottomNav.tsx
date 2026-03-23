'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LayoutGrid, Heart, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const items = [
  { href: '/', icon: Home, label: 'Home', protected: false },
  { href: '/products', icon: LayoutGrid, label: 'Categories', protected: false },
  { href: '/wishlist', icon: Heart, label: 'Wishlist', protected: false },
  { href: '/cart', icon: ShoppingCart, label: 'Cart', protected: false },
  { href: '/profile', icon: User, label: 'Profile', protected: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = !!session?.user;

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof items[number]) => {
    if (item.protected && !isLoggedIn) {
      e.preventDefault();
      router.push('/auth/signin');
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#F9F9F7] border-t border-border shadow-md safe-area-pb"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0), 8px)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const { href, icon: Icon, label } = item;
          const isCart = href === '/cart';
          const isWishlist = href === '/wishlist';

          // Show counts for everyone (guests can use cart and wishlist)
          const count = isCart ? totalItems : isWishlist ? wishlistCount : 0;

          const active = pathname === href || (href !== '/' && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleNav(e, item)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <span className="relative inline-flex">
                <Icon className="h-6 w-6" strokeWidth={active ? 2.2 : 1.8} />
                {mounted && count > 0 && (isCart || isWishlist) && (
                  <span className="absolute -top-1.5 -right-2.5 h-4 w-4 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium truncate w-full text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
