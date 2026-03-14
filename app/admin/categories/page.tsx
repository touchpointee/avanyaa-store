'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, LayoutGrid, List, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  active: boolean;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/categories/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories((c) => c.filter((x) => x._id !== deleteId));
        toast({ title: 'Category deleted' });
      } else {
        toast({ title: 'Delete failed', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.slug.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h2 className="text-3xl font-bold">Category Management</h2>
          <p className="text-muted-foreground text-sm mt-1">Organize your storefront sections.</p>
        </div>
        <div className="flex flex-1 items-center gap-2 w-full md:max-w-lg lg:max-w-2xl justify-end">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search categories..."
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
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((cat) => (
            <Card 
              key={cat._id}
              className="cursor-pointer group hover:shadow-md transition-shadow hover:border-primary/50"
              onClick={() => router.push(`/admin/categories/edit/${cat._id}`)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {cat.image ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                      <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted shrink-0 flex items-center justify-center text-[10px] text-muted-foreground uppercase border border-border">
                      Img
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{cat.name}</p>
                    <p className="text-xs text-muted-foreground truncate font-mono mt-1">{cat.slug}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {!cat.active ? (
                        <Badge variant="outline" className="text-[10px] bg-muted/30">Inactive</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700">Active</Badge>
                      )}
                      <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-1.5 py-0.5 rounded">Order: {cat.order}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); router.push(`/admin/categories/edit/${cat._id}`); }}>
                    <Pencil className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteId(cat._id); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="bg-muted/40 p-4 border-b border-border">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              <div>Category</div>
              <div className="hidden sm:block w-24">Status</div>
              <div className="hidden sm:block w-24 text-center">Sort Order</div>
              <div className="w-20 text-right">Actions</div>
            </div>
          </div>
          <div className="divide-y divide-border">
            {filteredCategories.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {searchTerm ? 'No categories match your search.' : 'No categories yet. Add one to organize products.'}
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <div 
                  key={cat._id} 
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-4 items-center group hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/categories/edit/${cat._id}`)}
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted border border-border shrink-0">
                      {cat.image ? (
                        <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground uppercase">Img</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-foreground truncate">{cat.name}</div>
                      <div className="text-xs font-mono text-muted-foreground truncate">{cat.slug}</div>
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex w-24 items-center">
                    {!cat.active ? (
                      <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground">Inactive</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                    )}
                  </div>

                  <div className="hidden sm:flex w-24 items-center justify-center text-sm text-muted-foreground font-mono bg-muted/30 rounded-md py-1 px-2 border border-transparent group-hover:border-border transition-colors">
                     {cat.order}
                  </div>

                  <div className="flex w-20 items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); router.push(`/admin/categories/edit/${cat._id}`); }}>
                       <Pencil className="h-4 w-4" />
                     </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(cat._id); }}>
                       <Trash2 className="h-4 w-4" />
                     </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {categories.length === 0 && !searchTerm && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No categories yet. Add one to organize products and show on the homepage.
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
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
