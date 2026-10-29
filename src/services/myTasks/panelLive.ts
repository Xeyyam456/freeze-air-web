import { createClient } from "@/lib/supabase/client";
import type { LiveCtx, LiveHandlers } from "@/types/myTasks";

// Usta panelinin bir Realtime kanalı: tasks, leave_requests (UPDATE), tool_assignments, depot_requests.
// Kanal sessiya yüklənəndən sonra açılır: yoxsa Realtime-a qonaq (anon) kimi qoşulur və RLS hadisələri göndərmir.
// Qaytarılan funksiya kanalı bağlayır.
export function subscribePanelLive(h: LiveHandlers) {
  const supabase = createClient();
  const ctx: LiveCtx = { me: null, keeper: false };
  let cancelled = false;
  let channel: ReturnType<typeof supabase.channel> | null = null;

  const subscribe = () => supabase
    .channel("tasks")
    .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (p) => h.tasks(p, ctx))
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "leave_requests" }, (p) => h.leaves(p, ctx))
    .on("postgres_changes", { event: "*", schema: "public", table: "tool_assignments" }, (p) => h.assignments(p, ctx))
    .on("postgres_changes", { event: "*", schema: "public", table: "depot_requests" }, (p) => h.depot(p, ctx))
    .subscribe();

  (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (cancelled || !session) return;
    await supabase.realtime.setAuth(session.access_token);
    const [{ data }, { data: canManage }] = await Promise.all([supabase.rpc("my_employee_id"), supabase.rpc("can_manage_tools")]);
    if (cancelled) return;
    ctx.me = data ?? null;
    ctx.keeper = canManage === true; // depo məsulu / admin: yeni depo sənədində tost
    h.ready(ctx);
    channel = subscribe();
  })();

  return () => {
    cancelled = true;
    if (channel) void supabase.removeChannel(channel);
  };
}
