import { useData } from "@/lib/useData";
import { fetchMe } from "@/services/me/fetchMe";

// undefined = yüklənir, null = əməkdaş kartı yoxdur (məs. yalnız admin hesabı)
export function useMe(): { id: number; name: string } | null | undefined {
  const d = useData("me", fetchMe);
  return d === null ? undefined : d.me;
}
