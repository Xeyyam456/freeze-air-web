import type { DashCardProps } from "@/types/panelDash";
import s from "./DashCard.module.css";

// Dashboard kartı (admin Paneli ilə eyni dil): başlıq, alt yazı, sağda əməliyyatlar.
// tone: vurğu rəngi — fon küncdən zəif rənglənir, içində yavaş gəzən işıq, üst kənarda arabir keçən parıltı.
export function DashCard({ title, subtitle, actions, tone, className = "", children }: DashCardProps) {
  return (
    <section className={`${s.card} ${className}`} data-tone={tone}>
      {tone && <span className={s.glow} aria-hidden="true" />}
      {(title || actions) && (
        <header className={s.head}>
          <div className="min-w-0">
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
