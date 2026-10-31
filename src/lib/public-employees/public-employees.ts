import { cacheLife, cacheTag } from "next/cache";
import { SITE_CACHE, SITE_TAG } from "@/lib/site-cache";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { experience } from "@/lib/experience";
import type { PublicEmployee } from "@/types/site";
import type { PublicManager } from "@/types/site";

// İşə başlama tarixindən tam ay sayı (experience() ilə eyni hesab; lib/experience.ts admin ilə sinxrondur, ona toxunmuruq)
function monthsSince(startDate: string | null, now = new Date()) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime()) || start > now) return 0;
  let m = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) m -= 1;
  return Math.max(0, m);
}

// Açıq saytın "Ustalarımız" səhifəsi: yalnız ad, ixtisas, şəkil və təcrübə (bazada public_employees() funksiyası).
// Keşdə saxlanır, hər dəqiqə yenilənir; təcrübə də burada hesablanır.
export async function getPublicEmployees(): Promise<PublicEmployee[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data } = await supabase.rpc("public_employees");

  return (data ?? []).map((e) => ({
    id: e.id,
    full_name: e.full_name,
    specialty: e.specialty,
    photo_url: e.photo_url,
    experience: experience(e.start_date),
    worker_type: e.worker_type,
    months: monthsSince(e.start_date),
  }));
}

// Açıq saytda "Rəhbərlik": yalnız ad, vəzifə və şəkil (bazada public_management(); müdir birinci)
export async function getPublicManagement(): Promise<PublicManager[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data } = await supabase.rpc("public_management");
  return data ?? [];
}
