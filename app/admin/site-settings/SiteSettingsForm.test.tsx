import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SiteSettingsForm } from './SiteSettingsForm'

vi.mock('./actions', () => ({
  updateSiteSettings: vi.fn(async () => ({})),
}))

import { updateSiteSettings } from './actions'

const initial = {
  logo_url: null,
  tagline: 'Club',
  contact_email: 'x@example.com',
  social_links: {},
  whatsapp_number: null,
  phone_number: null,
  college_address: null,
}

describe('SiteSettingsForm', () => {
  it('shows an inline error for an invalid email and does not call the server action', async () => {
    render(<SiteSettingsForm initial={initial} />)
    const emailInput = screen.getByLabelText(/contact email/i)
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).not.toBeNull()
    }, { timeout: 2000 })
    expect(updateSiteSettings).not.toHaveBeenCalled()
  })

  it('calls the server action with valid values', async () => {
    render(<SiteSettingsForm initial={initial} />)
    const emailInput = screen.getByLabelText(/contact email/i)
    fireEvent.change(emailInput, { target: { value: 'good@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(updateSiteSettings).toHaveBeenCalledTimes(1)
    })
    const arg = (updateSiteSettings as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(arg.contact_email).toBe('good@example.com')
  })
})
