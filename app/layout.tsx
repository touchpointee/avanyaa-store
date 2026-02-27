import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/AuthProvider';
import LayoutShell from '@/components/LayoutShell';
import SplashScreen from '@/components/SplashScreen';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
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
    <html lang="en" className={poppins.variable}>
      <body className="font-sans min-h-screen flex flex-col">
        <AuthProvider>
          <SplashScreen />
          {/* overflow-x-hidden must NOT be on body/html — it breaks position:sticky */}
          <div className="flex flex-col min-h-screen overflow-x-hidden">
            <LayoutShell>{children}</LayoutShell>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
