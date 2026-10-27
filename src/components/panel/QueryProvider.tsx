"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";

// Usta panelinin məlumat keşi (TanStack Query): useData / revalidate() bunu işlədir (admin ilə eyni, lib/queryClient.ts)
export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
