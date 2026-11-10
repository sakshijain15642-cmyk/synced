import type { IncidentStatus, Severity } from "../types";

type BadgeProps =
  | { kind: "status"; value: IncidentStatus }
  | { kind: "severity"; value: Severity };

export default function Badge({ kind, value }: BadgeProps) {
  return <span className={`badge badge-${kind}-${value}`}>{value}</span>;
}