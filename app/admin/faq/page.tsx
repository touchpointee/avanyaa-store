'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Loader2, Plus, Trash2, ChevronDown, ChevronUp,
  Truck, RotateCcw, Ruler, CreditCard, HelpCircle,
  Package, ShieldCheck, Star, Sparkles,
} from 'lucide-react';

/* ── Icon map ── */
const ICON_OPTIONS = [
  { value: 'truck', label: 'Truck (Delivery)', Icon: Truck },
  { value: 'rotateCCW', label: 'Return Arrow', Icon: RotateCcw },
  { value: 'ruler', label: 'Ruler (Sizing)', Icon: Ruler },
  { value: 'creditCard', label: 'Credit Card (Payment)', Icon: CreditCard },
  { value: 'helpCircle', label: 'Help Circle', Icon: HelpCircle },
  { value: 'package', label: 'Package', Icon: Package },
  { value: 'shieldCheck', label: 'Shield', Icon: ShieldCheck },
  { value: 'star', label: 'Star', Icon: Star },
  { value: 'sparkles', label: 'Sparkles', Icon: Sparkles },
];

const ICON_MAP: Record<string, React.ElementType> = {
  truck: Truck, rotateCCW: RotateCcw, ruler: Ruler, creditCard: CreditCard,
  helpCircle: HelpCircle, package: Package, shieldCheck: ShieldCheck,
  star: Star, sparkles: Sparkles,
};

