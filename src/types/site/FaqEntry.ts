import type { getFaq } from "@/lib/site-trust";

export type FaqEntry = Awaited<ReturnType<typeof getFaq>>[number];
