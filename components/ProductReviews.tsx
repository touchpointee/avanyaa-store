'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Star, Pencil, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

/* ─── Types ─────────────────────────────────────────────────── */
interface Review {
    _id: string;
    userId: string;
    userName: string;
    rating: number;
    title: string;
    body: string;
    createdAt: string;
}
interface Stats {
    total: number;
    avg: number;
    dist: { star: number; count: number }[];
}

/* ─── Star renderer ─────────────────────────────────────────── */
function Stars({
    value,
    max = 5,
    interactive = false,
    size = 'sm',
    onChange,
}: {
    value: number;
    max?: number;
    interactive?: boolean;
    size?: 'sm' | 'lg';
    onChange?: (v: number) => void;
}) {
    const [hovered, setHovered] = useState(0);
    const active = hovered || value;
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => interactive && setHovered(star)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    className={cn(
                        'transition-transform',
                        interactive && 'cursor-pointer hover:scale-110',
                        !interactive && 'cursor-default'
                    )}
                    aria-label={`${star} star`}
                >
                    <Star
                        className={cn(
                            size === 'lg' ? 'h-7 w-7' : 'h-4 w-4',
                            star <= active ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

/* ─── Avatar initials ───────────────────────────────────────── */
function Avatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    return (
        <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0 select-none">
            {initials}
        </div>
    );
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'Today';
    if (d === 1) return '1 day ago';
    if (d < 30) return `${d} days ago`;
    const m = Math.floor(d / 30);
    if (m < 12) return `${m} month${m > 1 ? 's' : ''} ago`;
    const y = Math.floor(m / 12);
    return `${y} year${y > 1 ? 's' : ''} ago`;
}

/* ════════════════════════════════════════════════════════════
   Main component
════════════════════════════════════════════════════════════ */
export default function ProductReviews({ productId }: { productId: string }) {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, avg: 0, dist: [] });
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [hasPurchased, setHasPurchased] = useState(false);

    /* Form state */
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);

    /* Editing */
    const [editingId, setEditingId] = useState<string | null>(null);

    /* Expand/collapse long reviews */
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const userId = (session?.user as any)?.id as string | undefined;
    const isLoggedIn = !!session?.user && (session.user as any).role === 'user';

    /* ── Fetch reviews ──────────────────────────────────────── */
    const fetchReviews = useCallback(async () => {
        setLoadingReviews(true);
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            const data = await res.json();
            setReviews(data.reviews ?? []);
            setStats(data.stats ?? { total: 0, avg: 0, dist: [] });
        } catch {
            /* silent */
        } finally {
            setLoadingReviews(false);
        }
    }, [productId]);

    const checkPurchase = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const res = await fetch(`/api/orders/check-purchase?productId=${productId}`);
            const data = await res.json();
            setHasPurchased(data.hasPurchased);
        } catch {
            setHasPurchased(false);
        }
    }, [productId, isLoggedIn]);

    useEffect(() => {
        fetchReviews();
        checkPurchase();
    }, [fetchReviews, checkPurchase]);

    /* ── Pre-fill form if user already reviewed ─────────────── */
    useEffect(() => {
        if (!showForm || !userId) return;
        const mine = reviews.find((r) => r.userId === userId);
        if (mine) {
            setRating(mine.rating);
            setTitle(mine.title);
            setBody(mine.body);
            setEditingId(mine._id);
        }
    }, [showForm, userId, reviews]);

    const resetForm = () => {
        setRating(0); setTitle(''); setBody('');
        setEditingId(null); setShowForm(false);
    };

    /* ── Submit review ──────────────────────────────────────── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating) { toast({ title: 'Please select a rating', variant: 'destructive' }); return; }
        if (!title.trim()) { toast({ title: 'Please add a title', variant: 'destructive' }); return; }
        if (!body.trim()) { toast({ title: 'Please write your review', variant: 'destructive' }); return; }

        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, rating, title, body }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            toast({ title: editingId ? 'Review updated!' : 'Review submitted! Thank you 🎉' });
            resetForm();
            await fetchReviews();
        } catch (err: any) {
            toast({ title: err.message, variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Delete review ──────────────────────────────────────── */
    const handleDelete = async (id: string) => {
        if (!confirm('Delete your review?')) return;
        try {
            const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            toast({ title: 'Review deleted' });
            await fetchReviews();
        } catch {
            toast({ title: 'Could not delete review', variant: 'destructive' });
        }
    };

    const myReview = reviews.find((r) => r.userId === userId);

    /* ────────────────────────────────────────────────────────── */
    return (
        <section className="mt-10 md:mt-14" aria-label="Product reviews">
            <Separator className="mb-8 bg-border" />

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-heading text-xl md:text-2xl font-semibold tracking-tight">
                        Customer Reviews
                    </h2>
                    {stats.total > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                            <Stars value={Math.round(stats.avg)} />
                            <span className="text-sm font-semibold">{stats.avg}</span>
                            <span className="text-sm text-muted-foreground">({stats.total} review{stats.total !== 1 ? 's' : ''})</span>
                        </div>
                    )}
                </div>

                {/* Write review button */}
                {!showForm && (
                    isLoggedIn ? (
                        hasPurchased ? (
                            <Button
                                size="sm"
                                variant={myReview ? 'outline' : 'default'}
                                className="shrink-0 rounded-lg gap-2"
                                onClick={() => setShowForm(true)}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                {myReview ? 'Edit My Review' : 'Write a Review'}
                            </Button>
                        ) : (
                            <p className="text-sm text-muted-foreground italic border border-border bg-muted/30 px-3 py-1.5 rounded-lg shrink-0">
                                Only customers who purchased this can review.
                            </p>
                        )
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0 rounded-lg"
                            onClick={() => router.push('/auth/signin')}
                        >
                            Sign in to Review
                        </Button>
                    )
                )}
            </div>

            {/* ── Rating distribution ── */}
            {stats.total > 0 && (
                <div className="mb-8 p-4 rounded-xl border border-border bg-muted/30 max-w-sm">
                    {stats.dist.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-2 mb-1.5 last:mb-0">
                            <span className="text-xs text-muted-foreground w-4 text-right">{star}</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-amber-400 transition-all"
                                    style={{ width: stats.total ? `${(count / stats.total) * 100}%` : '0%' }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground w-4">{count}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Write / Edit form ── */}
            {showForm && (
                <div className="mb-8 p-5 rounded-xl border border-border bg-muted/20">
                    <h3 className="font-heading font-semibold mb-4">
                        {editingId ? 'Update Your Review' : 'Write a Review'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Star picker */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground">Your rating *</label>
                            <Stars value={rating} interactive size="lg" onChange={setRating} />
                        </div>

                        {/* Title */}
                        <div className="space-y-1">
                            <label htmlFor="review-title" className="text-sm font-medium text-foreground">
                                Title *
                            </label>
                            <input
                                id="review-title"
                                type="text"
                                value={title}
                                maxLength={120}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Summarise your experience…"
                                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        {/* Body */}
                        <div className="space-y-1">
                            <label htmlFor="review-body" className="text-sm font-medium text-foreground">
                                Review *
                            </label>
                            <textarea
                                id="review-body"
                                value={body}
                                maxLength={1000}
                                rows={4}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Tell others what you liked or disliked…"
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            />
                            <p className="text-xs text-muted-foreground text-right">{body.length}/1000</p>
                        </div>

                        <div className="flex gap-3 pt-1">
                            <Button type="submit" size="sm" className="rounded-lg min-w-[120px]" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                {editingId ? 'Update Review' : 'Submit Review'}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={resetForm} disabled={submitting}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Review list ── */}
            {loadingReviews ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3.5 w-1/3 rounded bg-muted" />
                                <div className="h-3 w-1/2 rounded bg-muted" />
                                <div className="h-12 w-full rounded bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="py-12 text-center rounded-xl border border-dashed border-border">
                    <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => {
                        const isExpanded = expanded.has(review._id);
                        const isLong = review.body.length > 280;
                        const isOwner = review.userId === userId;

                        return (
                            <div key={review._id} className="flex gap-3 group">
                                <Avatar name={review.userName} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground leading-snug">{review.userName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Stars value={review.rating} />
                                                <span className="text-xs text-muted-foreground">{timeAgo(review.createdAt)}</span>
                                            </div>
                                        </div>
                                        {isOwner && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowForm(true); }}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                    title="Edit review"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(review._id)}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                    title="Delete review"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm font-medium text-foreground mt-2">{review.title}</p>
                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                        {isLong && !isExpanded ? `${review.body.slice(0, 280)}…` : review.body}
                                    </p>
                                    {isLong && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpanded((prev) => {
                                                    const next = new Set(prev);
                                                    next.has(review._id) ? next.delete(review._id) : next.add(review._id);
                                                    return next;
                                                })
                                            }
                                            className="mt-1 text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                                        >
                                            {isExpanded ? (
                                                <><ChevronUp className="h-3 w-3" /> Show less</>
                                            ) : (
                                                <><ChevronDown className="h-3 w-3" /> Read more</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
