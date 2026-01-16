"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { EnhancedCursor } from "@/components/shared/enhanced-cursor";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedCursor />
      {children}
    </QueryClientProvider>
  );
}
