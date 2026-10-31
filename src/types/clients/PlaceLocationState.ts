import type { PlaceFix } from "./PlaceFix";

// usePlaceLocation-un qaytardığı vəziyyət və əməliyyatlar
export type PlaceLocationState = {
  address: string;
  setAddress: (v: string) => void;
  fix: PlaceFix | null;
  locating: boolean;
  busy: "addr" | "coord" | null;
  confirm: boolean;
  setConfirm: (v: boolean) => void;
  manual: string;
  hasCoords: boolean;
  dist: number | null;
  goodFix: boolean;
  manualBad: boolean;
  addrChanged: boolean;
  find: () => void;
  onManual: (v: string) => void;
  save: (kind: "addr" | "coord") => Promise<void>;
};
