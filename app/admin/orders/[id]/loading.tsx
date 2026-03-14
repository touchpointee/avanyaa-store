export default function OrderDetailLoading() {
  return (
    <div className="max-w-5xl space-y-6 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-4 w-4 rounded" />
        <div className="skeleton h-4 w-28 rounded" />
      </div>

      {/* Hero header */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="skeleton h-8 w-52 rounded-xl" />
              <div className="skeleton h-6 w-24 rounded-full" />
            </div>
            <div className="flex gap-4">
              <div className="skeleton h-4 w-36 rounded" />
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-4 w-20 rounded" />
            </div>
          </div>
          <div className="skeleton h-10 w-48 rounded-xl" />
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="skeleton h-3 w-32 rounded mb-6" />
        <div className="flex items-center gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="skeleton w-8 h-8 rounded-full" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-5 gap-5">
        {/* Items */}
        <div className="md:col-span-3 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/40">
            <div className="skeleton h-4 w-4 rounded" />
            <div className="skeleton h-4 w-32 rounded" />
          </div>
          <div className="p-5 space-y-5">
            {[...Array(2)].map((_, i) => (
              <div key={i} className={`flex gap-4 ${i > 0 ? 'pt-5 border-t border-border' : ''}`}>
                <div className="skeleton w-20 h-24 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-40 rounded" />
                  <div className="skeleton h-5 w-20 rounded-full" />
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex justify-between"><div className="skeleton h-4 w-16 rounded" /><div className="skeleton h-4 w-20 rounded" /></div>
              <div className="flex justify-between"><div className="skeleton h-4 w-16 rounded" /><div className="skeleton h-4 w-12 rounded" /></div>
              <div className="flex justify-between pt-3 border-t border-border"><div className="skeleton h-5 w-12 rounded" /><div className="skeleton h-6 w-24 rounded" /></div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-2 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/40">
                <div className="skeleton h-4 w-4 rounded" />
                <div className="skeleton h-4 w-24 rounded" />
              </div>
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="skeleton h-3 w-16 rounded" />
                    <div className="skeleton h-3 w-24 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
