import { describe, expect, it, vi } from "vitest";
import type { MyTask, MyTasksData } from "@/types/myTasks";

// Hook-un məntiqi React-sız yoxlanır: useMemo sadəcə funksiyanı çağırır
vi.mock("react", () => ({ useMemo: (f: () => unknown) => f() }));
const { useTeamGroups } = await import("@/views/Tasks/hooks/useTeamGroups");

const task = (id: number, employee_id: number, group_id: string | null, done = false, cancelled = false) =>
  ({ id, employee_id, group_id, done, cancelled_at: cancelled ? "2026-11-09T08:00:00Z" : null }) as MyTask;
const emp = (id: number) => ({ id, full_name: `Usta ${id}` });

// Mən = 1 (A), B = 2, C = 3. Qrup birlikdə görülür (bazada hamıya düşür)
const data = {
  employees: [emp(1), emp(2), emp(3)],
  tasks: [
    task(1, 1, null, true), task(2, 1, null),
    task(3, 2, null, false, true), task(13, 3, null, true),
    task(4, 1, "g1", true), task(5, 2, "g1", true),
    task(6, 1, "g2"), task(7, 2, "g2", false, true), task(8, 3, "g2"),
    task(9, 2, "g3", false, true), task(10, 3, "g3", false, true),
    task(11, 2, "g4", true), task(12, 3, "g4", true),
  ],
} as unknown as MyTasksData;

describe("useTeamGroups — usta paneli Tapşırıqlar", () => {
  const r = useTeamGroups(data, 1);

  it("günün sayı: qrup bir tapşırıq, geri alınan sayılmır", () => {
    // tək: 1, 2, 13; qruplar: g1, g2, g4 (g3 tam geri alınıb)
    expect(r.live.map((t) => t.id)).toEqual([1, 2, 13, 4, 6, 11]); // sıra məlumatdakı kimi
    expect(r.doneAll).toBe(4); // 1, 13, g1, g4
  });

  it("işdə olan ustaların sayı (geri alınanlar xaric)", () => {
    expect(r.people).toBe(3);
  });

  it("mənim tapşırıqlarım: tək + daxil olduğum qruplar", () => {
    expect(r.mine.map((t) => t.id)).toEqual([1, 2, 4, 6]);
    expect(r.mineLive).toHaveLength(4);
  });

  it("Komanda: məndən başqalarının tək tapşırıqları", () => {
    expect(r.groups.map((g) => [g.employee.id, g.items.map((t) => t.id)])).toEqual([[2, [3]], [3, [13]]]);
  });

  it("Komanda qrupları: mənim olduğum qrup orada yoxdur", () => {
    expect(r.teams.map((g) => [g.id, g.live.length])).toEqual([["g3", 0], ["g4", 2]]);
  });

  it("məlumat və ya mən yoxdursa", () => {
    expect(useTeamGroups(null, 1)).toMatchObject({ groups: [], teams: [], mine: [], live: [], doneAll: 0, people: 0 });
    expect(useTeamGroups(data, undefined).mine).toEqual([]);
  });
});
