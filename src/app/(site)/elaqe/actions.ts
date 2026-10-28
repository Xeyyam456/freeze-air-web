"use server";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type ContactFormState = { ok?: boolean; error?: string } | null;

const field = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

// Saytdakı "Bizə yazın" forması: müraciət bazaya yazılır, admin panelində "Müraciətlər" səhifəsində görünür.
// Qonaq üçün cookie-siz klient; baza yalnız əlavə etməyə icazə verir (oxumaq yalnız admin).
export async function sendContactRequest(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  // Gizli tələ sahəsi: insan görmür və doldurmur, botlar doldurur
  if (field(formData, "website")) return { ok: true };

  const name = field(formData, "name");
  const phone = field(formData, "phone");
  const email = field(formData, "email");
  const message = field(formData, "message");

  if (!name || name.length > 100) return { error: "Adınızı yazın." };
  if (phone.replace(/\D/g, "").length < 7 || phone.length > 30) return { error: "Telefon nömrəsini düzgün yazın." };
  if (email && (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return { error: "E-poçt düzgün deyil." };
  if (message.length > 1000) return { error: "Mesaj 1000 simvoldan uzun olmamalıdır." };

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { error } = await supabase.from("contact_requests").insert({
    name, phone, email: email || null, message: message || null,
  });

  // Bazadakı sürət limiti (contact_requests_throttle): eyni telefondan saatda 3, ümumi 10 dəqiqədə 20
  if (error?.message.includes("too_many_requests")) return { error: "Çox sayda müraciət göndərilib. Bir az sonra yenidən yoxlayın və ya zəng edin." };
  if (error) return { error: "Göndərilmədi. Bir az sonra yenidən yoxlayın və ya zəng edin." };
  return { ok: true };
}
