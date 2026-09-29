import { describe, it, expect } from 'vitest'
import { formatEventDate } from './formatEventDate'

describe('formatEventDate', () => {
  it('formats an ISO date string as a short US date', () => {
    expect(formatEventDate('2026-01-01')).toBe('Jan 1, 2026')
  })

  it('parses as local time, not UTC, avoiding an off-by-one day', () => {
    expect(formatEventDate('2026-12-31')).toBe('Dec 31, 2026')
  })
})
