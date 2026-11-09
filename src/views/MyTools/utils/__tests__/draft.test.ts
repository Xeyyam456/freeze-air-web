import { describe, expect, it } from "vitest";
import { calc, emptyDraft } from "@/views/MyTools/utils/draft";
import { counts, groupPeople } from "@/views/MyTools/utils/people";
import { requestLine } from "@/views/MyTools/utils/requestLine";
import type { DepotRequest } from "@/types/depot";
import type { Held } from "@/types/myTools/Held";
import type { Mine } from "@/types/myTools/Mine";

const R410 = { name: "R410", kind: "material", unit: "kq", pack_name: "balon", pack_size: 11.3 };
const PUMP = { name: "Nasos", kind: "tool", unit: "ədəd", pack_name: null, pack_size: null };
const hold = (quantity: number, tools: Mine["tools"]) => ({ id: 1, tool_id: 1, quantity, taken_at: "", received_at: "x", disputed_at: null, tools }) as Mine;
const draft = (ret: string, byPack = false, restUsed = true, qty = "") => ({ qty, ret, byPack, restUsed });

describe("calc — alət qaytarma (tam say, 1…səndə olan)", () => {
  const h = hold(3, PUMP);
  it.each([
    ["2", true, false], ["3", true, false], ["0", false, false], ["4", false, true], ["1,5", false, false], ["", false, false],
  ])("%s → ok %s, over %s", (qty, ok, over) => {
    const r = calc(h, draft("", false, true, qty));
    expect([r.ok, r.over]).toEqual([ok, over]);
  });
  it("ipucu", () => {
    expect(calc(h, draft("", false, true, "2")).hint).toBe("2 ədəd qaytarılır");
    expect(calc(h, draft("", false, true, "9")).hint).toBe("1 ilə 3 arası yaz");
  });
  it("emptyDraft: alətdə hamısı qaytarılır", () => expect(emptyDraft(h).qty).toBe("3"));
});

describe("calc — material qaytarma (kq / balon)", () => {
  const h = hold(22.6, R410); // 2 balon
  it("1 balon qaytarıram, qalanı işlətdim", () => {
    expect(calc(h, draft("1", true))).toMatchObject({ ok: true, used: 11.3, returned: 11.3, hint: "işlətdim 11,3 kq · qaytarıram 11,3 kq" });
  });
  it("hamısını kq ilə qaytarıram", () => {
    expect(calc(h, draft("22,6"))).toMatchObject({ ok: true, used: 0, returned: 22.6 });
  });
  it("yarım balon: açıq balon hissəsi ipucunda", () => {
    expect(calc(h, draft("1,5", true))).toMatchObject({ returned: 16.95, hint: "işlətdim 5,65 kq · qaytarıram 16,95 kq (5,65 kq açıq balon)" });
  });
  it("heç nə qaytarmıram, hamısını işlətdim", () => {
    expect(calc(h, draft(""))).toMatchObject({ ok: true, used: 22.6, returned: 0, hint: "işlətdim 22,6 kq" });
  });
  it("qalanı məndə qalır", () => {
    expect(calc(h, draft("5", false, false))).toMatchObject({ ok: true, used: 0, returned: 5, hint: "qaytarıram 5 kq (5 kq açıq balon) · məndə qalır 17,6 kq" });
    expect(calc(h, draft("", false, false))).toMatchObject({ ok: false, used: 0, returned: 0 });
  });
  it("səndə olandan çox ola bilməz (3 balon > 2)", () => {
    expect(calc(h, draft("3", true))).toMatchObject({ ok: false, over: true, hint: "Səndə olandan çox ola bilməz" });
  });
  it("qablı olmayan materialda byPack təsirsizdir", () => {
    const pipe = hold(10, { ...R410, unit: "metr", pack_name: null, pack_size: null });
    expect(calc(pipe, draft("4", true))).toMatchObject({ returned: 4, used: 6, hint: "işlətdim 6 metr · qaytarıram 4 metr" });
  });
});

describe("Kimdə nə var", () => {
  const held = (employee_id: number, full_name: string, quantity: number, tools: Held["tools"]) =>
    ({ id: employee_id * 10 + quantity, tool_id: 1, employee_id, quantity, taken_at: "", employees: { full_name, photo_url: null }, tools }) as Held;
  const all = [held(3, "Şahin", 1, PUMP), held(2, "Əli", 2, PUMP), held(1, "Cavid", 1, PUMP), held(2, "Əli", 5, R410), held(9, "Mən", 1, PUMP)];

  it("özün birinci, qalanlar Azərbaycan əlifbası ilə (C < Ə < Ş)", () => {
    expect(groupPeople(all, 9).map((p) => p.name)).toEqual(["Mən", "Cavid", "Əli", "Şahin"]);
  });
  it("counts: alətlər say ilə toplanır, materiallar sətir sayı", () => {
    const ali = groupPeople(all, 9).find((p) => p.id === 2)!;
    expect(counts(ali)).toEqual({ tools: 2, mats: 1 });
  });
});

describe("requestLine", () => {
  const r = (p: Partial<DepotRequest>) => ({ tool_kind: "material", unit: "kq", quantity: null, used: null, returned: null, ...p }) as DepotRequest;
  it("material qaytarma, alət qaytarma, istək", () => {
    expect(requestLine(r({ type: "return", used: 3, returned: 8.3 }))).toBe("işlətdim 3, qaytarıram 8,3 kq");
    expect(requestLine(r({ type: "return", tool_kind: "tool", quantity: 2 }))).toBe("2 ədəd");
    expect(requestLine(r({ type: "request", quantity: 11.3 }))).toBe("11,3 kq");
  });
});
