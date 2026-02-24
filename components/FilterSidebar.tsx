'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

/* ─── Types ───────────────────────────────────────────────────── */
export interface CategoryOption {
  _id: string;
  name: string;
  slug?: string;
}

export interface FilterState {
  category: string[];
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  colors: string[];
  minDiscount: number; // 0 | 10 | 20 | 30 | 40 | 50
}

interface Props {
  onFilterChange: (filters: FilterState) => void;
  inDrawer?: boolean;
  initialFilters?: FilterState;
  categories?: CategoryOption[];
}

/* ─── Constants ───────────────────────────────────────────────── */
const PRICE_MAX = 10000;

const COLORS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'White', hex: '#f0ede8' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#9333ea' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Maroon', hex: '#7f1d1d' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Beige', hex: '#d4b896' },
];

const DISCOUNT_OPTIONS = [
  { label: '10% and above', value: 10 },
  { label: '20% and above', value: 20 },
  { label: '30% and above', value: 30 },
  { label: '40% and above', value: 40 },
  { label: '50% and above', value: 50 },
];

const DEFAULT_FILTERS: FilterState = {
  category: [],
  minPrice: 0,
  maxPrice: PRICE_MAX,
  sizes: [],
  colors: [],
  minDiscount: 0,
};

/* ─── Accordion section ───────────────────────────────────────── */
function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary transition-colors"
      >
        {title}
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-4 space-y-2">{children}</div>}
      <Separator />
    </div>
  );
}

