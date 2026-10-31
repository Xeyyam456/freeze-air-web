import type { PANEL_EVENTS } from "@/components/panel/nav";

export type MenuHandlers = { go: (href: string) => () => void; act: (name: (typeof PANEL_EVENTS)[keyof typeof PANEL_EVENTS]) => () => void };
