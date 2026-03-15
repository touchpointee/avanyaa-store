'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils';
import {
  Loader2, ArrowLeft, Package, MapPin, User,
  CreditCard, Hash, ChevronRight, Phone, Mail,
  Calendar, Clock, ExternalLink, CheckCircle2,
  Circle, AlertCircle,
} from 'lucide-react';

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface Order {
  _id: string;
  orderId: string;
  status: string;
  totalAmount: number;
  shippingFee?: number;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  items: OrderItem[];
  address: {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  cancellationReason?: string;
}

const STATUS_CFG: Record<string, { label: string; pill: string; dot: string; bg: string }> = {
  placed:           { label: 'Placed',           pill: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500',    bg: 'from-blue-50' },
  packed:           { label: 'Packed',           pill: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500',  bg: 'from-violet-50' },
  shipped:          { label: 'Shipped',          pill: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500',   bg: 'from-amber-50' },
  out_for_delivery: { label: 'Out for Delivery', pill: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500',  bg: 'from-orange-50' },
  delivered:        { label: 'Delivered',        pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', bg: 'from-emerald-50' },
  cancelled:        { label: 'Cancelled',        pill: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-500',     bg: 'from-red-50' },
  returned:         { label: 'Returned',         pill: 'bg-gray-100 text-gray-600 border-gray-300',       dot: 'bg-gray-400',    bg: 'from-gray-50' },
};

const TIMELINE = [
  { key: 'placed',           label: 'Order Placed' },
  { key: 'packed',           label: 'Packed' },
  { key: 'shipped',          label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered',        label: 'Delivered' },
];

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.placed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${c.pill}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function SectionCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/40">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 pt-0.5">{label}</span>
      <div className="text-sm font-medium text-right">{children}</div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const id = typeof params.id === 'string' ? params.id : params.id?.[0];

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(d => setOrder(d))
      .catch(() => toast({ title: 'Failed to load order', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!order) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrder(await res.json());
        toast({ title: '✅ Status updated', description: `Now: ${STATUS_CFG[status]?.label ?? status}` });
      } else {
        const e = await res.json();
        toast({ title: 'Update failed', description: e.error, variant: 'destructive' });
      }
    } catch { toast({ title: 'Network error', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  /* ── Loading / not found ── */
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  if (!order || (order as any).error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertCircle className="h-14 w-14 text-muted-foreground/40" />
      <p className="text-muted-foreground font-medium">Order not found.</p>
      <Button variant="outline" onClick={() => router.push('/admin/orders')}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
      </Button>
    </div>
  );

  const created = new Date(order.createdAt);
  const updated = new Date(order.updatedAt);
  const cfg = STATUS_CFG[order.status] ?? STATUS_CFG.placed;
  const timelineIdx = TIMELINE.findIndex(t => t.key === order.status);
  const isTerminal = order.status === 'cancelled' || order.status === 'returned';
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="max-w-5xl space-y-6">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <button onClick={() => router.push('/admin/orders')} className="hover:text-foreground flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Orders
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">#{order.orderId}</span>
      </div>

      {/* ── Hero header ── */}
      <div className={`rounded-2xl border border-border bg-gradient-to-r ${cfg.bg} to-transparent p-6 shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">Order #{order.orderId}</h1>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {created.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {created.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                {totalQty} item{totalQty !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Status changer */}
          <div className="flex items-center gap-2 shrink-0">
            {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Select value={order.status} onValueChange={handleStatusChange} disabled={saving}>
              <SelectTrigger className="w-52 bg-white dark:bg-card shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CFG).map(([val, c]) => (
                  <SelectItem key={val} value={val}>
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      {!isTerminal && (
        <div className="bg-white dark:bg-card rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Fulfilment Progress</p>
          <div className="relative flex items-start gap-0">
            {TIMELINE.map((step, i) => {
              const done = i <= timelineIdx;
              const active = i === timelineIdx;
              const sc = STATUS_CFG[step.key];
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {/* Connector line */}
                  {i < TIMELINE.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-0.5 transition-colors ${i < timelineIdx ? 'bg-primary' : 'bg-border'}`} />
                  )}
                  {/* Dot */}
                  <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    done
                      ? `${sc.dot} border-transparent`
                      : 'bg-white dark:bg-card border-border'
                  } ${active ? 'ring-4 ring-primary/20' : ''}`}>
                    {done
                      ? <CheckCircle2 className="h-4 w-4 text-white" />
                      : <Circle className="h-3.5 w-3.5 text-border" />
                    }
                  </div>
                  {/* Label */}
                  <p className={`text-[11px] text-center mt-2 font-medium leading-tight max-w-[70px] ${
                    active ? 'text-foreground' : done ? 'text-muted-foreground' : 'text-muted-foreground/40'
                  }`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancellation reason */}
      {isTerminal && order.cancellationReason && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Reason for {order.status}</p>
            <p className="text-sm text-red-600 mt-0.5">{order.cancellationReason}</p>
          </div>
        </div>
      )}

      {/* ── Main content grid ── */}
      <div className="grid md:grid-cols-5 gap-5">

        {/* LEFT — Items (3/5) */}
        <div className="md:col-span-3 space-y-5">
          <SectionCard icon={Package} title={`Order Items (${order.items.length} product${order.items.length !== 1 ? 's' : ''})`}>
            <div className="space-y-5">
              {order.items.map((item, i) => (
                <div key={i} className={`flex gap-4 ${i > 0 ? 'pt-5 border-t border-border' : ''}`}>
                  {/* Image */}
                  <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                    {item.productImage ? (
                      <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug">{item.productName}</p>
                    {/* Variant chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.size && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                          Size: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                          Colour: {item.color}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {formatPrice(item.price)} × {item.quantity} = <span className="font-bold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                    </p>
                    <Link
                      href={`/admin/products/edit/${item.productId}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5"
                    >
                      <ExternalLink className="h-3 w-3" /> View product
                    </Link>
                  </div>

                  {/* Qty bubble */}
                  <div className="shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-sm font-bold">
                      ×{item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order totals */}
            <div className="mt-6 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.totalAmount - (order.shippingFee || 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shippingFee ? formatPrice(order.shippingFee) : <span className="text-emerald-600 font-medium">Free</span>}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT — Sidebar (2/5) */}
        <div className="md:col-span-2 space-y-4">

          {/* Customer */}
          <SectionCard icon={User} title="Customer">
            <div className="space-y-0">
              <p className="font-semibold text-sm mb-3">{order.address.fullName}</p>
              <Row label="Email">
                <a href={`mailto:${order.address.email}`} className="text-primary hover:underline flex items-center gap-1 justify-end">
                  <Mail className="h-3 w-3" />{order.address.email}
                </a>
              </Row>
              <Row label="Phone">
                <a href={`tel:${order.address.phone}`} className="text-primary hover:underline flex items-center gap-1 justify-end">
                  <Phone className="h-3 w-3" />{order.address.phone}
                </a>
              </Row>
              <Row label="Type">
                {order.userId ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold">Registered</span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold">Guest</span>
                )}
              </Row>
            </div>
          </SectionCard>

          {/* Address */}
          <SectionCard icon={MapPin} title="Delivery Address">
            <address className="not-italic text-sm space-y-1 text-muted-foreground leading-relaxed">
              <p className="text-foreground font-semibold">{order.address.fullName}</p>
              <p>{order.address.street}</p>
              <p>{order.address.city}, {order.address.state} – {order.address.zipCode}</p>
              {order.address.country && <p>{order.address.country}</p>}
            </address>
          </SectionCard>

          {/* Payment */}
          <SectionCard icon={CreditCard} title="Payment">
            <Row label="Method">
              {order.paymentMethod === 'cod' ? (
                <span className="font-semibold">Cash on Delivery</span>
              ) : (
                <span className="font-semibold capitalize">{order.paymentMethod}</span>
              )}
            </Row>
            <Row label="Amount">
              <span className="font-bold text-base text-primary">{formatPrice(order.totalAmount)}</span>
            </Row>
            <Row label="Payment status">
              {order.paymentMethod === 'cod' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold">Pending (COD)</span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">✓ Paid</span>
              )}
            </Row>
          </SectionCard>

          {/* Order meta */}
          <SectionCard icon={Hash} title="Order Info">
            <Row label="Order ID"><span className="font-mono font-bold">{order.orderId}</span></Row>
            <Row label="Placed">
              {created.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Row>
            <Row label="Last update">
              {updated.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}{' '}
              <span className="text-muted-foreground text-xs ml-1">
                {updated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </Row>
            <Row label="Total items"><span className="font-semibold">{totalQty}</span></Row>
          </SectionCard>
        </div>
      </div>

      {/* Back */}
      <Button variant="outline" onClick={() => router.push('/admin/orders')} className="mt-2">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to All Orders
      </Button>
    </div>
  );
}
