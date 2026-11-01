import type { ButtonVariant } from "@/types/shared";
import type { Place } from "./Place";

export type PlaceLocationButtonProps = { place: Place; className?: string; label?: string; variant?: ButtonVariant; size?: "md" | "sm" };
