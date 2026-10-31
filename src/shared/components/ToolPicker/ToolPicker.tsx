"use client";

import { Wrench } from "lucide-react";
import type { ToolPickerProps } from "@/types/shared";
import { PickerButton } from "./PickerButton";
import { PickerList } from "./PickerList";
import { useToolPicker } from "./useToolPicker";

// Axtarışlı seçim siyahısı (əsasən depodan alət, həm də usta seçimi): brauzerin standart siyahısı əvəzinə.
// Pəncərənin aşağısında durduğu üçün yuxarı açılır. Seçim gizli sahə (`name`, standart "tool_id") ilə formaya gedir.
export function ToolPicker({
  items, value, onChange, name = "tool_id", icon: Icon = Wrench,
  placeholder = "Depodan alət seç...", emptyLabel = "Depoda boş alət yoxdur", searchLabel = "Alət axtar...",
}: ToolPickerProps) {
  const { rootRef, searchRef, open, query, active, selected, filtered, toggle, choose, onKeyDown, setActive, setQuery } = useToolPicker(items, value, onChange);

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1" onKeyDown={onKeyDown}>
      <input type="hidden" name={name} value={value ?? ""} />
      <PickerButton selected={selected} open={open} empty={items.length === 0} icon={Icon} placeholder={placeholder}
        emptyLabel={emptyLabel} onClick={toggle} />
      {open && (
        <PickerList items={filtered} value={value} active={active} query={query} searchRef={searchRef} icon={Icon}
          searchLabel={searchLabel} onActive={setActive} onQuery={setQuery} onChoose={choose} />
      )}
    </div>
  );
}
