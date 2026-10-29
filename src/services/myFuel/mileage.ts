import { createClient } from "@/lib/supabase/client";
import type { StepKind } from "@/types/myFuel";

// Spidometr şəkli qapalı "mileage" bucket-inə: <əməkdaş_id>/<gün>-<addım>-<uuid>.webp
export async function uploadMileagePhoto(employeeId: number, today: string, kind: StepKind, blob: Blob) {
  const path = `${employeeId}/${today}-${kind}-${crypto.randomUUID()}.webp`;
  const { error } = await createClient().storage.from("mileage").upload(path, blob, { contentType: "image/webp" });
  if (error) throw new Error(error.message);
  return path;
}

// Səhər km-i (günün ilk yazısı) yeni sətir yaradır; qalanı bu günün sətrini dəyişir. Xəta mətni və ya null
export async function saveMileage(employeeId: number, kind: StepKind, km: number, photo: string | null, todayId: number | null) {
  const supabase = createClient();
  const { error } = kind === "start" && todayId === null
    ? await supabase.from("mileage_logs").insert({ employee_id: employeeId, start_km: km, start_photo: photo })
    : await supabase.from("mileage_logs").update(kind === "start"
      ? { start_km: km, ...(photo ? { start_photo: photo } : {}) }
      : { end_km: km, ...(photo ? { end_photo: photo } : {}) }).eq("id", todayId!);
  return error?.message ?? null;
}

// Qapalı bucket-dəki şəkil: imzalı link (1 saat)
export async function mileagePhotoUrl(path: string) {
  const { data } = await createClient().storage.from("mileage").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
