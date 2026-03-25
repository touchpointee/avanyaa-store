'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { formatPrice } from '@/lib/utils';
import {
  Loader2, Search, ChevronRight, Package,
  RefreshCw, ShoppingBag, TrendingUp, Clock, CheckCircle2, Settings, Printer
} from 'lucide-react';

interface OrderSummary {
  _id: string;
  orderId: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  address: { fullName: string; email: string; phone: string; city: string; state: string };
  items: { productName: string; quantity: number; productImage?: string }[];
  cancellationReason?: string;
  isPaid?: boolean;
  isRefunded?: boolean;
}

const STATUS_CFG: Record<string, { label: string; pill: string; dot: string; row: string }> = {
  placed:           { label: 'Placed',           pill: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500',   row: 'hover:border-blue-300' },
  packed:           { label: 'Packed',           pill: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500', row: 'hover:border-violet-300' },
  shipped:          { label: 'Shipped',          pill: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500',  row: 'hover:border-amber-300' },
  out_for_delivery: { label: 'Out for Delivery', pill: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500', row: 'hover:border-orange-300' },
  delivered:        { label: 'Delivered',        pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', row: 'hover:border-emerald-300' },
  return_requested: { label: 'Return Req.',      pill: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500', row: 'hover:border-purple-300' },
  cancelled:        { label: 'Cancelled',        pill: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-500',    row: 'hover:border-red-300' },
  returned:         { label: 'Returned',         pill: 'bg-gray-100 text-gray-600 border-gray-300',       dot: 'bg-gray-400',   row: 'hover:border-gray-300' },
};

function Pill({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.placed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${c.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [filtered, setFiltered] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const [shippingCharge, setShippingCharge] = useState(0);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [invoiceStoreName, setInvoiceStoreName] = useState('Avanyaa');
  const [invoiceSubText, setInvoiceSubText] = useState('Premium Fashion Avenue');
  const [invoiceEmail, setInvoiceEmail] = useState('support@avanyaa.com');
  const [invoicePhone, setInvoicePhone] = useState('');
  const [invoiceAddress, setInvoiceAddress] = useState('');
  const [invoiceTaxId, setInvoiceTaxId] = useState('');
  const [invoiceFooterNote, setInvoiceFooterNote] = useState('Thank you for shopping with us!');
  const [savingSettings, setSavingSettings] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInvoiceConfigOpen, setIsInvoiceConfigOpen] = useState(false);

  useEffect(() => { 
    fetchOrders('initial'); 
    fetchSettings(); 

    // Auto-poll for new orders every 10 seconds silently
    const interval = setInterval(() => {
      fetchOrders('background');
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = orders;
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.orderId.toLowerCase().includes(q) ||
        o.address.fullName.toLowerCase().includes(q) ||
        o.address.email.toLowerCase().includes(q) ||
        o.address.phone.includes(q)
      );
    }
    setFiltered(result);
  }, [orders, search, statusFilter]);

  const fetchOrders = async (mode: 'initial' | 'refresh' | 'background' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true); 
    else if (mode === 'initial') setLoading(true);

    try {
      const res = await fetch('/api/orders');
      if (res.ok) setOrders(await res.json());
    } catch { } finally { 
      if (mode === 'initial') setLoading(false);
      if (mode === 'refresh') setRefreshing(false); 
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setShippingCharge(data.shippingCharge || 0);
        setFreeShippingThreshold(data.freeShippingThreshold || 0);
        setInvoiceStoreName(data.invoiceStoreName || 'Avanyaa');
        setInvoiceSubText(data.invoiceSubText || 'Premium Fashion Avenue');
        setInvoiceEmail(data.invoiceEmail || 'support@avanyaa.com');
        setInvoicePhone(data.invoicePhone || '');
        setInvoiceAddress(data.invoiceAddress || '');
        setInvoiceTaxId(data.invoiceTaxId || '');
        setInvoiceFooterNote(data.invoiceFooterNote || 'Thank you for shopping with us!');
      }
    } catch {}
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shippingCharge, freeShippingThreshold, invoiceStoreName, 
          invoiceSubText, invoiceEmail, invoicePhone, 
          invoiceAddress, invoiceTaxId, invoiceFooterNote 
        }),
      });
      if (res.ok) {
        setIsSettingsOpen(false);
        setIsInvoiceConfigOpen(false);
      }
    } catch {} finally {
      setSavingSettings(false);
    }
  };

  /* ── Derived stats ── */
  const totalRevenue = orders.filter(o => o.isPaid && !o.isRefunded).reduce((s, o) => s + o.totalAmount, 0);
  const refundedAmount = orders.filter(o => o.isRefunded).reduce((s, o) => s + o.totalAmount, 0);
  const pending = orders.filter(o => ['placed', 'packed', 'shipped', 'out_for_delivery'].includes(o.status)).length;
  const delivered = orders.filter(o => o.status === 'delivered').length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">{orders.length} total order{orders.length !== 1 ? 's' : ''} received</p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Invoice Config Button */}
          <Dialog open={isInvoiceConfigOpen} onOpenChange={setIsInvoiceConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900/50">
                <Printer className="h-4 w-4 mr-2" />
                Invoice Template Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invoice Branding</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Store Name</label>
                  <Input value={invoiceStoreName} onChange={e => setInvoiceStoreName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subtitle / Tagline</label>
                  <Input value={invoiceSubText} onChange={e => setInvoiceSubText(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Store Address / GST info</label>
                  <textarea 
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="123 Retail Street, City, State&#10;GSTIN: 22AAAAA0000A1Z5"
                    value={invoiceAddress} 
                    onChange={e => setInvoiceAddress(e.target.value)} 
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Email</label>
                    <Input type="email" value={invoiceEmail} onChange={e => setInvoiceEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Phone</label>
                    <Input value={invoicePhone} onChange={e => setInvoicePhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax ID / GST Number (Optional)</label>
                  <Input placeholder="e.g. GSTIN: 22ABCDE1234F1Z5" value={invoiceTaxId} onChange={e => setInvoiceTaxId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Footer Note</label>
                  <Input value={invoiceFooterNote} onChange={e => setInvoiceFooterNote(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInvoiceConfigOpen(false)}>Cancel</Button>
                <Button onClick={saveSettings} disabled={savingSettings}>
                  {savingSettings && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Shipping Config Button */}
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Shipping Config
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Shipping Configuration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Shipping Charge (₹)</label>
                  <Input type="number" min="0" value={shippingCharge} onChange={e => setShippingCharge(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Free Shipping Threshold (₹)</label>
                  <Input type="number" min="0" value={freeShippingThreshold} onChange={e => setFreeShippingThreshold(Number(e.target.value))} />
                  <p className="text-xs text-muted-foreground">Orders below this amount will have the shipping charge applied.</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
                <Button onClick={saveSettings} disabled={savingSettings}>
                  {savingSettings && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={() => fetchOrders('refresh')} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={ShoppingBag}   label="Total Orders"    value={orders.length}        color="bg-blue-500" />
        <StatCard icon={Clock}         label="Active Orders"   value={pending}              color="bg-amber-500" sub="Placed to Out for Delivery" />
        <StatCard icon={CheckCircle2}  label="Delivered"       value={delivered}            color="bg-emerald-500" />
        <StatCard icon={Package}       label="Returns"         value={orders.filter(o => ['return_requested', 'returned'].includes(o.status)).length} color="bg-purple-500" sub={`Refunded: ${formatPrice(refundedAmount)}`} />
        <StatCard icon={TrendingUp}    label="Net Revenue"     value={formatPrice(totalRevenue)} color="bg-violet-500" sub="All settled orders, minus refunds" />
      </div>

      {/* ── Status filter chips ── */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${statusFilter === 'all' ? 'bg-foreground text-background border-transparent' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}
        >
          All ({orders.length})
        </button>
        {Object.entries(STATUS_CFG).map(([key, cfg]) => {
          const count = orders.filter(o => o.status === key).length;
          if (!count) return null;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${statusFilter === key ? cfg.pill + ' ring-2 ring-offset-1 ring-current' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Search + filter ── */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search order ID, name, email, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(STATUS_CFG).map(([val, cfg]) => (
              <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card flex flex-col items-center justify-center py-24 gap-3">
          <Package className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">
            {orders.length === 0 ? 'No orders received yet.' : 'No orders match your filters.'}
          </p>
          {orders.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter('all'); }}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          {/* thead */}
          <div className="grid grid-cols-[2fr_1fr_auto_auto_24px] gap-4 px-5 py-3 bg-muted/60 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer / Order</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Amount</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
            <span />
          </div>

          {/* rows */}
          <div className="divide-y divide-border/70">
            {filtered.map((order, idx) => {
              const cfg = STATUS_CFG[order.status] ?? STATUS_CFG.placed;
              const date = new Date(order.createdAt);
              const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
              const itemLabel = order.items.length === 1
                ? `${order.items[0].quantity}× ${order.items[0].productName}`
                : `${order.items.length} products (${totalQty} items)`;

              return (
                <button
                  key={order._id}
                  onClick={() => router.push(`/admin/orders/${order._id}`)}
                  className={`w-full grid grid-cols-[2fr_1fr_auto_auto_24px] gap-4 items-center px-5 py-4 text-left transition-all group border-l-2 border-l-transparent ${cfg.row}`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">#{order.orderId}</span>
                      <span className="text-[11px] text-muted-foreground hidden sm:block">
                        {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' '}
                        {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mt-0.5 truncate leading-tight">{order.address.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.address.email}</p>
                    
                    {/* Expose Return/Cancel reason inline */}
                    {(order.status === 'return_requested' || order.status === 'returned') && (
                      <p className="text-[11px] font-medium text-purple-700 dark:text-purple-400 mt-1 truncate bg-purple-100 dark:bg-purple-900/30 inline-flex px-1.5 py-0.5 rounded w-fit max-w-xs">
                        {order.cancellationReason 
                          ? `Reason: ${order.cancellationReason.replace('Return Request: ', '')}`
                          : 'Reason: No reason provided'}
                      </p>
                    )}
                  </div>

                  {/* Col 2 — items */}
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate leading-relaxed">{itemLabel}</p>
                    <p className="text-xs text-muted-foreground">{order.address.city}, {order.address.state}</p>
                  </div>

                  {/* Col 3 — amount */}
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatPrice(order.totalAmount)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod}
                    </p>
                  </div>

                  {/* Col 4 — status */}
                  <Pill status={order.status} />

                  {/* Col 5 — chevron */}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>

          {/* Footer count */}
          <div className="px-5 py-3 bg-muted/30 border-t border-border text-xs text-muted-foreground">
            Showing {filtered.length} of {orders.length} orders
          </div>
        </div>
      )}
    </div>
  );
}
