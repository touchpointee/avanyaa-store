'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Pencil, Trash2, Ruler, Palette } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

/* ── Types ── */
interface SizeRecord { _id: string; name: string; sortOrder: number; isBigSize: boolean; }
interface ColorRecord { _id: string; name: string; hex: string; sortOrder: number; }

/* ── Hex contrast helper ── */
function isLight(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export default function AdminSizesAndColorsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'sizes' | 'colors'>('sizes');

  /* ── Sizes state ── */
  const [sizes, setSizes] = useState<SizeRecord[]>([]);
  const [loadingSizes, setLoadingSizes] = useState(true);
  const [deleteSizeId, setDeleteSizeId] = useState<string | null>(null);
  const [editSizeId, setEditSizeId] = useState<string | null>(null);
  const [addSizeOpen, setAddSizeOpen] = useState(false);
  const [addSizeName, setAddSizeName] = useState('');
  const [addIsBigSize, setAddIsBigSize] = useState(false);
  const [editSizeName, setEditSizeName] = useState('');
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editIsBigSize, setEditIsBigSize] = useState(false);
  const [savingSize, setSavingSize] = useState(false);

  /* ── Colors state ── */
  const [colors, setColors] = useState<ColorRecord[]>([]);
  const [loadingColors, setLoadingColors] = useState(true);
  const [deleteColorId, setDeleteColorId] = useState<string | null>(null);
  const [editColorId, setEditColorId] = useState<string | null>(null);
  const [addColorOpen, setAddColorOpen] = useState(false);
  const [addColorName, setAddColorName] = useState('');
  const [addColorHex, setAddColorHex] = useState('#000000');
  const [editColorName, setEditColorName] = useState('');
  const [editColorHex, setEditColorHex] = useState('#000000');
  const [editColorSort, setEditColorSort] = useState(0);
  const [savingColor, setSavingColor] = useState(false);

  /* ── Fetch on mount ── */
  useEffect(() => { fetchSizes(); fetchColors(); }, []);

  /* ════════ SIZE CRUD ════════ */
  const fetchSizes = async () => {
    try {
      const res = await fetch('/api/sizes');
      if (res.ok) setSizes(await res.json());
    } catch { } finally { setLoadingSizes(false); }
  };

  const handleAddSize = async () => {
    if (!addSizeName.trim()) { toast({ title: 'Enter a size name', variant: 'destructive' }); return; }
    setSavingSize(true);
    try {
      const res = await fetch('/api/sizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addSizeName.trim(), isBigSize: addIsBigSize }),
      });
      if (res.ok) {
        const created = await res.json();
        setSizes(prev => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
        setAddSizeOpen(false); setAddSizeName(''); setAddIsBigSize(false);
        toast({ title: 'Size added' });
      } else { const e = await res.json(); toast({ title: e.error || 'Failed', variant: 'destructive' }); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setSavingSize(false); }
  };

  const openEditSize = (s: SizeRecord) => {
    setEditSizeId(s._id); setEditSizeName(s.name); setEditSortOrder(s.sortOrder); setEditIsBigSize(s.isBigSize);
  };

  const handleEditSize = async () => {
    if (!editSizeId) return;
    setSavingSize(true);
    try {
      const res = await fetch(`/api/sizes/${editSizeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editSizeName.trim(), sortOrder: editSortOrder, isBigSize: editIsBigSize }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSizes(prev => prev.map(x => x._id === editSizeId ? updated : x).sort((a, b) => a.sortOrder - b.sortOrder));
        setEditSizeId(null);
        toast({ title: 'Size updated' });
      } else { const e = await res.json(); toast({ title: e.error || 'Failed', variant: 'destructive' }); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setSavingSize(false); }
  };

  const handleDeleteSize = async () => {
    if (!deleteSizeId) return;
    try {
      const res = await fetch(`/api/sizes/${deleteSizeId}`, { method: 'DELETE' });
      if (res.ok) { setSizes(s => s.filter(x => x._id !== deleteSizeId)); toast({ title: 'Size deleted' }); }
      else toast({ title: 'Delete failed', variant: 'destructive' });
    } catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setDeleteSizeId(null); }
  };

  /* ════════ COLOR CRUD ════════ */
  const fetchColors = async () => {
    try {
      const res = await fetch('/api/colors');
      if (res.ok) setColors(await res.json());
    } catch { } finally { setLoadingColors(false); }
  };

  const handleAddColor = async () => {
    if (!addColorName.trim()) { toast({ title: 'Enter a color name', variant: 'destructive' }); return; }
    setSavingColor(true);
    try {
      const res = await fetch('/api/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addColorName.trim(), hex: addColorHex }),
      });
      if (res.ok) {
        const created = await res.json();
        setColors(prev => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
        setAddColorOpen(false); setAddColorName(''); setAddColorHex('#000000');
        toast({ title: 'Color added' });
      } else { const e = await res.json(); toast({ title: e.error || 'Failed', variant: 'destructive' }); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setSavingColor(false); }
  };

  const openEditColor = (c: ColorRecord) => {
    setEditColorId(c._id); setEditColorName(c.name); setEditColorHex(c.hex); setEditColorSort(c.sortOrder);
  };

  const handleEditColor = async () => {
    if (!editColorId) return;
    setSavingColor(true);
    try {
      const res = await fetch(`/api/colors/${editColorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editColorName.trim(), hex: editColorHex, sortOrder: editColorSort }),
      });
      if (res.ok) {
        const updated = await res.json();
        setColors(prev => prev.map(x => x._id === editColorId ? updated : x).sort((a, b) => a.sortOrder - b.sortOrder));
        setEditColorId(null);
        toast({ title: 'Color updated' });
      } else { const e = await res.json(); toast({ title: e.error || 'Failed', variant: 'destructive' }); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setSavingColor(false); }
  };

  const handleDeleteColor = async () => {
    if (!deleteColorId) return;
    try {
      const res = await fetch(`/api/colors/${deleteColorId}`, { method: 'DELETE' });
      if (res.ok) { setColors(c => c.filter(x => x._id !== deleteColorId)); toast({ title: 'Color deleted' }); }
      else toast({ title: 'Delete failed', variant: 'destructive' });
    } catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setDeleteColorId(null); }
  };

  /* ── Render ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Size & Colour</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage sizes and colours used across all products.</p>
        </div>
        {tab === 'sizes' ? (
          <Button onClick={() => setAddSizeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Size
          </Button>
        ) : (
          <Button onClick={() => setAddColorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Colour
          </Button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          onClick={() => setTab('sizes')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'sizes' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Ruler className="h-4 w-4" /> Sizes
        </button>
        <button
          onClick={() => setTab('colors')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'colors' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Palette className="h-4 w-4" /> Colours
        </button>
      </div>

      {/* ════ SIZES TAB ════ */}
      {tab === 'sizes' && (
        <>
          <p className="text-muted-foreground text-sm">
            Sizes appear in product forms and store filters. Mark <strong>&quot;Big Size&quot;</strong> for plus-size entries (e.g. XL, XXL).
          </p>
          {loadingSizes ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-4 border-b border-border bg-muted/40 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  <div>Size Name</div>
                  <div className="hidden sm:block w-32">Classification</div>
                  <div className="hidden sm:block w-24 text-center">Sort Order</div>
                  <div className="w-20 text-right">Actions</div>
                </div>
                <div className="divide-y divide-border">
                  {sizes.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">No sizes yet. Click &quot;Add Size&quot; to create one.</div>
                  ) : (
                    sizes.map((s) => (
                      <div key={s._id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-4 items-center group hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 px-4 min-w-[3rem] rounded-md bg-muted/50 border border-border flex items-center justify-center font-bold text-sm text-foreground shadow-sm">
                            {s.name}
                          </div>
                        </div>
                        <div className="hidden sm:flex w-32 items-center">
                           {s.isBigSize ? (
                             <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20">Plus Size</Badge>
                           ) : (
                             <span className="text-sm text-muted-foreground/50">-</span>
                           )}
                        </div>
                        <div className="hidden sm:flex w-24 items-center justify-center text-sm text-muted-foreground font-mono bg-muted/30 rounded-md py-1 px-2 border border-transparent group-hover:border-border transition-colors">
                           {s.sortOrder}
                        </div>
                        <div className="flex w-20 items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEditSize(s)}>
                             <Pencil className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteSizeId(s._id)}>
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ════ COLORS TAB ════ */}
      {tab === 'colors' && (
        <>
          <p className="text-muted-foreground text-sm">
            Colours appear in product forms for variant selection. The hex code is shown as a colour swatch on the product page.
          </p>
          {loadingColors ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-4 border-b border-border bg-muted/40 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  <div>Colour Name</div>
                  <div className="hidden sm:block w-32">Hex Code</div>
                  <div className="hidden sm:block w-24 text-center">Sort Order</div>
                  <div className="w-20 text-right">Actions</div>
                </div>
                <div className="divide-y divide-border">
                  {colors.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">No colours yet. Click &quot;Add Colour&quot; to create one.</div>
                  ) : (
                    colors.map((c) => (
                      <div key={c._id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-4 items-center group hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div 
                            className="h-10 w-10 min-w-10 rounded-full border-2 border-background shadow-md shadow-black/10 shrink-0" 
                            style={{ backgroundColor: c.hex }} 
                          />
                          <div className="font-bold text-sm text-foreground">
                            {c.name}
                          </div>
                        </div>
                        <div className="hidden sm:flex w-32 items-center">
                           <span className="text-sm text-muted-foreground font-mono bg-muted/50 rounded-md py-1 px-2 border border-border shadow-sm">
                             {c.hex.toUpperCase()}
                           </span>
                        </div>
                        <div className="hidden sm:flex w-24 items-center justify-center text-sm text-muted-foreground font-mono bg-muted/30 rounded-md py-1 px-2 border border-transparent group-hover:border-border transition-colors">
                           {c.sortOrder}
                        </div>
                        <div className="flex w-20 items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEditColor(c)}>
                             <Pencil className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteColorId(c._id)}>
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ════ SIZE DIALOGS ════ */}
      {/* Add size */}
      <Dialog open={addSizeOpen} onOpenChange={setAddSizeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Size</DialogTitle>
            <DialogDescription>Enter a size label (e.g. S, M, XL) for use in product forms and filters.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={addSizeName} onChange={e => setAddSizeName(e.target.value)} placeholder="e.g. XXL" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="add-big" checked={addIsBigSize} onCheckedChange={c => setAddIsBigSize(!!c)} />
              <Label htmlFor="add-big">Show in Big Size section</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSizeOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSize} disabled={savingSize}>
              {savingSize && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit size */}
      <Dialog open={!!editSizeId} onOpenChange={open => !open && setEditSizeId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Size</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editSizeName} onChange={e => setEditSizeName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={editSortOrder} onChange={e => setEditSortOrder(parseInt(e.target.value, 10) || 0)} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="edit-big" checked={editIsBigSize} onCheckedChange={c => setEditIsBigSize(!!c)} />
              <Label htmlFor="edit-big">Show in Big Size section</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSizeId(null)}>Cancel</Button>
            <Button onClick={handleEditSize} disabled={savingSize}>
              {savingSize && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete size */}
      <AlertDialog open={!!deleteSizeId} onOpenChange={open => !open && setDeleteSizeId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete size?</AlertDialogTitle>
          <AlertDialogDescription>Products using this size will keep it in their list. You can remove it when editing those products.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSize} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ════ COLOR DIALOGS ════ */}
      {/* Add color */}
      <Dialog open={addColorOpen} onOpenChange={setAddColorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Colour</DialogTitle>
            <DialogDescription>Enter a colour name and pick a hex code. This will appear as a swatch on product pages.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Colour Name</Label>
              <Input value={addColorName} onChange={e => setAddColorName(e.target.value)} placeholder="e.g. Midnight Blue" />
            </div>
            <div className="space-y-2">
              <Label>Hex Code</Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={addColorHex}
                  onChange={e => setAddColorHex(e.target.value)}
                  className="h-10 w-14 rounded-lg border border-input cursor-pointer p-0.5"
                />
                <Input
                  value={addColorHex}
                  onChange={e => setAddColorHex(e.target.value)}
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
              {/* Swatch preview */}
              <div className="flex items-center gap-2 mt-2">
                <div className="h-8 w-8 rounded-full border border-border shadow-sm" style={{ backgroundColor: addColorHex }} />
                <span className="text-sm text-muted-foreground">Preview</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddColorOpen(false)}>Cancel</Button>
            <Button onClick={handleAddColor} disabled={savingColor}>
              {savingColor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit color */}
      <Dialog open={!!editColorId} onOpenChange={open => !open && setEditColorId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Colour</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Colour Name</Label>
              <Input value={editColorName} onChange={e => setEditColorName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hex Code</Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={editColorHex}
                  onChange={e => setEditColorHex(e.target.value)}
                  className="h-10 w-14 rounded-lg border border-input cursor-pointer p-0.5"
                />
                <Input value={editColorHex} onChange={e => setEditColorHex(e.target.value)} className="font-mono" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-8 w-8 rounded-full border border-border shadow-sm" style={{ backgroundColor: editColorHex }} />
                <span className="text-sm text-muted-foreground">Preview</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={editColorSort} onChange={e => setEditColorSort(parseInt(e.target.value, 10) || 0)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditColorId(null)}>Cancel</Button>
            <Button onClick={handleEditColor} disabled={savingColor}>
              {savingColor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete color */}
      <AlertDialog open={!!deleteColorId} onOpenChange={open => !open && setDeleteColorId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete colour?</AlertDialogTitle>
          <AlertDialogDescription>Products using this colour will keep it in their list. You can remove it when editing those products.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteColor} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
