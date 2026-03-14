'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Truck, RotateCcw, ShieldCheck, Sparkles, Star, Heart, Package, Zap, Plus, Trash2, GripVertical } from 'lucide-react';

/* ── Shared icon options ── */
const ICON_OPTIONS = [
  { value: 'truck', label: 'Truck (Shipping)', Icon: Truck },
  { value: 'rotateCCW', label: 'Return Arrow', Icon: RotateCcw },
  { value: 'shieldCheck', label: 'Shield (Security)', Icon: ShieldCheck },
  { value: 'sparkles', label: 'Sparkles (Quality)', Icon: Sparkles },
  { value: 'star', label: 'Star', Icon: Star },
  { value: 'heart', label: 'Heart', Icon: Heart },
  { value: 'package', label: 'Package', Icon: Package },
  { value: 'zap', label: 'Zap (Fast)', Icon: Zap },
];

const ICON_COLORS: Record<string, { bg: string; text: string }> = {
  truck: { bg: 'bg-blue-100', text: 'text-blue-600' },
  rotateCCW: { bg: 'bg-rose-100', text: 'text-rose-500' },
  shieldCheck: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  sparkles: { bg: 'bg-violet-100', text: 'text-violet-600' },
  star: { bg: 'bg-amber-100', text: 'text-amber-500' },
  heart: { bg: 'bg-pink-100', text: 'text-pink-500' },
  package: { bg: 'bg-orange-100', text: 'text-orange-500' },
  zap: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
};

const WHY_COLORS: Record<string, string> = {
  sparkles: 'text-violet-500 bg-violet-50',
  truck: 'text-blue-500 bg-blue-50',
  rotateCCW: 'text-rose-500 bg-rose-50',
  shieldCheck: 'text-emerald-500 bg-emerald-50',
  star: 'text-amber-500 bg-amber-50',
  heart: 'text-pink-500 bg-pink-50',
  package: 'text-orange-500 bg-orange-50',
  zap: 'text-yellow-500 bg-yellow-50',
};

/* ── Types ── */
interface Badge { icon: string; label: string; sub: string; }
interface WhyCard { icon: string; title: string; desc: string; }

/* ── Defaults ── */
const DEFAULT_BADGES: Badge[] = [
  { icon: 'truck', label: 'Free Shipping', sub: 'On orders above ₹999' },
  { icon: 'rotateCCW', label: '7-Day Returns', sub: 'Hassle-free exchanges' },
  { icon: 'shieldCheck', label: 'Secure Payment', sub: 'COD & online accepted' },
  { icon: 'sparkles', label: 'Premium Quality', sub: 'Curated fabrics & style' },
];

const DEFAULT_MARQUEE = [
  '✨ Free Shipping on Orders Above ₹999',
  '🛡️ 7-Day Easy Returns',
  '💳 Cash on Delivery Available',
  '📦 Pan-India Delivery',
  '🌸 New Arrivals Every Week',
];

const DEFAULT_WHY: WhyCard[] = [
  { icon: 'sparkles', title: 'Premium Quality', desc: 'Curated fabrics and finishes made to last, not just a season.' },
  { icon: 'truck', title: 'Fast Delivery', desc: 'Reliable pan-India shipping with real-time tracking.' },
  { icon: 'rotateCCW', title: 'Easy Returns', desc: '7-day no-questions-asked returns policy.' },
  { icon: 'shieldCheck', title: 'Cash on Delivery', desc: 'Pay only when your package arrives safely.' },
];

/* ── Reusable icon select ── */
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

