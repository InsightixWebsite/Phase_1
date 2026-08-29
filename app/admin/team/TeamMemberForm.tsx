'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { teamMemberSchema, type TeamMemberInput } from '@/lib/schemas'
import type { TeamMember } from '@/lib/supabase/types'

interface TeamMemberFormProps {
  initial?: TeamMember
  action: (input: TeamMemberInput) => Promise<{ error?: string }>
}

export function TeamMemberForm({ initial, action }: TeamMemberFormProps) {
  const [photoUrl, setPhotoUrl] = useState(initial?.photo_url ?? null)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof teamMemberSchema>, unknown, TeamMemberInput>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: initial?.name ?? '',
      role: initial?.role ?? '',
      photo_url: initial?.photo_url ?? null,
      linkedin_url: initial?.linkedin_url ?? '',
      category: initial?.category ?? 'core',
      display_order: initial?.display_order ?? 0,
    },
  })

  async function onSubmit(values: TeamMemberInput) {
    setServerError(null)
    const result = await action({ ...values, photo_url: photoUrl })
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
        Role
        <input {...register('role')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.role && <span className="text-sm text-red-400">{errors.role.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Photo
        <ImageUpload
          value={photoUrl}
          onChange={(url) => { setPhotoUrl(url); setValue('photo_url', url) }}
          folder="team"
        />
      </label>
      <label className="flex flex-col gap-1">
        LinkedIn URL
        <input {...register('linkedin_url')} type="url" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.linkedin_url && <span className="text-sm text-red-400">{errors.linkedin_url.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Category
        <select {...register('category')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2">
          <option value="core">Core Committee</option>
          <option value="faculty">Faculty Coordinator</option>
          <option value="senior">Senior Team</option>
          <option value="junior">Junior Team</option>
        </select>
        {errors.category && <span className="text-sm text-red-400">{errors.category.message}</span>}
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
