'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Tag, Pencil, Trash2, ArrowLeft, RefreshCw, LayoutDashboard } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProductTag {
  _id: string;
  tag: string;
  productIds: string[];
  createdAt: string;
}

export default function AdminTagsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTags(); }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tags');
      if (res.ok) {
        const data = await res.json();
        setTags(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Tag deleted successfully' });
        setTags(prev => prev.filter(t => t._id !== id));
      } else {
        toast({ title: 'Failed to delete tag', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error deleting tag', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <Link href="/admin/homepage" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Homepage
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Product Tags</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Create tags to group products, then use them as banner links (e.g. <code className="bg-muted px-1 rounded text-xs">/products?tag=your-tag</code>).
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={fetchTags} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/tags/new"><Plus className="h-4 w-4 mr-1.5" /> Create Tag</Link>
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 animate-pulse flex items-center gap-4">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2"><div className="skeleton h-4 w-40 rounded" /><div className="skeleton h-3 w-24 rounded" /></div>
            </div>
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Tag className="h-12 w-12 opacity-25" />
          <p className="font-medium">No custom tags yet</p>
          <Button asChild className="mt-2" size="sm">
            <Link href="/admin/tags/new"><Plus className="h-4 w-4 mr-1.5" /> Create First Tag</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tags.map((t) => (
            <div key={t._id} className="rounded-2xl border border-border bg-card transition-all">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">{t.tag}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.productIds.length} linked products</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/tags/${t._id}`}><Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit</Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 border-destructive/20">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete tag {t.tag}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this tag mapping. Banners using this link will stop filtering correctly.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(t._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
