'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import FilterSidebar, { FilterState, type CategoryOption } from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import { ProductWithId, PaginatedResponse } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetTrigger,
} from '@/components/ui/bottom-sheet';
import { SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';

const PRICE_MAX = 10000;

const DEFAULT_FILTERS: FilterState = {
  category: [],
  minPrice: 0,
  maxPrice: PRICE_MAX,
  sizes: [],
  colors: [],
  minDiscount: 0,
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
];

function ProductsContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<FilterState>(() => {
    const defaultCat = searchParams.get('categoryId');
    return {
      ...DEFAULT_FILTERS,
      category: defaultCat ? [defaultCat] : []
    };
  });
  const [sort, setSort] = useState('newest');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryLabels: Record<string, string> = Object.fromEntries(
    categories.map((c) => [c._id, c.name])
  );

  const activeFilterCount =
    filters.category.length + filters.sizes.length + filters.colors.length +
    (filters.minPrice > 0 || filters.maxPrice < PRICE_MAX ? 1 : 0) +
    (filters.minDiscount > 0 ? 1 : 0);

  useEffect(() => {
    fetchProducts();
  }, [searchParams, filters, sort, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', pagination.page.toString());
    params.set('limit', pagination.limit.toString());
    params.set('sort', sort);

    const search = searchParams.get('search');
    if (search) params.set('search', search);

    // Use selected filters.category as the definitive source for category filtering
    if (filters.category.length > 0) {
      params.set('categoryId', filters.category.join(','));
    } else {
      const urlCategory = searchParams.get('category');
      if (urlCategory) params.set('category', urlCategory);
    }

    const featured = searchParams.get('featured');
    if (featured) params.set('featured', featured);

    const bigSize = searchParams.get('bigSize');
    if (bigSize === 'true') params.set('bigSize', 'true');

    if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < PRICE_MAX) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.sizes.length > 0) params.set('size', filters.sizes.join(','));
    if (filters.colors.length > 0) params.set('color', filters.colors.join(','));
    if (filters.minDiscount > 0) params.set('minDiscount', filters.minDiscount.toString());

    try {
      const response = await fetch(`/api/products?${params.toString()}`);
      const data: PaginatedResponse<ProductWithId> = await response.json();
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const removeChip = (patch: Partial<FilterState>) =>
    handleFilterChange({ ...filters, ...patch });

  const isBigSize = searchParams.get('bigSize') === 'true';
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Recommended';

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 pb-28 md:pb-8">
      <h1 className="font-heading text-2xl md:text-3xl font-semibold mb-6 tracking-tight">
        {isBigSize ? 'Big Size' : 'Shop Dresses'}
      </h1>
      {isBigSize && (
        <p className="text-muted-foreground mb-4 -mt-2">Dresses available in XL, XXL and beyond</p>
      )}

      <div className="flex gap-6 items-start">

        {/* ════════════════════════════════════════
            DESKTOP sidebar — no scroll, shows all
        ════════════════════════════════════════ */}
        <aside className="hidden md:block w-56 xl:w-64 shrink-0">
          <div className="rounded-xl border border-border bg-card shadow p-4">
            <FilterSidebar
              categories={categories}
              initialFilters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </aside>

        {/* ════════════════
            Main content
        ════════════════ */}
        <div className="flex-1 min-w-0">

          {/* ── Desktop top bar: count + Sort ── */}
          <div className="hidden md:flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground font-medium">
              {loading ? 'Loading…' : `${pagination.total} products`}
            </p>
            <Select value={sort} onValueChange={(v) => { setSort(v); setPagination((p) => ({ ...p, page: 1 })); }}>
              <SelectTrigger className="w-[200px] h-10 border-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Active filter chips (both screens) ── */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {filters.category.map((id) => (
                <button key={id}
                  onClick={() => removeChip({ category: filters.category.filter((c) => c !== id) })}
                  className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                  {categoryLabels[id] ?? id} <X className="h-3 w-3" />
                </button>
              ))}
              {(filters.minPrice > 0 || filters.maxPrice < PRICE_MAX) && (
                <button onClick={() => removeChip({ minPrice: 0, maxPrice: PRICE_MAX })}
                  className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                  ₹{filters.minPrice.toLocaleString('en-IN')} – ₹{filters.maxPrice.toLocaleString('en-IN')}
                  <X className="h-3 w-3" />
                </button>
              )}
              {filters.sizes.map((size) => (
                <button key={size}
                  onClick={() => removeChip({ sizes: filters.sizes.filter((s) => s !== size) })}
                  className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                  Size: {size} <X className="h-3 w-3" />
                </button>
              ))}
              {filters.colors.map((color) => (
                <button key={color}
                  onClick={() => removeChip({ colors: filters.colors.filter((c) => c !== color) })}
                  className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                  {color} <X className="h-3 w-3" />
                </button>
              ))}
              {filters.minDiscount > 0 && (
                <button onClick={() => removeChip({ minDiscount: 0 })}
                  className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                  {filters.minDiscount}%+ off <X className="h-3 w-3" />
                </button>
              )}
              <button onClick={() => handleFilterChange(DEFAULT_FILTERS)}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors">
                Clear All <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`rounded-xl overflow-hidden border border-border bg-card shadow col-span-1 ${i < 3 ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
                  <div className="aspect-square bg-muted animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                    <div className="h-9 rounded-lg bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products grid */}
          {!loading && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5">
                {products.map((product, i) => (
                  <div key={product._id} className={`col-span-1 ${i < 3 ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => {
                    setPagination((p) => ({ ...p, page }));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
            </>
          )}

          {/* Empty */}
          {!loading && products.length === 0 && (
            <div className="text-center py-20 rounded-xl border border-border bg-card shadow">
              <p className="text-muted-foreground mb-4 font-medium">No products found</p>
              <Button onClick={() => handleFilterChange(DEFAULT_FILTERS)}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════
          MOBILE — sticky "Filter & Sort" bar
      ════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 flex border-t border-border bg-background shadow-lg">
        {/* Filter */}
        <BottomSheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <BottomSheetTrigger asChild>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold text-foreground border-r border-border hover:bg-muted/50 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary text-primary-foreground min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold px-1">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </BottomSheetTrigger>
          <BottomSheetContent>
            {mobileSheetOpen && (
              <FilterSidebar
                categories={categories}
                initialFilters={filters}
                inDrawer
                onFilterChange={(f) => {
                  handleFilterChange(f);
                  setMobileSheetOpen(false);
                }}
              />
            )}
          </BottomSheetContent>
        </BottomSheet>

        {/* Sort */}
        <BottomSheet open={mobileSortOpen} onOpenChange={setMobileSortOpen}>
          <BottomSheetTrigger asChild>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
            >
              <ArrowUpDown className="h-4 w-4" />
              Sort
              {sort !== 'newest' && (
                <span className="rounded-full bg-primary/15 text-primary min-w-[6px] h-[6px] inline-block" />
              )}
            </button>
          </BottomSheetTrigger>
          <BottomSheetContent>
            <div className="py-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-3">Sort By</p>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSort(opt.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                    setMobileSortOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-2 py-3.5 text-sm rounded-lg transition-colors ${sort === opt.value
                    ? 'text-primary font-semibold bg-primary/8'
                    : 'text-foreground hover:bg-muted/60'
                    }`}
                >
                  {opt.label}
                  {sort === opt.value && (
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 16 16">
                      <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </BottomSheetContent>
        </BottomSheet>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6">
        <div className="h-8 w-32 rounded bg-muted animate-pulse mb-6" />
        <div className="flex gap-6">
          <div className="hidden md:block w-56 xl:w-64 shrink-0 rounded-xl border border-border bg-card animate-pulse" style={{ height: 600 }} />
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-12 gap-4 xl:gap-5">
            {[...Array(7)].map((_, i) => <div key={i} className={`aspect-square rounded-xl bg-muted animate-pulse col-span-1 ${i < 3 ? 'lg:col-span-4' : 'lg:col-span-3'}`} />)}
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
