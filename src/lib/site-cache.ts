// Saytın açıq məzmunu (mətnlər, xidmətlər, əlaqə, ustalar) üçün keş müddəti.
// Admin paneldəki dəyişiklik ən gec ~5 saniyəyə görünür: revalidate 5 san. keçəndən sonra
// növbəti sorğu fonda təzə məlumat gətirir. stale: brauzerin daxili keçid keşi (Next 30 saniyədən aşağı qəbul etmir;
// səhifəni yeniləmək bunu keçir).
// expire ƏN AZI 300 san. (5 dəq) olmalıdır: Next 16 "expire < 5 dəq" keşi dinamik sayır və Suspense-dən kənarda
// işlədilərsə "runtime data during prerendering" xətası verir (landing, header, footer; build də uğursuz olar).
export const SITE_CACHE = { stale: 30, revalidate: 5, expire: 300 };
