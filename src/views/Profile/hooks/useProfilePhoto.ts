import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { setEmployeePhoto, uploadAvatar } from "@/services/avatars/avatars";
import { toast } from "@/lib/toast";
import type { Me } from "@/types/profile";
import { storagePath } from "../utils/storagePath";
import { toSquareWebp } from "../utils/toSquareWebp";

// Profil şəklini yüklə / sil (baza yalnız öz şəklinə icazə verir: set_employee_photo)
export function useProfilePhoto(me: Me) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(me.photoUrl);
  const [pending, setPending] = useState(false);

  async function save(url: string | null) {
    await setEmployeePhoto(me.employeeId!, url, storagePath(photoUrl));
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
      await save(await uploadAvatar(path, blob));
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
