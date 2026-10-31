import type { ButtonsProps } from "@/types/shared";

export function Buttons({ pending, label, onCancel }: ButtonsProps) {
  return (
    <div className="flex gap-2 pt-1">
      <button type="submit" disabled={pending} className="btn btn-primary flex-1">
        {pending ? "Gözləyin..." : label}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} className="btn btn-cancel">Ləğv et</button>
      )}
    </div>
  );
}
