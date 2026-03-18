"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#333] bg-[#1a1a1a]">
        <FileQuestion className="h-7 w-7 text-[#666]" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-white">Page not found</h2>
      <p className="mb-6 max-w-md text-sm text-[#666]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild className="bg-cyan-500 text-black hover:bg-cyan-400">
        <Link href="/admin">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
