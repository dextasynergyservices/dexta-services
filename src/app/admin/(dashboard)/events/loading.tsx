export default function EventsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 animate-pulse rounded-lg bg-[#1a1a1a]" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded-lg bg-[#1a1a1a]" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-[#1a1a1a]" />
      </div>

      <div className="flex gap-3">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-[#1a1a1a]" />
        <div className="h-10 w-36 animate-pulse rounded-lg bg-[#1a1a1a]" />
      </div>

      <div className="rounded-xl border border-[#222] bg-[#111]">
        <div className="flex gap-4 border-b border-[#222] px-5 py-3">
          {["w-40", "w-24", "w-28", "w-20", "w-28", "w-20"].map((w, i) => (
            <div
              key={i}
              className={`h-3 ${w} animate-pulse rounded bg-[#1a1a1a]`}
            />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[#1a1a1a] px-5 py-4 last:border-0"
          >
            <div className="h-4 w-40 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="h-4 w-24 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="h-4 w-28 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-[#1a1a1a]" />
            <div className="h-4 w-20 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="flex gap-1">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-[#1a1a1a]" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-[#1a1a1a]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
