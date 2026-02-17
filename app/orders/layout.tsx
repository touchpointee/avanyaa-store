import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders | AVANYAA',
  description: 'View and track your orders.',
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
