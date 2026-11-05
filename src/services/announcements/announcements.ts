import { createClient } from "@/lib/supabase/client";
import type { DbClient } from "@/types/shared";
import type { Announcement, AnnouncerState } from "@/types/announcements";

// Elanlar (0098): hamı oxuyur; göndərmək rəhbərlikdir (admin və ya rəhbərlik kartı) — bazada RLS yoxlayır
export async function fetchAnnouncements(supabase: DbClient = createClient()): Promise<Announcement[]> {
  const { data, error } = await supabase.from("announcements")
    .select("id, title, body, created_by, created_by_name, created_at").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}

// Göndərən kimdir və rəhbərlikdirmi (form yalnız onlara görünür)
export async function fetchAnnouncerState(supabase: DbClient = createClient()): Promise<AnnouncerState> {
  const [{ data: { user } }, { data: canSend }] = await Promise.all([supabase.auth.getUser(), supabase.rpc("is_management")]);
  return { me: user?.id ?? null, canSend: canSend === true };
}

export async function createAnnouncement(title: string, body: string): Promise<string | null> {
  const { error } = await createClient().from("announcements").insert({ title: title.trim(), body: body.trim() });
  return error ? (error.code === "42501" ? "Elanı yalnız rəhbərlik göndərə bilər." : error.message) : null;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  const { error } = await createClient().from("announcements").delete().eq("id", id);
  if (error) throw error;
}


// Oxunmamış elanlar (0105): son baxışdan sonra başqasının yazdığı — menyu nişanı
export async function fetchUnreadAnnouncements(): Promise<number> {
  const { data } = await createClient().rpc("unread_announcements");
  return data ?? 0;
}

// Elanlar səhifəsi açılanda: hamısı oxundu (telefon və kompüter eyni sayı görür, bazadadır)
export async function markAnnouncementsSeen(): Promise<void> {
  await createClient().rpc("mark_announcements_seen");
}
