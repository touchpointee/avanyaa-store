'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { OrderWithId } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { Loader2, Package } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && (session?.user as { role?: string })?.role === 'admin') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, session, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-yellow-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 pb-24 md:pb-16">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl border border-border bg-card shadow animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-20 pb-24 md:pb-20">
        <div className="text-center space-y-5 max-w-sm mx-auto">
          <div className="w-20 h-20 mx-auto rounded-xl bg-muted border border-border flex items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">No orders yet</h1>
          <p className="text-muted-foreground text-sm">
            Start shopping to see your orders here
          </p>
          <Button className="rounded-lg w-full" size="lg" asChild>
            <Link href="/products">Shop now</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      <h1 className="font-heading text-2xl md:text-3xl font-semibold mb-6 tracking-tight">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id} className="rounded-xl border border-border shadow overflow-hidden">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-heading text-lg">Order #{order.orderId}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Badge className={`${getStatusColor(order.status)} rounded-lg`}>
                  {order.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base line-clamp-2">{item.productName}</p>
                      {item.size && (
                        <p className="text-sm text-muted-foreground">
                          Size: {item.size}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm sm:text-base">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-border" />

              {/* Delivery Address */}
              <div>
                <h4 className="font-heading font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">Delivery Address</h4>
                <p className="text-sm text-muted-foreground">
                  {order.address.fullName}<br />
                  {order.address.street}<br />
                  {order.address.city}, {order.address.state} {order.address.zipCode}<br />
                  Phone: {order.address.phone}
                </p>
              </div>

              <Separator className="bg-border" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="text-xl font-semibold">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
