'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardStats } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Loader2, Package, ShoppingBag, DollarSign, Users, MessageSquare, TrendingUp, Plus, LayoutGrid, Clock, ChevronRight, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-60" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading dashboard insights…</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-20 text-center">
        <p className="text-destructive font-medium">Failed to load dashboard data. Please refresh.</p>
      </div>
    );
  }

  const quickStats = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', subtext: 'All time earnings' },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', subtext: 'Total orders placed' },
    { label: 'Registered Users', value: stats.totalUsers, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', subtext: 'Active customers' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50', subtext: 'Available in store' },
    { label: 'Inquiries', value: stats.totalMessages, icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-50', subtext: 'Customer messages' },
  ];

  const quickActions = [
    { label: 'Add Product', icon: Plus, href: '/admin/products/new', color: 'bg-indigo-600' },
    { label: 'Inventory', icon: LayoutGrid, href: '/admin/inventory', color: 'bg-slate-800' },
    { label: 'Categories', icon: ChevronRight, href: '/admin/categories', color: 'bg-slate-800' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200';
      case 'placed': return 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            Store Overview <TrendingUp className="h-6 w-6 text-emerald-500" />
          </h2>
          <p className="text-muted-foreground font-medium">
            Welcome back! Here&apos;s what&apos;s happening with Avanyaa today.
          </p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((action) => (
            <Button key={action.label} asChild size="sm" className={`${action.color} text-white hover:opacity-90 rounded-lg shadow-sm transition-all h-9`}>
              <Link href={action.href} className="flex items-center gap-2">
                <action.icon className="h-4 w-4" />
                <span>{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow group">
            <CardContent className="p-5 flex flex-col items-center text-center space-y-2">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List */}
        <Card className="lg:col-span-2 border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-6 py-5">
            <div className="space-y-0.5">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" /> Recent Sales
              </CardTitle>
              <CardDescription>Latest {stats.recentOrders.length} business transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-lg h-8 text-xs font-semibold hover:bg-slate-50 border-slate-200">
              <Link href="/admin/orders">View All Orders</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100">
              {stats.recentOrders.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm italic">No orders found yet.</div>
              ) : (
                stats.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center p-4 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                        #{order.orderId.slice(-4).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate text-slate-900 group-hover:text-primary transition-colors">
                          {order.address.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
                      <Badge className={`mt-1 font-semibold border ${getStatusColor(order.status)}`} variant="outline">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Sections */}
        <div className="space-y-6">
          {/* Out of Stock Alert */}
          {stats.outOfStockProducts.length > 0 && (
            <Card className="border-rose-200 bg-rose-50 shadow-sm overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-rose-200/50 flex flex-row items-center justify-between bg-rose-100/30">
                <div>
                  <CardTitle className="text-sm font-bold text-rose-900 flex items-center gap-2">
                    <Package className="h-4 w-4" /> Out of Stock
                  </CardTitle>
                  <CardDescription className="text-[10px] text-rose-700 font-medium">Items currently unavailable</CardDescription>
                </div>
                <Badge variant="destructive" className="bg-rose-600 text-[10px] px-2 h-5 font-bold">{stats.outOfStockProducts.length}</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-rose-200/40 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-rose-200">
                  {stats.outOfStockProducts.map((item) => (
                    <Link 
                      key={item._id} 
                      href={`/admin/products/edit/${(item as any).productId || item._id}`}
                      className="flex items-center gap-3 p-3 hover:bg-rose-200/50 transition-colors group"
                    >
                      <div className="h-9 w-9 shrink-0 rounded-lg overflow-hidden border border-rose-200 bg-white shadow-sm">
                        <Image 
                          src={item.images[0] || '/placeholder.png'} 
                          alt={item.name} 
                          width={36} 
                          height={36} 
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[9px] font-extrabold text-rose-600 flex items-center gap-1 uppercase tracking-tight">
                          <Ban className="h-2.5 w-2.5" /> Out of Stock
                        </p>
                      </div>
                      <ChevronRight className="h-3 w-3 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Low Stock Alert */}
          {stats.lowStockProducts.length > 0 && (
            <Card className="border-amber-200 bg-amber-50 shadow-sm overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-amber-200/50 flex flex-row items-center justify-between bg-amber-100/30">
                <div>
                  <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Low Stock
                  </CardTitle>
                  <CardDescription className="text-[10px] text-amber-700 font-medium">Items nearing empty</CardDescription>
                </div>
                <Badge className="bg-amber-600 text-white text-[10px] px-2 h-5 font-bold border-0">{stats.lowStockProducts.length}</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-amber-200/40 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-200">
                  {stats.lowStockProducts.map((item) => (
                    <Link 
                      key={item._id} 
                      href={`/admin/products/edit/${(item as any).productId || item._id}`}
                      className="flex items-center gap-3 p-3 hover:bg-amber-100/50 transition-colors group"
                    >
                      <div className="h-9 w-9 shrink-0 rounded-lg overflow-hidden border border-amber-200 bg-white shadow-sm">
                        <Image 
                          src={item.images[0] || '/placeholder.png'} 
                          alt={item.name} 
                          width={36} 
                          height={36} 
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[9px] font-extrabold text-amber-600 uppercase tracking-tight">
                          Only {item.stock} left
                        </p>
                      </div>
                      <ChevronRight className="h-3 w-3 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Log */}
          <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
            <CardHeader className="px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-lg font-bold">Activity Log</CardTitle>
              <CardDescription>Sales frequency over 7 days</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {stats.ordersLast7Days.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8 italic underline decoration-slate-200 underline-offset-4">No recent activity detected.</p>
              ) : (
                <div className="space-y-4">
                  {stats.ordersLast7Days.slice().reverse().map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <div className="w-20 text-xs font-bold text-slate-500 truncate uppercase">
                        {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.2)]" 
                          style={{ width: `${Math.min((day.count / 20) * 100, 100)}%` }} 
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 w-12 text-right">{day.count} {day.count === 1 ? 'sale' : 'sales'}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none bg-indigo-600 text-white shadow-xl shadow-indigo-200 overflow-hidden relative group">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-32 w-32 bg-indigo-400/20 rounded-full blur-xl" />
            
            <CardContent className="p-8 relative z-10 space-y-4">
              <div className="bg-white/20 p-3 rounded-2xl w-fit">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Manage Store</h3>
                <p className="text-indigo-100 text-xs leading-relaxed opacity-90">
                  Ready to add something new to your collections? Use the quick link to jump straight to product creation.
                </p>
              </div>
              <Button asChild className="bg-white text-indigo-600 hover:bg-indigo-50 w-full rounded-xl font-bold shadow-lg shadow-black/5 h-10 transition-all active:scale-95">
                <Link href="/admin/products/new">Create New Product</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
