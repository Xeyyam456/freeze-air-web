import { createClient } from "@/lib/supabase/client";

// Ustanın cavabı: "Aldım" / "Almadım" (fuel_payment_confirm, 0080-0081). Xəta mətni və ya null
export async function confirmPayment(id: number, received: boolean) {
  const { error } = await createClient().rpc("fuel_payment_confirm", { p_id: id, p_received: received });
  return error?.message ?? null;
}
