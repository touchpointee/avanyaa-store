'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, ShoppingBag, Loader2, Image as ImageIcon, Layout, FolderOpen, Ruler, MessageSquare, Star } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const SESSION_LOADING_TIMEOUT_MS = 2000;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isSignInPage = pathname === '/admin/signin';
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSignInPage) {
      if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
        router.replace('/admin');
      }
      return;
    }
    if (status === 'unauthenticated' || loadingTimedOut) {
      router.push('/admin/signin');
      return;
    }
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router, isSignInPage, loadingTimedOut]);

  // Fetch unread message count for sidebar badge
  useEffect(() => {
    if (status !== 'authenticated' || (session?.user as any)?.role !== 'admin') return;
    fetch('/api/admin/messages')
      .then((r) => r.ok ? r.json() : [])
      .then((msgs: { status: string }[]) =>
        setUnreadCount(msgs.filter((m) => m.status === 'new').length)
      )
      .catch(() => { });
  }, [status, session]);

  // If session stays "loading" too long (e.g. API/auth issue), show sign-in instead of infinite spinner
  useEffect(() => {
    if (isSignInPage || status !== 'loading') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setLoadingTimedOut(false);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      setLoadingTimedOut(true);
      timeoutRef.current = null;
    }, SESSION_LOADING_TIMEOUT_MS);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isSignInPage, status]);

  // Dedicated sign-in page: no header, no sidebar
  if (isSignInPage) {
    return <>{children}</>;
  }

  if (status === 'loading' && !loadingTimedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Checking sign-in…</p>
      </div>
    );
  }

  if (loadingTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Redirecting to sign in…
      </div>
    );
  }

  if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Fixed sidebar */}
      {/* Fixed sidebar */}
      <aside className="fixed left-0 top-0 z-30 h-screen w-64 shrink-0 border-none bg-[#265b9f] text-white shadow-xl flex flex-col">
        <div className="flex h-full flex-col">
          {/* Logo Header matches website logo background */}
          <div className="flex items-center justify-center bg-[#F9F9F7] h-16 md:h-[70px] shrink-0 border-b border-border shadow-sm px-4">
            <Link href="/admin" className="flex items-center gap-3 w-full justify-center">
              <Image
                src="/logo.png"
                alt="Avanyaa"
                width={130}
                height={46}
                className="h-10 w-auto object-contain"
                priority
              />
              <span className="font-semibold text-[1.1rem] text-foreground mt-0.5 whitespace-nowrap">Admin Panel</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 mt-2">
            <Button
              variant="ghost"
              className={cn('w-full justify-start text-blue-100 hover:text-white hover:bg-white/10 transition-colors', pathname === '/admin' && 'bg-white/20 text-white font-semibold')}
              asChild
            >
              <Link href="/admin">
                <LayoutDashboard className="mr-3 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start text-blue-100 hover:text-white hover:bg-white/10 transition-colors', pathname?.startsWith('/admin/banners') && 'bg-white/20 text-white font-semibold')}
              asChild
            >
              <Link href="/admin/banners">
                <ImageIcon className="mr-3 h-4 w-4" />
                Banners
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start text-blue-100 hover:text-white hover:bg-white/10 transition-colors', pathname?.startsWith('/admin/homepage') && 'bg-white/20 text-white font-semibold')}
              asChild
            >
              <Link href="/admin/homepage">
                <Layout className="mr-3 h-4 w-4" />
                Homepage
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start text-blue-100 hover:text-white hover:bg-white/10 transition-colors', pathname?.startsWith('/admin/categories') && 'bg-white/20 text-white font-semibold')}
              asChild
            >
              <Link href="/admin/categories">
                <FolderOpen className="mr-3 h-4 w-4" />
                Categories
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start text-blue-100 hover:text-white hover:bg-white/10 transition-colors', pathname?.startsWith('/admin/sizes') && 'bg-white/20 text-white font-semibold')}
              asChild
            >
              <Link href="/admin/sizes">
                <Ruler className="mr-3 h-4 w-4" />
                Sizes
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start text-blue-100 hover:text-white hover:bg-white/10 transition-colors', pathname?.startsWith('/admin/products') && 'bg-white/20 text-white font-semibold')}
              asChild
            >
              <Link href="/admin/products">
                <Package className="mr-3 h-4 w-4" />
                Products
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start text-blue-100 hover:text-white hover:bg-white/10 transition-colors', pathname?.startsWith('/admin/orders') && 'bg-white/20 text-white font-semibold')}
              asChild
            >
              <Link href="/admin/orders">
                <ShoppingBag className="mr-3 h-4 w-4" />
                Orders
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start text-blue-100 hover:text-white hover:bg-white/10 transition-colors', pathname?.startsWith('/admin/reviews') && 'bg-white/20 text-white font-semibold')}
              asChild
            >
              <Link href="/admin/reviews">
                <Star className="mr-3 h-4 w-4" />
                Reviews
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start text-blue-100 hover:text-white hover:bg-white/10 transition-colors', pathname?.startsWith('/admin/messages') && 'bg-white/20 text-white font-semibold')}
              asChild
            >
              <Link href="/admin/messages" className="flex items-center w-full">
                <div className="flex items-center flex-1">
                  <MessageSquare className="mr-3 h-4 w-4" />
                  <span>Messages</span>
                </div>
                {unreadCount > 0 && (
                  <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </Button>
          </nav>

          <div className="border-t border-white/10 p-4 shrink-0">
            <Button className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-0 transition-colors" size="sm" asChild>
              <Link href="/">Back to Store</Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content (offset by sidebar) */}
      <main className="flex-1 min-w-0 pl-64">
        <div className="border-b border-border bg-background px-6 py-4 sticky top-0 z-20">
          <h1 className="text-xl font-bold">Admin</h1>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
