export default function HeroLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-40 animate-pulse rounded-lg bg-[#1a1a1a]" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded-lg bg-[#1a1a1a]" />
      </div>

      {/* Tabs skeleton */}
      <div className="h-9 w-52 animate-pulse rounded-lg bg-[#1a1a1a]" />

      {/* Section cards skeleton */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[#222] bg-[#111] p-6">
          <div className="mb-4 h-4 w-36 animate-pulse rounded bg-[#1a1a1a]" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j}>
                <div className="mb-1.5 h-3 w-24 animate-pulse rounded bg-[#1a1a1a]" />
                <div className="h-9 w-full animate-pulse rounded-lg bg-[#1a1a1a]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
