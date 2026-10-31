// Konumu düzəldilən yer: filial/mağaza və ya sabit məkanlı şirkət
export type Place = {
  kind: "store" | "company";
  id: number;
  code?: string | null;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
};
