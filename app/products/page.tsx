'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import FilterSidebar, { FilterState } from '@/components/FilterSidebar';
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
import { SlidersHorizontal, X } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    minPrice: 0,
    maxPrice: 10000,
    sizes: [],
    colors: [],
  });
  
  const [sort, setSort] = useState('newest');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const activeFilterCount =
    filters.category.length + filters.sizes.length + filters.colors.length;

  const removeCategory = (id: string) => {
    handleFilterChange({
      ...filters,
      category: filters.category.filter((c) => c !== id),
    });
  };
  const removeSize = (size: string) => {
    handleFilterChange({
      ...filters,
      sizes: filters.sizes.filter((s) => s !== size),
    });
  };
  const removeColor = (color: string) => {
    handleFilterChange({
      ...filters,
      colors: filters.colors.filter((c) => c !== color),
    });
  };
  const categoryLabels: Record<string, string> = {
    casual: 'Casual',
    formal: 'Formal',
    party: 'Party',
    ethnic: 'Ethnic',
    summer: 'Summer',
    winter: 'Winter',
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams, filters, sort, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    
    const params = new URLSearchParams();
    params.set('page', pagination.page.toString());
    params.set('limit', pagination.limit.toString());
    params.set('sort', sort);

    // Add search from URL
    const search = searchParams.get('search');
    if (search) params.set('search', search);

    // Add category from URL or filters
    const urlCategoryId = searchParams.get('categoryId');
    const urlCategory = searchParams.get('category');
    if (urlCategoryId) {
      params.set('categoryId', urlCategoryId);
    } else {
      const categories = urlCategory ? [urlCategory] : filters.category;
      if (categories.length > 0) {
        params.set('category', categories[0]);
      }
    }

    // Add featured from URL
    const featured = searchParams.get('featured');
    if (featured) params.set('featured', featured);

    // Big Size: products with XL, XXL, etc.
    const bigSize = searchParams.get('bigSize');
    if (bigSize === 'true') params.set('bigSize', 'true');

    // Add filters
    if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 10000) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.sizes.length > 0) params.set('size', filters.sizes[0]);
    if (filters.colors.length > 0) params.set('color', filters.colors[0]);

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
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPagination({ ...pagination, page: 1 });
  };

  const isBigSize = searchParams.get('bigSize') === 'true';

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {isBigSize ? 'Big Size' : 'Shop Dresses'}
      </h1>
      {isBigSize && (
        <p className="text-muted-foreground mb-4 -mt-2">
          Dresses available in XL, XXL and beyond
        </p>
      )}

      <div className="flex flex-col gap-6">
        <div className="w-full min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${pagination.total} products`}
            </p>
            <div className="flex items-center gap-2">
              <BottomSheet open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                <BottomSheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-10 gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="rounded-full bg-primary text-primary-foreground min-w-[18px] h-[18px] flex items-center justify-center text-xs font-medium px-1">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </BottomSheetTrigger>
                <BottomSheetContent>
                  {filterDialogOpen && (
                    <FilterSidebar
                      initialFilters={filters}
                      inDrawer
                      onFilterChange={(newFilters) => {
                        handleFilterChange(newFilters);
                        setFilterDialogOpen(false);
                      }}
                    />
                  )}
                </BottomSheetContent>
              </BottomSheet>
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-xl h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-muted-foreground mr-1">Active:</span>
              {filters.category.map((id) => (
                <button
                  key={id}
                  onClick={() => removeCategory(id)}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/25"
                >
                  {categoryLabels[id] ?? id} <X className="h-3 w-3" />
                </button>
              ))}
              {filters.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => removeSize(size)}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/25"
                >
                  Size {size} <X className="h-3 w-3" />
                </button>
              ))}
              {filters.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => removeColor(color)}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/25"
                >
                  {color} <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-border bg-card">
                  <div className="aspect-[4/5] bg-muted animate-pulse" />
                  <div className="p-2.5 md:p-3 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                    <div className="h-9 rounded-lg bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-16 rounded-2xl bg-muted/40">
              <p className="text-muted-foreground mb-4">No products found</p>
              <Button className="rounded-xl" onClick={() => window.location.reload()}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-6"><div className="h-8 w-24 rounded bg-muted animate-pulse" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
