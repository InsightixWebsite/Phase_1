export function formatEventDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
