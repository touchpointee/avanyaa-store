'use client';

import { useState, useEffect } from 'react';
import { Trash2, Star, Loader2, Search, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function AdminReviewsPage() {
    const { toast } = useToast();
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/reviews');
            const data = await res.json();
            if (res.ok) {
                setReviews(data.reviews || []);
            } else {
                throw new Error(data.error || 'Failed to fetch reviews');
            }
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            return;
        }
        try {
            const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete review');
            toast({ title: 'Review deleted successfully' });
            setReviews(reviews.filter((r) => r._id !== id));
        } catch (err: any) {
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

            toast({
                title: !currentHidden ? 'Review hidden' : 'Review visible',
                description: !currentHidden ? 'This review is now hidden from customers.' : 'This review is now visible to customers.'
            });
        } catch (err: any) {
            toast({ title: 'Error updating review', variant: 'destructive' });
        }
    };

    const filteredReviews = reviews.filter(
        (r) =>
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.body.toLowerCase().includes(search.toLowerCase()) ||
            r.userName.toLowerCase().includes(search.toLowerCase()) ||
            r.productName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Product Reviews</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage customer reviews across all products
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search reviews, products, or customers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="h-32 text-center p-4">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </td>
                                </tr>
                            ) : filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="h-32 text-center text-muted-foreground p-4">
                                        {search ? 'No matching reviews found' : 'No reviews captured yet'}
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map((review) => (
                                    <tr key={review._id} className="group hover:bg-muted/30 transition-colors">
                                        {/* Product */}
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-3">
                                                {review.productImage ? (
                                                    <div className="h-12 w-10 shrink-0 rounded-md overflow-hidden bg-muted border border-border">
                                                        <Image
                                                            src={review.productImage}
                                                            alt={review.productName}
                                                            width={40}
                                                            height={48}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-10 shrink-0 rounded-md bg-muted border border-border" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium leading-tight line-clamp-2" title={review.productName}>
                                                        {review.productName}
                                                    </p>
                                                    <Link
                                                        href={`/products/${review.productSlug}`}
                                                        target="_blank"
                                                        className="inline-flex items-center text-xs text-primary hover:underline mt-1"
                                                    >
                                                        View Product <ExternalLink className="h-3 w-3 ml-1" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Customer */}
                                        <td className="p-4 align-top">
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                                    {review.userName.charAt(0).toUpperCase()}
                                                </div>
                                                <p className="text-sm font-medium line-clamp-1" title={review.userName}>
                                                    {review.userName}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Review Content */}
                                        <td className="p-4 align-top max-w-[300px] whitespace-normal">
                                            <div className="space-y-1 py-1 max-w-sm">
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-sm font-semibold">{review.title}</p>
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" title={review.body}>
                                                    {review.body}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="p-4 align-top text-sm text-muted-foreground">
                                            <div className="mt-2">
                                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 align-top text-right">
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`hover:bg-muted ${review.isHidden ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground'} transition-all rounded-lg opacity-100 group-hover:bg-muted/50`}
                                                    onClick={() => handleToggleHide(review._id, review.isHidden)}
                                                    title={review.isHidden ? "Show Review" : "Hide Review"}
                                                >
                                                    {review.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                                                    onClick={() => handleDelete(review._id)}
                                                    title="Delete Review"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
