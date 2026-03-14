'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft, Save, Loader2, Upload, X,
  LayoutDashboard, TrendingUp, Sparkles, Tag,
  ImageIcon, Maximize2, Layers, Search, PackageMinus, GripVertical
} from 'lucide-react';

/* ─── Type config ──────────────────────────────── */
const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  featured_categories: { label: 'Featured Categories', icon: <Layers className="h-4 w-4" />,          color: 'text-blue-700',   bg: 'bg-blue-100'   },
  trending:            { label: 'Trending',             icon: <TrendingUp className="h-4 w-4" />,      color: 'text-rose-700',   bg: 'bg-rose-100'   },
  new_arrivals:        { label: 'New Arrivals',         icon: <Sparkles className="h-4 w-4" />,        color: 'text-amber-700',  bg: 'bg-amber-100'  },
  promo:               { label: 'Promo Banner',         icon: <Tag className="h-4 w-4" />,             color: 'text-green-700',  bg: 'bg-green-100'  },
  category:            { label: 'Category Section',    icon: <Layers className="h-4 w-4" />,          color: 'text-cyan-700',   bg: 'bg-cyan-100'   },
  big_size:            { label: 'Big Size',             icon: <Maximize2 className="h-4 w-4" />,       color: 'text-orange-700', bg: 'bg-orange-100' },
  banner:              { label: 'Full Banner',          icon: <ImageIcon className="h-4 w-4" />,       color: 'text-pink-700',   bg: 'bg-pink-100'   },
  semi_banner:         { label: 'Semi Banner',          icon: <ImageIcon className="h-4 w-4" />,       color: 'text-indigo-700', bg: 'bg-indigo-100' },
};

