'use client';

import { useState, useEffect } from 'react';
import { Trash2, Star, Loader2, Search, ExternalLink, Eye, EyeOff, Plus, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import Link from 'next/link';

interface AdminReview {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  productName: string;
  productImage: string;
  productSlug: string;
  isHidden: boolean;
}

interface Testimonial {
  name: string;
  text: string;
  stars: number;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: 'Priya M.', text: 'Absolutely love the quality! Fits perfectly and looks stunning.', stars: 5 },
  { name: 'Divya R.', text: 'Fast delivery and the packaging was beautiful. Will order again!', stars: 5 },
  { name: 'Ananya K.', text: 'The dress looked even better in person. Highly recommend AVANYAA!', stars: 5 },
  { name: 'Meera S.', text: 'Great customer service and the return process was so easy.', stars: 5 },
];

/* ── Star Picker ── */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star className={`h-5 w-5 transition-colors ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { toast } = useToast();

  /* ── Product Reviews state ── */
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [search, setSearch] = useState('');

  /* ── Testimonials state ── */
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [loadingT, setLoadingT] = useState(true);
  const [savingT, setSavingT] = useState(false);

  /* ── Tab state ── */
  const [tab, setTab] = useState<'product' | 'testimonials'>('testimonials');

  /* ── Fetch product reviews ── */
  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (res.ok) setReviews(data.reviews || []);
      else throw new Error(data.error || 'Failed to fetch');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingReviews(false);
    }
  };

  /* ── Fetch testimonials ── */
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { if (data.testimonials?.length) setTestimonials(data.testimonials); })
      .catch(() => {})
      .finally(() => setLoadingT(false));
    fetchReviews();
  }, []);

  /* ── Product review actions ── */
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete review');
      toast({ title: 'Review deleted successfully' });
      setReviews(reviews.filter(r => r._id !== id));
    } catch {
      toast({ title: 'Error deleting review', variant: 'destructive' });
    }
  };

  const handleToggleHide = async (id: string, currentHidden: boolean) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isHidden: !currentHidden }),
      });
      if (!res.ok) throw new Error('Failed to update review visibility');
      setReviews(reviews.map(r => r._id === id ? { ...r, isHidden: !currentHidden } : r));
      toast({ title: !currentHidden ? 'Review hidden' : 'Review visible' });
    } catch {
      toast({ title: 'Error updating review', variant: 'destructive' });
    }
  };

  /* ── Testimonial helpers ── */
  const updateT = (idx: number, field: keyof Testimonial, val: string | number) =>
    setTestimonials(prev => prev.map((t, i) => i === idx ? { ...t, [field]: val } : t));

  const addT = () => setTestimonials(prev => [...prev, { name: 'Customer Name', text: 'Add your testimonial here...', stars: 5 }]);

  const removeT = (idx: number) => setTestimonials(prev => prev.filter((_, i) => i !== idx));

  const saveTestimonials = async () => {
    if (testimonials.some(t => !t.name.trim() || !t.text.trim())) {
      toast({ title: 'Incomplete fields', description: 'Please fill in name and text for all testimonials.', variant: 'destructive' });
      return;
    }
    setSavingT(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testimonials }),
      });
      if (res.ok) {
        toast({ title: '✅ Saved!', description: 'Homepage testimonials updated.' });
      } else {
        const d = await res.json();
        toast({ title: 'Error', description: d.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSavingT(false);
    }
  };

  const filteredReviews = reviews.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.body.toLowerCase().includes(search.toLowerCase()) ||
    r.userName.toLowerCase().includes(search.toLowerCase()) ||
    r.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage product reviews and homepage testimonials.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          onClick={() => setTab('testimonials')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'testimonials' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Quote className="h-4 w-4 inline mr-2" />
          Homepage Testimonials
        </button>
        <button
          onClick={() => setTab('product')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'product' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Star className="h-4 w-4 inline mr-2" />
          Product Reviews
        </button>
      </div>

      {/* ══ TESTIMONIALS TAB ══ */}
      {tab === 'testimonials' && (
        <div className="space-y-5 max-w-2xl">
          <p className="text-sm text-muted-foreground">
            These are the manual testimonials shown in the <strong>&quot;What Our Customers Say&quot;</strong> section on the homepage. Add, edit, or remove cards freely.
          </p>

          {/* Live preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {testimonials.map((t, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, s) => (
                        <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">&quot;{t.text}&quot;</p>
                    <p className="text-xs font-semibold">— {t.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Testimonial editors */}
          {loadingT ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="space-y-3">
                {testimonials.map((t, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Testimonial {idx + 1}</span>
                        <Button
                          variant="ghost" size="icon"
                          className="text-muted-foreground hover:text-destructive h-8 w-8"
                          onClick={() => removeT(idx)}
                          disabled={testimonials.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Customer Name</Label>
                          <Input
                            value={t.name}
                            onChange={e => updateT(idx, 'name', e.target.value)}
                            placeholder="e.g. Priya M."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Rating</Label>
                          <StarPicker value={t.stars} onChange={v => updateT(idx, 'stars', v)} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Review Text</Label>
                        <textarea
                          value={t.text}
                          onChange={e => updateT(idx, 'text', e.target.value)}
                          rows={2}
                          placeholder="What did the customer say?"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button variant="outline" className="w-full border-dashed" onClick={addT}>
                <Plus className="h-4 w-4 mr-2" /> Add Testimonial
              </Button>

              <Button onClick={saveTestimonials} disabled={savingT} size="lg" className="w-full">
                {savingT && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Testimonials
              </Button>
            </>
          )}
        </div>
      )}

      {/* ══ PRODUCT REVIEWS TAB ══ */}
      {tab === 'product' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reviews, products, or customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="sm:ml-auto text-sm text-muted-foreground whitespace-nowrap">
              {filteredReviews.length} Review{filteredReviews.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[250px]">Product</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[150px]">Customer</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground min-w-[200px]">Rating & Review</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[120px]">Date</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[80px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingReviews ? (
                    <tr><td colSpan={5} className="h-32 text-center p-4"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                  ) : filteredReviews.length === 0 ? (
                    <tr><td colSpan={5} className="h-32 text-center text-muted-foreground p-4">{search ? 'No matching reviews found' : 'No reviews yet'}</td></tr>
                  ) : filteredReviews.map(review => (
                    <tr key={review._id} className="group hover:bg-muted/30 transition-colors">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          {review.productImage ? (
                            <div className="h-12 w-10 shrink-0 rounded-md overflow-hidden bg-muted border border-border">
                              <Image src={review.productImage} alt={review.productName} width={40} height={48} className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-12 w-10 shrink-0 rounded-md bg-muted border border-border" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight line-clamp-2">{review.productName}</p>
                            <Link href={`/products/${review.productSlug}`} target="_blank" className="inline-flex items-center text-xs text-primary hover:underline mt-1">
                              View Product <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-sm font-medium line-clamp-1">{review.userName}</p>
                        </div>
                      </td>
                      <td className="p-4 align-top max-w-[300px] whitespace-normal">
                        <div className="space-y-1 py-1 max-w-sm">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'}`} />
                            ))}
                          </div>
                          <p className="text-sm font-semibold">{review.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{review.body}</p>
                        </div>
                      </td>
                      <td className="p-4 align-top text-sm text-muted-foreground">
                        <div className="mt-2">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </td>
                      <td className="p-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <Button
                            variant="ghost" size="icon"
                            className={`hover:bg-muted ${review.isHidden ? 'text-amber-500' : 'text-muted-foreground'} transition-all rounded-lg`}
                            onClick={() => handleToggleHide(review._id, review.isHidden)}
                            title={review.isHidden ? 'Show Review' : 'Hide Review'}
                          >
                            {review.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                            onClick={() => handleDelete(review._id)}
                            title="Delete Review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
