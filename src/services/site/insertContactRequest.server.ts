import { publicSiteClient } from "@/lib/site-client";

// Saytdan gələn müraciəti bazaya yazır. Qonaq üçün cookie-siz klient; baza yalnız əlavə etməyə icazə verir (oxumaq yalnız admin).
export async function insertContactRequest(row: { name: string; phone: string; email: string | null; message: string | null }) {
  const { error } = await publicSiteClient().from("contact_requests").insert(row);
  return error;
}
