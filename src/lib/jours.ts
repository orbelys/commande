export function jourLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function decalerJour(iso: string, jours: number): string {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + jours)
  return jourLocal(d)
}
