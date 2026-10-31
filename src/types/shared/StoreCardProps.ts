import type { Tables } from "@/types/database";

export type StoreCardProps = {
  store: Tables<"stores">;
  companyName?: string;
  action?: React.ReactNode;
  onHistory?: () => void; // "Tarixçə": bu filialda/mağazada görülən işlər (work/PlaceHistory.tsx)
};
