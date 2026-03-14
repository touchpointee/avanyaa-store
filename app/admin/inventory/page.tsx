'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Search, RefreshCw, ChevronDown, ChevronUp,
  Plus, Trash2, Loader2, Check, Package, History,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';

/* ─── Types ─────────────────────────────────────────── */
interface Variant { size: string; color: string; stock: number }

interface ProductGroup {
  productId: string;
  productName: string;
  image: string | null;
  slug: string;
  globalSizes: string[];
  globalColors: string[];
  variants: Variant[];
  totalStock: number;
}

/* ─── Helpers ────────────────────────────────────────── */
function stockBadge(stock: number) {
  if (stock === 0) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Out of Stock</span>;
  if (stock <= 5) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Low · {stock}</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">In Stock · {stock}</span>;
}

/* ─── Main Component ─────────────────────────────────── */
export default function AdminInventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<ProductGroup[]>([]);
  const [filtered, setFiltered] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Per-variant local stock state (for inline editing)
  const [localStock, setLocalStock] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Add-variant form per product
  const [addOpen, setAddOpen] = useState<Record<string, boolean>>({});
  const [newVariant, setNewVariant] = useState<Record<string, { size: string; color: string; stock: string }>>({});
  const [addSaving, setAddSaving] = useState<Record<string, boolean>>({});

  // Delete saving
  const [delSaving, setDelSaving] = useState<Record<string, boolean>>({});

  // All system sizes & colors (for add-variant dropdowns)
  const [allSizes, setAllSizes] = useState<string[]>([]);
  const [allColors, setAllColors] = useState<{ name: string; hex: string }[]>([]);

  /* ─── Auth ──────────────────────────────────────────── */
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
      router.push('/admin/signin');
    }
  }, [status, session, router]);

  /* ─── Fetch all sizes & colors ──────────────────────── */
  useEffect(() => {
    fetch('/api/sizes')
      .then(r => r.ok ? r.json() : [])
      .then(data => setAllSizes(data.map((s: { name: string }) => s.name)))
      .catch(() => {});
    fetch('/api/colors')
      .then(r => r.ok ? r.json() : [])
      .then(data => setAllColors(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  /* ─── Fetch ─────────────────────────────────────────── */
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory');
      if (!res.ok) throw new Error();
      const flat: any[] = await res.json();

      // Group flat items by product
      const map = new Map<string, ProductGroup>();
      for (const item of flat) {
        if (!map.has(item.productId)) {
          map.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            image: item.image,
            slug: item.slug,
            globalSizes: item.globalSizes || [],
            globalColors: item.globalColors || [],
            variants: [],
            totalStock: 0,
          });
        }
        const g = map.get(item.productId)!;
        if (item.variant) {
          g.variants.push({ size: item.variant.size, color: item.variant.color, stock: item.stock });
          g.totalStock += item.stock;
        }
      }

      const list = Array.from(map.values());
      setProducts(list);

      // Initialise local stock state
      const init: Record<string, string> = {};
      for (const p of list) {
        for (const v of p.variants) {
          init[`${p.productId}-${v.size}-${v.color}`] = String(v.stock);
        }
      }
      setLocalStock(init);
    } catch {
      toast({ title: 'Failed to load inventory', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { if (status === 'authenticated') fetchInventory(); }, [status, fetchInventory]);

  /* ─── Search filter ─────────────────────────────────── */
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? products.filter(p => p.productName.toLowerCase().includes(q)) : products);
  }, [search, products]);

  /* ─── Toggle expand ─────────────────────────────────── */
  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ─── Update variant stock ──────────────────────────── */
  const saveVariantStock = async (productId: string, size: string, color: string) => {
    const key = `${productId}-${size}-${color}`;
    const newStock = parseInt(localStock[key]) || 0;
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size, color, newStock, reason: 'Manual Stock Adjustment' }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: 'Stock updated' });
      await fetchInventory();
    } catch (e: any) {
      toast({ title: e.message || 'Failed to update stock', variant: 'destructive' });
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  /* ─── Add variant ───────────────────────────────────── */
  const addVariant = async (productId: string) => {
    const nv = newVariant[productId] || { size: '', color: '', stock: '' };
    if (!nv.size || !nv.color) {
      toast({ title: 'Select size and color', variant: 'destructive' }); return;
    }
    setAddSaving(prev => ({ ...prev, [productId]: true }));
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size: nv.size, color: nv.color, stock: parseInt(nv.stock) || 0 }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: 'Variant added' });
      setNewVariant(prev => ({ ...prev, [productId]: { size: '', color: '', stock: '' } }));
      setAddOpen(prev => ({ ...prev, [productId]: false }));
      await fetchInventory();
    } catch (e: any) {
      toast({ title: e.message || 'Failed to add variant', variant: 'destructive' });
    } finally {
      setAddSaving(prev => ({ ...prev, [productId]: false }));
    }
  };

  /* ─── Delete variant ────────────────────────────────── */
  const deleteVariant = async (productId: string, size: string, color: string) => {
    const key = `del-${productId}-${size}-${color}`;
    setDelSaving(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size, color }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: 'Variant removed' });
      await fetchInventory();
    } catch (e: any) {
      toast({ title: e.message || 'Failed to remove variant', variant: 'destructive' });
    } finally {
      setDelSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  /* ─── Render ─────────────────────────────────────────── */
  if (status === 'loading') return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ── Row 1: Title + action buttons ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
          <p className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? 's' : ''} ·{' '}
            {products.reduce((s, p) => s + p.totalStock, 0)} units total
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/inventory/history')}>
            <History className="h-4 w-4 mr-1.5" /> History
          </Button>
          <Button variant="outline" size="sm" onClick={fetchInventory} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* ── Row 2: Full-width search bar ── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search products by name…"
          className="pl-12 h-12 text-base rounded-xl border-border shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoComplete="off"
        />
        {search && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            onClick={() => setSearch('')}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Product Cards ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="skeleton w-14 h-14 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-48 rounded" />
                  <div className="skeleton h-3 w-32 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Package className="h-12 w-12 opacity-30" />
          <p className="font-medium">No products found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(product => {
            const isOpen = expanded.has(product.productId);
            const nv = newVariant[product.productId] || { size: '', color: '', stock: '' };

            return (
              <div
                key={product.productId}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* ── Product header row ── */}
                <button
                  type="button"
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => toggle(product.productId)}
                >
                  {/* Image */}
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                    {product.image ? (
                      <Image src={product.image} alt={product.productName} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{product.productName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                      </span>
                      {stockBadge(product.totalStock)}
                    </div>
                  </div>

                  {/* Total stock pill */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Total Stock</p>
                    <p className="text-2xl font-bold text-primary">{product.totalStock}</p>
                  </div>

                  {/* Chevron */}
                  <div className="pl-2 shrink-0 text-muted-foreground">
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </button>

                {/* ── Expanded: variant rows ── */}
                {isOpen && (
                  <div className="border-t border-border">
                    {/* Column headers */}
                    {product.variants.length > 0 && (
                      <div className="grid grid-cols-[80px_1fr_1fr_140px_40px] gap-3 items-center px-5 py-2 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                        <span>#</span>
                        <span>Size</span>
                        <span>Color</span>
                        <span className="text-center">Stock</span>
                        <span />
                      </div>
                    )}

                    {/* Variant rows */}
                    {product.variants.map((v, idx) => {
                      const key = `${product.productId}-${v.size}-${v.color}`;
                      const delKey = `del-${key}`;
                      const stockVal = localStock[key] ?? String(v.stock);
                      const isDirty = stockVal !== String(v.stock);

                      return (
                        <div
                          key={key}
                          className="grid grid-cols-[80px_1fr_1fr_140px_40px] gap-3 items-center px-5 py-3 border-b border-border/60 last:border-0 hover:bg-muted/10 transition-colors"
                        >
                          {/* Row index */}
                          <span className="text-xs text-muted-foreground font-mono">#{idx + 1}</span>

                          {/* Size badge */}
                          <Badge variant="secondary" className="w-fit">{v.size}</Badge>

                          {/* Color badge */}
                          <Badge variant="outline" className="w-fit">{v.color}</Badge>

                          {/* Stock input + save */}
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              min="0"
                              value={stockVal}
                              onChange={e => setLocalStock(prev => ({ ...prev, [key]: e.target.value }))}
                              className="w-20 h-8 text-center font-semibold text-sm"
                            />
                            <Button
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              variant={isDirty ? 'default' : 'ghost'}
                              disabled={!isDirty || saving[key]}
                              onClick={() => saveVariantStock(product.productId, v.size, v.color)}
                              title="Save stock"
                            >
                              {saving[key]
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Check className="h-3.5 w-3.5" />}
                            </Button>
                          </div>

                          {/* Delete */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            disabled={delSaving[delKey]}
                            onClick={() => deleteVariant(product.productId, v.size, v.color)}
                            title="Remove variant"
                          >
                            {delSaving[delKey]
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      );
                    })}

                    {/* ── Add variant row ── */}
                    {addOpen[product.productId] ? (
                      <div className="px-5 py-4 bg-muted/20 border-t border-border space-y-3">
                        <p className="text-sm font-semibold">Add New Variant</p>
                        <div className="flex flex-wrap gap-3 items-end">
                          {/* Size select */}
                          <div className="space-y-1 w-32">
                            <Label className="text-xs">Size</Label>
                            <Select
                              value={nv.size}
                              onValueChange={val => setNewVariant(prev => ({ ...prev, [product.productId]: { ...nv, size: val } }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Size" />
                              </SelectTrigger>
                              <SelectContent>
                                {allSizes.length > 0
                                  ? allSizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)
                                  : product.globalSizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Color select */}
                          <div className="space-y-1 w-36">
                            <Label className="text-xs">Color</Label>
                            <Select
                              value={nv.color}
                              onValueChange={val => setNewVariant(prev => ({ ...prev, [product.productId]: { ...nv, color: val } }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Color" />
                              </SelectTrigger>
                              <SelectContent>
                                {(allColors.length > 0 ? allColors : product.globalColors.map(c => ({ name: c, hex: '' }))).map(c => (
                                  <SelectItem key={c.name} value={c.name}>
                                    <span className="flex items-center gap-2">
                                      {c.hex && (
                                        <span className="inline-block w-3 h-3 rounded-full border border-border shrink-0" style={{ backgroundColor: c.hex }} />
                                      )}
                                      {c.name}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Stock */}
                          <div className="space-y-1 w-28">
                            <Label className="text-xs">Stock</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={nv.stock}
                              onChange={e => setNewVariant(prev => ({ ...prev, [product.productId]: { ...nv, stock: e.target.value } }))}
                              className="h-9"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => addVariant(product.productId)}
                              disabled={addSaving[product.productId]}
                            >
                              {addSaving[product.productId]
                                ? <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                : <Plus className="h-4 w-4 mr-1" />}
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setAddOpen(prev => ({ ...prev, [product.productId]: false }))}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 py-3 border-t border-border/50 bg-muted/10">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => setAddOpen(prev => ({ ...prev, [product.productId]: true }))}
                        >
                          <Plus className="h-3.5 w-3.5" /> Add Variant
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
