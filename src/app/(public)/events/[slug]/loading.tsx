export default function EventPageLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="mb-6 h-48 animate-pulse rounded-2xl bg-[#1a1a1a] sm:h-64" />
            <div className="mb-2 h-3 w-16 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="mb-4 h-10 w-3/4 animate-pulse rounded-lg bg-[#1a1a1a]" />
            <div className="mb-2 h-4 w-full animate-pulse rounded bg-[#1a1a1a]" />
            <div className="mb-6 h-4 w-2/3 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="h-32 animate-pulse rounded-xl bg-[#1a1a1a]" />
          </div>
          <div>
            <div className="h-96 animate-pulse rounded-2xl bg-[#1a1a1a]" />
          </div>
        </div>
      </div>
    </div>
  );
}
