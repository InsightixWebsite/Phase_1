'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { eventSchema, type EventInput } from '@/lib/schemas'
import type { Event } from '@/lib/supabase/types'

const eventFormSchema = eventSchema.extend({
  gallery_urls: z.string(),
  video_embed_urls: z.string(),
})
type EventFormValues = z.infer<typeof eventFormSchema>

interface EventFormProps {
  initial?: Event
  action: (input: EventInput) => Promise<{ error?: string }>
}

export function EventForm({ initial, action }: EventFormProps) {
  const [coverUrl, setCoverUrl] = useState(initial?.cover_photo_url ?? null)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof eventFormSchema>, unknown, EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initial?.title ?? '',
      slug: initial?.slug,
      description: initial?.description ?? '',
      event_date: initial?.event_date ?? '',
      type: initial?.type ?? 'upcoming',
      registration_url: initial?.registration_url ?? '',
      cover_photo_url: initial?.cover_photo_url ?? null,
      gallery_urls: initial?.gallery_urls?.join(', ') ?? '',
      video_embed_urls: initial?.video_embed_urls?.join(', ') ?? '',
    },
  })

  async function onSubmit(values: EventFormValues) {
    setServerError(null)
    const result = await action({
      ...values,
      cover_photo_url: coverUrl,
      gallery_urls: values.gallery_urls.split(',').map((s) => s.trim()).filter(Boolean),
      video_embed_urls: values.video_embed_urls.split(',').map((s) => s.trim()).filter(Boolean),
    })
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-lg flex-col gap-4">
      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      <label className="flex flex-col gap-1">
        Title
        <input {...register('title')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.title && <span className="text-sm text-red-400">{errors.title.message}</span>}
      </label>
      {initial && (
        <label className="flex flex-col gap-1">
          Slug (edit with care — changes the public URL)
          <input {...register('slug')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
          {errors.slug && <span className="text-sm text-red-400">{errors.slug.message}</span>}
        </label>
      )}
      <label className="flex flex-col gap-1">
        Description
        <textarea {...register('description')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.description && <span className="text-sm text-red-400">{errors.description.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Date
        <input {...register('event_date')} type="date" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.event_date && <span className="text-sm text-red-400">{errors.event_date.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Type
        <select {...register('type')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2">
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
        {errors.type && <span className="text-sm text-red-400">{errors.type.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Registration URL
        <input {...register('registration_url')} type="url" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.registration_url && <span className="text-sm text-red-400">{errors.registration_url.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Cover photo
        <ImageUpload
          value={coverUrl}
          onChange={(url) => { setCoverUrl(url); setValue('cover_photo_url', url) }}
          folder="events"
        />
        {errors.cover_photo_url && <span className="text-sm text-red-400">{errors.cover_photo_url.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Gallery photo URLs (comma-separated Cloudinary URLs)
        <textarea {...register('gallery_urls')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.gallery_urls && <span className="text-sm text-red-400">{errors.gallery_urls.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Video embed URLs (comma-separated YouTube/Instagram links)
        <textarea {...register('video_embed_urls')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.video_embed_urls && <span className="text-sm text-red-400">{errors.video_embed_urls.message}</span>}
      </label>
      <button type="submit" disabled={isSubmitting} className="rounded bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-50">
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
