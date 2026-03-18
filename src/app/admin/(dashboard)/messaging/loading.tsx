export default function MessagingLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-36 animate-pulse rounded-lg bg-[#1a1a1a]" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded-lg bg-[#1a1a1a]" />
      </div>

      {/* Compose form skeleton */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-6">
        <div className="space-y-5">
          {/* Recipient filter */}
          <div>
            <div className="mb-2 h-3 w-20 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="flex gap-3">
              <div className="h-10 w-24 animate-pulse rounded-lg bg-[#1a1a1a]" />
              <div className="h-10 w-32 animate-pulse rounded-lg bg-[#1a1a1a]" />
            </div>
          </div>

          {/* Subject */}
          <div>
            <div className="mb-2 h-3 w-16 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-[#1a1a1a]" />
          </div>

          {/* Body */}
          <div>
            <div className="mb-2 h-3 w-24 animate-pulse rounded bg-[#1a1a1a]" />
            <div className="h-48 w-full animate-pulse rounded-lg bg-[#1a1a1a]" />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[#222] pt-5">
            <div className="h-10 w-24 animate-pulse rounded-lg bg-[#1a1a1a]" />
            <div className="h-10 w-32 animate-pulse rounded-lg bg-[#1a1a1a]" />
          </div>
        </div>
      </div>
    </div>
  );
}
