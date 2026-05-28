export function formatDuration(
  seconds: number | undefined,
  fallback = "—"
): string {
  if (seconds === undefined || seconds === 0) return fallback;
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}
