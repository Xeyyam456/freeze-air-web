import type { ButtonsProps } from "@/types/shared";
import { Button } from "@/shared/components/Button";

export function Buttons({ pending, label, onCancel }: ButtonsProps) {
  return (
    <div className="flex gap-2 pt-1">
      <Button type="submit" disabled={pending} className="flex-1">
        {pending ? "Gözləyin..." : label}
      </Button>
      {onCancel && (
        <Button type="button" onClick={onCancel} variant="cancel">Ləğv et</Button>
      )}
    </div>
  );
}
