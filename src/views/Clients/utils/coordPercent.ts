// Koordinatı olan filial/mağazaların faizi
export function coordPercent(withCoords: number, total: number) {
  return total ? Math.round((withCoords / total) * 100) : 0;
}
