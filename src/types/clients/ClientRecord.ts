// Siyahı sətri: şirkət/market + filialların koordinatları
export type ClientRecord = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  contact_person: string | null;
  stores: { lat: number | null; lng: number | null }[];
};
