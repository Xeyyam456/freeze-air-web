import type { PublicEmployee } from "@/lib/public-employees";
import type { TextsProps } from "./TextsProps";

export type MasterCardProps = TextsProps & { e: PublicEmployee; max: number };
