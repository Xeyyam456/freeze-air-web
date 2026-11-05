import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import type { PrefetchProps } from "@/types/panel";

// Usta panelinin səhifələri üçün ümumi qəlib: məlumat serverdə, səhifə ilə birlikdə gəlir (açılan an dolu, "Yüklənir..." yox).
// Səhifə yalnız yükləyicini verir; nəticə TanStack keşinə qoyulur, brauzerdəki useData eyni açarla keşdən götürür
// (30 san. təkrar sorğulamır, sonra canlı yenilənmə və revalidate() əvvəlki kimi işləyir).
// Sorğu xəta versə səhifə dayanmır: keş boş qalır, brauzer özü yükləyir.
export async function Prefetch({ load, children }: PrefetchProps) {
  const qc = new QueryClient();
  const entries = await load(await createClient()).catch(() => []);
  for (const e of entries) qc.setQueryData(e.key, e.data);
  return <HydrationBoundary state={dehydrate(qc)}>{children}</HydrationBoundary>;
}
