"use client";

import { CalendarOff, Plus } from "lucide-react";
import { emitPanel, PANEL_EVENTS } from "@/components/panel/nav";
import { leaveRange } from "@/shared/utils/attendance/leaveRange";
import type { LeavesHeroProps } from "@/types/leaves";

// Tünd xülasə: bu il / bu ay icazə günü, növbəti icazə, gözləyən + "İcazə istə"
export function LeavesHero({ stats }: LeavesHeroProps) {
  return (
    <section className="flex flex-wrap items-center gap-x-10 gap-y-4 rounded-[18px] max-sm:gap-y-2.5 max-sm:px-4 max-sm:py-3.5 bg-[#0c1b36] bg-[radial-gradient(520px_220px_at_100%_0%,rgba(34,195,230,0.22),transparent_70%)] px-6 py-5 text-white">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-frost max-sm:h-10 max-sm:w-10"><CalendarOff size={22} /></span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">İcazələrim</p>
          <p className="text-2xl font-extrabold leading-tight max-sm:text-xl">{stats.year} gün <span className="text-base font-semibold text-white/60">bu il</span></p>
        </div>
      </div>
      <dl className="flex flex-1 flex-wrap gap-x-10 gap-y-3 max-sm:grid max-sm:basis-full max-sm:grid-cols-[auto_minmax(0,1fr)_auto] max-[360px]:grid-cols-3 max-sm:gap-1.5 max-sm:[&>div]:rounded-xl max-sm:[&>div]:bg-white/[0.07] max-sm:[&>div]:px-2.5 max-sm:[&>div]:py-1.5 max-[360px]:[&>div]:px-2 max-sm:[&_dd]:whitespace-nowrap max-sm:[&_dd]:text-lg max-[360px]:[&_dd]:!text-[13px]">
        <div><dt className="text-xs text-white/55">Bu ay</dt><dd className="text-2xl font-extrabold tabular-nums">{stats.month} gün</dd></div>
        <div>
          <dt className="whitespace-nowrap text-xs text-white/55">Növbəti<span className="max-sm:hidden"> icazə</span></dt>
          <dd className="whitespace-nowrap text-2xl font-extrabold tabular-nums">
            {stats.next ? <><span className="max-[360px]:hidden">{leaveRange(stats.next)}</span><span className="hidden max-[360px]:inline">{leaveRange(stats.next).replaceAll(" ", "")}</span></> : <span className="text-white/50">Yoxdur</span>}
          </dd>
        </div>
        <div><dt className="text-xs text-white/55">Gözləyən</dt><dd className={`text-2xl font-extrabold tabular-nums ${stats.pending ? "text-frost" : ""}`}>{stats.pending}</dd></div>
      </dl>
      <button type="button" onClick={() => emitPanel(PANEL_EVENTS.leave)} className="btn shrink-0 !bg-white !text-[#0c1b36] hover:!bg-frost max-sm:w-full max-sm:!h-7 max-sm:!text-[13px]">
        <Plus size={16} /> İcazə istə
      </button>
    </section>
  );
}
