import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import type { PrefetchProps } from "@/types/panel";
import { PrefetchMark } from "../PrefetchMark";

// Usta panelinin səhifələri üçün ümumi qəlib: məlumat serverdə, səhifə ilə birlikdə gəlir (açılan an dolu, "Yüklənir..." yox).
// Səhifə yalnız yükləyicini verir; nəticə TanStack keşinə qoyulur, brauzerdəki useData eyni açarla keşdən götürür
// (30 san. təkrar sorğulamır, sonra canlı yenilənmə və revalidate() əvvəlki kimi işləyir).
// Sorğu xəta versə səhifə dayanmır: keş boş qalır, brauzer özü yükləyir. PrefetchMark: təkrar keçiddə brauzer eyni datanı ikinci dəfə yükləməsin.
export async function Prefetch({ load, children }: PrefetchProps) {
  const qc = new QueryClient();
  const entries = await load(await createClient()).catch(() => []);
  for (const e of entries) qc.setQueryData(e.key, e.data);
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <PrefetchMark keys={entries.map((e) => e.key)} />
      {children}
    </HydrationBoundary>
  );
}
