"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-white">
        Something went wrong
      </h2>
      <p className="mb-6 max-w-md text-sm text-[#666]">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button
        onClick={reset}
        className="bg-cyan-500 text-black hover:bg-cyan-400"
      >
        Try again
      </Button>
    </div>
  );
}
