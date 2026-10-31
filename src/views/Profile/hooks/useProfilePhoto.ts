import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { Me } from "@/types/profile";
import { AVATAR_BUCKET } from "../utils/constants";
import { storagePath } from "../utils/storagePath";
import { toSquareWebp } from "../utils/toSquareWebp";

// Profil şəklini yüklə / sil (baza yalnız öz şəklinə icazə verir: set_employee_photo)
export function useProfilePhoto(me: Me) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(me.photoUrl);
  const [pending, setPending] = useState(false);

  async function save(url: string | null) {
    const supabase = createClient();
    const { error } = await supabase.rpc("set_employee_photo", { p_employee_id: me.employeeId!, p_url: url });
    if (error) throw error;
    const old = storagePath(photoUrl);
    if (old) await supabase.storage.from(AVATAR_BUCKET).remove([old]);
    setPhotoUrl(url);
    toast.success(url ? "Şəkil yadda saxlanıldı" : "Şəkil silindi");
    router.refresh();
  }

  async function onFile(file: File | undefined) {
    if (!file || !me.employeeId) return;
    if (!file.type.startsWith("image/")) return toast.error("Yalnız şəkil faylı seç.");
    setPending(true);
    try {
      const blob = await toSquareWebp(file);
      const path = `${me.employeeId}/${crypto.randomUUID()}.webp`;
      const supabase = createClient();
      const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, blob, { contentType: "image/webp" });
      if (error) throw error;
      await save(supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl);
    } catch {
      toast.error("Şəkil yüklənmədi. Başqa şəkil yoxla.");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onRemove() {
    setPending(true);
    try {
      await save(null);
    } catch {
      toast.error("Şəkil silinmədi.");
    } finally {
      setPending(false);
    }
  }

  return { inputRef, photoUrl, pending, onFile, onRemove };
}