export default function TrustBadgesAdmin() {
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[]>(DEFAULT_BADGES);
  const [marquee, setMarquee] = useState<string[]>(DEFAULT_MARQUEE);
  const [whyCards, setWhyCards] = useState<WhyCard[]>(DEFAULT_WHY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.trustBadges?.length) setBadges(data.trustBadges);
        if (data.marqueeMessages?.length) setMarquee(data.marqueeMessages);
        if (data.whyCards?.length) setWhyCards(data.whyCards);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Helpers ── */
  const updateBadge = (idx: number, field: keyof Badge, val: string) =>
    setBadges(prev => prev.map((b, i) => i === idx ? { ...b, [field]: val } : b));

  const updateMarquee = (idx: number, val: string) =>
    setMarquee(prev => prev.map((m, i) => i === idx ? val : m));
  const addMarquee = () => setMarquee(prev => [...prev, '🌟 New message']);
  const removeMarquee = (idx: number) => setMarquee(prev => prev.filter((_, i) => i !== idx));

  const updateWhy = (idx: number, field: keyof WhyCard, val: string) =>
    setWhyCards(prev => prev.map((c, i) => i === idx ? { ...c, [field]: val } : c));
  const addWhy = () => setWhyCards(prev => [...prev, { icon: 'sparkles', title: 'New Feature', desc: 'Describe it here.' }]);
  const removeWhy = (idx: number) => setWhyCards(prev => prev.filter((_, i) => i !== idx));

  /* ── Save ── */
  const handleSave = async () => {
    if (marquee.some(m => !m.trim())) {
      toast({ title: 'Empty message', description: 'Fill in all marquee messages or remove empty ones.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trustBadges: badges, marqueeMessages: marquee, whyCards }),
      });
      if (res.ok) {
        toast({ title: '✅ Saved!', description: 'All changes saved successfully.' });
      } else {
        const d = await res.json();
        toast({ title: 'Error', description: d.error || 'Failed to save', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h2 className="text-3xl font-bold mb-1">Banners & Badges</h2>
        <p className="text-sm text-muted-foreground">Edit marquee messages, trust badges, and the &quot;Why Choose AVANYAA&quot; feature cards — all in one place.</p>
      </div>

      {/* ═══ SECTION 1: SCROLLING MARQUEE ═══ */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold">Scrolling Marquee Messages</h3>
          <p className="text-sm text-muted-foreground mt-0.5">These scroll across the top of every page. Use emoji + text for best results.</p>
        </div>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full overflow-hidden bg-primary text-primary-foreground rounded-lg py-2.5 select-none">
              <div className="flex whitespace-nowrap" style={{ animation: 'none' }}>
                {[...marquee, ...marquee].map((msg, i) => (
                  <span key={i} className="inline-flex items-center gap-2 text-sm font-medium px-6">
                    {msg || '…'}<span className="opacity-40 mx-1">•</span>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {marquee.map((msg, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Message {idx + 1}</Label>
                    <Input value={msg} onChange={e => updateMarquee(idx, e.target.value)} placeholder="e.g. ✨ Free Shipping on Orders Above ₹999" />
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeMarquee(idx)} disabled={marquee.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" className="w-full border-dashed" onClick={addMarquee}>
            <Plus className="h-4 w-4 mr-2" /> Add Message
          </Button>
        </div>
      </div>

      {/* ═══ SECTION 2: TRUST BADGES ═══ */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold">Trust Badge Strip</h3>
          <p className="text-sm text-muted-foreground mt-0.5">The 4 feature highlights shown just below the hero banner.</p>
        </div>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-xl p-4"
              style={{ background: 'linear-gradient(135deg, hsl(212 51% 20%) 0%, hsl(212 51% 28%) 100%)' }}>
              {badges.map((b, i) => {
                const opt = ICON_OPTIONS.find(o => o.value === b.icon);
                const Icon = opt?.Icon || Sparkles;
                const cls = ICON_COLORS[b.icon] || { bg: 'bg-gray-100', text: 'text-gray-600' };
                return (
                  <div key={i} className="bg-white/10 border border-white/15 rounded-xl flex items-center gap-3 px-3 py-3">
                    <div className={`w-9 h-9 rounded-lg ${cls.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-4 w-4 ${cls.text}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white leading-tight">{b.label || '—'}</p>
                      <p className="text-[10px] text-white/60 mt-0.5">{b.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {badges.map((badge, idx) => {
          const opt = ICON_OPTIONS.find(o => o.value === badge.icon);
          const Icon = opt?.Icon || Sparkles;
          return (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Icon className="h-4 w-4" />Badge {idx + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <IconSelect value={badge.icon} onChange={val => updateBadge(idx, 'icon', val)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={badge.label} onChange={e => updateBadge(idx, 'label', e.target.value)} placeholder="e.g. Free Shipping" />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input value={badge.sub} onChange={e => updateBadge(idx, 'sub', e.target.value)} placeholder="e.g. On orders above ₹999" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ═══ SECTION 3: WHY CHOOSE AVANYAA ═══ */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold">Why Choose AVANYAA Cards</h3>
          <p className="text-sm text-muted-foreground mt-0.5">The feature cards in the &quot;Our Promise / Why Choose AVANYAA&quot; section.</p>
        </div>

        {/* Live preview */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {whyCards.map((c, i) => {
                const opt = ICON_OPTIONS.find(o => o.value === c.icon);
                const Icon = opt?.Icon || Sparkles;
                const color = WHY_COLORS[c.icon] || 'text-violet-500 bg-violet-50';
                return (
                  <div key={i} className="flex flex-col items-center text-center gap-3 p-4 rounded-2xl border border-border bg-card shadow-sm">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs">{c.title || '—'}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{c.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Card editors */}
        <div className="space-y-3">
          {whyCards.map((card, idx) => {
            const opt = ICON_OPTIONS.find(o => o.value === card.icon);
            const Icon = opt?.Icon || Sparkles;
            return (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><Icon className="h-4 w-4" />Card {idx + 1}</CardTitle>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8"
                      onClick={() => removeWhy(idx)} disabled={whyCards.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <IconSelect value={card.icon} onChange={val => updateWhy(idx, 'icon', val)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={card.title} onChange={e => updateWhy(idx, 'title', e.target.value)} placeholder="e.g. Premium Quality" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <textarea
                      value={card.desc}
                      onChange={e => updateWhy(idx, 'desc', e.target.value)}
                      rows={2}
                      placeholder="e.g. Curated fabrics made to last."
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Button variant="outline" className="w-full border-dashed" onClick={addWhy}>
            <Plus className="h-4 w-4 mr-2" /> Add Card
          </Button>
        </div>
      </div>

      {/* Save all */}
      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sticky bottom-4 shadow-xl">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save All Changes
      </Button>
    </div>
  );
}
