'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { updateHomeContent } from './actions'
import { homeContentSchema, type HomeContentInput } from '@/lib/schemas'
import type { HomeContent } from '@/lib/supabase/types'

export function HomeContentForm({ initial }: { initial: HomeContent }) {
  const [bannerUrl, setBannerUrl] = useState(initial.banner_media_url)
  const [bannerType, setBannerType] = useState(initial.banner_media_type ?? 'image')
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<HomeContentInput>({
    resolver: zodResolver(homeContentSchema),
    defaultValues: {
      intro_text: initial.intro_text,
      banner_media_url: initial.banner_media_url,
      banner_media_type: initial.banner_media_type,
    },
  })

  async function onSubmit(values: HomeContentInput) {
    setServerError(null)
    const result = await updateHomeContent({ ...values, banner_media_url: bannerUrl, banner_media_type: bannerType })
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-lg flex-col gap-4">
      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      <label className="flex flex-col gap-1">
        Intro text
        <textarea {...register('intro_text')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        Banner media type
        <select
          value={bannerType ?? 'image'}
          onChange={(e) => {
            const type = e.target.value as 'image' | 'video'
            setBannerType(type)
            setValue('banner_media_type', type)
            setBannerUrl(null)
            setValue('banner_media_url', null)
          }}
          className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
        >
          <option value="image">Image</option>
          <option value="video">Video (YouTube/Instagram embed link)</option>
        </select>
      </label>
      {bannerType === 'video' ? (
        <label className="flex flex-col gap-1">
          Banner video embed URL
          <input
            value={bannerUrl ?? ''}
            onChange={(e) => { setBannerUrl(e.target.value); setValue('banner_media_url', e.target.value) }}
            placeholder="https://www.youtube.com/embed/..."
            className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
        </label>
      ) : (
        <label className="flex flex-col gap-1">
          Banner image
          <ImageUpload
            value={bannerUrl}
            onChange={(url) => { setBannerUrl(url); setValue('banner_media_url', url) }}
            folder="home"
          />
        </label>
      )}
      <button type="submit" disabled={isSubmitting} className="rounded bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-50">
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
