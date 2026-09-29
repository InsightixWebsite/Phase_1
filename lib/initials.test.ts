import { describe, it, expect } from 'vitest'
import { getInitials } from './initials'

describe('getInitials', () => {
  it('takes the first letter of the first and last word for multi-word names', () => {
    expect(getInitials('Aarav Mehta')).toBe('AM')
    expect(getInitials('Sanya Kapoor Iyer')).toBe('SI')
  })

  it('takes the first two letters of a single-word name', () => {
    expect(getInitials('Riya')).toBe('RI')
  })

  it('trims and collapses extra whitespace', () => {
    expect(getInitials('  Sanya   Iyer  ')).toBe('SI')
  })

  it('returns an empty string for an empty name', () => {
    expect(getInitials('')).toBe('')
    expect(getInitials('   ')).toBe('')
  })
})
