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
  Heart, Sparkles, Shield, Leaf, Star, Truck,
  RotateCcw, Award, Globe, Users,
} from 'lucide-react';

/* ── Icon options ── */
const ICON_OPTIONS = [
  { value: 'heart',     label: 'Heart',     Icon: Heart },
  { value: 'sparkles',  label: 'Sparkles',  Icon: Sparkles },
  { value: 'shield',    label: 'Shield',    Icon: Shield },
  { value: 'leaf',      label: 'Leaf',      Icon: Leaf },
  { value: 'star',      label: 'Star',      Icon: Star },
  { value: 'truck',     label: 'Truck',     Icon: Truck },
  { value: 'rotateCCW', label: 'Return',    Icon: RotateCcw },
  { value: 'award',     label: 'Award',     Icon: Award },
  { value: 'globe',     label: 'Globe',     Icon: Globe },
  { value: 'users',     label: 'Users',     Icon: Users },
];

function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ICON_OPTIONS.map(o => (
          <SelectItem key={o.value} value={o.value}>
            <span className="flex items-center gap-2"><o.Icon className="h-4 w-4" /> {o.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ── Types ── */
interface ValueCard  { icon: string; title: string; desc: string; }
interface StatItem   { value: string; label: string; }
interface AboutContent {
  heroEyebrow: string;
  heroHeadline: string;
  heroSubtext: string;
  stats: StatItem[];
  storyHeading: string;
  storyParagraphs: string[];
  storyTagline: string;
  storyLocation: string;
  valuesHeading: string;
  valuesSubtext: string;
  values: ValueCard[];
  ctaHeading: string;
  ctaSubtext: string;
}

const DEFAULT: AboutContent = {
  heroEyebrow: 'Our Story',
  heroHeadline: 'Dressing Women.\nCelebrating Confidence.',
  heroSubtext: 'AVANYAA was born from a simple belief — every woman deserves to feel beautiful, every day, in clothing made just for her.',
  stats: [
    { value: '5,000+', label: 'Happy Customers' },
    { value: '200+', label: 'Styles Available' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '7-Day', label: 'Easy Returns' },
  ],
  storyHeading: 'Where It All Began',
  storyParagraphs: [
    'AVANYAA started as a small boutique in Murukkumpuzha, Thiruvananthapuram — a dream nurtured by a passion for fashion that feels personal.',
    'So we set out to build that brand ourselves. Every AVANYAA piece carries the care and attention of a small team that genuinely loves what it does.',
    'Today, we ship hundreds of orders every month — but our goal remains the same: make a woman feel effortlessly confident.',
  ],
  storyTagline: 'AVANYAA',
  storyLocation: 'Est. Murukkumpuzha, Thiruvananthapuram',
  valuesHeading: 'What We Stand For',
  valuesSubtext: 'Our values shape every decision — from which fabrics we source to how we handle returns.',
  values: [
    { icon: 'heart',    title: 'Made with Love',        desc: 'Every piece is thoughtfully curated with care for the woman who wears it.' },
    { icon: 'sparkles', title: 'Premium Quality',       desc: 'We work only with fabrics that meet our high standards — because you deserve the best.' },
    { icon: 'shield',   title: 'Trusted & Transparent', desc: 'Honest pricing, clear sizing, and a no-hassle return policy.' },
    { icon: 'leaf',     title: 'Mindful Fashion',       desc: 'Styles made to last, not just for a season.' },
  ],
  ctaHeading: 'Ready to Explore?',
  ctaSubtext: "Browse our latest collection or reach out — we'd love to help you find your perfect look.",
};

/* ── Reusable textarea ── */
function Textarea({ value, onChange, rows = 3, placeholder = '' }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

/* ── Section wrapper ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export default function AdminAboutPage() {
  const { toast } = useToast();
  const [data, setData] = useState<AboutContent>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings/about')
      .then(r => r.json())
      .then(d => { if (d?.heroHeadline) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof AboutContent>(key: K, val: AboutContent[K]) =>
    setData(prev => ({ ...prev, [key]: val }));

  const updateStat = (i: number, field: keyof StatItem, val: string) =>
    setData(prev => ({ ...prev, stats: prev.stats.map((s, j) => j === i ? { ...s, [field]: val } : s) }));

  const addStat = () => set('stats', [...data.stats, { value: '0+', label: 'New Metric' }]);
  const removeStat = (i: number) => set('stats', data.stats.filter((_, j) => j !== i));

  const updatePara = (i: number, val: string) =>
    setData(prev => ({ ...prev, storyParagraphs: prev.storyParagraphs.map((p, j) => j === i ? val : p) }));
  const addPara = () => set('storyParagraphs', [...data.storyParagraphs, '']);
  const removePara = (i: number) => set('storyParagraphs', data.storyParagraphs.filter((_, j) => j !== i));

  const updateValue = (i: number, field: keyof ValueCard, val: string) =>
    setData(prev => ({ ...prev, values: prev.values.map((v, j) => j === i ? { ...v, [field]: val } : v) }));
  const addValue = () => set('values', [...data.values, { icon: 'heart', title: 'New Value', desc: 'Description here.' }]);
  const removeValue = (i: number) => set('values', data.values.filter((_, j) => j !== i));
  const moveValue = (i: number, dir: -1 | 1) => {
    const arr = [...data.values];
    const to = i + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[i], arr[to]] = [arr[to], arr[i]];
    set('values', arr);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) toast({ title: '✅ About page saved!' });
      else { const e = await res.json(); toast({ title: 'Error', description: e.error, variant: 'destructive' }); }
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
          <h1 className="text-3xl font-bold">About Us Editor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All changes are reflected live on the <strong>/about</strong> page.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save All
        </Button>
      </div>

      {/* ── 1. Hero ── */}
      <Section title="🌟 Hero Section">
        <div className="space-y-1.5">
          <Label>Eyebrow text (small label above headline)</Label>
          <Input value={data.heroEyebrow} onChange={e => set('heroEyebrow', e.target.value)} placeholder="e.g. Our Story" />
        </div>
        <div className="space-y-1.5">
          <Label>Headline <span className="text-muted-foreground text-xs">(use a new line for line break)</span></Label>
          <Textarea value={data.heroHeadline} onChange={v => set('heroHeadline', v)} rows={2} placeholder="Dressing Women.\nCelebrating Confidence." />
        </div>
        <div className="space-y-1.5">
          <Label>Subtext paragraph</Label>
          <Textarea value={data.heroSubtext} onChange={v => set('heroSubtext', v)} rows={2} />
        </div>
      </Section>

      {/* ── 2. Stats ── */}
      <Section title="📊 Stats Bar">
        <p className="text-xs text-muted-foreground">Numbers displayed underneath the hero banner.</p>
        <div className="space-y-2">
          {data.stats.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input value={s.value} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="5,000+" className="w-28 shrink-0 font-mono" />
              <Input value={s.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="Happy Customers" className="flex-1" />
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeStat(i)} disabled={data.stats.length <= 1}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="border-dashed" onClick={addStat}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Stat
        </Button>
      </Section>

      {/* ── 3. Our Story ── */}
      <Section title="📖 Our Story Section">
        <div className="space-y-1.5">
          <Label>Section heading</Label>
          <Input value={data.storyHeading} onChange={e => set('storyHeading', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Story paragraphs</Label>
          {data.storyParagraphs.map((p, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-xs text-muted-foreground mt-2.5 w-4 shrink-0">{i + 1}.</span>
              <Textarea value={p} onChange={v => updatePara(i, v)} rows={2} />
              <Button variant="ghost" size="icon" className="mt-1 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removePara(i)} disabled={data.storyParagraphs.length <= 1}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="border-dashed" onClick={addPara}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Paragraph
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Brand tagline (in visual block)</Label>
            <Input value={data.storyTagline} onChange={e => set('storyTagline', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Location line</Label>
            <Input value={data.storyLocation} onChange={e => set('storyLocation', e.target.value)} />
          </div>
        </div>
      </Section>

      {/* ── 4. Values ── */}
      <Section title="💎 Values Cards">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Section heading</Label>
            <Input value={data.valuesHeading} onChange={e => set('valuesHeading', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Section subtext</Label>
            <Input value={data.valuesSubtext} onChange={e => set('valuesSubtext', e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          {data.values.map((v, i) => (
            <div key={i} className="rounded-xl border border-border bg-muted/20 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Card {i + 1}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveValue(i, -1)} disabled={i === 0}><ChevronUp className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveValue(i, 1)} disabled={i === data.values.length - 1}><ChevronDown className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeValue(i)} disabled={data.values.length <= 1}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Icon</Label>
                  <IconSelect value={v.icon} onChange={val => updateValue(i, 'icon', val)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input value={v.title} onChange={e => updateValue(i, 'title', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea value={v.desc} onChange={val => updateValue(i, 'desc', val)} rows={2} />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full border-dashed" onClick={addValue}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Value Card
          </Button>
        </div>
      </Section>

      {/* ── 5. CTA ── */}
      <Section title="🚀 Call to Action (Bottom)">
        <div className="space-y-1.5">
          <Label>Heading</Label>
          <Input value={data.ctaHeading} onChange={e => set('ctaHeading', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Subtext</Label>
          <Textarea value={data.ctaSubtext} onChange={v => set('ctaSubtext', v)} rows={2} />
        </div>
      </Section>

      {/* Save sticky */}
      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sticky bottom-4 shadow-xl">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save All Changes
      </Button>
    </div>
  );
}
