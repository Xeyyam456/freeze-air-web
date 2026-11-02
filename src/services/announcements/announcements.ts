import { createClient } from "@/lib/supabase/client";
import type { Announcement } from "@/types/announcements";

// Elanlar (0098): hamı oxuyur; göndərmək rəhbərlikdir (admin və ya rəhbərlik kartı) — bazada RLS yoxlayır
export async function fetchAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await createClient().from("announcements")
    .select("id, title, body, created_by, created_by_name, created_at").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}

// Göndərən kimdir və rəhbərlikdirmi (form yalnız onlara görünür)
export async function fetchAnnouncerState(): Promise<{ me: string | null; canSend: boolean }> {
  const supabase = createClient();
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

// Yeni elan canlı gəlsin: açıq səhifədə siyahı yenilənir (sessiya ilə qoşulur, yoxsa RLS hadisə göndərmir)
export function watchAnnouncements(onChange: () => void) {
  const supabase = createClient();
  let channel: ReturnType<typeof supabase.channel> | null = null;
  let closed = false;
  void supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session) await supabase.realtime.setAuth(session.access_token);
    if (closed) return;
    channel = supabase.channel(`announcements-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, onChange)
      .subscribe();
  });
  return () => {
    closed = true;
    if (channel) void supabase.removeChannel(channel);
  };
}
