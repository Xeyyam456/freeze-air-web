import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

// Yer adı tostda: mağaza (şirkət adı ilə) | şirkət | siyahıda olmayan yer
export async function placeName(t: Tables<"tasks">) {
  const supabase = createClient();
  if (t.store_id) {
    const { data } = await supabase.from("stores").select("code, name, companies(name)").eq("id", t.store_id).maybeSingle();
    if (data) return `${data.companies?.name ?? ""} · ${data.code} ${data.name}`;
  }
  if (t.company_id) {
    const { data } = await supabase.from("companies").select("name").eq("id", t.company_id).maybeSingle();
    if (data) return data.name;
  }
  return t.place_text ?? "";
}

export async function toolName(id: number) {
  const { data } = await createClient().from("tools").select("name").eq("id", id).maybeSingle();
  return data?.name ?? null;
}

// Alət/material adı və ölçü vahidi (tostda "5 kq" kimi göstərmək üçün); alətdə "ədəd"
export async function toolLabel(id: number) {
  const { data } = await createClient().from("tools").select("name, kind, unit").eq("id", id).maybeSingle();
  return data ? { name: data.name, unit: data.kind === "material" ? data.unit : "ədəd" } : null;
}
