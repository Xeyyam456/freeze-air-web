"use client";

import { markServerFresh } from "@/lib/queryClient";
import type { PrefetchMarkProps } from "@/types/panel";

// Prefetch-in göndərdiyi açarları brauzerdə qeyd edir (render zamanı, uşaqların effektlərindən əvvəl):
// səhifəyə təkrar keçiddə useData köhnəlmiş keşi görüb Supabase-ə ikinci sorğu atmır, server datası gəlir.
export function PrefetchMark({ keys }: PrefetchMarkProps) {
  markServerFresh(keys);
  return null;
}
