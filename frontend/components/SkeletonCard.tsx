export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-ink-800 bg-ink-850">
      <div className="skeleton aspect-[4/5]" />
      <div className="space-y-2.5 p-3.5">
        <div className="skeleton h-3.5 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-4 w-2/5 rounded" />
      </div>
    </div>
  );
}

export function SkeletonRail() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}