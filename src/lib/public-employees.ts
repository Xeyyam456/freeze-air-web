import { cacheLife } from "next/cache";
import { SITE_CACHE } from "@/lib/site-cache";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { experience } from "@/lib/experience";

export type PublicEmployee = {
  id: number;
  full_name: string;
  specialty: string | null;
  photo_url: string | null;
  experience: string | null;
};

// Açıq saytın "Ustalarımız" səhifəsi: yalnız ad, ixtisas, şəkil və təcrübə (bazada public_employees() funksiyası).
// Keşdə saxlanır, hər dəqiqə yenilənir; təcrübə də burada hesablanır.
export async function getPublicEmployees(): Promise<PublicEmployee[]> {
  "use cache";
  cacheLife(SITE_CACHE);

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
  }));
}

export type PublicManager = { id: number; full_name: string; job_title: string; photo_url: string | null };

// Açıq saytda "Rəhbərlik": yalnız ad, vəzifə və şəkil (bazada public_management(); müdir birinci)
export async function getPublicManagement(): Promise<PublicManager[]> {
  "use cache";
  cacheLife(SITE_CACHE);

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data } = await supabase.rpc("public_management");
  return data ?? [];
}
