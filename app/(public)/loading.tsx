'use client'

import { useEffect, useState } from 'react'

// Next shows this the instant a navigation starts, with no minimum wait --
// on a fast route that resolves in well under a second, that meant a
// spinner flashing on screen for a single frame on basically every click.
// Delaying the visible state until the navigation has actually taken a
// noticeable amount of time keeps fast loads silent (same as before
// loading.tsx existed) while still giving feedback on a genuinely slow one.
export default function Loading() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 400)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

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
