import { describe, it, expect } from 'vitest'
import { isActiveNavLink } from './navLinks'

describe('isActiveNavLink', () => {
  it('matches the home link only on the exact root path', () => {
    expect(isActiveNavLink('/', '/')).toBe(true)
    expect(isActiveNavLink('/about', '/')).toBe(false)
  })

  it('matches a section link on its own path and nested paths', () => {
    expect(isActiveNavLink('/events', '/events')).toBe(true)
    expect(isActiveNavLink('/events/hack-night', '/events')).toBe(true)
  })

  it('does not match a different path that merely shares a prefix', () => {
    expect(isActiveNavLink('/eventsomething', '/events')).toBe(false)
  })

  it('does not match unrelated paths', () => {
    expect(isActiveNavLink('/team', '/events')).toBe(false)
  })
})
