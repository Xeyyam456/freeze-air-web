import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 1024px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

// Geniş ekran (≥ 1024): pult sağda sabit durur; dar ekranda kod pəncərədə açılır
export function useWide() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => true);
}
