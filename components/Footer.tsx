'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const HELP_LINKS = [
  { label: 'Contact', href: 'mailto:hello@avanyaa.com' },
  { label: 'Shipping & Delivery', href: '#' },
  { label: 'Returns & Exchanges', href: '#' },
];

const COMPANY_LINKS = [
  { label: 'About Us', href: '#' },
  { label: 'FAQ', href: '#' },
];

function FooterColumn({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">
        {title}
      </h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="border-t border-footer-border bg-footer mt-auto w-full" role="contentinfo">
      <div className="container mx-auto px-4 py-12 md:py-16 w-full">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-3 lg:grid-cols-5 w-full">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Avanyaa"
                width={100}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Premium dresses for every occasion.
            </p>
          </div>

          {/* Shop */}
          <FooterColumn title="Shop">
            <li>
              <Link
                href="/products?sort=newest"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:underline"
              >
                New Arrivals
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <Link
                  href={`/products?categoryId=${cat._id}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:underline"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/products?featured=true"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:underline"
              >
                Sale
              </Link>
            </li>
            <li>
              <Link
                href="/products?bigSize=true"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:underline"
              >
                Big Size
              </Link>
            </li>
          </FooterColumn>

          {/* Help */}
          <FooterColumn title="Help">
            {HELP_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          {/* Company */}
          <FooterColumn title="Company">
            {COMPANY_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          {/* Newsletter - takes 1 column on lg so grid is balanced */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">
              Stay in touch
            </h3>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-lg bg-background text-sm"
              />
              <Button type="submit" size="sm" className="w-full rounded-lg">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-footer-border bg-background/70">
        <div className="container mx-auto px-4 py-4 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Avanyaa. All rights reserved.</p>
            <p>India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
