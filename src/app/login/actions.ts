"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(_prev: string | null, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (error) return "E-poçt və ya parol səhvdir.";
  redirect("/panel");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/"); // çıxışdan sonra landing
}
