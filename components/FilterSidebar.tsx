'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryOption {
  _id: string;
  name: string;
  slug?: string;
}

interface FilterSidebarProps {
  onFilterChange: (filters: FilterState) => void;
  /** When true, used inside a drawer (e.g. mobile) - shows Apply button and compact layout */
  inDrawer?: boolean;
  /** Optional initial state (e.g. when opening mobile drawer to show current filters) */
  initialFilters?: FilterState;
  /** Categories from API; if not provided, fetched from /api/categories */
  categories?: CategoryOption[];
}

export interface FilterState {
  category: string[];
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  colors: string[];
}

const COLORS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#9333ea' },
];

function FilterSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

export default function FilterSidebar({ onFilterChange, inDrawer, initialFilters, categories: categoriesProp }: FilterSidebarProps) {
  const [sizes, setSizes] = useState<string[]>([]);
  const [categoriesFetched, setCategoriesFetched] = useState<CategoryOption[]>([]);
  const categories = categoriesProp ?? categoriesFetched;
  const [filters, setFilters] = useState<FilterState>(initialFilters ?? {
    category: [],
    minPrice: 0,
    maxPrice: 10000,
    sizes: [],
    colors: [],
  });


  const handleCategoryChange = (categoryId: string) => {
    const newCategories = filters.category.includes(categoryId)
      ? filters.category.filter((c) => c !== categoryId)
      : [...filters.category, categoryId];
    const newFilters = { ...filters, category: newCategories };
    setFilters(newFilters);
    if (!inDrawer) onFilterChange(newFilters);
  };

  const handleSizeChange = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    const newFilters = { ...filters, sizes: newSizes };
    setFilters(newFilters);
    if (!inDrawer) onFilterChange(newFilters);
  };

  const handleColorChange = (colorName: string) => {
    const newColors = filters.colors.includes(colorName)
      ? filters.colors.filter((c) => c !== colorName)
      : [...filters.colors, colorName];
    const newFilters = { ...filters, colors: newColors };
    setFilters(newFilters);
    if (!inDrawer) onFilterChange(newFilters);
  };

  useEffect(() => {
    fetch('/api/sizes')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setSizes(data.map((s: { name: string }) => s.name)))
      .catch(() => setSizes([]));
  }, []);

  useEffect(() => {
    if (categoriesProp) return;
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategoriesFetched(Array.isArray(data) ? data : []))
      .catch(() => setCategoriesFetched([]));
  }, [categoriesProp]);

  const handleReset = () => {
    const resetFilters: FilterState = {
      category: [],
      minPrice: 0,
      maxPrice: 10000,
      sizes: [],
      colors: [],
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  const activeCount =
    filters.category.length + filters.sizes.length + filters.colors.length;

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Filters</h3>
          {activeCount > 0 && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              {activeCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg text-muted-foreground hover:text-foreground"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>

      <Separator />

      {categories.length > 0 && (
        <FilterSection title="Category">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => handleCategoryChange(cat._id)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors touch-manipulation',
                  filters.category.includes(cat._id)
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {sizes.length > 0 && (
        <>
          <Separator />
          <FilterSection title="Size">
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeChange(size)}
                  className={cn(
                    'min-h-[40px] min-w-[40px] rounded-xl px-3 py-2 text-sm font-medium transition-colors touch-manipulation',
                    filters.sizes.includes(size)
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'border border-border bg-card hover:border-primary/40 hover:bg-primary/5'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </FilterSection>
        </>
      )}

      <Separator />

      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => handleColorChange(color.name)}
              className={cn(
                'flex items-center gap-2 rounded-full border-2 px-3 py-2 text-sm font-medium transition-all touch-manipulation',
                filters.colors.includes(color.name)
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card hover:border-primary/30'
              )}
              title={color.name}
            >
              <span
                className="h-4 w-4 rounded-full shrink-0 border border-border shadow-inner"
                style={{ backgroundColor: color.hex }}
              />
              <span>{color.name}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {inDrawer && (
        <div className="sticky bottom-0 -mx-4 -mb-2 flex gap-3 bg-background p-4 pt-6 border-t border-border">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={handleReset}
          >
            Clear all
          </Button>
          <Button
            className="flex-1 rounded-xl"
            onClick={handleApply}
          >
            Apply filters
          </Button>
        </div>
      )}
    </div>
  );

  return content;
}
