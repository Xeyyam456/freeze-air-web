"use server";

import { insertContactRequest } from "@/services/site/insertContactRequest.server";
import type { ContactFormState } from "@/types/site";

const field = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

// Saytdakı "Bizə yazın" forması: müraciət bazaya yazılır, admin panelində "Müraciətlər" səhifəsində görünür.
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

  const error = await insertContactRequest({ name, phone, email: email || null, message: message || null });

  // Bazadakı sürət limiti (contact_requests_throttle): eyni telefondan saatda 3, ümumi 10 dəqiqədə 20
  if (error?.message.includes("too_many_requests")) return { error: "Çox sayda müraciət göndərilib. Bir az sonra yenidən yoxlayın və ya zəng edin." };
  if (error) return { error: "Göndərilmədi. Bir az sonra yenidən yoxlayın və ya zəng edin." };
  return { ok: true };
}
