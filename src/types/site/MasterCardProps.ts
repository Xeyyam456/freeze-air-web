import type { TextsProps } from "./TextsProps";
import type { PublicEmployee } from "@/types/site";

export type MasterCardProps = TextsProps & { e: PublicEmployee; max: number };
