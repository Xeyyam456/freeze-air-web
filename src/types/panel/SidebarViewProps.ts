import type { Me } from "@/types/profile";

export type SidebarViewProps = { showDepot: boolean; showFuel?: boolean; me: Me | null; pathname: string | null };
