// Ayın sayları: günlər üzrə, cəmi, iş görülən gün, fərqli yer, ən çox işlənən 5 yer
export type MonthSummary = { counts: number[]; total: number; active: number; placeCount: number; top: { label: string; n: number }[] };
