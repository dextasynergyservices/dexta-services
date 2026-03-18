export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-2 h-4 w-20 animate-pulse rounded bg-[#1a1a1a]" />
          <div className="mx-auto h-10 w-64 animate-pulse rounded-lg bg-[#1a1a1a]" />
          <div className="mx-auto mt-3 h-4 w-80 animate-pulse rounded bg-[#1a1a1a]" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[#222] bg-[#111]"
            >
              <div className="h-48 animate-pulse bg-[#1a1a1a]" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-40 animate-pulse rounded bg-[#1a1a1a]" />
                <div className="h-4 w-full animate-pulse rounded bg-[#1a1a1a]" />
                <div className="flex gap-4">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#1a1a1a]" />
                  <div className="h-3 w-20 animate-pulse rounded bg-[#1a1a1a]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
