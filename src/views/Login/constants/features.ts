import { ClipboardList, ListChecks, Warehouse } from "lucide-react";
import type { LoginFeature } from "@/types/login";

export const FEATURES: LoginFeature[] = [
  { icon: ListChecks, title: "Günün tapşırıqları", text: "Hansı yerdə, nə üçün gedəcəyin bir baxışda." },
  { icon: ClipboardList, title: "Gördüyün işlər", text: "İşi yaz, tarixçəyə və aylıq statistikaya bax." },
  { icon: Warehouse, title: "Alət və material", text: "Hansı alətin kimdə olduğunu depoya zəng etmədən gör." },
];
