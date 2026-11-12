import { useId } from "react";

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  rows?: number;
}

export default function TextAreaField({
  label,
  value,
  onChange,
  error,
  rows = 5,
}: TextAreaFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}