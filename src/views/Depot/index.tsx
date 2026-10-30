"use client";

import type { DepotPageProps } from "@/types/depot";
import { DepotScreen } from "./components/DepotScreen";
import { useDepotData } from "./queries/useDepotData";

// Web depo səhifəsi (depo məsulu üçün): yetki app/(panel)/depo/page.tsx-də serverdə yoxlanır.
// Ekran admin-dən kopyalanıb və ayrıdır; "Depo məsulu" pəncərəsi yalnız admindədir.
export function DepotPage({ myUid, owner }: DepotPageProps) {
  const data = useDepotData();
  return <DepotScreen data={data} canManage myUid={myUid} owner={owner} variant="web" />;
}
