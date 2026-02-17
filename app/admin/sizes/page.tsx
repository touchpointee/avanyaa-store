'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SizeRecord {
  _id: string;
  name: string;
  sortOrder: number;
  isBigSize: boolean;
}

export default function AdminSizesPage() {
  const { toast } = useToast();
  const [sizes, setSizes] = useState<SizeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addIsBigSize, setAddIsBigSize] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editIsBigSize, setEditIsBigSize] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    try {
      const res = await fetch('/api/sizes');
      if (res.ok) {
        const data = await res.json();
        setSizes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!addName.trim()) {
      toast({ title: 'Enter a size name', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/sizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addName.trim(), isBigSize: addIsBigSize }),
      });
      if (res.ok) {
        const created = await res.json();
        setSizes((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
        setAddOpen(false);
        setAddName('');
        setAddIsBigSize(false);
        toast({ title: 'Size added' });
      } else {
        const err = await res.json();
        toast({ title: err.error || 'Failed to add size', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (s: SizeRecord) => {
    setEditId(s._id);
    setEditName(s.name);
    setEditSortOrder(s.sortOrder);
    setEditIsBigSize(s.isBigSize);
  };

  const handleEdit = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/sizes/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          sortOrder: editSortOrder,
          isBigSize: editIsBigSize,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSizes((prev) =>
          prev.map((x) => (x._id === editId ? updated : x)).sort((a, b) => a.sortOrder - b.sortOrder)
        );
        setEditId(null);
        toast({ title: 'Size updated' });
      } else {
        const err = await res.json();
        toast({ title: err.error || 'Failed to update', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/sizes/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setSizes((s) => s.filter((x) => x._id !== deleteId));
        toast({ title: 'Size deleted' });
      } else {
        toast({ title: 'Delete failed', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setDeleteId(null);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Size Management</h2>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Size
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">
        Sizes are used in product forms and the store filter. Mark &quot;Big Size&quot; for sizes that appear in the Big Size section (e.g. XL, XXL).
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sizes.map((s) => (
          <Card key={s._id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Order: {s.sortOrder}</p>
                  {s.isBigSize && (
                    <Badge variant="secondary" className="mt-1">Big Size</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteId(s._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sizes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No sizes yet. Default sizes will be created when you first load the products page or filter. You can also add sizes above.
          </CardContent>
        </Card>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Size</DialogTitle>
            <DialogDescription>Size name (e.g. S, M, XL). It will be shown in product form and filters.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Name</Label>
              <Input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. XXL"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="add-big"
                checked={addIsBigSize}
                onCheckedChange={(c) => setAddIsBigSize(!!c)}
              />
              <Label htmlFor="add-big">Show in Big Size section</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Size</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. XXL"
              />
            </div>
            <div>
              <Label>Sort order</Label>
              <Input
                type="number"
                value={editSortOrder}
                onChange={(e) => setEditSortOrder(parseInt(e.target.value, 10) || 0)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-big"
                checked={editIsBigSize}
                onCheckedChange={(c) => setEditIsBigSize(!!c)}
              />
              <Label htmlFor="edit-big">Show in Big Size section</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete size?</AlertDialogTitle>
          <AlertDialogDescription>
            Products that use this size will keep it in their list. You can remove it when editing those products.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
