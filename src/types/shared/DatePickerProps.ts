export type DatePickerProps = {
  name?: string;
  defaultValue?: string | null;
  value?: string;
  onChange?: (v: string) => void;
  max?: string;
  required?: boolean;
  small?: boolean;
  placeholder?: string;
};
