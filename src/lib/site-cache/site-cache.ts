// Saytın açıq məzmunu (mətnlər, xidmətlər, əlaqə, ustalar) üçün keş müddəti.
// Admin dəyişiklikdən sonra `/api/revalidate` etiketi dərhal təmizləyir (əsas yol). O çağırış alınmasa,
// ehtiyat: 60 san. keçəndən sonra növbəti sorğu fonda təzə məlumat gətirir (stale-while-revalidate).
// expire ≥ 5 dəq olmalıdır: Next 16 qısa ömürlü keşi (expire < 5 dəq) statik HTML-ə qoymur, səhifə hər sorğuda
// serverdə render olunur və hero şəkli gec gəlir (2026-11-02 ölçmə: LCP 5,7 s, CLS 0,32). Uzun ömürlə səhifələr
// build-də statik shell-ə düşür və CDN-dən verilir.
export const SITE_CACHE = { stale: 30, revalidate: 60, expire: 86400 };

// Açıq saytın bütün keşləri bu etiketi daşıyır: admin dəyişiklikdən sonra `/api/revalidate` onu dərhal təmizləyir.
export const SITE_TAG = "site";
