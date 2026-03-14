'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Plus, Pencil, GripVertical, LayoutDashboard,
  TrendingUp, Sparkles, Tag, ImageIcon, Maximize2,
  Layers, RefreshCw, Eye, EyeOff,
} from 'lucide-react';

interface Section {
  _id: string;
  type: string;
  title: string;
  order: number;
  active: boolean;
  linkedProductIds: string[];
  categoryId: string | null;
}

/* ─── Config per section type ─────────────────────── */
const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  hero:                { label: 'Hero',               icon: <LayoutDashboard className="h-4 w-4" />, color: 'text-violet-700', bg: 'bg-violet-100' },
  featured_categories: { label: 'Featured Categories',icon: <Layers className="h-4 w-4" />,          color: 'text-blue-700',   bg: 'bg-blue-100'   },
  trending:            { label: 'Trending',            icon: <TrendingUp className="h-4 w-4" />,      color: 'text-rose-700',   bg: 'bg-rose-100'   },
  new_arrivals:        { label: 'New Arrivals',        icon: <Sparkles className="h-4 w-4" />,        color: 'text-amber-700',  bg: 'bg-amber-100'  },
  promo:               { label: 'Promo Banner',        icon: <Tag className="h-4 w-4" />,             color: 'text-green-700',  bg: 'bg-green-100'  },
  category:            { label: 'Category Section',   icon: <Layers className="h-4 w-4" />,          color: 'text-cyan-700',   bg: 'bg-cyan-100'   },
  big_size:            { label: 'Big Size',            icon: <Maximize2 className="h-4 w-4" />,       color: 'text-orange-700', bg: 'bg-orange-100' },
  banner:              { label: 'Full Banner',         icon: <ImageIcon className="h-4 w-4" />,       color: 'text-pink-700',   bg: 'bg-pink-100'   },
  semi_banner:         { label: 'Semi Banner',         icon: <ImageIcon className="h-4 w-4" />,       color: 'text-indigo-700', bg: 'bg-indigo-100' },
};

export default function AdminHomepagePage() {
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => { fetchSections(); }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/homepage-sections');
      if (res.ok) {
        const data = await res.json();
        setSections(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  // Optimistic active toggle
  const toggleActive = async (section: Section) => {
    setTogglingId(section._id);
    const newActive = !section.active;
    setSections(prev => prev.map(s => s._id === section._id ? { ...s, active: newActive } : s));
    try {
      await fetch(`/api/homepage-sections/${section._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive }),
      });
    } catch {
      setSections(prev => prev.map(s => s._id === section._id ? { ...s, active: !newActive } : s));
      toast({ title: 'Failed to update', variant: 'destructive' });
    } finally { setTogglingId(null); }
  };

  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const activeCount = sections.filter(s => s.active).length;

  return (
    <div className="space-y-7">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Homepage Manager</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {sections.length} section{sections.length !== 1 ? 's' : ''} · {activeCount} active
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={fetchSections} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/homepage/new">
              <Plus className="h-4 w-4 mr-1.5" /> Add Section
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Sections list ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 animate-pulse flex items-center gap-4">
              <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-40 rounded" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <LayoutDashboard className="h-12 w-12 opacity-25" />
          <p className="font-medium">No homepage sections yet</p>
          <p className="text-sm">Add sections like Trending, New Arrivals or Banners to build your homepage.</p>
          <Button asChild className="mt-2" size="sm">
            <Link href="/admin/homepage/new"><Plus className="h-4 w-4 mr-1.5" /> Add First Section</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((section) => {
            const cfg = TYPE_CONFIG[section.type] || { label: section.type, icon: <Layers className="h-4 w-4" />, color: 'text-primary', bg: 'bg-primary/10' };
            const meta: string[] = [];
            if (section.type === 'big_size') meta.push('Auto — XL/XXL products');
            else {
              if (section.linkedProductIds?.length) meta.push(`${section.linkedProductIds.length} product${section.linkedProductIds.length !== 1 ? 's' : ''}`);
              if (section.categoryId) meta.push('Category linked');
            }

            return (
              <div
                key={section._id}
                className={`rounded-2xl border bg-card transition-all ${section.active ? 'border-border' : 'border-border/50 opacity-70'}`}
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Drag handle */}
                  <GripVertical className="h-5 w-5 text-muted-foreground/40 shrink-0 cursor-grab" />

                  {/* Type icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">{section.title || '(No title)'}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {!section.active && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>Order: <strong>{section.order}</strong></span>
                      {meta.map((m, i) => <span key={i}>· {m}</span>)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Active toggle */}
                    <button
                      type="button"
                      title={section.active ? 'Hide section' : 'Show section'}
                      disabled={togglingId === section._id}
                      onClick={() => toggleActive(section)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${
                        section.active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                      }`}
                    >
                      {section.active
                        ? <><Eye className="h-3.5 w-3.5" /> Live</>
                        : <><EyeOff className="h-3.5 w-3.5" /> Hidden</>}
                    </button>

                    {/* Edit */}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/homepage/edit/${section._id}`}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
