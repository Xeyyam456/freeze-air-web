import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_KEY } from "@/lib/env";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Database } from "@/types/database";

export async function createClient() {
  // Supabase klienti daxildə Date.now() işlədir; prerender-dən çıxarıb sorğu vaxtına keçiririk.
  await connection();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component-dən çağırılanda yazmaq olmur; sessiyanı proxy yeniləyir.
          }
        },
      },
    },
  );
}
