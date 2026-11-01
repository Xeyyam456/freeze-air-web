import { createClient } from "@/lib/supabase/client";
import type { PlaceLocationArgs } from "@/types/clients";

// Mağaza/filial/sabit məkanın ünvanını və ya koordinatını dəyişir (hər dəyişiklik jurnala düşür); xəta mətni və ya null
export async function setPlaceLocation(args: PlaceLocationArgs): Promise<string | null> {
  const { error } = await createClient().rpc("place_set_location", args);
  return error?.message ?? null;
}
