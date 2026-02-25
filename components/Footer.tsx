'use client';

import Link from 'next/link';
import Image from 'next/image';

const QUICK_LINKS = [
  { label: 'Shop All', href: '/products' },
  { label: 'About Us', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

const CUSTOMER_CARE = [
  { label: 'Shipping Policy', href: '/shipping-policy' },
  { label: 'Returns & Refunds', href: '/returns-refunds' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms' },
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-primary mb-2.5">{title}</h3>
      <ul className="space-y-1.5">{children}</ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      className="border-t border-border mt-auto w-full"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(212 45% 92%) 0%, hsl(212 25% 96%) 45%, hsl(40 20% 99%) 100%)' }}
      role="contentinfo"
    >
      <div className="container mx-auto px-4 py-7 md:py-9">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">

          {/* ── Col 1 : Brand ─────────────────────────────── */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Avanyaa"
                width={110}
                height={44}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
              Premium women's dresses crafted for elegance, comfort, and confidence.
            </p>
            {/* Social proof */}
            <div className="flex items-center gap-2 mt-1">
              {/* Avatar stack */}
              <div className="flex -space-x-2">
                {['F', 'A', 'R', 'S'].map((letter, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-semibold text-primary"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">Trusted by 5k+ customers</span>
            </div>
          </div>

          {/* ── Col 2 : Quick Links ───────────────────────── */}
          <div className="lg:pl-10">
            <FooterCol title="Quick Links">
              {QUICK_LINKS.map((l) => (
                <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
              ))}
            </FooterCol>
          </div>

          {/* ── Col 3 : Customer Care ─────────────────────── */}
          <FooterCol title="Customer Care">
            {CUSTOMER_CARE.map((l) => (
              <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
            ))}
          </FooterCol>

          {/* ── Col 4 : Get in Touch ──────────────────────── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold text-primary mb-2.5">Get in Touch</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:support@avanyaa.in" className="hover:text-foreground transition-colors">
                  support@avanyaa.in
                </a>
              </li>
              <li>
                <a href="tel:+919999999999" className="hover:text-foreground transition-colors">
                  +91-99999-99999
                </a>
              </li>
              <li className="leading-relaxed">
                Palakkad, Kerala — 678 001
              </li>
            </ul>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              {/* Instagram */}
              <a href="https://instagram.com/avanyaa" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <radialGradient id="ig-f" cx="30%" cy="107%" r="150%">
                      <stop offset="0%" stopColor="#fdf497" />
                      <stop offset="50%" stopColor="#fd5949" />
                      <stop offset="68%" stopColor="#d6249f" />
                      <stop offset="100%" stopColor="#285AEB" />
                    </radialGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-f)" />
                  <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://facebook.com/avanyaa" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="6" fill="#1877F2" />
                  <path d="M13.5 21v-7.5h2.5l.375-3H13.5V8.625c0-.863.422-1.625 1.75-1.625H16.5V4.28S15.345 4 14.258 4C11.5 4 9.75 5.75 9.75 8.375v2.125H7.5v3H9.75V21h3.75z" fill="white" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="6" fill="#25D366" />
                  <path d="M12 4.5C7.86 4.5 4.5 7.86 4.5 12c0 1.34.35 2.6.96 3.7L4.5 19.5l3.93-.94A7.46 7.46 0 0 0 12 19.5c4.14 0 7.5-3.36 7.5-7.5S16.14 4.5 12 4.5zm3.6 10.35c-.15.42-1.02.81-1.38.84-.36.03-.69.18-2.34-.48-1.98-.81-3.18-2.82-3.27-2.94-.09-.12-.72-.96-.72-1.83s.45-1.32.63-1.5c.18-.18.39-.21.51-.21h.36c.12 0 .27.03.42.33l.54 1.32c.15.36.03.54-.06.69l-.3.36c-.12.12-.24.27-.09.51.15.21.63.96 1.35 1.56.93.81 1.71 1.05 1.95 1.17.24.12.36.09.51-.06l.36-.42c.18-.21.33-.15.54-.06l1.32.63c.21.09.33.15.33.3v.57z" fill="white" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────── */}
      <div className="border-t border-border/60" style={{ background: 'hsl(212 35% 93%)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Avanyaa. All rights reserved.</p>
            <p>Made with ♥ in India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
