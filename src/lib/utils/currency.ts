export function formatCurrency(amount: number | null | undefined, currency = 'USD', locale = 'en-US'): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—'
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export function formatPercent(value: number | null | undefined, fractionDigits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${value.toFixed(fractionDigits)}%`
}

export function formatCompactCurrency(amount: number | null | undefined, currency = 'USD'): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}
