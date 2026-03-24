'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { OrderWithId } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { Loader2, Package, X, AlertTriangle, Star, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import OrderStatusPopup from '@/components/OrderStatusPopup';
import OrderTracker from '@/components/OrderTracker';
import ReviewModal from '@/components/ReviewModal';

/* ─── Cancellation reasons ────────────────────────────────────── */
const CANCEL_REASONS = [
  'Ordered by mistake',
  'Changed my mind',
  'Expected delivery time is too long',
  'Found a better price elsewhere',
  'Other',
];

/* ─── Cancellation modal ──────────────────────────────────────── */
function CancelModal({
  orderId,
  orderRef,
  onClose,
  onCancelled,
}: {
  orderId: string;
  orderRef: string;
  onClose: () => void;
  onCancelled: (orderId: string) => void;
}) {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [otherText, setOtherText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    const finalReason = reason === 'Other' ? otherText.trim() : reason;
    if (!reason) { setError('Please select a reason.'); return; }
    if (reason === 'Other' && !finalReason) { setError('Please describe your reason.'); return; }

    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason: finalReason }),
      });

      if (res.ok) {
        onCancelled(orderId);
        onClose();
        toast({ title: 'Order cancelled', description: `Order #${orderRef} has been cancelled.` });
      } else {
        const data = await res.json();
        setError(data.error ?? 'Failed to cancel order. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-lg">Cancel Order</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Order #{orderRef}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Why are you cancelling this order? This action cannot be undone.
        </p>

        {/* Reason radios */}
        <div className="space-y-2.5">
          {CANCEL_REASONS.map((r) => (
            <label
              key={r}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${reason === r
                ? 'border-destructive/60 bg-destructive/5'
                : 'border-border hover:bg-muted/40'
                }`}
            >
              <input
                type="radio"
                name="cancel-reason"
                value={r}
                checked={reason === r}
                onChange={() => { setReason(r); setError(''); }}
                className="accent-destructive"
              />
              <span className="text-sm">{r}</span>
            </label>
          ))}
        </div>

        {/* "Other" textarea */}
        {reason === 'Other' && (
          <textarea
            placeholder="Please describe your reason…"
            value={otherText}
            onChange={(e) => { setOtherText(e.target.value); setError(''); }}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder:text-muted-foreground"
          />
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            className="flex-1 rounded-lg"
            onClick={onClose}
            disabled={submitting}
          >
            Nevermind
          </Button>
          <Button
            className="flex-1 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cancelling…</>
            ) : (
              'Confirm Cancellation'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────── */
export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<{ id: string; ref: string } | null>(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  /* Review modal state */
  const [reviewTarget, setReviewTarget] = useState<{
    productId: string;
    productName: string;
    productImage: string;
  } | null>(null);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

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

  // Optimistic UI update after successful cancellation
  const handleCancelled = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: 'cancelled' } : o))
    );
    setShowCancelPopup(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-blue-500';
      case 'shipped': return 'bg-yellow-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const canCancel = (status: string) => ['placed', 'pending'].includes(status);

  /* ── Loading skeleton ────────────────── */
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl border border-border bg-card shadow animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty state ─────────────────────── */
  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center space-y-5 max-w-sm mx-auto">
          <div className="w-20 h-20 mx-auto rounded-xl bg-muted border border-border flex items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">No orders yet</h1>
          <p className="text-muted-foreground text-sm">Start shopping to see your orders here</p>
          <Button className="rounded-lg w-full" size="lg" asChild>
            <Link href="/products">Shop now</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Cancelled animation popup */}
      {showCancelPopup && (
        <OrderStatusPopup
          type="cancelled"
          onDone={() => setShowCancelPopup(false)}
        />
      )}

      {/* Review modal */}
      {reviewTarget && (
        <ReviewModal
          productId={reviewTarget.productId}
          productName={reviewTarget.productName}
          productImage={reviewTarget.productImage}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => {
            setReviewed((prev) => new Set(Array.from(prev).concat(reviewTarget.productId)));
            setReviewTarget(null);
          }}
        />
      )}

      {/* Cancel reason modal */}
      {cancelTarget && (
        <CancelModal
          orderId={cancelTarget.id}
          orderRef={cancelTarget.ref}
          onClose={() => setCancelTarget(null)}
          onCancelled={handleCancelled}
        />
      )}

      <div className="container mx-auto px-4 py-6 md:py-8">
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
                  {/* Status badge + cancel button side-by-side */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${getStatusColor(order.status)} rounded-lg`}>
                      {order.status.toUpperCase()}
                    </Badge>
                    {canCancel(order.status) && (
                      <button
                        onClick={() => setCancelTarget({ id: order._id, ref: order.orderId })}
                        className="text-xs font-medium text-destructive border border-destructive/40 rounded-lg px-3 py-1 hover:bg-destructive/8 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
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
                          <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>

                        {/* ── Rate & Review — only on delivered orders ── */}
                        {order.status === 'delivered' && (
                          reviewed.has(item.productId.toString()) ? (
                            <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Review submitted
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setReviewTarget({
                                  productId: item.productId.toString(),
                                  productName: item.productName,
                                  productImage: item.productImage,
                                })
                              }
                              className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-3 py-1 hover:bg-primary/8 transition-colors"
                            >
                              <Star className="h-3.5 w-3.5" />
                              Rate &amp; Review
                            </button>
                          )
                        )}
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

                {/* ── Order Tracker ── */}
                <OrderTracker
                  status={order.status as Parameters<typeof OrderTracker>[0]['status']}
                  createdAt={order.createdAt}
                  updatedAt={order.updatedAt}
                />

                <Separator className="bg-border" />

                {/* Delivery Address */}
                <div>
                  <h4 className="font-heading font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                    Delivery Address
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {order.address.fullName}<br />
                    {order.address.street}<br />
                    {order.address.city}, {order.address.state} {order.address.zipCode}<br />
                    Phone: {order.address.phone}
                  </p>
                </div>

                {/* Subtotal & Shipping */}
                <div className="space-y-2 text-sm pt-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.totalAmount - (order.shippingFee || 0))}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{order.shippingFee ? formatPrice(order.shippingFee) : <span className="text-emerald-600 font-medium">Free</span>}</span>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(order.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
