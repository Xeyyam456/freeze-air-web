import { cacheLife, cacheTag } from "next/cache";
import { publicSiteClient } from "@/lib/site-client";
import { SITE_CACHE, SITE_TAG } from "@/lib/site-cache";
import { formatPhone } from "@/shared/utils/phone";
import type { HomeContent } from "@/types/site";

// Telefon köməkçiləri shared/utils/phone.ts-dədir; köhnə import yolu işləsin deyə burdan da ixrac olunur
export { formatPhone, telHref, whatsappHref } from "@/shared/utils/phone";

export type { HomeContent } from "@/types/site";
export type Contact = { phone: string; address: string; hours: string; email: string | null; instagram: string | null; facebook: string | null };

// Admin hələ doldurmayıbsa göstərilən yer tutucular
const FALLBACK: Contact = {
  phone: "+994 XX XXX XX XX",
  address: "Bakı, ünvan yazılacaq",
  hours: "Hər gün, saatlar yazılacaq",
  email: null,
  instagram: null,
  facebook: null,
};

// Saytın əlaqə məlumatları: admin panelindəki "Sayt" səhifəsindən dəyişir.
// Keşdə saxlanır və hər dəqiqə yenilənir (admin dəyişikliyi saytda ən gec ~1 dəqiqəyə görünür).
export async function getContact(): Promise<Contact> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);

  const { data } = await publicSiteClient().from("site_settings").select("phone, address, hours, email, instagram_url, facebook_url").eq("id", 1).maybeSingle();

  return {
    phone: data?.phone ? formatPhone(data.phone) : FALLBACK.phone,
    address: data?.address || FALLBACK.address,
    hours: data?.hours || FALLBACK.hours,
    email: data?.email || null,
    instagram: data?.instagram_url || null,
    facebook: data?.facebook_url || null,
  };
}

// Saytın loqosu (admin panelində "Sayt" → Ana səhifə → Loqo); yoxdursa null → qar dənəsi ikonu
export async function getLogo(): Promise<string | null> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);

  const { data } = await publicSiteClient().from("site_settings").select("logo_url").eq("id", 1).maybeSingle();
  return data?.logo_url || null;
}


// Admin sahəni boş qoyubsa göstərilən mətnlər
const ABOUT_FALLBACK = {
  title: "Obyektlərinizin iqlimi bizim işimizdir",
  text: "Bakıda market şəbəkələri, banklar, stadionlar və yaşayış kompleksləri ilə müqavilə əsasında işləyirik.",
  points: "",
  cardTitle: "Hər iş qeydə alınır",
  cardText: "Akt, şəkillər, tarixçə",
};

// Ana səhifənin idarə olunan hissələri (admin panelində "Sayt" → Ana səhifə):
// hero şəkli və "Haqqımızda" bölməsi. Şəkil yoxdursa null → saytda illüstrasiya.
export async function getHomeContent(): Promise<HomeContent> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);

  const { data: d } = await publicSiteClient()
    .from("site_settings")
    .select("hero_image_url, hero_form_enabled, about_title, about_text, about_points, about_card_title, about_card_text, about_card_color, about_image_main_url, about_image_side_url")
    .eq("id", 1)
    .maybeSingle();

  const lines = (v: string, sep: RegExp) => v.split(sep).map((x) => x.trim()).filter(Boolean);
  return {
    heroImage: d?.hero_image_url || null,
    heroFormEnabled: d?.hero_form_enabled ?? true,
    about: {
      title: d?.about_title || ABOUT_FALLBACK.title,
      text: lines(d?.about_text || ABOUT_FALLBACK.text, /\n\s*\n/),
      points: lines(d?.about_points ?? ABOUT_FALLBACK.points, /\n/),
      cardTitle: d?.about_card_title || ABOUT_FALLBACK.cardTitle,
      cardText: d?.about_card_text ?? ABOUT_FALLBACK.cardText,
      cardColor: (["night", "cold", "ice", "white"] as const).find((c) => c === d?.about_card_color) ?? "night",
      mainImage: d?.about_image_main_url || null,
      sideImage: d?.about_image_side_url || null,
    },
  };
}
