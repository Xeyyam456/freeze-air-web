import type { SavedFile } from "./SavedFile";

export type ExistingFilesProps = { saved: SavedFile[] | null; removed: Set<number>; onToggle: (id: number) => void };
