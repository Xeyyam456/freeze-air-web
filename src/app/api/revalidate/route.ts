import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { SITE_TAG } from "@/lib/site-cache";

// Admin paneli saytın məzmununu dəyişəndən sonra bunu çağırır: açıq saytın keşi dərhal təmizlənir.
// Yoxlama: admin sessiyasının JWT-si (Authorization: Bearer) göndərilir, baza `is_admin()` ilə təsdiqləyir.
// Paylaşılan gizli açar yoxdur. CORS yalnız ADMIN_ORIGIN üçün (standart: yerli admin paneli).
const ALLOWED_ORIGIN = process.env.ADMIN_ORIGIN ?? "http://localhost:5173";

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  Vary: "Origin",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ ok: false }, { status: 401, headers: cors });

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } },
  );
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) return Response.json({ ok: false }, { status: 403, headers: cors });

  revalidateTag(SITE_TAG, { expire: 0 });
  return Response.json({ ok: true }, { headers: cors });
}
