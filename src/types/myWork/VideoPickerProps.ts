import type { CompressedVideo } from "@/types/shared";

export type VideoPickerProps = {
  value: CompressedVideo | null;
  onChange: (v: CompressedVideo | null) => void;
  onBusy: (busy: boolean) => void;
  className?: string;
};
