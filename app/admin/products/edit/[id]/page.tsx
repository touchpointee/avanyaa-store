'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: 'casual',
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as string[],
    stock: '',
    featured: false,
  });

  const [sizes, setSizes] = useState<string[]>([]);
  const [homepageSections, setHomepageSections] = useState<{ _id: string; title: string; type: string; linkedProductIds: { _id: string }[] }[]>([]);
  const [showInSectionIds, setShowInSectionIds] = useState<string[]>([]);
  const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Pink', 'Yellow', 'Purple'];

  const sectionTypesWithProducts = ['trending', 'new_arrivals', 'promo', 'category'];

  useEffect(() => {
    fetchProduct();
  }, []);

  useEffect(() => {
    fetch('/api/sizes')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setSizes(data.map((s: { name: string }) => s.name)))
      .catch(() => setSizes([]));
  }, []);

  useEffect(() => {
    fetch('/api/homepage-sections')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const filtered = list.filter((s: { type: string }) => sectionTypesWithProducts.includes(s.type));
        setHomepageSections(filtered);
        const productId = typeof params.id === 'string' ? params.id : params.id?.[0];
        if (productId) {
          const included = filtered
            .filter((s: { linkedProductIds: { _id: string }[] }) =>
              (s.linkedProductIds || []).some((p: any) => (typeof p === 'object' ? p._id : p) === productId)
            )
            .map((s: { _id: string }) => s._id);
          setShowInSectionIds(included);
        }
      })
      .catch(() => setHomepageSections([]));
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price.toString(),
          compareAtPrice: data.compareAtPrice?.toString() || '',
          category: data.category,
          sizes: data.sizes,
          colors: data.colors,
          images: data.images,
          stock: data.stock.toString(),
          featured: data.featured,
        });
      } else {
        toast({
          title: 'Product not found',
          variant: 'destructive',
        });
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          return data.url;
        }
        throw new Error('Upload failed');
      });

      const urls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
      }));

      toast({
        title: 'Images uploaded',
        description: `${urls.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (formData.images.length === 0) {
      toast({
        title: 'No images',
        description: 'Please upload at least one image',
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    if (formData.sizes.length === 0) {
      toast({
        title: 'No sizes',
        description: 'Please select at least one size',
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
          stock: parseInt(formData.stock),
        }),
      });

      if (response.ok) {
        const productId = typeof params.id === 'string' ? params.id : params.id?.[0];
        if (productId) {
          for (const section of homepageSections) {
            const currentIds = (section.linkedProductIds || []).map((p: any) => (typeof p === 'object' ? p._id : p));
            const shouldInclude = showInSectionIds.includes(section._id);
            const hasProduct = currentIds.includes(productId);
            let newIds: string[];
            if (shouldInclude && !hasProduct) newIds = [...currentIds, productId];
            else if (!shouldInclude && hasProduct) newIds = currentIds.filter((id) => id !== productId);
            else continue;
            await fetch(`/api/homepage-sections/${section._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ linkedProductIds: newIds }),
            });
          }
        }
        toast({
          title: 'Product updated',
          description: 'Product has been updated successfully',
        });
        router.push('/admin/products');
      } else {
        const data = await response.json();
        toast({
          title: 'Failed to update product',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleShowInSection = (sectionId: string) => {
    setShowInSectionIds((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold mb-6">Edit Product</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Compare at Price (₹)</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="party">Party</SelectItem>
                  <SelectItem value="ethnic">Ethnic</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked as boolean })
                }
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured Product
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sizes *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <Button
                  key={size}
                  type="button"
                  variant={formData.sizes.includes(size) ? 'default' : 'outline'}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      sizes: prev.sizes.includes(size)
                        ? prev.sizes.filter((s) => s !== size)
                        : [...prev.sizes, size],
                    }));
                  }}
                >
                  {size}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {homepageSections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Show on homepage</CardTitle>
              <p className="text-sm text-muted-foreground font-normal">Tick sections where this product should appear.</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {homepageSections.map((section) => (
                  <div key={section._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`section-${section._id}`}
                      checked={showInSectionIds.includes(section._id)}
                      onCheckedChange={() => toggleShowInSection(section._id)}
                    />
                    <Label htmlFor={`section-${section._id}`} className="cursor-pointer text-sm font-normal">
                      {section.title || section.type}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Colors *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {COLORS.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={color}
                    checked={formData.colors.includes(color)}
                    onCheckedChange={(checked) => {
                      setFormData((prev) => ({
                        ...prev,
                        colors: checked
                          ? [...prev.colors, color]
                          : prev.colors.filter((c) => c !== color),
                      }));
                    }}
                  />
                  <Label htmlFor={color} className="cursor-pointer">
                    {color}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="images" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  {uploadingImages ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload more images
                      </p>
                    </>
                  )}
                </div>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                />
              </Label>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={url} alt={`Product ${index + 1}`} className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
