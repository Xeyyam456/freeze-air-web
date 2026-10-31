import type { CompressedVideo } from "@/types/shared";

export type NoteFilePickersProps = {
  act: File | null;
  hasAct: boolean;
  photos: File[];
  video: CompressedVideo | null;
  onAct: (f: File | null) => void;
  onPhotos: (f: File[]) => void;
  onVideo: (v: CompressedVideo | null) => void;
  onVideoBusy: (b: boolean) => void;
};
