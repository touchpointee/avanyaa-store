export default function OrdersLoading() {
  return (
    <div className="space-y-7 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-9 w-28 rounded-xl" />
          <div className="skeleton h-4 w-40 rounded" />
        </div>
        <div className="skeleton h-9 w-24 rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
            <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-7 w-14 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2">
        {[60, 80, 72, 90, 76].map((w, i) => (
          <div key={i} className="skeleton h-7 rounded-full" style={{ width: `${w}px` }} />
        ))}
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="skeleton h-10 flex-1 max-w-md rounded-xl" />
        <div className="skeleton h-10 w-44 rounded-xl" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 bg-muted/60 border-b border-border">
          <div className="skeleton h-4 w-full max-w-sm rounded" />
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="grid grid-cols-[2fr_1fr_auto_auto_24px] gap-4 items-center px-5 py-4 border-b border-border last:border-0">
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-4 w-24 rounded" />
              </div>
              <div className="skeleton h-4 w-36 rounded" />
              <div className="skeleton h-3 w-48 rounded" />
            </div>
            <div className="space-y-1">
              <div className="skeleton h-3 w-32 rounded" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
            <div className="space-y-1 text-right">
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton h-3 w-10 rounded ml-auto" />
            </div>
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-4 w-4 rounded" />
          </div>
        ))}
        <div className="px-5 py-3 bg-muted/30 border-t border-border">
          <div className="skeleton h-3 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}
