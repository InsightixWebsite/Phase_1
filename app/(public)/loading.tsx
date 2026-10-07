'use client'

import { useEffect, useState } from 'react'

// Next shows this the instant a navigation starts, with no minimum wait --
// on a fast route that resolves in well under a second, that meant a
// spinner flashing on screen for a single frame on basically every click.
// Delaying the visible state until the navigation has actually taken a
// noticeable amount of time keeps fast loads silent (same as before
// loading.tsx existed) while still giving feedback on a genuinely slow one.
const SPINNER_DELAY_MS = 600

export default function Loading() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), SPINNER_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    // The outer min-height always renders, even before the spinner itself
    // becomes visible -- loading.tsx only ever replaces the page content
    // between Header and Footer, not the layout around it, so an empty
    // (zero-height) fallback let the Footer render directly under the
    // Header until real content streamed in and shoved it back down.
    // Reserving roughly a viewport's worth of space keeps the page's
    // overall shape stable through the whole load.
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-24">
      {show && (
        <>
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-brand-border border-t-brand-accent"
            aria-hidden="true"
          />
          <p className="text-sm text-brand-muted">Loading…</p>
        </>
      )}
    </div>
  )
}
