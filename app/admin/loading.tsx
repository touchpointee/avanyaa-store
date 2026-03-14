export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-4 w-64 rounded-lg" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
            <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-7 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* thead */}
        <div className="px-5 py-3 bg-muted/60 border-b border-border">
          <div className="skeleton h-4 w-full max-w-lg rounded" />
        </div>
        {/* rows */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0">
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-3 w-48 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
            <div className="skeleton h-4 w-16 rounded" />
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-4 w-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
