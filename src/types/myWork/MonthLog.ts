// Ayın işi (öz statistikam)
export type MonthLog = {
  id: number;
  work_date: string;
  place_text: string | null;
  stores: { name: string; companies: { name: string } | null } | null;
  companies: { name: string } | null;
};
