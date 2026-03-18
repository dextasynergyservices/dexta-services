export default function AdminLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#1a1a1a]" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded-lg bg-[#1a1a1a]" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#222] bg-[#111] p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="h-3 w-24 animate-pulse rounded bg-[#1a1a1a]" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-[#1a1a1a]" />
            </div>
            <div className="h-7 w-16 animate-pulse rounded bg-[#1a1a1a]" />
          </div>
        ))}
      </div>

      {/* Activity skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[#222] bg-[#111]">
            <div className="border-b border-[#222] px-5 py-4">
              <div className="h-4 w-40 animate-pulse rounded bg-[#1a1a1a]" />
            </div>
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="px-5 py-3">
                <div className="h-4 w-32 animate-pulse rounded bg-[#1a1a1a]" />
                <div className="mt-2 h-3 w-48 animate-pulse rounded bg-[#1a1a1a]" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
