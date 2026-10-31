import type { ContactItem } from "./ContactItem";
import type { TextsProps } from "./TextsProps";

export type ContactCardProps = TextsProps & { items: ContactItem[] };
