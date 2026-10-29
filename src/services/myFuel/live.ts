import { createClient } from "@/lib/supabase/client";
import type { FuelPayment } from "@/types/fuel";

// Canlı (0080-0082): yalnız bu ustanın ödənişləri və yürüşləri. Kanal sessiya ilə qoşulur (yoxsa RLS hadisə göndərmir).
// onPayment: yeni ödənişdə ödənişin özü, dəyişiklik/silinmədə null. Qaytarılan funksiya kanalı bağlayır.
export function subscribeMyFuel(employeeId: number, onPayment: (inserted: FuelPayment | null) => void, onMileage: () => void) {
  const supabase = createClient();
  let cancelled = false;
  let channel: ReturnType<typeof supabase.channel> | null = null;
  (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (cancelled) return;
    if (session) await supabase.realtime.setAuth(session.access_token);
    channel = supabase
      .channel(`fuel-${employeeId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "fuel_payments", filter: `employee_id=eq.${employeeId}` },
        (payload) => onPayment(payload.eventType === "INSERT" ? (payload.new as FuelPayment) : null))
      .on("postgres_changes", { event: "*", schema: "public", table: "mileage_logs", filter: `employee_id=eq.${employeeId}` }, () => onMileage())
      .subscribe();
  })();
  return () => {
    cancelled = true;
    if (channel) void supabase.removeChannel(channel);
  };
}
