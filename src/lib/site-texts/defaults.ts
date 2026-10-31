import { COMMON_TEXTS } from "./defaults/common";
import { CONTACT_TEXTS } from "./defaults/contact";
import { EQUIPMENT_TEXTS } from "./defaults/equipment";
import { HOME_TEXTS } from "./defaults/home";
import { HOW_TEXTS } from "./defaults/how";
import { SEGMENT_TEXTS } from "./defaults/segment";
import { SERVICE_TEXTS } from "./defaults/service";
import { SERVICES_TEXTS } from "./defaults/services";
import { TEAM_TEXTS } from "./defaults/team";

// Saytın bütün sabit mətnləri. Admin panelində "Sayt" → Mətnlər-dən dəyişir (cədvəl site_texts).
// Bazada sətir yoxdursa və ya boşdursa, buradakı mətn göstərilir.
// Siyahılar (…items) hər sətirdə bir bənddir.
// Yeni açar əlavə edəndə admin/src/pages/Site/constants/textGroups/-a da əlavə et.
export const TEXT_DEFAULTS = {
  ...COMMON_TEXTS,
  ...HOME_TEXTS,
  ...EQUIPMENT_TEXTS,
  ...SERVICES_TEXTS,
  ...SERVICE_TEXTS,
  ...SEGMENT_TEXTS,
  ...HOW_TEXTS,
  ...TEAM_TEXTS,
  ...CONTACT_TEXTS,
} as const;
