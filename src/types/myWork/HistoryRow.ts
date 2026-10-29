import type { FileCount } from "@/lib/jobs";

// Obyektin tarixçəsində iş
export type HistoryRow = {
  id: number;
  work_date: string;
  created_at: string;
  description: string;
  employees: { full_name: string; photo_url: string | null } | null;
  stores: { code: string; name: string } | null;
  files?: FileCount;
};
