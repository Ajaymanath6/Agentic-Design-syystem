/**
 * Human-readable catalog publish line, e.g. "Created on 5 July 2026".
 */
export function formatPublishedDateLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return iso
  }
  const formatted = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
  return `Created on ${formatted}`
}
