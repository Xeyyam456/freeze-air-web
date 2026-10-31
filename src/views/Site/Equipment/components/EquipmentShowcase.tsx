"use client";

import type { EquipmentShowcaseProps } from "@/types/site";
import { useEquipmentTabs } from "../hooks/useEquipmentTabs";
import { EquipmentStage } from "./EquipmentStage";
import { EquipmentTabButton } from "./EquipmentTabButton";

// Avadanlıq vitrini: solda növlərin siyahısı (tablar), sağda seçilmiş növün böyük səhnəsi.
// Bəndlər səhnənin hündürlüyünə paylanır (ilki üst, sonuncusu alt kənarla bir xətdə). Planşetdə də yan-yana
// (siyahı dar, miniatür kiçik). Mobildə tab yoxdur: hər növ öz səhnə kartıdır, alt-alta, nömrə nişanı ilə;
// sürüşdürdükcə kart yumşaq açılır (.eq-card, motion.css). Bəyənilmədi: yana sürüşən sıra, miniatür sırası.
// Bütün növlər DOM-dadır (axtarış sistemləri hamısını oxuyur); ≥ 640 yalnız seçilən görünür.
// Şəkil kəsilmir: çərçivə şəklin öz nisbətindədir.
export function EquipmentShowcase({ items }: EquipmentShowcaseProps) {
  const { active, setActive, tabs, onKey } = useEquipmentTabs(items.length);

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(200px,250px)_1fr] lg:grid-cols-[minmax(300px,380px)_1fr] 2xl:grid-cols-[430px_1fr]">
      <div role="tablist" aria-orientation="vertical" aria-label="Avadanlıq növləri" className="flex flex-col justify-between gap-2 max-sm:hidden">
        {items.map((e, i) => (
          <EquipmentTabButton key={e.id} item={e} index={i} on={i === active} tabRef={(el) => { tabs.current[i] = el; }}
            onSelect={() => setActive(i)} onKey={(ev) => onKey(ev, i)} />
        ))}
      </div>

      <div className="max-sm:space-y-5">
        {items.map((e, i) => <EquipmentStage key={e.id} item={e} index={i} total={items.length} on={i === active} />)}
      </div>
    </div>
  );
}
