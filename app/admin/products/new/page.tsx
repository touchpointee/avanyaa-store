'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, X, Plus } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: '',
    categoryId: '',
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as string[],
    featured: false,
    variants: [] as { size: string; color: string; stock: string | number }[],
    colorImages: [] as { color: string; image: string }[],
  });

  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string; slug: string }[]>([]);
  const [homepageSections, setHomepageSections] = useState<{ _id: string; title: string; type: string; linkedProductIds: { _id: string }[] }[]>([]);
  const [showInSectionIds, setShowInSectionIds] = useState<string[]>([]);

  const sectionTypesWithProducts = ['trending', 'new_arrivals', 'promo', 'category'];

  useEffect(() => {
    fetch('/api/sizes')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setSizes(data.map((s: { name: string }) => s.name)))
      .catch(() => setSizes([]));
  }, []);

  useEffect(() => {
    fetch('/api/colors')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setColors(Array.isArray(data) ? data.map((c: { name: string; hex: string }) => ({ name: c.name, hex: c.hex })) : []))
      .catch(() => setColors([]));
  }, []);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
        if (list.length > 0) {
          setFormData((prev) =>
            prev.categoryId ? prev : { ...prev, category: list[0].name, categoryId: list[0]._id }
          );
        }
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetch('/api/homepage-sections')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setHomepageSections(list.filter((s: { type: string }) => sectionTypesWithProducts.includes(s.type)));
      })
      .catch(() => setHomepageSections([]));
  }, []);

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
    const removedUrl = formData.images[index];
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      colorImages: prev.colorImages.filter((ci) => ci.image !== removedUrl),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.images.length === 0) {
      toast({
        title: 'No images',
        description: 'Please upload at least one image',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (formData.sizes.length === 0) {
      toast({
        title: 'No sizes',
        description: 'Please select at least one size',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category: formData.category,
          categoryId: formData.categoryId || undefined,
          price: parseFloat(formData.price),
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
          stock: formData.variants.reduce((sum, v) => sum + (parseInt(String(v.stock)) || 0), 0),
          variants: formData.variants.map(v => ({ ...v, stock: parseInt(String(v.stock)) || 0 })),
          colorImages: formData.colorImages,
        }),
      });

      if (response.ok) {
        const created = await response.json();
        const newProductId = created._id;
        for (const sectionId of showInSectionIds) {
          const section = homepageSections.find((s) => s._id === sectionId);
          if (section) {
            const currentIds = (section.linkedProductIds || []).map((p: any) => (typeof p === 'object' ? p._id : p));
            if (!currentIds.includes(newProductId)) {
              await fetch(`/api/homepage-sections/${sectionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkedProductIds: [...currentIds, newProductId] }),
              });
            }
          }
        }
        toast({
          title: 'Product created',
          description: 'Product has been created successfully',
        });
        router.push('/admin/products');
      } else {
        const data = await response.json();
        toast({
          title: 'Failed to create product',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleShowInSection = (sectionId: string) => {
    setShowInSectionIds((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  return (
    <div className="max-w-3xl pb-20">
      <h2 className="text-3xl font-bold mb-6">Add New Product</h2>

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
                value={formData.categoryId}
                onValueChange={(value) => {
                  const cat = categories.find((c) => c._id === value);
                  setFormData({ ...formData, categoryId: value, category: cat?.name ?? '' });
                }}
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
              {categories.length === 0 && (
                <p className="text-xs text-muted-foreground">No categories yet. Add them in Admin → Categories.</p>
              )}
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
            {sizes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading sizes…</p>
            ) : (
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
            )}
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
            {colors.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading colours…</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {colors.map((color) => (
                  <div key={color.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color.name}`}
                      checked={formData.colors.includes(color.name)}
                      onCheckedChange={(checked) => {
                        setFormData((prev) => ({
                          ...prev,
                          colors: checked
                            ? [...prev.colors, color.name]
                            : prev.colors.filter((c) => c !== color.name),
                        }));
                      }}
                    />
                    <div
                      className="h-4 w-4 rounded-full border border-border shadow-sm shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <Label htmlFor={`color-${color.name}`} className="cursor-pointer">
                      {color.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variants & Stock</CardTitle>
            <p className="text-sm text-muted-foreground">Manage stock for specific sizes and colors.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Total Stock — auto-calculated, read-only */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex-1 space-y-1">
                <Label className="text-sm font-semibold">Total Stock</Label>
                <p className="text-xs text-muted-foreground">Auto-calculated from the sum of all variant stocks below.</p>
              </div>
              <div className="w-32 h-10 rounded-md border border-border bg-background px-3 flex items-center justify-center font-bold text-lg select-none">
                {formData.variants.reduce((sum, v) => sum + (parseInt(String(v.stock)) || 0), 0)}
              </div>
            </div>
            <div className="border-b border-border" />
            {formData.variants.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                  <div>Size</div>
                  <div>Color</div>
                  <div>Stock</div>
                  <div></div>
                </div>
                {formData.variants.map((v, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-4 items-center">
                    <Select
                      value={v.size || undefined}
                      onValueChange={(val) => {
                        const newVariants = [...formData.variants];
                        newVariants[idx].size = val;
                        setFormData({ ...formData, variants: newVariants });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.sizes.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={v.color || undefined}
                      onValueChange={(val) => {
                        const newVariants = [...formData.variants];
                        newVariants[idx].color = val;
                        setFormData({ ...formData, variants: newVariants });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.colors.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="0"
                      value={String(v.stock)}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[idx] = { ...newVariants[idx], stock: e.target.value };
                        setFormData({ ...formData, variants: newVariants });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive w-fit"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          variants: formData.variants.filter((_, i) => i !== idx)
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No variants added yet.</p>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={() => {
                setFormData({
                  ...formData,
                  variants: [...formData.variants, { size: formData.sizes[0] || '', color: formData.colors[0] || '', stock: '' }]
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Variant
            </Button>
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
                        Click to upload images
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

        {/* Color → Image Mapping */}
        {formData.colors.length > 0 && formData.images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Color → Image Mapping</CardTitle>
              <p className="text-sm text-muted-foreground">Assign a specific image to each color. When a customer selects a color, that image will be shown automatically.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.colors.map((color) => {
                const mapped = formData.colorImages.find((ci) => ci.color === color);
                return (
                  <div key={color} className="flex items-center gap-4">
                    <span className="w-20 text-sm font-medium shrink-0">{color}</span>
                    <Select
                      value={mapped?.image || '__none__'}
                      onValueChange={(val) => {
                        setFormData((prev) => {
                          const rest = prev.colorImages.filter((ci) => ci.color !== color);
                          if (val === '__none__') return { ...prev, colorImages: rest };
                          return { ...prev, colorImages: [...rest, { color, image: val }] };
                        });
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="No image assigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— No image assigned —</SelectItem>
                        {formData.images.map((url, idx) => (
                          <SelectItem key={url} value={url}>
                            Image {idx + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {mapped?.image && (
                      <img src={mapped.image} alt={color} className="w-12 h-12 rounded-lg object-cover border shrink-0" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Product
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
