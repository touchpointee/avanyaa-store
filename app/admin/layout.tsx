'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, ShoppingBag, Loader2, Image, Layout, FolderOpen, Ruler } from 'lucide-react';
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
      <aside className="fixed left-0 top-0 z-30 h-screen w-64 shrink-0 border-r border-border bg-card shadow-sm">
        <div className="flex h-full flex-col">
          <div className="border-b border-border px-4 py-4">
            <h2 className="font-semibold text-lg">Admin Panel</h2>
            <p className="text-xs text-muted-foreground mt-0.5">AVANYAA</p>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <Button
              variant="ghost"
              className={cn('w-full justify-start', pathname === '/admin' && 'bg-primary/10 text-primary')}
              asChild
            >
              <Link href="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start', pathname?.startsWith('/admin/banners') && 'bg-primary/10 text-primary')}
              asChild
            >
              <Link href="/admin/banners">
                <Image className="mr-2 h-4 w-4" />
                Banners
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start', pathname?.startsWith('/admin/homepage') && 'bg-primary/10 text-primary')}
              asChild
            >
              <Link href="/admin/homepage">
                <Layout className="mr-2 h-4 w-4" />
                Homepage
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start', pathname?.startsWith('/admin/categories') && 'bg-primary/10 text-primary')}
              asChild
            >
              <Link href="/admin/categories">
                <FolderOpen className="mr-2 h-4 w-4" />
                Categories
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start', pathname?.startsWith('/admin/sizes') && 'bg-primary/10 text-primary')}
              asChild
            >
              <Link href="/admin/sizes">
                <Ruler className="mr-2 h-4 w-4" />
                Sizes
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start', pathname?.startsWith('/admin/products') && 'bg-primary/10 text-primary')}
              asChild
            >
              <Link href="/admin/products">
                <Package className="mr-2 h-4 w-4" />
                Products
              </Link>
            </Button>
            <Button
              variant="ghost"
              className={cn('w-full justify-start', pathname?.startsWith('/admin/orders') && 'bg-primary/10 text-primary')}
              asChild
            >
              <Link href="/admin/orders">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Orders
              </Link>
            </Button>
          </nav>
          <div className="border-t border-border p-3">
            <Button variant="outline" className="w-full justify-start" size="sm" asChild>
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
