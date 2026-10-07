export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-24">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-brand-border border-t-brand-accent"
        aria-hidden="true"
      />
      <p className="text-sm text-brand-muted">Loading…</p>
    </div>
  )
}
