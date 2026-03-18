export default function EventDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-[#1a1a1a]" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-[#1a1a1a]" />
          </div>
          <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-[#1a1a1a]" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded-lg bg-[#1a1a1a]" />
      </div>

      <div className="h-48 animate-pulse rounded-xl bg-[#1a1a1a] sm:h-64" />

      <div className="h-20 animate-pulse rounded-xl bg-[#1a1a1a]" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#222] bg-[#111] p-4"
          >
            <div className="mb-2 h-3 w-16 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="h-7 w-12 animate-pulse rounded bg-[#1a1a1a]" />
          </div>
        ))}
      </div>
    </div>
  );
}
