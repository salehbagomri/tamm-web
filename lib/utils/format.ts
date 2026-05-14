export function formatPrice(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value.toLocaleString('en-SA')} ر.س`
}
