export function formatDate(iso: string | null | undefined, locale = 'en-US'): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(d)
}

export function formatDateTime(iso: string | null | undefined, locale = 'en-US'): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function isOverdue(dueDateIso: string | null | undefined): boolean {
  if (!dueDateIso) return false
  return new Date(dueDateIso).getTime() < Date.now()
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return toIsoDate(d)
}
