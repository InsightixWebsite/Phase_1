'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateAboutContent } from './actions'
import { aboutContentSchema, type AboutContentInput } from '@/lib/schemas'
import type { AboutContent } from '@/lib/supabase/types'

const FIELDS = ['vision', 'mission', 'history', 'objectives', 'faculty_message'] as const

export function AboutContentForm({ initial }: { initial: AboutContent }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<AboutContentInput>({
    resolver: zodResolver(aboutContentSchema),
    defaultValues: initial,
  })

  async function onSubmit(values: AboutContentInput) {
    setServerError(null)
    const result = await updateAboutContent(values)
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-lg flex-col gap-4">
      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      {FIELDS.map((field) => (
        <label key={field} className="flex flex-col gap-1 capitalize">
          {field.replace('_', ' ')}
          <textarea {...register(field)} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        </label>
      ))}
      <button type="submit" disabled={isSubmitting} className="rounded bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-50">
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
