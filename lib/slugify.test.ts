import { describe, it, expect } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('lowercases, trims, and hyphenates spaces', () => {
    expect(slugify('Hack Night 2026')).toBe('hack-night-2026')
  })

  it('strips punctuation', () => {
    expect(slugify("Founder's Day: Kickoff!")).toBe('founders-day-kickoff')
  })

  it('collapses repeated whitespace/hyphens', () => {
    expect(slugify('  Too   Many   Spaces  ')).toBe('too-many-spaces')
  })
})
