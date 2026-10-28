import type { fetchMine } from "@/services/myTools/fetchMine";

// Alətlərim səhifəsinin məlumatı (üzərimdəkilər, sorğularım, depo, kimdə nə var)
export type MineData = Awaited<ReturnType<typeof fetchMine>>;
