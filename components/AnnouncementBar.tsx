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
      .catch(() => {});
  }, []);

  if (!banner) return null;

  const text = [banner.title, banner.subtitle].filter(Boolean).join(' — ');
  const wrapperClass = 'w-full min-w-0 overflow-hidden bg-primary text-primary-foreground py-2.5 px-4 text-center text-sm font-medium';
  const content = (
    <span className="block max-w-full break-words px-1">
      {text}
      {banner.link && (banner.buttonText || 'Shop Now') && (
        <>
          {' '}
          <Link href={banner.link} className="underline font-semibold hover:opacity-90">
            {banner.buttonText || 'Shop Now'}
          </Link>
        </>
      )}
    </span>
  );
  if (banner.link && !banner.buttonText && text) {
    return (
      <Link href={banner.link} className={wrapperClass}>
        {content}
      </Link>
    );
  }
  return <div className={wrapperClass}>{content}</div>;
}
