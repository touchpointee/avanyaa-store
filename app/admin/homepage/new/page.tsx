'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function NewHomepageSectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ _id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    type: 'trending',
    title: '',
    linkedProductIds: [] as string[],
    categoryId: '',
    order: 0,
    active: true,
  });

  useEffect(() => {
    Promise.all([fetch('/api/categories').then((r) => r.json()), fetch('/api/products?limit=100').then((r) => r.json())]).then(
      ([cats, prods]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setProducts(Array.isArray(prods?.data) ? prods.data : []);
      }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/homepage-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || undefined,
        }),
      });
      if (res.ok) {
        toast({ title: 'Section created' });
        router.push('/admin/homepage');
      } else {
        const err = await res.json();
        toast({ title: err.error || 'Failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (id: string) => {
    setForm((f) => ({
      ...f,
      linkedProductIds: f.linkedProductIds.includes(id)
        ? f.linkedProductIds.filter((x) => x !== id)
        : [...f.linkedProductIds, id],
    }));
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-3xl font-bold">Add Homepage Section</h2>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Section config</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured_categories">Featured Categories</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="new_arrivals">New Arrivals</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                  <SelectItem value="category">Category Section</SelectItem>
                  <SelectItem value="big_size">Big Size (XL/XXL etc.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title (section heading)</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={form.type === 'big_size' ? 'e.g. Big Size' : 'e.g. Trending Now'}
              />
              {form.type === 'big_size' && (
                <p className="text-sm text-muted-foreground mt-1">
                  Products with sizes XL, XXL, 2XL, 3XL, 4XL are shown automatically.
                </p>
              )}
            </div>
            {(form.type === 'trending' || form.type === 'new_arrivals' || form.type === 'category') && (
              <div>
                <Label>Linked products (show these in this section)</Label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 mt-2">
                  {products.slice(0, 50).map((p) => (
                    <label key={p._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.linkedProductIds.includes(p._id)}
                        onChange={() => toggleProduct(p._id)}
                      />
                      <span className="text-sm">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {form.type === 'category' && (
              <div>
                <Label>Category (optional)</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={form.active}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, active: !!c }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
                  className="w-24"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 mt-6">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Section
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/homepage">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
