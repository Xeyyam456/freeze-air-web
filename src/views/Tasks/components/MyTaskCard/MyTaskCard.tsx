import { Building2, MapPin, PenLine, Store, Users } from "lucide-react";
import { FileBadges } from "@/components/work/FileBadges";
import type { MyTaskCardProps } from "@/types/myTasks";
import { fileTotal, placeOf } from "../../utils/place";
import { GroupMates } from "../GroupMates";
import { TaskCheck } from "../TaskCheck";
import { TaskStateChip } from "../TaskStateChip";

// Mənim tapşırığım: işarə dairəsi, yer, səbəb, qrup yoldaşları, təmir qeydi, vəziyyət, fayllar, "Təmir qeydi"
export function MyTaskCard({ t, data, past, fileLog, onToggle, onNote, onViewLog }: MyTaskCardProps) {
  const cancelled = !!t.cancelled_at; // admin geri alıb: tarixçə kimi qalır, işarələnmir
  const files = fileTotal(t);
  return (
    <li className={`card relative min-w-0 grow basis-[440px] !p-3.5 transition-colors ${
      cancelled ? "opacity-60" : t.done ? "!border-[#bfe8cf] !bg-[#f3fbf6]" : "hover:!border-[#c9dafb]"}`}>
      <div className="flex items-center gap-2.5 pr-16">
        <TaskCheck t={t} past={past} onToggle={onToggle} />
        <p className={`flex min-w-0 items-center gap-1.5 text-sm font-bold ${cancelled ? "text-muted line-through" : t.done ? "text-ok" : "text-primary"}`}>
          {t.stores ? <Store size={15} className="shrink-0" /> : t.companies ? <Building2 size={15} className="shrink-0" /> : <MapPin size={15} className="shrink-0" />}<span className="line-clamp-2">{placeOf(t)}</span>
        </p>
      </div>
      <div className="mt-2">
        {t.group_id && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700"><Users size={11} /> Qrup</span>}
        <p className={cancelled ? "text-muted line-through" : "text-ink"}>{t.reason}</p>
        {t.group_id && <GroupMates t={t} data={data} />}
        {t.note && <p className="mt-1.5 rounded-lg bg-[#fff7ed] px-2.5 py-1.5 text-xs text-[#b45309]"><b>Təmir:</b> {t.note}</p>}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 max-sm:mt-2">
          <TaskStateChip t={t} past={past} />
          {/* Fayllar (akt, şəkil, video): klik → iş pəncərəsi, orada hər biri pəncərədə açılır */}
          {files > 0 && fileLog && (
            <button type="button" onClick={() => onViewLog(fileLog)} title="Akt, şəkil və videoya bax"
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-1 text-xs font-semibold hover:bg-primary-soft">
              <FileBadges files={t.files} />
            </button>
          )}
          {/* Görülmüş tapşırıqda: təmir barədə yaz, akt/şəkil əlavə et */}
          {t.done && !cancelled && !past && (
            <button type="button" onClick={onNote} className="btn btn-sm ml-auto !h-8 bg-ok-soft text-ok hover:bg-ok hover:text-white">
              <PenLine size={14} /> {t.note || files ? "Təmir qeydi" : "Təmir barədə yaz"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