/* ─── Section card wrapper ─────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

/* ─── Field wrapper ────────────────────────────── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-medium">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

/* ─── Image uploader ───────────────────────────── */
function ImageUpload({
  label, value, uploading, onChange, onClear,
}: { label: string; value: string; uploading: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onClear: () => void }) {
  return (
    <Field label={label}>
      <div className="relative rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors overflow-hidden">
        <label className="flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[140px] p-4">
          <input type="file" accept="image/*" className="hidden" onChange={onChange} disabled={uploading} />
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : value ? (
            <div className="relative w-full">
              <img src={value} alt="Uploaded" className="max-h-36 mx-auto rounded-lg object-contain" />
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WebP</p>
              </div>
            </>
          )}
        </label>
        {value && !uploading && (
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </Field>
  );
}

/* ─── Main page ────────────────────────────────── */
export default function EditHomepageSectionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ _id: string; name: string; images?: string[] }[]>([]);

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [initialProducts, setInitialProducts] = useState<{ _id: string; name: string; images?: string[] }[]>([]);
  // Store only the full product objects for the currently Linked ones
  const [linkedProductsData, setLinkedProductsData] = useState<Record<string, { _id: string; name: string; images?: string[] }>>({});

  const [form, setForm] = useState({
    type: 'trending',
    image: '',
    title: '',
    subtitle: '',
    buttonText: '',
    link: '',
    image2: '',
    link2: '',
    active: true,
    order: 0,
    categoryId: '',
    linkedProductIds: [] as string[],
  });

  // Load categories and initial products
  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/products?limit=200').then(r => r.json()),
    ]).then(([cats, prods]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setInitialProducts(Array.isArray(prods?.data) ? prods.data : []);
    });
  }, []);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;
    fetch('/api/homepage-sections')
      .then(r => r.json())
      .then(data => {
        const s = data.find((x: any) => x._id === id);
        if (s) {
          const linkedIds = (s.linkedProductIds || []).map((p: any) => typeof p === 'object' ? p._id : p);
          setForm({
            type: s.type,
            title: s.title || '',
            image: s.image || '',
            link: s.link || '',
            image2: s.image2 || '',
            link2: s.link2 || '',
            linkedProductIds: linkedIds,
            categoryId: s.categoryId?._id || s.categoryId || '',
            order: s.order ?? 0,
            active: s.active ?? true,
            subtitle: s.subtitle || '',
            buttonText: s.buttonText || '',
          });
          
          // Fetch data for the linked products
          if (linkedIds.length > 0) {
             const idsParams = linkedIds.map((id:string) => `ids=${id}`).join('&');
             fetch(`/api/products/batch?${idsParams}`)
               .then(r => r.ok ? r.json() : [])
               .then(data => {
                  const map: Record<string, any> = {};
                  data.forEach((p:any) => map[p._id] = p);
                  setLinkedProductsData(map);
               }).catch(()=>{});
          }
        }
      })
      .catch(() => toast({ title: 'Failed to load section', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [params.id]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(productSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [productSearch]);

  // Fire search API
  useEffect(() => {
    if (!debouncedSearch) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    fetch(`/api/products?search=${encodeURIComponent(debouncedSearch)}&limit=20`)
      .then(r => r.json())
      .then(data => setSearchResults(Array.isArray(data?.data) ? data.data : []))
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  }, [debouncedSearch]);

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/homepage-sections/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, categoryId: form.categoryId || null }),
      });
      if (res.ok) {
        toast({ title: 'Section saved successfully' });
        router.push('/admin/homepage');
      } else {
        const err = await res.json();
        toast({ title: err.error || 'Failed to save', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error saving section', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleProduct = (p: { _id: string; name: string; images?: string[] }) => {
    const isAdding = !form.linkedProductIds.includes(p._id);
    if (isAdding) {
      set('linkedProductIds', [...form.linkedProductIds, p._id]);
      setLinkedProductsData(prev => ({ ...prev, [p._id]: p }));
    } else {
      set('linkedProductIds', form.linkedProductIds.filter(x => x !== p._id));
    }
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'image' | 'image2',
    setUpl: (v: boolean) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpl(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) set(field, data.url);
      else toast({ title: 'Upload failed', variant: 'destructive' });
    } catch {
      toast({ title: 'Upload error', variant: 'destructive' });
    } finally { setUpl(false); }
  };

  const cfg = TYPE_CONFIG[form.type] || { label: form.type, icon: <Layers className="h-4 w-4" />, color: 'text-primary', bg: 'bg-primary/10' };
  const hasBanner = form.type === 'banner' || form.type === 'semi_banner';
  const hasProducts = ['trending', 'new_arrivals', 'category', 'promo'].includes(form.type);

  // Derive the combined list to render
  let listToRender = initialProducts;
  if (productSearch) {
    const searchLower = productSearch.toLowerCase();
    const localMatches = initialProducts.filter(p => p.name.toLowerCase().includes(searchLower));
    
    // Combine local instant matches with delayed API results, deduplicated by ID
    const merged = new Map();
    localMatches.forEach(p => merged.set(p._id, p));
    searchResults.forEach(p => merged.set(p._id, p));
    listToRender = Array.from(merged.values());
  }

  const unselectedToRender = listToRender.filter(p => !form.linkedProductIds.includes(p._id));
  
  // Selected products at the top
  const selectedToRender = form.linkedProductIds.map(id => linkedProductsData[id] || initialProducts.find(x => x._id === id) || { _id: id, name: 'Loading...' });

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6 pb-20">
      {/* ── Breadcrumb / header ── */}
      <div>
        <Link
          href="/admin/homepage"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Homepage
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
              {cfg.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold">Edit Section</h2>
              <p className="text-sm text-muted-foreground">{form.title || '(No title)'} · {cfg.label}</p>
            </div>
          </div>

          {/* Active toggle */}
          <button
            type="button"
            onClick={() => set('active', !form.active)}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border transition-colors shrink-0 ${
              form.active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${form.active ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
            {form.active ? 'Live' : 'Hidden'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Section Config ── */}
        <Section title="Section Configuration">
          <Field label="Section Type">
            <Select value={form.type} onValueChange={v => set('type', v)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured_categories">Featured Categories</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="new_arrivals">New Arrivals</SelectItem>
                <SelectItem value="promo">Promo Banner</SelectItem>
                <SelectItem value="category">Category Section</SelectItem>
                <SelectItem value="big_size">Big Size (XL / XXL etc.)</SelectItem>
                <SelectItem value="banner">Full Banner</SelectItem>
                <SelectItem value="semi_banner">Semi Banner (2 images)</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Section Title" hint={form.type === 'big_size' ? 'Products with XL, XXL, 2XL, 3XL sizes are shown automatically.' : undefined}>
            <Input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Trending Collections"
            />
          </Field>

          {/* Order + Active row */}
          <div className="flex items-end gap-4">
            <Field label="Display Order">
              <Input
                type="number"
                value={form.order}
                onChange={e => set('order', parseInt(e.target.value, 10) || 0)}
                className="w-28"
              />
            </Field>
          </div>
        </Section>

        {/* ── Banner images ── */}
        {hasBanner && (
          <Section title={form.type === 'semi_banner' ? 'Banner Images' : 'Banner Image'}>
            <ImageUpload
              label={form.type === 'semi_banner' ? 'Left Image *' : 'Image *'}
              value={form.image}
              uploading={uploading1}
              onChange={e => handleUpload(e, 'image', setUploading1)}
              onClear={() => set('image', '')}
            />
            <Field label="Link (optional URL)">
              <Input
                value={form.link}
                onChange={e => set('link', e.target.value)}
                placeholder="/products?category=..."
              />
            </Field>

            {form.type === 'semi_banner' && (
              <>
                <div className="border-t border-border pt-5" />
                <ImageUpload
                  label="Right Image *"
                  value={form.image2}
                  uploading={uploading2}
                  onChange={e => handleUpload(e, 'image2', setUploading2)}
                  onClear={() => set('image2', '')}
                />
                <Field label="Right Link (optional URL)">
                  <Input
                    value={form.link2}
                    onChange={e => set('link2', e.target.value)}
                    placeholder="/products?category=..."
                  />
                </Field>
              </>
            )}
          </Section>
        )}

        {/* ── Category picker ── */}
        {form.type === 'category' && (
          <Section title="Category">
            <Field label="Linked Category">
              <Select value={form.categoryId} onValueChange={v => set('categoryId', v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </Section>
        )}

        {/* ── Linked Products ── */}
        {hasProducts && (
          <Section title={`Linked Products (${form.linkedProductIds.length} selected)`}>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name..."
                className="pl-9 h-10"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
              />
              {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            {/* Clear selected button */}
            {form.linkedProductIds.length > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => set('linkedProductIds', [])}
                  className="text-xs font-medium text-destructive hover:underline"
                >
                  Clear all selected ({form.linkedProductIds.length})
                </button>
              </div>
            )}

            {/* Unified Product list */}
            <div className="rounded-xl border border-border max-h-[450px] overflow-y-auto overflow-x-hidden bg-muted/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                
                {/* 1. Show Selected Products first (Pinned to top) */}
                {selectedToRender.map(p => {
                  const img = p.images?.[0];
                  return (
                    <label
                      key={p._id}
                      className="group flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all bg-primary/5 border-primary/40 shadow-sm"
                    >
                      <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors bg-primary border-primary text-primary-foreground">
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-current"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <input type="checkbox" className="hidden" checked={true} onChange={() => toggleProduct(p)} />
                      
                      <div className="relative w-10 h-10 rounded-md bg-muted border border-border shrink-0 overflow-hidden flex items-center justify-center bg-card">
                        {img ? <img src={img} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-muted-foreground/50" />}
                      </div>
                      <span className="text-sm truncate w-full font-semibold text-foreground">
                        {p.name}
                      </span>
                    </label>
                  );
                })}

                {/* 2. Show Unselected Products */}
                {(!productSearch || !searching) && unselectedToRender.length === 0 && selectedToRender.length === 0 ? (
                  <div className="col-span-1 sm:col-span-2 py-8 text-center text-sm text-muted-foreground">
                    {productSearch ? 'No matches found.' : 'No products available.'}
                  </div>
                ) : (
                  unselectedToRender.map(p => {
                    const img = p.images?.[0];
                    return (
                      <label
                        key={p._id}
                        className="group flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all bg-card border-border hover:border-border/80 hover:bg-muted/30"
                      >
                        <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors border-input bg-background group-hover:border-primary/50" />
                        <input type="checkbox" className="hidden" checked={false} onChange={() => toggleProduct(p)} />
                        
                        <div className="relative w-10 h-10 rounded-md bg-muted border border-border shrink-0 overflow-hidden flex items-center justify-center">
                          {img ? <img src={img} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-muted-foreground/50" />}
                        </div>
                        <span className="text-sm truncate w-full text-foreground/80 group-hover:text-foreground">
                          {p.name}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </Section>
        )}

        {/* ── Save / Cancel ── */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="min-w-[120px]">
            {saving
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
              : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/homepage">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
