'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function EditHomepageSectionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ _id: string; name: string }[]>([]);
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

  useEffect(() => {
    Promise.all([fetch('/api/categories').then((r) => r.json()), fetch('/api/products?limit=100').then((r) => r.json())]).then(
      ([cats, prods]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setProducts(Array.isArray(prods?.data) ? prods.data : []);
      }
    );
  }, []);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;
    fetch('/api/homepage-sections')
      .then((r) => r.json())
      .then((data) => {
        const s = data.find((x: any) => x._id === id);
        if (s) {
          setForm({
            type: s.type,
            title: s.title || '',
            image: s.image || '',
            link: s.link || '',
            image2: s.image2 || '',
            link2: s.link2 || '',
            linkedProductIds: (s.linkedProductIds || []).map((p: any) => (typeof p === 'object' ? p._id : p)),
            categoryId: s.categoryId?._id || s.categoryId || '',
            order: s.order ?? 0,
            active: s.active ?? true,
            subtitle: '',
            buttonText: '',
          });
        }
      })
      .catch(() => toast({ title: 'Failed to load section', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/homepage-sections/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || null,
        }),
      });
      if (res.ok) {
        toast({ title: 'Section updated' });
        router.push('/admin/homepage');
      } else {
        const err = await res.json();
        toast({ title: err.error || 'Failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setSaving(false);
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

  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'image' | 'image2', setUploadingLocal: (v: boolean) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLocal(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, [fieldName]: data.url }));
      } else {
        toast({ title: 'Upload failed', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Upload error', variant: 'destructive' });
    } finally {
      setUploadingLocal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-3xl font-bold">Edit Homepage Section</h2>
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
                  <SelectItem value="banner">Full Banner</SelectItem>
                  <SelectItem value="semi_banner">Semi Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              {form.type === 'big_size' && (
                <p className="text-sm text-muted-foreground mt-1">
                  Products with sizes XL, XXL, 2XL, 3XL, 4XL are shown automatically.
                </p>
              )}
            </div>
            {(form.type === 'trending' || form.type === 'new_arrivals' || form.type === 'category') && (
              <div>
                <Label>Linked products</Label>
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
                <Label>Category</Label>
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
            {(form.type === 'banner' || form.type === 'semi_banner') && (
              <>
                <div>
                  <Label>{form.type === 'semi_banner' ? 'Left Image *' : 'Image *'}</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, 'image', setUploading1)}
                        disabled={uploading1}
                      />
                      {uploading1 ? (
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      ) : form.image ? (
                        <img src={form.image} alt="Banner" className="max-h-40 mx-auto rounded" />
                      ) : (
                        <span className="text-sm text-muted-foreground">Click to upload image</span>
                      )}
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Link (Optional URL)</Label>
                  <Input
                    value={form.link}
                    onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                    placeholder="/products?category=..."
                  />
                </div>
              </>
            )}

            {form.type === 'semi_banner' && (
              <>
                <div className="pt-4 border-t">
                  <Label>Right Image *</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, 'image2', setUploading2)}
                        disabled={uploading2}
                      />
                      {uploading2 ? (
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      ) : form.image2 ? (
                        <img src={form.image2} alt="Semi Banner Right" className="max-h-40 mx-auto rounded" />
                      ) : (
                        <span className="text-sm text-muted-foreground">Click to upload 2nd image</span>
                      )}
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Right Link (Optional URL)</Label>
                  <Input
                    value={form.link2}
                    onChange={(e) => setForm((f) => ({ ...f, link2: e.target.value }))}
                    placeholder="/products?category=..."
                  />
                </div>
              </>
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
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/homepage">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
