"use client";

import { useState } from "react";
import { CalendarCheck, CalendarOff, CalendarRange } from "lucide-react";
import { AttendanceCalendar } from "@/components/employees/AttendanceCalendar";
import { LeaveModal } from "../LeaveModal";
import { MyDayStatsGrid } from "./MyDayStatsGrid";
import { PresenceActions } from "./PresenceActions";
import { SessionList } from "./SessionList";
import { useMyDay } from "./useMyDay";

// Mənim bugünüm: davamiyyət ("İşə gəldim" / vəziyyət, "İcazə istə"), dörd göstərici (bu gün, bu ay, bugünkü tapşırıqlar, məndə olan alət/material) "İş əlavə et" üst zolaqdadır (hər səhifədə, components/panel/TopbarTools.tsx).
// Əməkdaş kartı olmayan hesabda (məs. yalnız admin) görünmür. Tapşırıq dəyişəndə (Realtime) və iş yazılanda yenilənir.
export function MyDay() {
  const { me, stats, checking, mine, onCheckIn, onGiveUpLeave, onCheckOut } = useMyDay();
  const [leaving, setLeaving] = useState(false); // "İcazə istə" pəncərəsi
  const [calendar, setCalendar] = useState(false); // davamiyyət təqvimi
  if (me === null) return null;
  const p = mine?.today?.presence;

  const leaveBtn = (cls: string) => (
    <button type="button" disabled={!me} onClick={() => setLeaving(true)} className={`btn btn-soft btn-sm !h-9 ${cls}`} title="İcazə sorğusu: admin təsdiqləyir">
      <CalendarOff size={15} /> İcazə istə{mine?.pendingLeave ? ` (${mine.pendingLeave})` : ""}
    </button>
  );

  return (
    <section className="card space-y-3 !py-4">
      {leaving && me && <LeaveModal employeeId={me.id} onClose={() => setLeaving(false)} />}
      {calendar && me && <AttendanceCalendar employeeId={me.id} name={me.name} onClose={() => setCalendar(false)} />}
      <div className="flex flex-wrap items-center gap-3">
        <span className="icon-tile shrink-0"><CalendarCheck size={20} /></span>
        <p className="muted text-xs font-semibold uppercase tracking-wide max-sm:flex-1 sm:max-lg:hidden">Mənim bugünüm</p>
        {/* Planşetdə başlıq yazısı gizlidir ki, hamısı bir sətrə sığsın. < 640: vəziyyət və düymələr ayrıca sətirdə: nişan üstdə tam endə, düymələr altda yarı-yarı
            (nişandan sonra tək düymə qalırsa o da tam endə); uzun düymə mətni sətrə keçə bilir */}
        <div className="flex items-center gap-2 sm:[&>.dpill]:whitespace-nowrap sm:max-lg:min-w-0 sm:max-lg:flex-1 sm:max-lg:[&>button]:shrink-0 max-sm:order-last max-sm:w-full max-sm:[&>*]:justify-center max-sm:grid max-sm:grid-cols-2 max-sm:[&>.dpill+*:last-child]:col-span-2 max-sm:[&>button]:!h-auto max-sm:[&>button]:min-h-9 max-sm:[&>button]:py-2 max-sm:[&>button]:leading-tight">
          <PresenceActions day={mine?.today} checking={checking} onCheckIn={onCheckIn} onCheckOut={onCheckOut} onGiveUpLeave={onGiveUpLeave} />
          {leaveBtn("sm:hidden")}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button type="button" disabled={!me} onClick={() => setCalendar(true)} className="icon-btn !h-9 !w-9" title="Davamiyyət təqvimim" aria-label="Davamiyyət təqvimim">
            <CalendarRange size={16} />
          </button>
          {leaveBtn("max-sm:hidden")}
        </div>
      </div>
      {/* Bugünkü seanslar: hər biri ayrıca sətir, nömrə ilə (yalnız yenidən işə çıxanda) */}
      {p && p.sessions.length > 1 && <SessionList sessions={p.sessions} />}
      <MyDayStatsGrid s={stats} />
    </section>
  );
}
