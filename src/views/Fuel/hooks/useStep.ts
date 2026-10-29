import { useState } from "react";
import { toast } from "@/lib/toast";
import type { StepProps } from "@/types/myFuel";

// Səhər / axşam addımının forması: km, şəkil (önizləmə ilə), yoxlamalar; "Dəyiş" ilə yazılmış km düzəldilir
export function useStep({ value, photo, min, max, onSave }: StepProps) {
  const [editing, setEditing] = useState(false);
  const [km, setKm] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function pick(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(km.replace(/\s/g, ""));
    if (!km || !Number.isInteger(n) || n < 0) return toast.error("Km-i tam rəqəmlə yaz.");
    if (min !== undefined && n < min) return toast.error("Axşam km səhər km-dən az ola bilməz.", `Səhər km: ${min.toLocaleString("az")}. Daha böyük rəqəm yaz.`);
    if (max !== undefined && n > max) return toast.error("Səhər km axşam km-dən çox ola bilməz.", `Axşam km: ${max.toLocaleString("az")}. Daha kiçik rəqəm yaz və ya əvvəl axşam km-ni düzəlt.`);
    if (!file && !photo) return toast.error("Spidometrin şəklini çək.");
    setPending(true);
    const ok = await onSave(n, file);
    setPending(false);
    if (ok) { setEditing(false); setKm(""); pick(null); }
  }

  return {
    editing, km, preview, pending, pick, submit,
    done: value !== null && !editing,
    setKm: (v: string) => setKm(v.replace(/[^\d\s]/g, "")),
    startEdit: () => { setEditing(true); setKm(String(value)); },
    cancel: () => { setEditing(false); pick(null); },
  };
}
