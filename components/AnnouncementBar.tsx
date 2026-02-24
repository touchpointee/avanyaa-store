'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface PromoBanner {
  _id: string;
  title?: string;
  subtitle?: string;
  link?: string;
  buttonText?: string;
}

export default function AnnouncementBar() {
  const [banner, setBanner] = useState<PromoBanner | null>(null);

  useEffect(() => {
    fetch('/api/banners?type=promo')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0 && (list[0].title || list[0].subtitle)) {
          setBanner(list[0]);
        }
      })
      .catch(() => { });
  }, []);

  if (!banner) return null;

  const text = [banner.title, banner.subtitle].filter(Boolean).join(' — ');
  // Duplicate for seamless loop
  const repeated = Array.from({ length: 6 }, () => text);

  return (
    <div className="w-full overflow-hidden bg-primary text-primary-foreground py-2 select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        {repeated.map((msg, i) => (
          <span key={i} className="inline-flex items-center text-sm font-medium px-8 gap-3">
            {msg}
            {banner.link && (
              <Link
                href={banner.link}
                className="underline underline-offset-2 font-semibold hover:opacity-80 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {banner.buttonText || 'Shop Now'}
              </Link>
            )}
            <span className="opacity-30 mx-1">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
