import { ClipboardCheck, Fan, History, Image as ImageIcon, MapPin, PhoneCall, Refrigerator, Wrench } from "lucide-react";
import type { TextKey, Texts } from "@/types/site";

// Saytın quruluşu: ünvanlar və ikonlar burada, mətnlər bazadadır (lib/site-texts.ts, admin → "Sayt" → Mətnlər)

// Açıq saytın səhifələri (header və footer eyni siyahını işlədir)
const PAGES: { href: string; key: TextKey }[] = [
  { href: "/", key: "nav.home" },
  { href: "/avadanliq", key: "nav.equipment" },
  { href: "/xidmetler", key: "nav.services" },
  { href: "/nece-isleyirik", key: "nav.how" },
  { href: "/ustalarimiz", key: "nav.team" },
  { href: "/elaqe", key: "nav.contact" },
];

export const sitePages = (t: Texts) => PAGES.map((p) => ({ href: p.href, label: t[p.key] }));

// Necə işləyirik: 3 addım və işdən sonra müştərinin aldığı 3 şey
export const STEPS = [
  { icon: PhoneCall, title: "how.step1.title", text: "how.step1.text" },
  { icon: MapPin, title: "how.step2.title", text: "how.step2.text" },
  { icon: ClipboardCheck, title: "how.step3.title", text: "how.step3.text" },
] as const;

export const DELIVERABLES = [
  { icon: ClipboardCheck, title: "how.d1.title", text: "how.d1.text" },
  { icon: ImageIcon, title: "how.d2.title", text: "how.d2.text" },
  { icon: History, title: "how.d3.title", text: "how.d3.text" },
] as const;

// Ana səhifə: göy fonda xidmət kateqoriyaları (3 qrup)
export const CATEGORIES = [
  { icon: Fan, title: "home.cat1.title", items: "home.cat1.items" },
  { icon: Wrench, title: "home.cat2.title", items: "home.cat2.items" },
  { icon: Refrigerator, title: "home.cat3.title", items: "home.cat3.items" },
] as const;
