'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '@/lib/utils';
import {
  Loader2, Search, ChevronRight, Package,
  RefreshCw, ShoppingBag, TrendingUp, Clock, CheckCircle2,
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
}

const STATUS_CFG: Record<string, { label: string; pill: string; dot: string; row: string }> = {
  placed:           { label: 'Placed',           pill: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500',   row: 'hover:border-blue-300' },
  packed:           { label: 'Packed',           pill: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500', row: 'hover:border-violet-300' },
  shipped:          { label: 'Shipped',          pill: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500',  row: 'hover:border-amber-300' },
  out_for_delivery: { label: 'Out for Delivery', pill: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500', row: 'hover:border-orange-300' },
  delivered:        { label: 'Delivered',        pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', row: 'hover:border-emerald-300' },
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

  useEffect(() => { fetchOrders(); }, []);

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

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) setOrders(await res.json());
    } catch { } finally { setLoading(false); setRefreshing(false); }
  };

  /* ── Derived stats ── */
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0);
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
        <Button variant="outline" size="sm" onClick={() => fetchOrders(true)} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag}   label="Total Orders"    value={orders.length}        color="bg-blue-500" />
        <StatCard icon={Clock}         label="Active Orders"   value={pending}              color="bg-amber-500" sub="Placed to Out for Delivery" />
        <StatCard icon={CheckCircle2}  label="Delivered"       value={delivered}            color="bg-emerald-500" />
        <StatCard icon={TrendingUp}    label="Revenue (COD)"   value={formatPrice(totalRevenue)} color="bg-violet-500" sub="Delivered orders only" />
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
                  {/* Col 1 — order + customer */}
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
