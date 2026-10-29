"use client";

import { TaskNoteModal } from "@/components/work/TaskNoteModal";
import { WorkLogModal } from "@/components/work/WorkLogModal";
import { DaySummary } from "./components/DaySummary";
import { EmptyDay } from "./components/EmptyDay";
import { MyTasksSection } from "./components/MyTasksSection";
import { TeamSection } from "./components/TeamSection";
import { WeekStrip } from "./components/WeekStrip";
import { useTasksView } from "./hooks/useTasksView";
import { placeOf } from "./utils/place";

// Tapşırıqlar: admin/rəhbərlik ustaya gün üçün iş verir (admin paneldə). Hamı görür; usta yalnız ÖZ tapşırığını "görüldü" işarələyir.
// Düzülüş: həftə zolağı (gün seçimi, hər gündə say) → mənim günüm (halqa) + komandanın rəqəmləri → mənim tapşırıqlarım (iri kartlar) → komanda (usta kartları).
export function TasksView() {
  const v = useTasksView();
  const { data, noteFor } = v;
  return (
    <div className="space-y-5">
      {v.viewLog && <WorkLogModal key={v.viewLog} logId={v.viewLog} onClose={() => v.setViewLog(null)} />}
      {noteFor && <TaskNoteModal key={noteFor.id} task={{
        id: noteFor.id, logId: noteFor.work_log_id, reason: noteFor.reason, place: placeOf(noteFor),
        // Əvvəl yazılan: tapşırıqdakı yazı, yoxdursa iş qeydinin təsviri (avtomatik yaranan təsvir = səbəb sayılmır)
        note: noteFor.note ?? (noteFor.work_logs && noteFor.work_logs.description !== `Tapşırıq: ${noteFor.reason}` ? noteFor.work_logs.description : null),
      }} onClose={() => v.setNoteFor(null)} onSaved={v.load} />}

      <WeekStrip day={v.day} today={v.today} from={v.from} rows={v.weekRows} me={v.me} onDay={v.setDay} />

      {data === null ? (
        <div className="card muted py-16 text-center text-sm">Yüklənir...</div>
      ) : v.live.length === 0 && v.mine.length === 0 && v.groups.length === 0 && v.teams.length === 0 ? (
        <EmptyDay day={v.day} today={v.today} />
      ) : (
        <>
          <DaySummary me={v.me} mineLive={v.mineLive} total={v.live.length} done={v.doneAll} people={v.people} />
          {v.mine.length > 0 && (
            <MyTasksSection mine={v.mine} liveCount={v.mineLive.length} data={data} past={v.past} logOf={v.logOf}
              onToggle={v.toggle} onNote={v.setNoteFor} onViewLog={v.setViewLog} />
          )}
          {(v.groups.length > 0 || v.teams.length > 0) && (
            <TeamSection teams={v.teams} groups={v.groups} employees={data.employees} logOf={v.logOf} onViewLog={v.setViewLog} />
          )}
        </>
      )}
    </div>
  );
}
