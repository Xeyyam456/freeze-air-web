import type { NavService } from "@/types/site";

export type SiteNavProps = {
  pages: { href: string; label: string }[];
  services?: NavService[];
  className?: string;
};
