import type { ButtonVariant } from "@/types/shared";
import type { HistoryTarget } from "./HistoryTarget";

export type PlaceHistoryButtonProps = { target: HistoryTarget; className?: string; variant?: ButtonVariant; size?: "md" | "sm" };
