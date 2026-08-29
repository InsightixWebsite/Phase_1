'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { updateSiteSettings } from './actions'
import { siteSettingsSchema, type SiteSettingsInput } from '@/lib/schemas'
import type { SiteSettings } from '@/lib/supabase/types'

export function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [logoUrl, setLogoUrl] = useState(initial.logo_url)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      logo_url: initial.logo_url,
      tagline: initial.tagline,
      contact_email: initial.contact_email,
      social_links: initial.social_links ?? {},
      whatsapp_number: initial.whatsapp_number,
      phone_number: initial.phone_number,
      college_address: initial.college_address,
    },
  })

  async function onSubmit(values: SiteSettingsInput) {
    setServerError(null)
    const result = await updateSiteSettings({ ...values, logo_url: logoUrl })
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-lg flex-col gap-4">
      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      <label className="flex flex-col gap-1">
        Logo
        <ImageUpload
          value={logoUrl}
          onChange={(url) => { setLogoUrl(url); setValue('logo_url', url) }}
          folder="site-settings"
        />
      </label>
      <label className="flex flex-col gap-1">
        Tagline
        <input {...register('tagline')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.tagline && <span className="text-sm text-red-400">{errors.tagline.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Contact email
        <input {...register('contact_email')} type="email" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.contact_email && <span className="text-sm text-red-400">{errors.contact_email.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Instagram URL
        <input {...register('social_links.instagram')} placeholder="https://instagram.com/insightix" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.social_links?.instagram && <span className="text-sm text-red-400">{errors.social_links.instagram.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        LinkedIn URL
        <input {...register('social_links.linkedin')} placeholder="https://linkedin.com/company/insightix" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.social_links?.linkedin && <span className="text-sm text-red-400">{errors.social_links.linkedin.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        WhatsApp number
        <input {...register('whatsapp_number')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        Phone number
        <input {...register('phone_number')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        College address
        <textarea {...register('college_address')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
      </label>
      <button type="submit" disabled={isSubmitting} className="rounded bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-50">
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
