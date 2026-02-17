import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cart | AVANYAA',
  description: 'Your shopping cart. Review items and proceed to checkout.',
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
