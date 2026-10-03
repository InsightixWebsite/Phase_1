'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { sponsorSchema, type SponsorInput } from '@/lib/schemas'
import type { Sponsor } from '@/lib/supabase/types'

interface SponsorFormProps {
  initial?: Sponsor
  action: (input: SponsorInput) => Promise<{ error?: string }>
}

export function SponsorForm({ initial, action }: SponsorFormProps) {
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? null)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof sponsorSchema>, unknown, SponsorInput>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      name: initial?.name ?? '',
      logo_url: initial?.logo_url ?? null,
      description: initial?.description ?? '',
      website_url: initial?.website_url ?? '',
      display_order: initial?.display_order ?? 0,
    },
  })

  async function onSubmit(values: SponsorInput) {
    setServerError(null)
    const result = await action({ ...values, logo_url: logoUrl })
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-lg flex-col gap-4">
      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      <label className="flex flex-col gap-1">
        Name
        <input {...register('name')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.name && <span className="text-sm text-red-400">{errors.name.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Logo
        <ImageUpload
          value={logoUrl}
          onChange={(url) => { setLogoUrl(url); setValue('logo_url', url) }}
          folder="sponsors"
        />
      </label>
      <label className="flex flex-col gap-1">
        Description
        <textarea {...register('description')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.description && <span className="text-sm text-red-400">{errors.description.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Website URL
        <input {...register('website_url')} type="url" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.website_url && <span className="text-sm text-red-400">{errors.website_url.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Display order
        <input {...register('display_order')} type="number" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.display_order && <span className="text-sm text-red-400">{errors.display_order.message}</span>}
      </label>
      <button type="submit" disabled={isSubmitting} className="rounded bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-50">
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
