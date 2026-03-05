import { Input } from "./input";

interface DatePickerProps {
  id: string;
  value?: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
  disabled?: boolean;
}

export function DatePicker({
  id,
  value,
  onChange,
  required,
  min,
  max,
  disabled,
}: DatePickerProps) {
  return (
    <Input
      id={id}
      type="date"
      className="field-sizing-fixed pr-10 scheme-light [&::-webkit-calendar-picker-indicator]:ml-20 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      min={min}
      max={max}
      disabled={disabled}
    />
  );
}
