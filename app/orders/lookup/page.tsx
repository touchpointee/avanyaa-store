'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, Search, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { OrderWithId } from '@/types';
import OrderTracker from '@/components/OrderTracker';

const STATUS_COLOR: Record<string, string> = {
  placed: 'bg-blue-500',
  packed: 'bg-indigo-500',
  shipped: 'bg-yellow-500',
  out_for_delivery: 'bg-orange-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
  returned: 'bg-gray-500',
};

export default function GuestOrderLookupPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderWithId[] | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !phone.trim()) {
      setError('Please enter both email and phone number.');
      return;
    }
    setLoading(true);
    setError('');
    setOrders(null);

    try {
      const res = await fetch(
        `/api/orders?email=${encodeURIComponent(email.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data: OrderWithId[] = await res.json();
      setOrders(data);
      if (data.length === 0) setError('No orders found for this email and phone number.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 pb-24 md:pb-10 max-w-2xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to store
      </Link>

      <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-1">Track Your Order</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Enter the email address and phone number you used at checkout to view your orders.
      </p>

      {/* Search form */}
      <Card className="rounded-xl border border-border shadow mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Find My Orders
          </CardTitle>
          <CardDescription>Use the details you provided during checkout</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lookup-email">Email Address *</Label>
              <Input
                id="lookup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lookup-phone">Phone Number *</Label>
              <Input
                id="lookup-phone"
                type="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="rounded-lg border-border"
              />
            </div>
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
            <Button type="submit" className="w-full rounded-lg" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching…</> : 'Find My Orders'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Have an account? */}
      <p className="text-center text-sm text-muted-foreground mb-8">
        Have an account?{' '}
        <Link href="/auth/signin?callbackUrl=/orders" className="text-primary font-medium hover:underline">
          Sign in to view all orders
        </Link>
      </p>

      {/* Results */}
      {orders !== null && orders.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-semibold">{orders.length} Order{orders.length !== 1 ? 's' : ''} Found</h2>
          {orders.map((order) => (
            <Card key={order._id} className="rounded-xl border border-border shadow overflow-hidden">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-heading text-base">Order #{order.orderId}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge className={`${STATUS_COLOR[order.status] ?? 'bg-gray-500'} rounded-lg`}>
                    {order.status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="relative w-14 h-18 rounded-lg overflow-hidden bg-muted shrink-0" style={{ height: 72 }}>
                        <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{item.productName}</p>
                        {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                      <p className="text-sm font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Tracker */}
                <OrderTracker
                  status={order.status as Parameters<typeof OrderTracker>[0]['status']}
                  createdAt={order.createdAt}
                  updatedAt={order.updatedAt}
                />

                <Separator />

                {/* Delivery + Total */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground text-xs uppercase tracking-wide mb-1">Delivering to</p>
                    <p>{order.address.fullName}</p>
                    <p>{order.address.street}, {order.address.city}, {order.address.state} – {order.address.zipCode}</p>
                    <p>Phone: {order.address.phone}</p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <div className="flex justify-between w-40 text-sm text-muted-foreground mb-1">
                      <span>Subtotal:</span>
                      <span>{formatPrice(order.totalAmount - (order.shippingFee || 0))}</span>
                    </div>
                    <div className="flex justify-between w-40 text-sm text-muted-foreground mb-3">
                      <span>Shipping:</span>
                      <span>{order.shippingFee ? formatPrice(order.shippingFee) : <span className="text-emerald-600 font-medium">Free</span>}</span>
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Total</p>
                    <p className="text-lg font-semibold text-primary">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
