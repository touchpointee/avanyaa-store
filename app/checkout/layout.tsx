import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | AVANYAA',
  description: 'Complete your order. Cash on Delivery available.',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
