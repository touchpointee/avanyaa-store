'use client';

import { useEffect, useState } from 'react';
import { ProductWithId } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Pencil, Trash2, LayoutGrid, List, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/products/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Product deleted',
          description: 'Product has been deleted successfully',
        });
        setProducts(products.filter((p) => p._id !== deleteId));
      } else {
        toast({
          title: 'Delete failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-shrink-0">
          <h2 className="text-3xl font-bold">Products</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage your storefront catalog.</p>
        </div>
        <div className="flex flex-1 items-center gap-2 w-full md:max-w-lg lg:max-w-2xl justify-end">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 w-full bg-muted/50 focus-visible:bg-background"
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex flex-shrink-0 items-center bg-muted p-1 rounded-lg border border-border">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Button asChild className="flex-shrink-0">
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card 
              key={product._id} 
              className="cursor-pointer group hover:shadow-md transition-shadow hover:border-primary/50"
              onClick={() => router.push(`/admin/products/edit/${product._id}`)}
            >
              <CardContent className="p-4">
                <div className="relative h-40 rounded-lg overflow-hidden bg-muted mb-3">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                      <Badge variant="secondary" className="mt-1 capitalize">
                        {product.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatPrice(product.price)}</span>
                    {(() => {
                      const totalStock = product.variants?.length 
                        ? product.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0) 
                        : 0;
                      const label = totalStock === 0 ? 'Out of Stock' : `Stock: ${totalStock}`;
                      const color =
                        totalStock === 0
                          ? 'bg-red-100 text-red-700'
                          : totalStock <= 5
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700';
                      return (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
                          {label}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => { e.stopPropagation(); router.push(`/admin/products/edit/${product._id}`); }}
                    >
                      <Pencil className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setDeleteId(product._id); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="bg-muted/40 p-4 border-b border-border">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              <div>Product</div>
              <div className="hidden md:block w-32">Category</div>
              <div className="hidden sm:block w-32">Status</div>
              <div className="w-24 text-right">Actions</div>
            </div>
          </div>
          <div className="divide-y divide-border">
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {searchTerm ? 'No products match your search.' : 'No products found.'}
              </div>
            ) : (
              filteredProducts.map((product) => {
                const totalStock = product.variants?.length 
                  ? product.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0) 
                  : 0;
                const isOutOfStock = totalStock === 0;
                
                return (
                  <div 
                    key={product._id} 
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-4 items-center group hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/products/edit/${product._id}`)}
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted border border-border shrink-0">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground uppercase">Img</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-foreground truncate">{product.name}</div>
                        <div className="text-sm font-medium text-muted-foreground">{formatPrice(product.price)}</div>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex w-32 items-center">
                      <Badge variant="secondary" className="capitalize bg-muted/60">{product.category}</Badge>
                    </div>

                    <div className="hidden sm:flex w-32 items-center">
                       <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${
                         isOutOfStock 
                           ? 'bg-red-50 text-red-700 border-red-200' 
                           : totalStock <= 5 
                           ? 'bg-amber-50 text-amber-700 border-amber-200'
                           : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                       }`}>
                         {isOutOfStock ? 'Out of Stock' : `Stock: ${totalStock}`}
                       </span>
                    </div>

                    <div className="flex w-24 items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); router.push(`/admin/products/edit/${product._id}`); }}>
                         <Pencil className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(product._id); }}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
