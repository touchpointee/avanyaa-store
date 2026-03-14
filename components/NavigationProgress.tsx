'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NavigationProgress
 * ─────────────────
 * Shows a thin top progress bar on every client-side route change.
 * Works purely with Next.js built-ins — no external packages needed.
 *
 * Strategy:
 *  1. On pathname/searchParams CHANGE → bar quickly sweeps to ~85 % (indeterminate phase)
 *  2. After a short delay we assume page is ready → sweep to 100 % and fade out
 */
export default function NavigationProgress() {
  const pathname  = usePathname();
  const searchParams = useSearchParams();
  const [width, setWidth]     = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef  = useRef<number | null>(null);
  const t1Ref   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2Ref   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (rafRef.current)  cancelAnimationFrame(rafRef.current);
    if (t1Ref.current)   clearTimeout(t1Ref.current);
    if (t2Ref.current)   clearTimeout(t2Ref.current);
  };

  useEffect(() => {
    clear();

    // Start: snap to 0, show bar, animate to ~85 %
    setWidth(0);
    setVisible(true);

    rafRef.current = requestAnimationFrame(() => {
      setWidth(85);

      // After 500 ms complete to 100 % and then hide
      t1Ref.current = setTimeout(() => {
        setWidth(100);
        t2Ref.current = setTimeout(() => {
          setVisible(false);
          setWidth(0);
        }, 350);
      }, 500);
    });

    return clear;
  }, [pathname, searchParams]);

  if (!visible && width === 0) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${width}%`,
          background: 'linear-gradient(90deg, hsl(212 51% 40%), hsl(212 51% 60%))',
          boxShadow: '0 0 8px 1px hsl(212 51% 55% / 0.6)',
          transition: width === 0
            ? 'none'
            : width < 100
              ? 'width 600ms cubic-bezier(0.1, 0.05, 0, 1)'
              : 'width 200ms ease-out, opacity 300ms ease 50ms',
          opacity: visible ? 1 : 0,
          borderRadius: '0 2px 2px 0',
        }}
      />
    </div>
  );
}
