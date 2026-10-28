import { fmt } from "@/views/Depot/utils/quantity";
import type { DepotRequest } from "@/types/depot";

export function requestLine(r: DepotRequest) {
  const u = r.tool_kind === "material" ? r.unit : "ədəd";
  if (r.type === "return") return r.tool_kind === "material" ? `işlətdim ${fmt(r.used ?? 0)}, qaytarıram ${fmt(r.returned ?? 0)} ${u}` : `${fmt(r.quantity ?? 0)} ${u}`;
  if (r.type === "request") return `${fmt(r.quantity ?? 0)} ${u}`;
  return `${fmt(r.quantity ?? 0)} ${u}`;
}
