'use client';

import { useState, useEffect } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

/* ─── Star picker ────────────────────────────────────────────── */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0);
    const active = hovered || value;
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-110 cursor-pointer"
                        aria-label={`${star} star`}
                    >
                        <Star
                            className={cn(
                                'h-9 w-9 transition-colors',
                                star <= active
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-muted text-muted-foreground/20'
                            )}
                        />
                    </button>
                ))}
            </div>
            <span className={cn('text-sm font-medium h-5 transition-all', active ? 'text-amber-500' : 'text-muted-foreground')}>
                {active ? labels[active] : 'Tap to rate'}
            </span>
        </div>
    );
}

/* ─── Props ──────────────────────────────────────────────────── */
export interface ReviewModalProps {
    productId: string;
    productName: string;
    productImage?: string;
    onClose: () => void;
    onSubmitted?: () => void;
}

/* ════════════════════════════════════════════════════════════
   ReviewModal
════════════════════════════════════════════════════════════ */
export default function ReviewModal({
    productId,
    productName,
    productImage,
    onClose,
    onSubmitted,
}: ReviewModalProps) {
    const { toast } = useToast();

    const [rating, setRating] = useState(0);
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);

    /* Pre-fill if user already reviewed this product */
    useEffect(() => {
        fetch(`/api/reviews?productId=${productId}`)
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (!data) return;
                // The API returns my review if I'm logged in; we look for it by checking
                // we rely on the POST (upsert) so just check if there's any existing
                // The reviews list will have mine if it exists — but we don't know userId here.
                // We just try to prefill from the first result that matches via POST response.
            })
            .catch(() => { });
    }, [productId]);

    /* Submit */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating) { toast({ title: 'Please select a rating', variant: 'destructive' }); return; }
        if (!body.trim()) { toast({ title: 'Please write your review', variant: 'destructive' }); return; }

        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, rating, title: body.slice(0, 80), body }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit');

            toast({ title: 'Review submitted! Thank you 🎉' });
            onSubmitted?.();
            onClose();
        } catch (err: any) {
            toast({ title: err.message, variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Panel */}
            <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border  shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border bg-[white]" style={{ borderRadius: '15px 15px 0px 0px' }}>
                    <h2 className="font-heading font-semibold text-base">Rate this Product</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5 bg-[lightgray]">

                    {/* Product preview */}
                    <div className="flex items-center gap-3">
                        {productImage && (
                            <div className="h-14 w-14 rounded-xl overflow-hidden border border-border bg-muted shrink-0">
                                <Image
                                    src={productImage}
                                    alt={productName}
                                    width={56}
                                    height={56}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}
                        <p className="text-sm font-medium text-foreground line-clamp-2">{productName}</p>
                    </div>

                    {/* Star picker */}
                    <StarPicker value={rating} onChange={setRating} />


                    <div className="space-y-1.5">
                        <label htmlFor="rev-body" className="text-sm font-medium text-foreground">
                            Your Review <span className="text-destructive">*</span>
                        </label>
                        <textarea
                            id="rev-body"
                            maxLength={1000}
                            rows={5}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="What did you like or dislike about this product?"
                            className="w-full rounded-xl border-2 border-gray-300 bg-white text-gray-900 px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-all resize-none placeholder:text-gray-400 shadow-sm"
                        />
                        <p className="text-xs text-muted-foreground text-right">{body.length}/1000</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <Button
                            type="submit"
                            className="flex-1 rounded-lg h-11 font-semibold"
                            disabled={submitting}
                        >
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Review
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-lg h-11 border-border"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
