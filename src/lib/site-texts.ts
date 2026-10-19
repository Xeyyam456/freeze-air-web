import { cacheLife, cacheTag } from "next/cache";
import { SITE_CACHE, SITE_TAG } from "@/lib/site-cache";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Saytın bütün sabit mətnləri. Admin panelində "Sayt" → Mətnlər-dən dəyişir (cədvəl site_texts).
// Bazada sətir yoxdursa və ya boşdursa, buradakı mətn göstərilir.
// Siyahılar (…items) hər sətirdə bir bənddir.
// Yeni açar əlavə edəndə admin/src/components/site/textFields.ts-ə də əlavə et.
export const TEXT_DEFAULTS = {
  // Ümumi: brend, header, menyu, footer
  "brand.name": "Freeze Air Service",
  "brand.tagline": "Kondisioner və soyuducu servisi",
  "header.cta": "Usta çağır",
  "header.login": "Daxil ol",
  "header.panel": "Panelə keç",
  "nav.home": "Əsas",
  "nav.equipment": "Avadanlıq",
  "nav.services": "Xidmətlər",
  "nav.how": "Necə işləyirik",
  "nav.team": "Ustalarımız",
  "nav.contact": "Əlaqə",
  "footer.text": "Kondisioner və soyuducu sistemlərinin quraşdırılması, təmiri və müntəzəm servisi.",
  "footer.login": "Usta girişi",
  "footer.pages": "Səhifələr",
  "footer.services": "Xidmətlər",
  "footer.contact": "Əlaqə",
  "footer.copyright": "© Freeze Air Service, Bakı",
  "footer.slogan": "Yayda sərin, qışda isti.",
  "footer.social": "Bizi izləyin",

  // Ana səhifə
  "home.hero.badge_out": "Çöldə +40°",
  "home.hero.badge_in": "İçəridə +22°",
  "home.hero.title": "Kondisioner təmiri və servisi",
  "home.hero.lead": "Marketlər, banklar, stadionlar və yaşayış kompleksləri üçün quraşdırma, təmir və müqavilə ilə müntəzəm texniki xidmət.",
  "home.hero.cta": "Usta çağır",
  "home.hero.cta2": "Xidmətlər",
  "home.quick.title": "Sürətli müraciət",
  "home.quick.name": "Adınız",
  "home.quick.phone": "Telefon nömrəniz",
  "home.quick.button": "Zəng sifariş et",
  "home.quick.note": "Nömrənizi yazın, sizə özümüz zəng edək.",
  "home.quick.or": "Və ya zəng edin",
  "home.how.title": "Müraciətdən təhvilə qədər 3 addım",
  "home.how.lead": "Hər iş qeydə alınır: hansı usta, nə vaxt, harada, nə edib.",
  "home.how.button": "Ətraflı",
  "home.faq.title": "Tez-tez verilən suallar",
  "home.faq.lead": "Cavab tapmadınızsa, bizə yazın və ya zəng edin.",
  "home.faq.button": "Bizə yazın",
  "home.about.label": "Haqqımızda",
  "home.about.button": "Necə işləyirik",
  "home.segments.title": "Xidmət",
  "home.segments.lead": "Hansı obyekt olursa olsun: evdən stadiona qədər.",
  "home.segments.more": "Ətraflı",
  "home.categories.title": "Xidmət kateqoriyaları",
  "home.categories.lead": "Gördüyümüz bütün işlər, növlərinə görə.",
  "home.cat1.title": "Quraşdırma və servis",
  "home.cat1.items": "Kondisioner quraşdırma\nProfilaktik təmizlik\nFreon doldurma\nElektrik qoşulması",
  "home.cat2.title": "Təmir və diaqnostika",
  "home.cat2.items": "Kondisioner təmiri\nXəta kodu diaqnostikası\nQaz sızmasının tapılması\nKompressor dəyişmə\nDrenaj təmiri",
  "home.cat3.title": "Ventilyasiya və soyuducu",
  "home.cat3.items": "Ventilyasiya sistemləri\nSoyuducu vitrinlər\nSoyuducu kameralar",
  "home.contact.label": "Sürətli əlaqə",
  "home.contact.title": "Usta lazımdır?",
  "home.contact.text": "Zəng edin, ən yaxın usta obyektinizə gəlsin.",
  "home.contact.phone": "Telefon",
  "home.contact.address": "Ünvan",
  "home.contact.hours": "İş saatları",
  "home.contact.button": "Əlaqə səhifəsi",

  // Avadanlıq
  "equipment.title": "Avadanlıq",
  "equipment.lead": "Xidmət etdiyimiz kondisioner növləri. Markasından asılı olmayaraq quraşdırır, təmir edir və servis edirik.",

  // Xidmətlər
  "services.title": "Xidmətlər",
  "services.lead": "Bir müqavilə ilə bütün obyektlərinizdəki iqlim avadanlığına xidmət: quraşdırmadan müntəzəm profilaktikaya qədər.",
  "services.segments": "Obyektinizi seçin",
  "services.list": "Bütün xidmətlər",
  "services.cta_text": "Obyektiniz üçün hansı xidmət lazım olduğunu bilmirsiniz?",
  "services.cta_button": "Bizə yazın",

  // Xidmət səhifəsi (/xidmet/...)
  "service.includes": "Nə daxildir",
  "service.steps": "Necə edirik",
  "service.aside_title": "Bu xidmət lazımdır?",
  "service.aside_text": "Zəng edin və ya yazın, ən yaxın usta obyektinizə gəlsin.",
  "service.others": "Digər xidmətlər",
  "service.more": "Ətraflı",

  // Obyekt səhifəsi (/xidmetler/...)
  "segment.cta": "Usta çağır",
  "segment.equipment": "Tipik avadanlıq",
  "segment.issues": "Tez-tez rast gəlinən problemlər",
  "segment.work": "Nə edirik",
  "segment.note_fallback": "Obyektiniz üçün usta lazımdır?",
  "segment.others": "Digər obyektlər",

  // Necə işləyirik
  "how.title": "Necə işləyirik",
  "how.lead": "Müraciətdən təhvilə qədər hər addım qeydə alınır: hansı usta, nə vaxt, harada, nə edib.",
  "how.step1.title": "Müraciət edirsiniz",
  "how.step1.text": "Zəng edirsiniz və ya müqaviləli obyektdən sorğu gəlir.",
  "how.step2.title": "Usta yerə gəlir",
  "how.step2.text": "Ən yaxın usta lazımi alətlərlə obyektə yollanır.",
  "how.step3.title": "İş aktla təhvil verilir",
  "how.step3.text": "Görülən iş akt və şəkillərlə qeydə alınır.",
  "how.deliverables": "Hər işdən sonra əlinizdə",
  "how.d1.title": "İmzalı akt",
  "how.d1.text": "Hər iş üçün görülən işlər və istifadə olunan materiallar.",
  "how.d2.title": "İşin şəkilləri",
  "how.d2.text": "Əvvəl və sonra: nə dəyişdiyi görünür.",
  "how.d3.title": "Obyektin tarixçəsi",
  "how.d3.text": "Hər filial üzrə hansı usta, nə vaxt, nə edib.",

  // Ustalarımız
  "team.title": "Ustalarımız",
  "team.lead": "Obyektinizə gələn ustalar: hər birinin ixtisası və təcrübəsi.",
  "team.empty": "Usta siyahısı tezliklə burada olacaq.",
  "team.specialty": "Usta",
  "team.experience": "Təcrübə:",
  "team.new": "Yeni usta",
  "team.cta_text": "Usta lazımdır? Ən yaxın usta obyektinizə gəlsin.",
  "team.cta_button": "Usta çağır",
  "team.type.master": "Usta",
  "team.type.assistant": "Köməkçi",
  "team.type.driver": "Sürücü",

  // Əlaqə
  "contact.title": "Əlaqə",
  "contact.lead": "Obyektinizə usta lazımdırsa və ya müqavilə bağlamaq istəyirsinizsə, zəng edin.",
  "contact.call_label": "Bizə zəng edin",
  "contact.call": "Zəng et",
  "contact.whatsapp": "WhatsApp",
  "contact.address": "Ünvan",
  "contact.hours": "İş saatları",
  "contact.email": "E-poçt",
  "contact.map_reset": "Ünvana qayıt",
  "contact.route": "Marşrut qur",
  "contact.route_loading": "Yeriniz təyin olunur...",
  "contact.route_denied": "Yerinizi təyin etmək olmadı. Brauzerdə məkana icazə verin.",
  "contact.route_open": "Naviqasiyanı aç",
  "form.title": "Bizə yazın",
  "form.lead": "Mesajınızı yazın, sizə özümüz zəng edək.",
  "form.name": "Adınız",
  "form.phone": "Telefon",
  "form.email": "E-poçt (istəyə bağlı)",
  "form.message": "Nə lazımdır? Obyekt, ünvan, kondisionerin növü...",
  "form.submit": "Göndər",
  "form.sending": "Göndərilir...",
  "form.success_title": "Mesajınız göndərildi",
  "form.success_text": "Tezliklə sizinlə əlaqə saxlayacağıq. Təcili işdirsə, zəng edin.",
} as const;

export type TextKey = keyof typeof TEXT_DEFAULTS;
export type Texts = Record<TextKey, string>;

// Bütün mətnlər bir sorğu ilə; keşdə saxlanır və hər dəqiqə yenilənir
export async function getTexts(): Promise<Texts> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data } = await supabase.from("site_texts").select("key, value");

  const texts: Texts = { ...TEXT_DEFAULTS };
  for (const row of data ?? []) {
    if (row.key in texts && row.value.trim()) texts[row.key as TextKey] = row.value.trim();
  }
  return texts;
}

// Siyahı mətni → bəndlər (hər sətir bir bənd)
export const lines = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);

// Səhifə başlığı (brauzer tabı): "Səhifə — Brend"
export async function pageTitle(key: TextKey) {
  const t = await getTexts();
  return `${t[key]} — ${t["brand.name"]}`;
}
