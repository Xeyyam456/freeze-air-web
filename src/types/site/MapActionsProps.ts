import type { ContactMapTexts } from "./ContactMapTexts";

export type MapActionsProps = {
  texts: ContactMapTexts;
  hasOrigin: boolean;
  showReset: boolean;
  locating: boolean;
  navUrl: string;
  wazeUrl: string;
  onRoute: () => void;
  onReset: () => void;
};
