import { describe, it, expect } from 'vitest'
import { isAdminRoute } from './isAdminRoute'

describe('isAdminRoute', () => {
  it('matches admin routes other than the login page', () => {
    expect(isAdminRoute('/admin/team')).toBe(true)
    expect(isAdminRoute('/admin')).toBe(true)
  })

  it('does not match the login page or public routes', () => {
    expect(isAdminRoute('/admin/login')).toBe(false)
    expect(isAdminRoute('/events')).toBe(false)
  })
})
