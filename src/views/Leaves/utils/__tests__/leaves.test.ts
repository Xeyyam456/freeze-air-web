import { describe, expect, it } from "vitest";
import { groupByMonth } from "@/views/Leaves/utils/groupByMonth";
import { leaveStats } from "@/views/Leaves/utils/leaveStats";
import { splitLeaves } from "@/views/Leaves/utils/splitLeaves";
import { stamp } from "@/views/Leaves/utils/stamp";
import { statusOf } from "@/views/Leaves/utils/statusOf";
import type { MyLeaveRow } from "@/types/leaves";

const TODAY = "2026-11-09";
const leave = (id: number, date_from: string, date_to: string, status: string) =>
  ({ id, employee_id: 1, date_from, date_to, status, decided_at: null }) as MyLeaveRow;

describe("splitLeaves — usta paneli İcazələrim", () => {
  it("aktiv: gözləyən + bitməmiş təsdiqli (tarixə görə); qalanı tarixçə", () => {
    const all = [
      leave(1, "2026-11-20", "2026-11-21", "pending"), leave(2, "2026-11-05", "2026-11-09", "approved"),
      leave(3, "2026-11-01", "2026-11-02", "approved"), leave(4, "2026-11-12", "2026-11-12", "rejected"),
      leave(5, "2026-11-15", "2026-11-15", "cancelled"),
    ];
    const s = splitLeaves(all, TODAY);
    expect(s.active.map((l) => l.id)).toEqual([2, 1]); // 2 bu gün bitir — hələ aktivdir
    expect(s.past.map((l) => l.id)).toEqual([3, 4, 5]);
  });
});

describe("leaveStats — xülasə", () => {
  it("bu il və bu ay iş günləri (bazar sayılmır), gözləyən, növbəti", () => {
    const all = [
      leave(1, "2026-11-02", "2026-11-04", "approved"), // 3
      leave(2, "2026-11-07", "2026-11-09", "approved"), // 7 şənbə, 8 bazar, 9 → 2
      leave(3, "2026-10-05", "2026-10-06", "approved"), // ildə 2, ayda yox
      leave(4, "2026-11-12", "2026-11-12", "rejected"),
      leave(5, "2026-11-25", "2026-11-25", "pending"),
      leave(6, "2026-11-18", "2026-11-18", "approved"), // növbəti
      leave(7, "2026-11-16", "2026-11-17", "approved"), // daha yaxın növbəti
    ];
    const s = leaveStats(all, TODAY);
    expect([s.year, s.month, s.pending, s.next?.id]).toEqual([10, 8, 1, 7]);
  });

  it("ayın əvvəlindən o tərəfə keçən icazə: yalnız bu aya düşən günlər", () => {
    expect(leaveStats([leave(1, "2026-10-29", "2026-11-03", "approved")], TODAY).month).toBe(2); // 2, 3 noy (1 noyabr bazardır)
  });

  it("ayın sonundan o tərəfə keçən icazə növbəti ayın günlərini saymır (30 və 28 günlük ay)", () => {
    expect(leaveStats([leave(1, "2026-11-28", "2026-12-05", "approved")], TODAY).month).toBe(2); // 28 şənbə, 30 bazar ertəsi
    expect(leaveStats([leave(1, "2026-02-26", "2026-03-04", "approved")], "2026-02-10").month).toBe(3); // 26, 27, 28
    expect(leaveStats([leave(1, "2026-12-30", "2027-01-04", "approved")], "2026-12-15").month).toBe(2); // 31 günlük ay
  });

  it("ilin sərhədini keçən icazə: yalnız bu ilə düşən günlər", () => {
    expect(leaveStats([leave(1, "2025-12-29", "2026-01-03", "approved")], "2026-01-05").year).toBe(3);
  });

  it("heç nə yoxdursa", () => {
    expect(leaveStats([], TODAY)).toEqual({ year: 0, month: 0, pending: 0, next: null });
  });
});

describe("kiçik köməkçilər", () => {
  it("groupByMonth: sıra olduğu kimi qalır", () => {
    const g = groupByMonth([leave(1, "2026-10-05", "2026-10-05", "approved"), leave(2, "2026-11-01", "2026-11-01", "approved"), leave(3, "2026-10-20", "2026-10-20", "approved")]);
    expect(g.map(([m, l]) => [m, l.map((x) => x.id)])).toEqual([["2026-10", [1, 3]], ["2026-11", [2]]]);
  });

  it("stamp və statusOf", () => {
    expect(stamp("2026-10-21T14:41:00Z")).toBe("21.10.2026 18:41");
    expect(statusOf("xyz")).toBe(statusOf("pending"));
  });
});
