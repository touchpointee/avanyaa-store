'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Loader2, Search, ImageIcon, Tag } from 'lucide-react';

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  const tagId = isNew ? null : (params.id as string);

  const { toast } = useToast();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  const [productSearch, setProductSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [initialProducts, setInitialProducts] = useState<any[]>([]);
  const [linkedProductsData, setLinkedProductsData] = useState<Record<string, any>>({});

  const [form, setForm] = useState({
    tag: '',
    productIds: [] as string[],
  });

  useEffect(() => {
    fetch('/api/products?limit=200')
      .then(r => r.json())
      .then(prods => {
        setInitialProducts(Array.isArray(prods?.data) ? prods.data : []);
      });
  }, []);

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/admin/tags/${tagId}`)
      .then(r => r.json())
      .then(data => {
        if (data && data._id) {
          const ids = data.productIds || [];
          setForm({ tag: data.tag, productIds: ids });
          
          if (ids.length > 0) {
             const idsParams = ids.map((id:string) => `ids=${id}`).join('&');
             fetch(`/api/products/batch?${idsParams}`)
               .then(r => r.ok ? r.json() : [])
               .then(pData => {
                  const map: Record<string, any> = {};
                  pData.forEach((p:any) => map[p._id] = p);
                  setLinkedProductsData(map);
               }).catch(()=>{});
          }
        }
      })
      .catch(() => toast({ title: 'Failed to load tag', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [tagId, isNew]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(productSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [productSearch]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isNew ? `/api/admin/tags` : `/api/admin/tags/${tagId}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: `Tag ${isNew ? 'created' : 'saved'} successfully` });
        router.push('/admin/tags');
      } else {
        const err = await res.json();
        toast({ title: err.error || 'Failed to save', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error saving tag', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleProduct = (p: { _id: string; name: string; images?: string[] }) => {
    const isAdding = !form.productIds.includes(p._id);
    if (isAdding) {
      setForm(f => ({ ...f, productIds: [...f.productIds, p._id] }));
      setLinkedProductsData(prev => ({ ...prev, [p._id]: p }));
    } else {
      setForm(f => ({ ...f, productIds: f.productIds.filter(x => x !== p._id) }));
    }
  };

  let listToRender = initialProducts;
  if (productSearch) {
    const searchLower = productSearch.toLowerCase();
    const localMatches = initialProducts.filter(p => p.name.toLowerCase().includes(searchLower));
    const merged = new Map();
    localMatches.forEach(p => merged.set(p._id, p));
    searchResults.forEach(p => merged.set(p._id, p));
    listToRender = Array.from(merged.values());
  }

  const unselectedToRender = listToRender.filter(p => !form.productIds.includes(p._id));
  const selectedToRender = form.productIds.map(id => linkedProductsData[id] || initialProducts.find(x => x._id === id) || { _id: id, name: 'Loading...' });

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6 pb-20">
      <div>
        <Link href="/admin/tags" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Tags
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{isNew ? 'New Tag' : `Edit ${form.tag}`}</h2>
              <p className="text-sm text-muted-foreground">Select products to link to this banner tag.</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Tag Name</Label>
            <p className="text-xs text-muted-foreground">No spaces or special characters (e.g. <code className="bg-muted px-1 rounded">summer-sale</code>).</p>
            <Input 
              value={form.tag} 
              onChange={e => setForm(f => ({ ...f, tag: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} 
              placeholder="summer-sale"
              required
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="font-semibold text-sm text-foreground">Linked Products ({form.productIds.length})</h3>
            {form.productIds.length > 0 && (
              <button type="button" onClick={() => setForm(f => ({ ...f, productIds: [] }))} className="text-xs font-medium text-destructive hover:underline">
                Clear all Selected
              </button>
            )}
          </div>
          
          <div className="p-6 space-y-4">
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

            <div className="rounded-xl border border-border max-h-[450px] overflow-y-auto bg-muted/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                {selectedToRender.map(p => {
                  const img = p.images?.[0];
                  return (
                    <label key={p._id} className="group flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all bg-primary/5 border-primary/40 shadow-sm">
                      <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors bg-primary border-primary text-primary-foreground">
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-current"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <input type="checkbox" className="hidden" checked={true} onChange={() => toggleProduct(p)} />
                      <div className="relative w-10 h-10 rounded-md bg-muted border border-border shrink-0 overflow-hidden flex items-center justify-center bg-card">
                        {img ? <img src={img} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-muted-foreground/50" />}
                      </div>
                      <span className="text-sm truncate w-full font-semibold text-foreground">{p.name}</span>
                    </label>
                  );
                })}

                {(!productSearch || !searching) && unselectedToRender.length === 0 && selectedToRender.length === 0 ? (
                  <div className="col-span-1 sm:col-span-2 py-8 text-center text-sm text-muted-foreground">
                    {productSearch ? 'No matches found.' : 'No products available.'}
                  </div>
                ) : (
                  unselectedToRender.map(p => {
                    const img = p.images?.[0];
                    return (
                      <label key={p._id} className="group flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all bg-card border-border hover:border-border/80 hover:bg-muted/30">
                        <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors border-input bg-background group-hover:border-primary/50" />
                        <input type="checkbox" className="hidden" checked={false} onChange={() => toggleProduct(p)} />
                        <div className="relative w-10 h-10 rounded-md bg-muted border border-border shrink-0 overflow-hidden flex items-center justify-center">
                          {img ? <img src={img} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-muted-foreground/50" />}
                        </div>
                        <span className="text-sm truncate w-full text-foreground/80 group-hover:text-foreground">{p.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="min-w-[120px]">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-2 h-4 w-4" /> Save Tag</>}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/tags">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
