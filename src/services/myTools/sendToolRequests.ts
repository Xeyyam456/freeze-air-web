import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { Tool } from "@/types/depot";

// Ustanın alət/material istəyi (0086): hamısı eyni batch ilə yazılır, depoda bir qrup kimi görünür.
// Alınmayanlar ayrıca tostla bildirilir; qaytarır: alınmayanların sayı.
export async function sendToolRequests(items: { tool: Tool; amount: number }[], note: string) {
  const batch = crypto.randomUUID();
  let failed = 0;
  for (const { tool, amount } of items) {
    const { error } = await createClient().rpc("depot_request_create", { p_tool_id: tool.id, p_quantity: amount, p_note: note.trim() || undefined, p_batch: batch });
    if (error) { failed++; toast.error(`${tool.name}: ${error.message}`); }
  }
  revalidate();
  if (failed < items.length) toast.success(`${items.length - failed} istək göndərildi: depo məsulu təsdiqləyəndə sənə veriləcək`);
  return failed;
}
