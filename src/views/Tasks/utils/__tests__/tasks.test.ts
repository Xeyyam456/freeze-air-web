import { describe, expect, it } from "vitest";
import { iso, shift, weekRange, weekStart } from "@/views/Tasks/utils/days";
import { fileTotal, placeOf } from "@/views/Tasks/utils/place";
import type { MyTask } from "@/types/myTasks";

const at = (p: object) => ({ stores: null, companies: null, place_text: null, ...p }) as unknown as MyTask;

describe("placeOf / fileTotal", () => {
  it("mağaza (şirkətlə) → sabit məkan → yazılan yer → silinib", () => {
    expect(placeOf(at({ stores: { code: "ARZ-045", name: "Nərimanov", companies: { name: "Araz" } } }))).toBe("Araz · ARZ-045 Nərimanov");
    expect(placeOf(at({ companies: { name: "Port Baku" } }))).toBe("Port Baku");
    expect(placeOf(at({ place_text: "Ev, Yasamal" }))).toBe("Ev, Yasamal");
    expect(placeOf(at({}))).toBe("Yer silinib");
  });
  it("fileTotal: akt + şəkil + video", () => {
    expect(fileTotal({ files: { act: 1, photo: 3, video: 1 } } as MyTask)).toBe(5);
  });
});

describe("həftə zolağı (TZ=Asia/Baku)", () => {
  it("shift: ay və il sərhədi", () => {
    expect(shift("2026-10-31", 1)).toBe("2026-11-01");
    expect(shift("2027-01-01", -1)).toBe("2026-12-31");
    expect(iso(new Date(2026, 10, 9))).toBe("2026-11-09");
  });
  it("weekStart: bazar ertəsi; bazar günü əvvəlki həftəyə düşür", () => {
    expect(weekStart("2026-11-09")).toBe("2026-11-09");
    expect(weekStart("2026-11-08")).toBe("2026-11-02");
    expect(weekStart("2026-11-01")).toBe("2026-10-26");
  });
  it("weekRange: eyni ay və ay dəyişəndə", () => {
    expect(weekRange("2026-11-02")).toBe("2–8 noyabr");
    expect(weekRange("2026-10-26")).toBe("26 oktyabr – 1 noyabr");
    expect(weekRange("2026-12-28")).toBe("28 dekabr – 3 yanvar");
  });
});