/* ── Category colors (matches frontend) ── */
const CAT_COLORS = [
  { text: 'text-blue-600', bg: 'bg-blue-50', iconBg: 'bg-blue-100', border: 'border-blue-200' },
  { text: 'text-rose-600', bg: 'bg-rose-50', iconBg: 'bg-rose-100', border: 'border-rose-200' },
  { text: 'text-violet-600', bg: 'bg-violet-50', iconBg: 'bg-violet-100', border: 'border-violet-200' },
  { text: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', border: 'border-emerald-200' },
  { text: 'text-amber-600', bg: 'bg-amber-50', iconBg: 'bg-amber-100', border: 'border-amber-200' },
  { text: 'text-pink-600', bg: 'bg-pink-50', iconBg: 'bg-pink-100', border: 'border-pink-200' },
];

/* ── Types ── */
interface FaqItem { q: string; a: string; }
interface FaqCategory { category: string; icon: string; faqs: FaqItem[]; }

const DEFAULT_FAQS: FaqCategory[] = [
  {
    category: 'Orders & Delivery', icon: 'truck',
    faqs: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 4–7 business days across India.' },
      { q: 'Do you offer Cash on Delivery?', a: 'Yes, COD is available for orders across India.' },
    ],
  },
  {
    category: 'Returns & Exchanges', icon: 'rotateCCW',
    faqs: [
      { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery.' },
    ],
  },
];

/* ── Icon picker ── */
function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ICON_OPTIONS.map(o => (
          <SelectItem key={o.value} value={o.value}>
            <span className="flex items-center gap-2"><o.Icon className="h-4 w-4" />{o.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminFaqPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<FaqCategory[]>(DEFAULT_FAQS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { if (data.faqCategories?.length) setCategories(data.faqCategories); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Category helpers ── */
  const updateCat = (ci: number, field: keyof FaqCategory, val: string) =>
    setCategories(prev => prev.map((c, i) => i === ci ? { ...c, [field]: val } : c));

  const addCategory = () => setCategories(prev => [
    ...prev,
    { category: 'New Category', icon: 'helpCircle', faqs: [{ q: 'Question?', a: 'Answer.' }] },
  ]);

  const removeCategory = (ci: number) => setCategories(prev => prev.filter((_, i) => i !== ci));

  const moveCategory = (ci: number, dir: -1 | 1) => {
    const next = [...categories];
    const to = ci + dir;
    if (to < 0 || to >= next.length) return;
    [next[ci], next[to]] = [next[to], next[ci]];
    setCategories(next);
    setExpanded(to);
  };

  /* ── FAQ item helpers ── */
  const updateFaq = (ci: number, fi: number, field: keyof FaqItem, val: string) =>
    setCategories(prev => prev.map((c, i) => i !== ci ? c : {
      ...c, faqs: c.faqs.map((f, j) => j === fi ? { ...f, [field]: val } : f),
    }));

  const addFaq = (ci: number) =>
    setCategories(prev => prev.map((c, i) => i !== ci ? c : {
      ...c, faqs: [...c.faqs, { q: 'New question?', a: 'Answer here.' }],
    }));

  const removeFaq = (ci: number, fi: number) =>
    setCategories(prev => prev.map((c, i) => i !== ci ? c : {
      ...c, faqs: c.faqs.filter((_, j) => j !== fi),
    }));

  const moveFaq = (ci: number, fi: number, dir: -1 | 1) => {
    const to = fi + dir;
    setCategories(prev => prev.map((c, i) => {
      if (i !== ci) return c;
      const faqs = [...c.faqs];
      if (to < 0 || to >= faqs.length) return c;
      [faqs[fi], faqs[to]] = [faqs[to], faqs[fi]];
      return { ...c, faqs };
    }));
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (categories.some(c => !c.category.trim())) {
      toast({ title: 'Category name required', variant: 'destructive' }); return;
    }
    if (categories.some(c => c.faqs.some(f => !f.q.trim() || !f.a.trim()))) {
      toast({ title: 'All questions and answers must be filled in', variant: 'destructive' }); return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqCategories: categories }),
      });
      if (res.ok) toast({ title: '✅ FAQ saved!', description: 'FAQ page updated.' });
      else { const d = await res.json(); toast({ title: 'Error', description: d.error, variant: 'destructive' }); }
    } catch { toast({ title: 'Network error', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FAQ Editor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit the FAQ categories and questions that appear on <strong>/faq</strong>.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save All
        </Button>
      </div>

      {/* Live mini-preview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Preview — Category tabs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => {
              const color = CAT_COLORS[i % CAT_COLORS.length];
              const Icon = ICON_MAP[cat.icon] || HelpCircle;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${color.bg} ${color.border} ${color.text}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.category} <span className="opacity-60">({cat.faqs.length})</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category editors */}
      <div className="space-y-4">
        {categories.map((cat, ci) => {
          const color = CAT_COLORS[ci % CAT_COLORS.length];
          const Icon = ICON_MAP[cat.icon] || HelpCircle;
          const isOpen = expanded === ci;
          return (
            <Card key={ci} className={`overflow-hidden border-2 ${isOpen ? color.border : 'border-border'}`}>
              {/* Category header row */}
              <div
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${isOpen ? `${color.bg}` : 'hover:bg-muted/30'} transition-colors`}
                onClick={() => setExpanded(isOpen ? null : ci)}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color.iconBg}`}>
                  <Icon className={`h-4 w-4 ${color.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${color.text}`}>{cat.category}</p>
                  <p className="text-xs text-muted-foreground">{cat.faqs.length} question{cat.faqs.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveCategory(ci, -1)} disabled={ci === 0} title="Move up">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveCategory(ci, 1)} disabled={ci === categories.length - 1} title="Move down">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeCategory(ci)} disabled={categories.length <= 1} title="Delete category">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </div>

              {/* Expanded content */}
              {isOpen && (
                <CardContent className="p-4 space-y-5 border-t border-border">
                  {/* Category name + icon */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Category Name</Label>
                      <Input value={cat.category} onChange={e => updateCat(ci, 'category', e.target.value)} placeholder="e.g. Orders & Delivery" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Icon</Label>
                      <IconSelect value={cat.icon} onChange={val => updateCat(ci, 'icon', val)} />
                    </div>
                  </div>

                  {/* FAQ items */}
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Questions</p>
                    {cat.faqs.map((faq, fi) => (
                      <div key={fi} className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Q {fi + 1}</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveFaq(ci, fi, -1)} disabled={fi === 0}><ChevronUp className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveFaq(ci, fi, 1)} disabled={fi === cat.faqs.length - 1}><ChevronDown className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeFaq(ci, fi)} disabled={cat.faqs.length <= 1}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Question</Label>
                          <Input value={faq.q} onChange={e => updateFaq(ci, fi, 'q', e.target.value)} placeholder="e.g. How long does delivery take?" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Answer</Label>
                          <textarea
                            value={faq.a}
                            onChange={e => updateFaq(ci, fi, 'a', e.target.value)}
                            rows={2}
                            placeholder="Type the answer here…"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full border-dashed mt-1" onClick={() => addFaq(ci)}>
                      <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Question
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add category */}
      <Button variant="outline" className="w-full border-dashed" onClick={addCategory}>
        <Plus className="h-4 w-4 mr-2" /> Add FAQ Category
      </Button>

      {/* Sticky save */}
      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sticky bottom-4 shadow-xl">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save All Changes
      </Button>
    </div>
  );
}
