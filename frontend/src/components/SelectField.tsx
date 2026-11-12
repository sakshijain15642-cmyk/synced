import { useId } from "react";
import { capitalize } from "../utils/format";

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

export default function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: SelectFieldProps<T>) {
  const id = useId();

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {capitalize(option)}
          </option>
        ))}
      </select>
    </div>
  );
}