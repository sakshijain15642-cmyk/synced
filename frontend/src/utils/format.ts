export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// The API sends UTC timestamps; this turns one into "5 min ago".
export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((now.getTime() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

// Shows a UTC timestamp from the API in the viewer's local time and format.
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}