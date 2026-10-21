"use client";

import { useEffect } from "react";
import { leaveRange } from "@/lib/attendance";
import { isSoundReady, playNotify } from "@/lib/sound";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";
import { refreshMyOpenTasks, TASKS_CHANGED } from "@/lib/tasks-live";
import { toast } from "@/lib/toast";

// Tab arxa planda olanda başlıqda "(N)" göstərilir, tab açılanda silinir (səs olmasa da tab-da görünsün)
let unseen = 0;
let baseTitle = "";
function markTitle() {
  if (!document.hidden) return;
  baseTitle ||= document.title;
  unseen += 1;
  document.title = `(${unseen}) Yeni tapşırıq · ${baseTitle}`;
}
function clearTitle() {
  if (document.hidden || !unseen) return;
  unseen = 0;
  document.title = baseTitle;
  baseTitle = "";
}

// Yer adı tostda: mağaza (şirkət adı ilə) | şirkət | siyahıda olmayan yer
async function placeName(t: Tables<"tasks">) {
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

// Tapşırıqlar Realtime ilə (migrasiya 0056): admin ustaya tapşırıq verəndə həmin ustaya tost + qısa səs + tab başlığı,
// geri alanda (0057) xəbərdarlıq tostu;
// hər dəyişiklikdə Tapşırıqlar siyahısı, "Mənim bugünüm" və menyudakı nişan yenilənir. Ekranda heç nə çəkmir.
export function TasksListener() {
  useEffect(() => {
    const supabase = createClient();
    let me: number | null = null;
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const subscribe = () => supabase
      .channel("tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, async (payload) => {
        window.dispatchEvent(new Event(TASKS_CHANGED));
        void refreshMyOpenTasks(me);
        const t = payload.new as Tables<"tasks">;
        if (!me || t.employee_id !== me) return;
        // Admin öz tapşırığımı geri aldı (başqa ustaya verə bilər): xəbərdarlıq, səssiz
        if (payload.eventType === "UPDATE" && t.cancelled_at && !(payload.old as Partial<Tables<"tasks">>).cancelled_at) {
          toast.error(`Tapşırıq geri alındı: ${(await placeName(t)) || t.reason}`, t.reason);
          return;
        }
        if (payload.eventType !== "INSERT") return;
        const place = await placeName(t);
        const silent = !isSoundReady();
        toast.success(`Yeni tapşırıq: ${place || t.reason}`, silent ? `${t.reason} · səs üçün səhifədə bir dəfə klik et` : t.reason);
        playNotify();
        markTitle();
      })
      // İcazə sorğuma qərar verildi (0059): təsdiq və ya rədd tostu
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "leave_requests" }, (payload) => {
        const l = payload.new as Tables<"leave_requests">;
        if (!me || l.employee_id !== me || l.status === (payload.old as Partial<Tables<"leave_requests">>).status) return;
        const range = leaveRange(l);
        if (l.status === "approved") toast.success(`İcazən təsdiqləndi: ${range}`, l.reason ?? undefined);
        else if (l.status === "rejected") toast.error(`İcazən rədd edildi: ${range}`, l.reason ?? undefined);
        playNotify();
      })
      .subscribe();

    // Kanal sessiya yüklənəndən sonra açılır: yoxsa Realtime-a qonaq (anon) kimi qoşulur və RLS hadisələri göndərmir
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled || !session) return;
      await supabase.realtime.setAuth(session.access_token);
      const { data } = await supabase.rpc("my_employee_id");
      if (cancelled) return;
      me = data ?? null;
      void refreshMyOpenTasks(me);
      channel = subscribe();
    })();

    document.addEventListener("visibilitychange", clearTitle);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", clearTitle);
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
