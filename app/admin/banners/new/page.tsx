'use client';

import { useState, useEffect, useCallback } from 'react';
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
import HeroImageCropModal from '@/components/HeroImageCropModal';
import { HERO_BANNER_SIZE_LABEL } from '@/lib/heroBannerConstants';

export default function NewBannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    type: 'hero',
    image: '',
    title: '',
    subtitle: '',
    buttonText: '',
    link: '',
    active: true,
    order: 0,
    categoryId: '',
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const uploadBlob = useCallback(
    async (blob: Blob) => {
      setUploading(true);
      try {
        const fd = new FormData();
        const file = new File([blob], `hero-${Date.now()}.jpg`, { type: blob.type });
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.url) setForm((f) => ({ ...f, image: data.url }));
        else throw new Error('Upload failed');
        toast({ title: 'Hero image uploaded (3:1 crop applied)' });
      } catch {
        toast({ title: 'Upload failed', variant: 'destructive' });
      } finally {
        setUploading(false);
      }
    },
    [toast]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (form.type === 'hero') {
      const url = URL.createObjectURL(file);
      setCropImageSrc(url);
      setCropModalOpen(true);
    } else {
      const fd = new FormData();
      fd.append('file', file);
      setUploading(true);
      fetch('/api/upload', { method: 'POST', body: fd })
        .then((r) => r.json())
        .then((data) => {
          if (data.url) setForm((f) => ({ ...f, image: data.url }));
          else throw new Error('Upload failed');
        })
        .catch(() => toast({ title: 'Upload failed', variant: 'destructive' }))
        .finally(() => setUploading(false));
    }
  };

  const handleCropClose = () => {
    setCropModalOpen(false);
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) {
      toast({ title: 'Please upload an image', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || undefined,
        }),
      });
      if (res.ok) {
        toast({ title: 'Banner created' });
        router.push('/admin/banners');
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

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-3xl font-bold">Add Banner</h2>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Banner details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="promo">Promotional</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image *</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                {form.type === 'hero'
                  ? `Hero: fixed size ${HERO_BANNER_SIZE_LABEL}. You will crop to 3:1 after selecting.`
                  : form.type === 'promo'
                    ? 'Recommended: 1920×250 px. Promo displays at 160–224px height.'
                    : 'Upload an image. Hero: crop to 3:1. Promo: 1920×250 px.'}
              </p>
              <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  ) : form.image ? (
                    <img src={form.image} alt="Banner" className="max-h-40 mx-auto rounded" />
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {form.type === 'hero' ? 'Select image → crop to 3:1' : 'Click to upload'}
                    </span>
                  )}
                </label>
              </div>
            </div>
            <HeroImageCropModal
              open={cropModalOpen}
              imageSrc={cropImageSrc}
              onClose={handleCropClose}
              onComplete={uploadBlob}
              isUploading={uploading}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Button text</Label>
                <Input
                  value={form.buttonText}
                  onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))}
                />
              </div>
              <div>
                <Label>Link (URL)</Label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  placeholder="/products or https://..."
                />
              </div>
            </div>
            <div>
              <Label>Category (optional, for type=category)</Label>
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))
                  }
                  className="w-24"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4 mt-6">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Banner
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/banners">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
