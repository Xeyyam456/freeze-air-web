import { LogIn, LogOut } from "lucide-react";
import { presenceText } from "@/shared/utils/attendance/presenceText";
import { timeBaku } from "@/shared/utils/timeBaku";
import type { PresenceActionsProps } from "@/types/myWork";
import { durShort } from "../../utils/dayTime";
import { Button } from "@/shared/components/Button";

const pill = (cls: string, text: string) => <span title={text} className={`dpill rounded-full px-3 py-1.5 text-center text-xs font-bold max-sm:col-span-2 max-sm:py-2 sm:max-lg:min-w-0 sm:max-lg:truncate ${cls}`}>{text}</span>;

// Bu günün davamiyyəti: "İşə gəldim" → gün boyu "İşdəsən · 09:02-dən" + "İşi bitirdim" → "İşi bitirdin · 09:02 – 18:10".
// Təsdiqlənmiş icazə günü "icazəlisən" (Realtime: admin təsdiqləyən kimi dəyişir)
export function PresenceActions({ day, checking, onCheckIn, onCheckOut, onGiveUpLeave }: PresenceActionsProps) {
  const p = day?.presence;
  // Bir neçə seans (yenidən işə çıxıb): nişan qısadır (indiki seans və ya cəmi müddət), seanslar aşağıda nömrəli siyahıdadır
  const multi = !!p && p.sessions.length > 1;
  const last = p?.sessions[p.sessions.length - 1];
  const status = (label: string) => !p ? label
    : !multi ? `${label} · ${presenceText(p)}`
    : !p.out && last ? `${label} · ${timeBaku(last.in)}-dən`
    : `${label} · ${durShort(p.minutes)}`;

  if (!day) return <span className="muted text-sm">…</span>;
  if (day.status === "pending") return (
    <Button type="button" onClick={onCheckIn} disabled={checking} variant="plain" size="sm" className="!h-9 bg-ok text-white hover:brightness-110">
      <LogIn size={15} /> {checking ? "..." : "İşə gəldim"}
    </Button>
  );
  if (day.status === "present" && p && !p.out) return (
    <>
      {pill("bg-ok-soft text-ok", status("İşdəsən"))}
      <Button type="button" onClick={onCheckOut} disabled={checking} variant="plain" size="sm" className="!h-9 bg-navy text-white hover:brightness-125">
        <LogOut size={15} /> {checking ? "..." : "İşi bitirdim"}
      </Button>
    </>
  );
  if (day.status === "present" && p) return (
    <>
      {pill("bg-bg text-ink", status("İşi bitirdin"))}
      {/* Təcili iş çıxsa yenidən işə çıxır: yeni seans açılır (0066), sonra yenə "İşi bitirdim" */}
      <Button type="button" onClick={onCheckIn} disabled={checking} variant="soft" size="sm" className="!h-9" title="Yeni seans açılır">
        <LogIn size={15} /> {checking ? "..." : "Yenidən işə çıxdım"}
      </Button>
    </>
  );
  if (day.status === "leave") return (
    <>
      {pill("bg-violet-50 text-violet-700", "Bu gün icazəlisən")}
      <Button type="button" onClick={onGiveUpLeave} disabled={checking} variant="soft" size="sm" className="!h-9" title="İcazə ləğv olunur, işə gəlmə yazılır">
        <LogIn size={15} /> {checking ? "..." : "İcazəyə ehtiyac qalmadı, işdəyəm"}
      </Button>
    </>
  );
  // Admin bu günü "işdə olmayıb" qeyd edib (0065): usta işə gəldim basa bilmir, səhvdirsə admin geri alır
  if (day.status === "absent") return pill("bg-danger-soft text-danger", "Bu gün işdə olmayıb qeyd olunub");
  // Bazar iş günü deyil, amma usta çağırılıbsa işə çıxdığını qeyd edə bilər (əlavə gün)
  return (
    <>
      {pill("bg-slate-200 text-slate-600", "Bazar: iş günü deyil")}
      <Button type="button" onClick={onCheckIn} disabled={checking} variant="soft" size="sm" className="!h-9" title="Bazar günü işə çağırılmısansa">
        <LogIn size={15} /> {checking ? "..." : "Bazar günü işdəyəm"}
      </Button>
    </>
  );
}
