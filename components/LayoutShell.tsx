'use client';

import { usePathname } from 'next/navigation';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';

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
      <div className="print:hidden"><AnnouncementBar /></div>
      <div className="print:hidden"><Navbar /></div>
      <main id="main-content" className="flex-1 pb-24 md:pb-0 pt-10 md:pt-16 print:p-0 print:m-0" tabIndex={-1}>{children}</main>
      <div className="print:hidden"><Footer /></div>
      <div className="print:hidden"><BottomNav /></div>
    </>
  );
}
