export default function ArticleSkeleton({ showLead = true, count = 6 }) {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Lead Story Skeleton (if requested) */}
      {showLead && (
        <div className="rounded-xl border border-line/70 bg-surface/30 p-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6">
            <div className="lg:col-span-7 h-56 sm:h-72 lg:h-80 bg-surface-subtle rounded-lg" />
            <div className="lg:col-span-5 flex flex-col justify-between py-2 space-y-4">
              <div className="space-y-3">
                <div className="h-3 w-32 bg-surface-subtle rounded-full" />
                <div className="h-7 w-5/6 bg-surface-subtle rounded" />
                <div className="h-7 w-2/3 bg-surface-subtle rounded" />
                <div className="h-4 w-full bg-surface-subtle rounded mt-2" />
                <div className="h-4 w-4/5 bg-surface-subtle rounded" />
              </div>
              <div className="h-4 w-24 bg-surface-subtle rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-line/70 bg-surface/35 overflow-hidden flex flex-col justify-between h-[360px]"
          >
            <div>
              <div className="w-full aspect-[16/10] bg-surface-subtle" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-28 bg-surface-subtle rounded-full" />
                <div className="h-5 w-5/6 bg-surface-subtle rounded" />
                <div className="h-3.5 w-full bg-surface-subtle rounded" />
                <div className="h-3.5 w-2/3 bg-surface-subtle rounded" />
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-line/50 flex justify-between items-center">
              <div className="h-3 w-16 bg-surface-subtle rounded" />
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-surface-subtle" />
                <div className="w-6 h-6 rounded-full bg-surface-subtle" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
