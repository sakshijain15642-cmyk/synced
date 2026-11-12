interface LoadingProps {
  label?: string;
}

export default function Loading({ label = "Loading..." }: LoadingProps) {
  return (
    <p role="status" className="muted">
      {label}
    </p>
  );
}