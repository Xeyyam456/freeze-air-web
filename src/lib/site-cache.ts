// Saytın açıq məzmunu (mətnlər, xidmətlər, əlaqə, ustalar) üçün keş müddəti.
// Admin paneldəki dəyişiklik ən gec ~5 saniyəyə görünür: revalidate 5 san. keçəndən sonra
// növbəti sorğu fonda təzə məlumat gətirir. stale: brauzerin daxili keçid keşi (Next 30 saniyədən aşağı qəbul etmir;
// səhifəni yeniləmək bunu keçir). expire: uzun müddət sorğu olmasa, köhnə məlumat bir dəqiqədən sonra atılır.
// Diqqət: Next 16 bu keşi "qısa ömürlü" (expire < 5 dəq) sayır: onu oxuyan hər şey <Suspense> daxilində olmalıdır
// (`app/(site)/layout.tsx`-də header, səhifə və footer ayrı Suspense-dədir).
export const SITE_CACHE = { stale: 30, revalidate: 5, expire: 60 };
