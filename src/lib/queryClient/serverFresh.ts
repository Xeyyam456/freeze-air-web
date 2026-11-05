import { hashKey, type Query } from "@tanstack/react-query";

// Serverdən (components/panel/Prefetch) təzə məlumatı gələn açarlar. HydrationBoundary keşdə ARTIQ olan sorğulara
// təzə datanı effektdə qoyur; o vaxta qədər useData köhnəlmiş datanı görüb brauzerdən də yükləməsin (iki dəfə yüklənməsin).
const fresh = new Map<string, number>();
const WINDOW = 5_000;

export function markServerFresh(keys: readonly (readonly unknown[])[]) {
  const t = Date.now();
  for (const k of keys) fresh.set(hashKey(k), t);
}

// QueryClient-in refetchOnMount-u: true = standart davranış (köhnəlibsə yüklə), false = server datası yoldadır
export function refetchOnMount(query: Query) {
  const t = fresh.get(query.queryHash);
  return !(t && Date.now() - t < WINDOW);
}
