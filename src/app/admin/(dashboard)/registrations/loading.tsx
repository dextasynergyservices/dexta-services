export default function RegistrationsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-44 animate-pulse rounded-lg bg-[#1a1a1a]" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-[#1a1a1a]" />
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-[#1a1a1a]" />
        <div className="h-10 w-36 animate-pulse rounded-lg bg-[#1a1a1a]" />
        <div className="h-10 w-10 animate-pulse rounded-lg bg-[#1a1a1a]" />
        <div className="ml-auto h-10 w-28 animate-pulse rounded-lg bg-[#1a1a1a]" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-[#222] bg-[#111]">
        {/* Table header */}
        <div className="flex gap-4 border-b border-[#222] px-5 py-3">
          {["w-32", "w-44", "w-20", "w-28", "w-24", "w-16"].map((w, i) => (
            <div
              key={i}
              className={`h-3 ${w} animate-pulse rounded bg-[#1a1a1a]`}
            />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[#1a1a1a] px-5 py-4 last:border-0"
          >
            <div className="h-4 w-32 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="h-4 w-44 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-[#1a1a1a]" />
            <div className="h-4 w-28 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="h-4 w-24 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="h-8 w-8 animate-pulse rounded-lg bg-[#1a1a1a]" />
          </div>
        ))}

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between border-t border-[#222] px-5 py-3">
          <div className="h-3 w-32 animate-pulse rounded bg-[#1a1a1a]" />
          <div className="flex gap-2">
            <div className="h-8 w-20 animate-pulse rounded-lg bg-[#1a1a1a]" />
            <div className="h-8 w-20 animate-pulse rounded-lg bg-[#1a1a1a]" />
          </div>
        </div>
      </div>
    </div>
  );
}
