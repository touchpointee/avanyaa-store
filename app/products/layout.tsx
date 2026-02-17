import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Dresses | AVANYAA',
  description: 'Discover elegant dresses for every occasion. Shop casual, formal, party wear and big sizes.',
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
