import type { TaskNoteTarget } from "./TaskNoteTarget";

export type TaskNoteModalProps = { task: TaskNoteTarget; onClose: () => void; onSaved: () => void };
