import { createElement } from "react";
import {
  Droplets, Fan, Gauge, Refrigerator, ShieldCheck, Snowflake, ThermometerSnowflake, Wind, Wrench, Zap,
  type LucideIcon, type LucideProps,
} from "lucide-react";

// Admin panelində xidmətə seçilən ikon adı → ikon (bazadakı icon sütununun dəyərləri ilə eyni)
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  fan: Fan,
  wrench: Wrench,
  gauge: Gauge,
  thermometer: ThermometerSnowflake,
  wind: Wind,
  refrigerator: Refrigerator,
  snowflake: Snowflake,
  zap: Zap,
  droplets: Droplets,
  shield: ShieldCheck,
};

export function serviceIcon(name: string): LucideIcon {
  return SERVICE_ICONS[name] ?? Wrench;
}

// Ad ilə ikon komponenti (render zamanı dinamik komponent yaratmamaq üçün)
export function ServiceIcon({ name, ...props }: { name: string } & LucideProps) {
  return createElement(serviceIcon(name), props);
}
