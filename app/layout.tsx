import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/AuthProvider';
import LayoutShell from '@/components/LayoutShell';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AVANYAA - Premium Fashion Dresses',
  description: 'Discover elegant dresses for every occasion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-sans min-h-screen flex flex-col overflow-x-hidden">
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