/* ─── Dual price range ────────────────────────────────────────── */
function PriceRange({
  min, max, onChange,
}: {
  min: number; max: number; onChange: (min: number, max: number) => void;
}) {
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);

  const pct = (v: number) => Math.round((v / PRICE_MAX) * 100);

  const commitMin = (v: number) => {
    const clamped = Math.min(v, localMax - 100);
    setLocalMin(clamped);
    onChange(clamped, localMax);
  };
  const commitMax = (v: number) => {
    const clamped = Math.max(v, localMin + 100);
    setLocalMax(clamped);
    onChange(localMin, clamped);
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Track */}
      <div className="relative h-1.5 rounded-full bg-muted mx-1">
        <div
          className="absolute h-full rounded-full bg-primary"
          style={{ left: `${pct(localMin)}%`, right: `${100 - pct(localMax)}%` }}
        />
        {/* Min thumb */}
        <input type="range" min={0} max={PRICE_MAX} step={100}
          value={localMin}
          onChange={(e) => setLocalMin(Number(e.target.value))}
          onMouseUp={(e) => commitMin(Number((e.target as HTMLInputElement).value))}
          onTouchEnd={(e) => commitMin(Number((e.target as HTMLInputElement).value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ zIndex: localMin > PRICE_MAX - 200 ? 5 : 3 }}
        />
        {/* Max thumb */}
        <input type="range" min={0} max={PRICE_MAX} step={100}
          value={localMax}
          onChange={(e) => setLocalMax(Number(e.target.value))}
          onMouseUp={(e) => commitMax(Number((e.target as HTMLInputElement).value))}
          onTouchEnd={(e) => commitMax(Number((e.target as HTMLInputElement).value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ zIndex: 4 }}
        />
        {/* Min dot */}
        <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-white border-2 border-primary shadow"
          style={{ left: `${pct(localMin)}%` }} />
        {/* Max dot */}
        <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-white border-2 border-primary shadow"
          style={{ left: `${pct(localMax)}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground font-medium">
        <span>₹{localMin.toLocaleString('en-IN')}</span>
        <span>₹{localMax.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Main FilterSidebar
════════════════════════════════════════════════════════════════ */
export default function FilterSidebar({ onFilterChange, inDrawer, initialFilters, categories: categoriesProp }: Props) {
  const [sizes, setSizes] = useState<string[]>([]);
  const [categoriesFetched, setCategoriesFetched] = useState<CategoryOption[]>([]);
  const categories = categoriesProp ?? categoriesFetched;
  const [filters, setFilters] = useState<FilterState>(initialFilters ?? DEFAULT_FILTERS);

  /* Sync to parent immediately (desktop) or via Apply button (drawer) */
  const apply = useCallback((f: FilterState) => {
    if (!inDrawer) onFilterChange(f);
  }, [inDrawer, onFilterChange]);

  const update = (patch: Partial<FilterState>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    apply(next);
  };

  const toggle = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  };

  const activeCount =
    filters.category.length + filters.sizes.length + filters.colors.length +
    (filters.minPrice > 0 || filters.maxPrice < PRICE_MAX ? 1 : 0) +
    (filters.minDiscount > 0 ? 1 : 0);

  useEffect(() => {
    fetch('/api/sizes')
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setSizes(d.map((s: { name: string }) => s.name)))
      .catch(() => setSizes([]));
  }, []);

  useEffect(() => {
    if (categoriesProp) return;
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategoriesFetched(Array.isArray(d) ? d : []))
      .catch(() => setCategoriesFetched([]));
  }, [categoriesProp]);

  return (
    <div className="flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Filters</h3>
          {activeCount > 0 && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors"
          >
            <X className="h-3 w-3" /> Clear All
          </button>
        )}
      </div>

      <Separator className="mb-1" />

      {/* ── Filter sections ── */}
      <div className="space-y-0">

        {/* Category */}
        {categories.length > 0 && (
          <Section title="Category">
            <div className="space-y-1">
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center gap-3 cursor-pointer group py-1">
                  <div className={cn(
                    'h-4 w-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
                    filters.category.includes(cat._id)
                      ? 'bg-primary border-primary'
                      : 'border-border group-hover:border-primary/50'
                  )}>
                    {filters.category.includes(cat._id) && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <input type="checkbox" className="sr-only"
                    checked={filters.category.includes(cat._id)}
                    onChange={() => update({ category: toggle(filters.category, cat._id) })} />
                  <span className={cn('text-sm transition-colors', filters.category.includes(cat._id) ? 'text-primary font-medium' : 'text-foreground group-hover:text-primary')}>
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </Section>
        )}

        {/* Price Range */}
        <Section title="Price Range">
          <PriceRange
            min={filters.minPrice}
            max={filters.maxPrice}
            onChange={(minPrice, maxPrice) => update({ minPrice, maxPrice })}
          />
        </Section>

        {/* Size */}
        {sizes.length > 0 && (
          <Section title="Size">
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => update({ sizes: toggle(filters.sizes, size) })}
                  className={cn(
                    'min-h-[36px] min-w-[36px] px-3 py-1.5 text-sm font-medium border-2 rounded-[10px] transition-all',
                    filters.sizes.includes(size)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Color */}
        <Section title="Color">
          <div className="flex flex-wrap gap-3 pt-1">
            {COLORS.map((color) => {
              const active = filters.colors.includes(color.name);
              return (
                <button
                  key={color.name}
                  type="button"
                  title={color.name}
                  onClick={() => update({ colors: toggle(filters.colors, color.name) })}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className={cn(
                    'h-8 w-8 rounded-full border-2 transition-all shadow-sm',
                    active ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-transparent group-hover:border-primary/40 group-hover:scale-105'
                  )}
                    style={{ backgroundColor: color.hex }}
                  >
                    {active && (
                      <div className="h-full w-full rounded-full flex items-center justify-center">
                        <svg className="h-3 w-3 text-white drop-shadow" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className={cn('text-[10px] leading-none', active ? 'text-primary font-semibold' : 'text-muted-foreground')}>{color.name}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Discount */}
        <Section title="Discount" defaultOpen={false}>
          <div className="space-y-1">
            {DISCOUNT_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group py-1">
                <div className={cn(
                  'h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
                  filters.minDiscount === opt.value ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'
                )}>
                  {filters.minDiscount === opt.value && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <input type="radio" className="sr-only" name="discount"
                  checked={filters.minDiscount === opt.value}
                  onChange={() => update({ minDiscount: filters.minDiscount === opt.value ? 0 : opt.value })} />
                <span className={cn('text-sm', filters.minDiscount === opt.value ? 'text-primary font-medium' : 'text-foreground group-hover:text-primary')}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </Section>
      </div>

      {/* ── Drawer footer ── */}
      {inDrawer && (
        <div className="sticky bottom-0 flex gap-3 bg-background border-t border-border pt-3 pb-2 mt-auto">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Clear All
          </Button>
          <Button className="flex-1" onClick={() => onFilterChange(filters)}>
            Apply Filters
            {activeCount > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold">{activeCount}</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
