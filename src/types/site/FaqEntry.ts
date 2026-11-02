import type { getFaq } from "@/services/site/fetchSiteTrust.server";

export type FaqEntry = Awaited<ReturnType<typeof getFaq>>[number];
