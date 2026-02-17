'use client';

import { usePathname } from 'next/navigation';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

/**
 * For /admin (portal): no store header or bottom nav.
 * For other routes: show announcement bar + Navbar + main + BottomNav.
 */
export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith('/admin');

  if (isPortal) {
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" className="flex-1 pb-20 md:pb-0" tabIndex={-1}>{children}</main>
      <BottomNav />
    </>
  );
}
