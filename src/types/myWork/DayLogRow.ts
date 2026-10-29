import type { FileCount } from "@/lib/jobs";

// Görülən işlər (Panel): günün işi; qrup işi bir sətir
export type DayLogRow = {
  id: number;
  created_at: string;
  description: string;
  place_text: string | null;
  employees: { full_name: string; photo_url: string | null } | null;
  stores: { name: string; companies: { name: string } | null } | null;
  companies: { name: string } | null;
  files?: FileCount;
};
