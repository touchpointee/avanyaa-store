import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wishlist | AVANYAA',
  description: 'Your saved favorites. Move items to cart anytime.',
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
