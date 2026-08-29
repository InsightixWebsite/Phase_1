'use server'

import { revalidatePath } from 'next/cache'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { aboutContentSchema, type AboutContentInput } from '@/lib/schemas'

export async function updateAboutContent(input: AboutContentInput): Promise<{ error?: string }> {
  const parsed = aboutContentSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase
    .from('about_content')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', true)

  if (error) return { error: error.message }
  revalidatePath('/about')
  return {}
}
