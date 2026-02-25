'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Clock, X, ArrowRight, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

/* ─── Types ───────────────────────────────────────────────────── */
interface Suggestion {
    type: 'product' | 'category' | 'recent';
    label: string;
    href: string;
    image?: string;
    price?: number;
}

const RECENT_KEY = 'avanyaa_recent_searches';
const MAX_RECENT = 6;

function getRecent(): string[] {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); }
    catch { return []; }
}
function saveRecent(q: string) {
    const next = [q, ...getRecent().filter((x) => x !== q)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}
function deleteRecent(q: string) {
    localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter((x) => x !== q)));
}

function formatPrice(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

/* ─── Props ───────────────────────────────────────────────────── */
interface Props {
    className?: string;
    isMobile?: boolean;
}

/* ════════════════════════════════════════════════════════════════
   SearchBox
════════════════════════════════════════════════════════════════ */
export default function SearchBox({ className, isMobile }: Props) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [products, setProducts] = useState<Suggestion[]>([]);
    const [recents, setRecents] = useState<string[]>([]);
    const [activeIdx, setActiveIdx] = useState(-1);
    const [fetching, setFetching] = useState(false);
    const [mounted, setMounted] = useState(false);

    /* Real data: categories & top products for default suggestions */
    const [categories, setCategories] = useState<Suggestion[]>([]);
    const [topProducts, setTopProducts] = useState<Suggestion[]>([]);
    const [defaultFetched, setDefaultFetched] = useState(false);

    /* Track the position of the input for the fixed portal */
    const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 300 });

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => { setMounted(true); }, []);

    /* Fetch categories + top products once the dropdown first opens */
    useEffect(() => {
        if (!open || defaultFetched) return;
        setDefaultFetched(true);

        // Fetch categories
        fetch('/api/categories')
            .then((r) => r.ok ? r.json() : [])
            .then((data: { _id: string; name: string; slug: string; image?: string }[]) => {
                setCategories(
                    data.slice(0, 6).map((c) => ({
                        type: 'category',
                        label: c.name,
                        href: `/products?category=${encodeURIComponent(c.name)}`,
                        image: c.image,
                    }))
                );
            })
            .catch(() => { });

        // Fetch top / featured products (shown as trending)
        fetch('/api/products?featured=true&limit=5')
            .then((r) => r.ok ? r.json() : { data: [] })
            .then((res: { data: { _id: string; name: string; slug: string; images?: string[]; price: number }[] }) => {
                const items = res.data ?? [];
                // If not enough featured products, fall back to newest
                if (items.length < 3) {
                    return fetch('/api/products?limit=5')
                        .then((r) => r.ok ? r.json() : { data: [] })
                        .then((r2) => r2.data ?? []);
                }
                return items;
            })
            .then((items: { _id: string; name: string; slug: string; images?: string[]; price: number }[]) => {
                setTopProducts(
                    items.slice(0, 5).map((p) => ({
                        type: 'product',
                        label: p.name,
                        href: `/products/${p.slug || p._id}`,
                        image: p.images?.[0],
                        price: p.price,
                    }))
                );
            })
            .catch(() => { });
    }, [open, defaultFetched]);

    /* Compute fixed coordinates whenever the dropdown opens or window resizes */
    const updatePos = useCallback(() => {
        if (!containerRef.current) return;
        const r = containerRef.current.getBoundingClientRect();
        setDropPos({ top: r.bottom + 8, left: r.left, width: r.width });
    }, []);

    useEffect(() => {
        if (!open) return;
        updatePos();
        window.addEventListener('resize', updatePos);
        window.addEventListener('scroll', updatePos, true);
        return () => {
            window.removeEventListener('resize', updatePos);
            window.removeEventListener('scroll', updatePos, true);
        };
    }, [open, updatePos]);

    /* Load recents on open */
    useEffect(() => { if (open) setRecents(getRecent()); }, [open]);

    /* Debounced product search */
    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (query.trim().length < 2) { setProducts([]); setFetching(false); return; }
        setFetching(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=5`);
                const data = await res.json();
                setProducts(
                    (data.data ?? []).map((p: { _id: string; name: string; slug: string; images?: string[]; price: number }) => ({
                        type: 'product',
                        label: p.name,
                        href: `/products/${p.slug || p._id}`,
                        image: p.images?.[0],
                        price: p.price,
                    }))
                );
            } catch { setProducts([]); }
            finally { setFetching(false); }
        }, 280);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    /* Close on outside click */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (containerRef.current?.contains(target)) return;
            const dropdown = document.getElementById('search-dropdown-portal');
            if (dropdown?.contains(target)) return;
            setOpen(false); setActiveIdx(-1);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* Flat suggestions list for keyboard navigation */
    const suggestions: Suggestion[] =
        query.trim().length >= 2
            ? products
            : [
                ...recents.map((r) => ({ type: 'recent' as const, label: r, href: `/products?search=${encodeURIComponent(r)}` })),
                ...categories,
                ...topProducts,
            ];

    const navigate = useCallback((href: string, label: string) => {
        saveRecent(label);
        setQuery(''); setOpen(false); setActiveIdx(-1);
        router.push(href);
    }, [router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        if (activeIdx >= 0 && suggestions[activeIdx]) {
            navigate(suggestions[activeIdx].href, suggestions[activeIdx].label);
        } else {
            saveRecent(q); setQuery(''); setOpen(false);
            router.push(`/products?search=${encodeURIComponent(q)}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, -1)); }
        if (e.key === 'Escape') { setOpen(false); setActiveIdx(-1); inputRef.current?.blur(); }
    };

    const showDropdown = open && mounted && (fetching || suggestions.length > 0 || (query.trim().length >= 2 && !fetching));

    /* ─── Dropdown content (rendered via portal) ───────────────── */
    const dropdownContent = showDropdown ? (
        <div
            id="search-dropdown-portal"
            style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999 }}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-1 duration-150"
        >
            <div className={cn('overflow-y-auto', isMobile ? 'max-h-[55vh]' : 'max-h-[460px]')}>

                {/* Loading */}
                {fetching && (
                    <div className="px-4 py-3 space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 w-3/4 rounded bg-muted" />
                                    <div className="h-2.5 w-1/3 rounded bg-muted" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!fetching && (
                    <>
                        {/* Empty state on search */}
                        {query.trim().length >= 2 && products.length === 0 && (
                            <div className="px-4 py-6 text-center">
                                <p className="text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
                                <button type="button"
                                    onMouseDown={(e) => { e.preventDefault(); navigate(`/products?search=${encodeURIComponent(query.trim())}`, query.trim()); }}
                                    className="mt-2 text-xs text-primary font-medium hover:underline">
                                    Search anyway →
                                </button>
                            </div>
                        )}

                        {/* Product results */}
                        {query.trim().length >= 2 && products.length > 0 && (
                            <>
                                <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Products</p>
                                {products.map((s, i) => (
                                    <button key={`prod-${i}`} type="button"
                                        onMouseDown={(e) => { e.preventDefault(); navigate(s.href, s.label); }}
                                        className={cn(
                                            'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                                            activeIdx === i ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60'
                                        )}>
                                        {s.image ? (
                                            <div className="h-11 w-11 shrink-0 rounded-lg overflow-hidden border border-border bg-muted">
                                                <Image src={s.image} alt={s.label} width={44} height={44} className="h-full w-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-11 w-11 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                                                <Search className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-medium text-foreground">{s.label}</p>
                                            {s.price != null && <p className="text-xs text-muted-foreground">{formatPrice(s.price)}</p>}
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-50" />
                                    </button>
                                ))}
                                <button type="button"
                                    onMouseDown={(e) => { e.preventDefault(); navigate(`/products?search=${encodeURIComponent(query.trim())}`, query.trim()); }}
                                    className="flex w-full items-center justify-between px-4 py-3 border-t border-border text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
                                    View all results for &ldquo;{query}&rdquo;
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </>
                        )}

                        {/* Default: recents + categories + top products */}
                        {query.trim().length < 2 && (
                            <>
                                {/* Recent searches */}
                                {recents.length > 0 && (
                                    <>
                                        <div className="flex items-center justify-between px-4 pt-3 pb-1">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Recent</p>
                                            <button type="button"
                                                onMouseDown={(e) => { e.preventDefault(); localStorage.removeItem(RECENT_KEY); setRecents([]); }}
                                                className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">
                                                Clear all
                                            </button>
                                        </div>
                                        {recents.map((r, i) => (
                                            <SuggestionRow key={`rec-${i}`}
                                                icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                                                label={r} active={activeIdx === i}
                                                onMouseDown={() => navigate(`/products?search=${encodeURIComponent(r)}`, r)}
                                                onRemove={() => { deleteRecent(r); setRecents(getRecent()); }} />
                                        ))}
                                    </>
                                )}

                                {/* Categories */}
                                {categories.length > 0 && (
                                    <>
                                        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Categories</p>
                                        {categories.map((s, i) => {
                                            const idx = recents.length + i;
                                            return (
                                                <SuggestionRow key={`cat-${i}`}
                                                    icon={
                                                        s.image
                                                            ? <div className="h-5 w-5 rounded overflow-hidden shrink-0 border border-border bg-muted">
                                                                <Image src={s.image} alt={s.label} width={20} height={20} className="h-full w-full object-cover" />
                                                            </div>
                                                            : <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                                                    }
                                                    label={s.label} active={activeIdx === idx}
                                                    onMouseDown={() => navigate(s.href, s.label)} />
                                            );
                                        })}
                                    </>
                                )}

                                {/* Top products */}
                                {topProducts.length > 0 && (
                                    <>
                                        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Trending Products</p>
                                        {topProducts.map((s, i) => {
                                            const idx = recents.length + categories.length + i;
                                            return (
                                                <button key={`top-${i}`} type="button"
                                                    onMouseDown={(e) => { e.preventDefault(); navigate(s.href, s.label); }}
                                                    className={cn(
                                                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                                                        activeIdx === idx ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60'
                                                    )}>
                                                    {s.image ? (
                                                        <div className="h-9 w-9 shrink-0 rounded-lg overflow-hidden border border-border bg-muted">
                                                            <Image src={s.image} alt={s.label} width={36} height={36} className="h-full w-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-9 w-9 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                                                            <TrendingUp className="h-4 w-4 text-primary" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="truncate text-sm font-medium text-foreground">{s.label}</p>
                                                        {s.price != null && <p className="text-xs text-muted-foreground">{formatPrice(s.price)}</p>}
                                                    </div>
                                                    <TrendingUp className="h-3.5 w-3.5 shrink-0 text-primary opacity-60" />
                                                </button>
                                            );
                                        })}
                                    </>
                                )}

                                {/* Loading skeleton for default suggestions */}
                                {!defaultFetched || (categories.length === 0 && topProducts.length === 0) && (
                                    <div className="px-4 py-3 space-y-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                                <div className="h-4 w-4 rounded bg-muted shrink-0" />
                                                <div className="h-3 w-2/3 rounded bg-muted" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="h-2" />
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    ) : null;

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <input
                        ref={inputRef}
                        type="search"
                        autoComplete="off"
                        placeholder="Search dresses, kurtas, suits…"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIdx(-1); updatePos(); }}
                        onFocus={() => { setOpen(true); updatePos(); }}
                        onKeyDown={handleKeyDown}
                        className="w-full pl-10 pr-9 h-10 rounded-[10px] border border-border bg-muted/40 text-sm placeholder:text-muted-foreground focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {query && (
                        <button type="button"
                            onClick={() => { setQuery(''); setProducts([]); inputRef.current?.focus(); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </form>

            {/* Portal — escapes header stacking context entirely */}
            {mounted && dropdownContent && createPortal(dropdownContent, document.body)}
        </div>
    );
}

/* ─── Row item ────────────────────────────────────────────────── */
function SuggestionRow({ icon, label, active, onMouseDown, onRemove }: {
    icon: React.ReactNode; label: string; active: boolean;
    onMouseDown: () => void; onRemove?: () => void;
}) {
    return (
        <div
            onMouseDown={(e) => { e.preventDefault(); onMouseDown(); }}
            className={cn(
                'group flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors',
                active ? 'bg-primary/10' : 'hover:bg-muted/60'
            )}>
            <span className="shrink-0">{icon}</span>
            <span className="flex-1 text-sm text-foreground truncate">{label}</span>
            {onRemove && (
                <button type="button"
                    onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(); }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}
