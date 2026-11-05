import { createClient } from "@/lib/supabase/client";
import type { DbClient } from "@/types/shared";
import type { ErrorCode, ErrorModel } from "@/types/errorCodes";

// Xəta kodları (yalnız baxış): modellər + kodlar. supabase: serverdə prefetch üçün
export async function fetchCodes(supabase: DbClient = createClient()): Promise<{ models: ErrorModel[]; codes: ErrorCode[] }> {
  const [models, codes] = await Promise.all([
    supabase.from("ac_models").select("id, name").order("name").then((r) => r.data ?? []),
    supabase.from("ac_error_codes").select("id, model_id, code, title, solution").order("code").then((r) => r.data ?? []),
  ]);
  return { models: models.sort((a, b) => a.name.localeCompare(b.name, "az")), codes };
}
