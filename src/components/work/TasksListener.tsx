"use client";

import { useEffect } from "react";
import { leaveRange } from "@/lib/attendance";
import { isSoundReady, playNotify } from "@/lib/sound";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";
import { revalidate } from "@/lib/revalidate";
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
    let keeper = false; // depo məsulu / admin: yeni depo sənədində tost
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
      // Depo (0084): mənə alət verildi → "Aldım" xatırlatması; sorğuma cavab → tost; depo məsuluna yeni sənəd → tost.
      // Hər dəyişiklikdə Alətlərim və Depo səhifələri yenilənir (useData → revalidate).
      .on("postgres_changes", { event: "*", schema: "public", table: "tool_assignments" }, async (payload) => {
        revalidate();
        const a = payload.new as Partial<Tables<"tool_assignments">>;
        const o = payload.old as Partial<Tables<"tool_assignments">>;
        if (!me || a.employee_id !== me || a.returned_at || a.received_at) return;
        const given = payload.eventType === "INSERT" || (o.received_at && !a.received_at);
        if (!given) return;
        const { data: t } = await supabase.from("tools").select("name").eq("id", a.tool_id!).maybeSingle();
        toast.success(`Sənə verildi: ${t?.name ?? "alət"}`, "Alətlərim bölməsində «Aldım» ilə təsdiqlə");
        playNotify();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "depot_requests" }, (payload) => {
        revalidate();
        const r = payload.new as Tables<"depot_requests">;
        const o = payload.old as Partial<Tables<"depot_requests">>;
        if (payload.eventType === "INSERT" && keeper && r.employee_id !== me) {
          toast.success(`Depo: ${r.created_by_name ?? ""}`, `${r.tool_name} · ${r.type === "return" ? "qaytarır" : r.type === "request" ? "istəyir" : "təsdiq gözləyir"}`);
          playNotify();
          return;
        }
        if (payload.eventType !== "UPDATE" || !me || r.employee_id !== me || r.status === o.status || !r.decided_by) return;
        const what = r.type === "return" ? "Qaytarman" : r.type === "request" ? "İstəyin" : "Sənəd";
        if (r.status === "approved") toast.success(`${what} qəbul edildi: ${r.tool_name}`, r.decided_by_name ?? undefined);
        else if (r.status === "rejected") toast.error(`${what} rədd edildi: ${r.tool_name}`, r.decision_note ?? r.decided_by_name ?? undefined);
        playNotify();
      })
      .subscribe();

    // Kanal sessiya yüklənəndən sonra açılır: yoxsa Realtime-a qonaq (anon) kimi qoşulur və RLS hadisələri göndərmir
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled || !session) return;
      await supabase.realtime.setAuth(session.access_token);
      const [{ data }, { data: canManage }] = await Promise.all([supabase.rpc("my_employee_id"), supabase.rpc("can_manage_tools")]);
      if (cancelled) return;
      me = data ?? null;
      keeper = canManage === true;
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
