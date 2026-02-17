'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle2, Loader2 } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      router.push('/');
    }
  }, [orderId, router]);

  if (!orderId) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-20 pb-24 md:pb-20">
      <Card className="max-w-2xl mx-auto rounded-2xl border-border shadow-soft overflow-hidden">
        <CardContent className="p-8 md:p-12 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-brand-light flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Order Placed Successfully!</h1>
            <p className="text-muted-foreground text-sm">
              Thank you for your order. We&apos;ll send you a confirmation email shortly.
            </p>
          </div>
          <div className="bg-primary/10 p-4 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
            <p className="text-lg font-mono font-bold">{orderId}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your order in <Link href="/orders" className="text-primary font-medium">My Orders</Link>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button className="rounded-xl w-full sm:w-auto" asChild>
              <Link href="/orders">View Orders</Link>
            </Button>
            <Button variant="outline" className="rounded-xl w-full sm:w-auto" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
