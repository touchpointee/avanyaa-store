import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, LayoutGrid } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="font-heading text-6xl md:text-8xl font-semibold text-primary/20 tracking-tight">404</h1>
      <h2 className="font-heading text-xl md:text-2xl font-semibold mt-4 tracking-tight">Page not found</h2>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Button className="rounded-lg gap-2" asChild>
          <Link href="/">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>
        <Button variant="outline" className="rounded-lg gap-2 border-border" asChild>
          <Link href="/products">
            <LayoutGrid className="h-4 w-4" />
            Shop
          </Link>
        </Button>
      </div>
    </div>
  );
}
